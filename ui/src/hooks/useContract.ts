import { useState } from 'react';
import { ContractService } from '../services/contractService';

export function useContract() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contractService = ContractService.getInstance();

  const addOracle = async (name: string, privateKey: string) => {
    setLoading(true);
    setError(null);
    try {
      await contractService.addOracle(name, privateKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getOraclePublicKey = async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      return await contractService.getOraclePublicKey(name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const listOracles = async () => {
    setLoading(true);
    setError(null);
    try {
      return await contractService.listOracles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const removeOracle = async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      await contractService.removeOracle(name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    addOracle,
    getOraclePublicKey,
    listOracles,
    removeOracle,
  };
} 