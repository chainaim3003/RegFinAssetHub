import { useState, useCallback } from 'react';
import { getSignedContract } from '../utils/contracts';
import { parseEther, formatEther } from 'ethers';

export interface MarketplaceInvoice {
  id: number;
  owner: string;
  price: string;
  isCompliant: boolean;
  isFrozen: boolean;
}

export function useMarketplace() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createInvoice = useCallback(async (price: number) => {
    try {
      setLoading(true);
      setError(null);
      const contract = await getSignedContract();
      const tx = await contract.create(parseEther(price.toString()));
      await tx.wait();
      return tx;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invoice');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const buyInvoice = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const contract = await getSignedContract();
      const details = await contract.getInvoice(id);
      const tx = await contract.buy(id, { value: details[1] });
      await tx.wait();
      return tx;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to buy invoice');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getInvoiceDetails = useCallback(async (id: number): Promise<MarketplaceInvoice> => {
    try {
      setLoading(true);
      setError(null);
      const contract = await getSignedContract();
      const [owner, price, isCompliant] = await contract.getInvoice(id);
      const isFrozen = await contract.frozen(id);
      return {
        id,
        owner,
        price: formatEther(price),
        isCompliant,
        isFrozen, // TODO: Add frozen status check
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get invoice details');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const setCompliant = useCallback(async (id: number, price: number, isCompliant: boolean) => {
    try {
      setLoading(true);
      setError(null);
      const contract = await getSignedContract();
      const tx = await contract.setCompliant(id, parseEther(price.toString()), isCompliant);
      await tx.wait();
      return tx;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set compliance');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const setFreeze = useCallback(async (id: number, freeze: boolean) => {
    try {
      setLoading(true);
      setError(null);
      const contract = await getSignedContract();
      const tx = await contract.setFreeze(id, freeze);
      await tx.wait();
      return tx;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set freeze status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createInvoice,
    buyInvoice,
    getInvoiceDetails,
    setCompliant,
    setFreeze,
  };
} 