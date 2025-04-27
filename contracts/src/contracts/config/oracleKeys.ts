import { oracleRegistry } from '../OracleRegistry';

import * as dotenv from 'dotenv';
dotenv.config();


// Oracle private keys configuration
// Replace these with actual private keys when deploying to testnet
const GLEIF_PRIVATE_KEY = "EKF9UFABWY1QTPvhhCKE4MsN84rRtANDBcxFnnFDfdVjBkMV8X7B"
const MCA_PRIVATE_KEY = "EKF9UFABWY1QTPvhhCKE4MsN84rRtANDBcxFnnFDfdVjBkMV8X7B"
const EXIM_PRIVATE_KEY = "EKF9UFABWY1QTPvhhCKE4MsN84rRtANDBcxFnnFDfdVjBkMV8X7B"
const BPMN_PRIVATE_KEY = "EKF9UFABWY1QTPvhhCKE4MsN84rRtANDBcxFnnFDfdVjBkMV8X7B"
const RISK_PRIVATE_KEY = "EKF9UFABWY1QTPvhhCKE4MsN84rRtANDBcxFnnFDfdVjBkMV8X7B"
export const ORACLE_PRIVATE_KEYS = {
  GLEIF: GLEIF_PRIVATE_KEY || '',
  MCA: MCA_PRIVATE_KEY || '',
  EXIM: EXIM_PRIVATE_KEY || '',
  BPMN: BPMN_PRIVATE_KEY || '',
  RISK: RISK_PRIVATE_KEY || ''
};
console.log('ORACLE_PRIVATE_KEYS', ORACLE_PRIVATE_KEYS);

// Validate that all required private keys are present
export function validateOracleKeys(): void {
  const missingKeys = Object.entries(ORACLE_PRIVATE_KEYS)
    .filter(([, key]) => !key)
    .map(([name]) => name);

  if (missingKeys.length > 0) {
    throw new Error(`Missing private keys for oracles: dot dot dot${missingKeys.join(', ')}`);
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