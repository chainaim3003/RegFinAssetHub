import { Mina, PublicKey, fetchAccount } from 'o1js';
import * as Comlink from "comlink";
import type { GLEIFVerifierSmartContract } from '@contracts/src/contracts/GLEIFVerifierSmartContractWithSign';
import type { GLEIFProof } from '@contracts/src/contracts/GLEIFZKProgramWithSign';
import { CONTRACT_ADDRESS } from '../contracts/config/network';
import { GLEIF } from '@contracts/build/src/contracts/GLEIFZKProgramWithSign';
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
    state.transaction = await Mina.transaction(
      { sender: PublicKey.fromBase58(CONTRACT_ADDRESS) },
      async () => {
        await state.zkappInstance!.verifyComplianceWithProof(proof);
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