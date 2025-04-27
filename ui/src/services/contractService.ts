import { OracleRegistry } from '../contracts/OracleRegistry';

export class ContractService {
  private static instance: ContractService;
  private oracleRegistry: OracleRegistry;

  private constructor() {
    this.oracleRegistry = OracleRegistry.getInstance();
  }

  public static getInstance(): ContractService {
    if (!ContractService.instance) {
      ContractService.instance = new ContractService();
    }
    return ContractService.instance;
  }

  public async addOracle(name: string, privateKeyString: string): Promise<void> {
    try {
      this.oracleRegistry.addOracle(name, privateKeyString);
    } catch (error) {
      console.error('Error adding oracle:', error);
      throw error;
    }
  }

  public async getOraclePublicKey(name: string): Promise<string> {
    try {
      const publicKey = this.oracleRegistry.getPublicKey(name);
      return publicKey.toBase58();
    } catch (error) {
      console.error('Error getting oracle public key:', error);
      throw error;
    }
  }

  public async listOracles(): Promise<string[]> {
    try {
      return this.oracleRegistry.listOracles();
    } catch (error) {
      console.error('Error listing oracles:', error);
      throw error;
    }
  }

  public async removeOracle(name: string): Promise<void> {
    try {
      this.oracleRegistry.removeOracle(name);
    } catch (error) {
      console.error('Error removing oracle:', error);
      throw error;
    }
  }
} 