import { CircuitString, Field, Mina, Poseidon, PublicKey, Signature, fetchAccount } from 'o1js';
import * as Comlink from "comlink";
import type { GLEIFVerifierSmartContract } from '@contracts/src/contracts/GLEIFVerifierSmartContractWithSign';
import type { GLEIFProof } from '@contracts/src/contracts/GLEIFZKProgramWithSign';
import { GLEIF, GLEIFComplianceData } from '@contracts/build/src/contracts/GLEIFZKProgramWithSign';
import { getPrivateKeyFor, getPublicKeyFor } from '@contracts/src/contracts/OracleRegistry';
import axios from 'axios';
type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

const state = {
  GLEIFInstance: null as null | typeof GLEIFVerifierSmartContract,
  zkappInstance: null as null | GLEIFVerifierSmartContract,
  transaction: null as null | Transaction,
};

export const api = {
  async setActiveInstanceToDevnet() {
    const Network = Mina.Network('https://api.minascan.io/node/devnet/v1/graphql');
    console.log('Devnet network instance configured');
    Mina.setActiveInstance(Network);
  },

  async loadContract() {
    const { GLEIFVerifierSmartContract } = await import('@contracts/build/src/contracts/GLEIFVerifierSmartContractWithSign.js');
    state.GLEIFInstance = GLEIFVerifierSmartContract;
    console.log('GLEIFVerifierSmartContract done');
  },

  async compileContract() {
    console.log('compileContract started');
    // const { GLEIFVerifierSmartContract } = await import('@contracts/build/src/contracts/GLEIFVerifierSmartContractWithSign.js');
    await GLEIF.compile();
    console.log('GLEIF compiled');
    await state.GLEIFInstance!.compile();
    console.log('Contract compiled');
  },

  async fetchAccount(publicKey58: string) {
    const publicKey = PublicKey.fromBase58(publicKey58);
    console.log('fetchAccount', publicKey);
    return fetchAccount({ publicKey });
  },

  async initZkappInstance(publicKey58: string) {
    const publicKey = PublicKey.fromBase58(publicKey58);
    console.log('initZkappInstance', publicKey);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error 
    state.zkappInstance = new state.GLEIFInstance!(publicKey);
    console.log('zkappInstance', state.zkappInstance);
  },

  async getNum() {
    const currentNum = await state.zkappInstance!.num.get() || "";
    console.log('getNum', currentNum.toJSON());
    return currentNum.toJSON();
  },

  async verifyCompliance(proof: GLEIFProof) {
    // Fetch compliance data
    const BASEURL = "https://9a4d8990-c981-42fa-ace4-675ddec17321.mock.pstmn.io";
    //const companyname = "bhurja_gleif";
    const companyname = "zenova_gleif";
    const response = await axios.get(`${BASEURL}/${companyname}`);
    const parsedData = response.data;
    console.log('parsedData', parsedData);

    // Create GLEIF compliance data
    const GLEIFcomplianceData = new GLEIFComplianceData({
      type: CircuitString.fromString(parsedData.data[0].type || ''),
      id: CircuitString.fromString(parsedData.data[0].id || ''),
      lei: CircuitString.fromString(parsedData.data[0].attributes.lei || ''),
      name: CircuitString.fromString(parsedData.data[0].attributes.entity.legalName.name || ''),
      initialRegistrationDate: CircuitString.fromString(parsedData.data[0].attributes.registration.initialRegistrationDate || ''),
      lastUpdateDate: CircuitString.fromString(parsedData.data[0].attributes.registration.lastUpdateDate || ''),
      activeComplianceStatusCode: Field(parsedData.data[0].attributes.registration.activeComplianceStatusCode || 0),
      registration_status: CircuitString.fromString(parsedData.data[0].attributes.registration.status || ''),
      nextRenewalDate: CircuitString.fromString(parsedData.data[0].attributes.registration.nextRenewalDate || ''),

    });
    console.log('GLEIFcomplianceData', GLEIFcomplianceData);

    // =================================== Oracle Signature Generation ===================================
    // Create message hash
    const complianceDataHash = Poseidon.hash(GLEIFComplianceData.toFields(GLEIFcomplianceData));

    console.log('complianceDataHash', complianceDataHash);
    // Get oracle private key
    const registryPrivateKey = getPrivateKeyFor('GLEIF');
    console.log('registryPrivateKey', registryPrivateKey);
    // Sign the message hash with the oracle's private key
    const oracleSignature = Signature.create(registryPrivateKey, [complianceDataHash]);

    // =================================== Generate Proof ===================================
    const proofA = await GLEIF.proveCompliance(Field(0), GLEIFcomplianceData, oracleSignature);

    console.log('GLEIF Compliance Data ..', GLEIFcomplianceData.name.toString(), ' compliance ..', GLEIFcomplianceData.registration_status);
    console.log('GLEIF Oracle Signature..', oracleSignature.toJSON());

    console.log('generating proof ..', proof.toJSON());

    state.transaction = await Mina.transaction(
      { sender: getPublicKeyFor('GLEIF') },
      async () => {
        await state.zkappInstance!.verifyComplianceWithProof(proofA);
      }
    );
  },

  async proveTransaction() {
    await state.transaction!.prove();
  },

  async getTransactionJSON() {
    return state.transaction!.toJSON();
  },
};

// Expose the API to be used by the main thread
Comlink.expose(api); 