import {
  Field,
  Signature,
  Struct,
  ZkProgram,
  CircuitString,
  Poseidon,
} from 'o1js';
import { getPublicKeyFor } from './OracleRegistry';
import { initializeOracles } from './config/oracleKeys';

initializeOracles();
// =================================== Compliance Data Definition ===================================
export class GLEIFComplianceData extends Struct({
  type: CircuitString,
  id: CircuitString,
  lei: CircuitString,
  name: CircuitString,
  initialRegistrationDate: CircuitString,
  lastUpdateDate: CircuitString,
  activeComplianceStatusCode: Field,
  registration_status: CircuitString,
  nextRenewalDate: CircuitString,
}) { }

// ========================== Public Output Structure Definition ========================================
export class GLEIFPublicOutput extends Struct({
  name: CircuitString, // Adjust if needed
  id: CircuitString, // Adjust if needed
}) { }



function isValidObject(GLEIFData: GLEIFComplianceData) {
  return true;
}


export const GLEIF = ZkProgram({
  name: 'GLEIF',

  publicInput: Field,

  publicOutput: GLEIFPublicOutput,

  methods: {
    proveCompliance: { // Generates the public output
      privateInputs: [
        GLEIFComplianceData,
        Signature // Oracle Signature
      ],
      async method(
        GLEIFToProve: Field,
        GLEIFData: GLEIFComplianceData,
        oracleSignature: Signature // Oracle Signature
      ): Promise<GLEIFPublicOutput> {

        try {

          //console.log('GLEIF in ZKProgram with Sign', GLEIFData.name.toString, ' status ..', GLEIFData.registration_status.toString);

          // =================================== Oracle Signature Verification ===================================
          // Hash the compliance data
          const complianceDataHash = Poseidon.hash(GLEIFComplianceData.toFields(GLEIFData));

          // Get the oracle's public key
          const registryPublicKey = getPublicKeyFor('GLEIF');

          //console.log('GLEIF in ZKProgram with Sign ComplianceDataHash', complianceDataHash);
          //console.log('GLEIF in ZKProgram with Sign registryPublicKey', registryPublicKey);

          // Verify the oracle's signature
          const isValidSignature = oracleSignature.verify(registryPublicKey, [complianceDataHash]);

          //console.log('GLEIF in ZKProgram with Sign isValidSignature assert before ', isValidSignature);

          isValidSignature.assertTrue();

          //console.log('GLEIF in ZKProgram with Sign isValidSignature assert after', isValidSignature);

          if (isValidObject(GLEIFData)) {


            const activeComplianceHash = CircuitString.fromString("Active").hash();
            const inactiveComplianceHash = CircuitString.fromString("Inactive").hash();
            const currentStatusHash = GLEIFData.registration_status.hash();

            currentStatusHash.assertNotEquals(inactiveComplianceHash);

            currentStatusHash.assertEquals(activeComplianceHash);


          }

          return new GLEIFPublicOutput({
            name: GLEIFData.name,
            id: GLEIFData.id, // Adjust if needed
          });


        }
        catch (error) {

          console.log('error..', error)

          return new GLEIFPublicOutput({
            name: GLEIFData.name,
            id: GLEIFData.id, // Adjust if needed
          });


        }


      },


    },
  },
});

export class GLEIFProof extends ZkProgram.Proof(GLEIF) { }
