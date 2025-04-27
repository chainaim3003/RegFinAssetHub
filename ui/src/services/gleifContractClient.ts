import { Field } from 'o1js';
import * as Comlink from "comlink";
import type { GLEIFProof } from '@contracts/src/contracts/GLEIFZKProgramWithSign';

export default class GLEIFContractClient {
  private worker: Worker;
  private remoteApi: Comlink.Remote<typeof import('./gleifContractService').api>;

  constructor() {
    this.worker = new Worker(new URL('./gleifContractService.ts', import.meta.url), { type: 'module' });
    this.remoteApi = Comlink.wrap(this.worker);
  }

  async setActiveInstanceToDevnet() {
    return this.remoteApi.setActiveInstanceToDevnet();
  }

  async loadContract() {
    return this.remoteApi.loadContract();
  }

  async compileContract() {
    return this.remoteApi.compileContract();
  }

  async fetchAccount(publicKeyBase58: string) {
    return this.remoteApi.fetchAccount(publicKeyBase58);
  }

  async initZkappInstance(publicKeyBase58: string) {
    return this.remoteApi.initZkappInstance(publicKeyBase58);
  }

  async getNum(): Promise<Field> {
    const result = await this.remoteApi.getNum();
    return Field.fromJSON(JSON.parse(result as string));
  }

  async verifyCompliance(proof: GLEIFProof) {

    return this.remoteApi.verifyCompliance(proof);
  }

  async proveTransaction() {
    return this.remoteApi.proveTransaction();
  }

  async getTransactionJSON() {
    return this.remoteApi.getTransactionJSON();
  }
} 