import { useState } from 'react';
import GLEIFContractClient from '../services/gleifContractClient';
import { GLEIFProof } from '@contracts/src/contracts/GLEIFZKProgramWithSign';
import { CONTRACT_ADDRESS } from '@/contracts/config/network';

export function useGLEIFContract() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contractState, setContractState] = useState<string | null>(null);
  const [client] = useState(() => new GLEIFContractClient());

  const verifyCompliance = async (proof: GLEIFProof) => {
    setLoading(true);
    setError(null);
    try {
      await client.setActiveInstanceToDevnet();
      await client.fetchAccount(CONTRACT_ADDRESS);
      await client.loadContract();
      await client.compileContract();
      await client.initZkappInstance(CONTRACT_ADDRESS);
      await client.verifyCompliance(proof);
      await client.proveTransaction();
      // await loadContractState(); // Refresh state after verification
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadContractState = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('loading contract state');
      await client.setActiveInstanceToDevnet();
      await client.fetchAccount(CONTRACT_ADDRESS);
      await client.loadContract();
      await client.compileContract();
      await client.initZkappInstance(CONTRACT_ADDRESS);
      const state = await client.getNum();
      console.log('state', state);
      setContractState(state.toJSON());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    contractState,
    verifyCompliance,
    loadContractState,
  };
} 