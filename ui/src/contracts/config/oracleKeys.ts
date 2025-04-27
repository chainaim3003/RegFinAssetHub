
import { oracleRegistry } from '../OracleRegistry';



// Oracle private keys configuration
// Replace these with actual private keys when deploying to testnet
export const ORACLE_PRIVATE_KEYS = {
  GLEIF: process.env.NEXT_PUBLIC_GLEIF_PRIVATE_KEY || '',
  MCA: process.env.NEXT_PUBLIC_MCA_PRIVATE_KEY || '',
  EXIM: process.env.NEXT_PUBLIC_EXIM_PRIVATE_KEY || '',
  BPMN: process.env.NEXT_PUBLIC_BPMN_PRIVATE_KEY || '',
  RISK: process.env.NEXT_PUBLIC_RISK_PRIVATE_KEY || ''
};

// Validate that all required private keys are present
export function validateOracleKeys(): void {
  const missingKeys = Object.entries(ORACLE_PRIVATE_KEYS)
    .filter(([, key]) => !key)
    .map(([name]) => name);

  if (missingKeys.length > 0) {
    throw new Error(`Missing private keys for oracles:hihi ${missingKeys.join(', ')}`);
  }
}

// Initialize oracles with private keys
export function initializeOracles(): void {
  validateOracleKeys();

  // Add each oracle to the registry
  Object.entries(ORACLE_PRIVATE_KEYS).forEach(([name, privateKey]) => {
    oracleRegistry.addOracle(name, privateKey);
  });
} 