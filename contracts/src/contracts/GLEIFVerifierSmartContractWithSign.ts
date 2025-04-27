import { Field, SmartContract, state, State, method } from 'o1js';
import { GLEIFProof } from './GLEIFZKProgramWithSign';

export class GLEIFVerifierSmartContract extends SmartContract {
  @state(Field) num = State<Field>(); // State variable to hold a number state

  // Initialize the contract state
  init() {
    super.init(); // Call the parent class initializer
    this.num.set(Field(100)); // Set initial value of 'num' to 100
  }

  @method async verifyComplianceWithProof(proof: GLEIFProof) {
    // Ensure the state of 'num' matches its current value
    this.num.requireEquals(this.num.get());
    const currentNum = this.num.get();

    // Verification of the proof from the ZK
    proof.verify();

    // Update the state
    const updatedNum = currentNum.sub(10);
    this.num.set(updatedNum);
  }
}
