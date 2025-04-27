import { Mina, PrivateKey, PublicKey } from 'o1js';
import { initializeNetwork } from './config/network';

// Initialize the network
initializeNetwork();

// Account definitions with private key support
export interface OracleAccount {
  publicKey: PublicKey;
  privateKey: PrivateKey;
}

export class OracleRegistry {
  private static instance: OracleRegistry;
  private registry: Map<string, OracleAccount>;

  private constructor() {
    this.registry = new Map();
  }

  public static getInstance(): OracleRegistry {
    if (!OracleRegistry.instance) {
      OracleRegistry.instance = new OracleRegistry();
    }
    return OracleRegistry.instance;
  }

  public addOracle(name: string, privateKeyString: string): void {
    try {
      const privateKey = PrivateKey.fromBase58(privateKeyString);
      const publicKey = privateKey.toPublicKey();

      this.registry.set(name, {
        publicKey,
        privateKey
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to add oracle ${name}: ${errorMessage}`);
    }
  }

  public getOracle(name: string): OracleAccount {
    const oracle = this.registry.get(name);
    if (!oracle) {
      throw new Error(`Oracle ${name} not found in registry`);
    }
    return oracle;
  }

  public getPrivateKey(name: string): PrivateKey {
    return this.getOracle(name).privateKey;
  }

  public getPublicKey(name: string): PublicKey {
    return this.getOracle(name).publicKey;
  }

  public hasOracle(name: string): boolean {
    return this.registry.has(name);
  }

  public removeOracle(name: string): void {
    this.registry.delete(name);
  }

  public listOracles(): string[] {
    return Array.from(this.registry.keys());
  }
}

// Export singleton instance
export const oracleRegistry = OracleRegistry.getInstance();

// Helper functions for backward compatibility
export function getPrivateKeyFor(key: string): PrivateKey {
  return oracleRegistry.getPrivateKey(key);
}

export function getPublicKeyFor(key: string): PublicKey {
  return oracleRegistry.getPublicKey(key);
}

// Example usage:
/*
// Initialize oracles with private keys
oracleRegistry.addOracle('GLEIF', 'your-private-key-here');
oracleRegistry.addOracle('MCA', 'another-private-key-here');

// Get oracle details
const gleifOracle = oracleRegistry.getOracle('GLEIF');
const mcaPublicKey = oracleRegistry.getPublicKey('MCA');

// Check if oracle exists
if (oracleRegistry.hasOracle('GLEIF')) {
  // Do something
}

// List all oracles
const oracleList = oracleRegistry.listOracles();
*/
