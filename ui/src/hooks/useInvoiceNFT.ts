import { useState, useCallback } from 'react';
import { getSignedContract } from '../utils/contracts';
import { parseEther, formatEther } from 'ethers';
import { toast } from 'react-hot-toast';

export interface NFT {
  tokenId: number;
  seller: string;
  price: string;
  isForSale: boolean;
  complianceVerified: boolean;
  isFrozen: boolean;
}

export function useInvoiceNFT() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nfts, setNfts] = useState<NFT[]>([]);

  const mintNFT = useCallback(async (price: number) => {
    try {
      setLoading(true);
      setError(null);
      const contract = await getSignedContract();
      const tx = await contract.create(parseEther(price.toString()));
      await tx.wait();
      toast.success('NFT created successfully!');
      await loadNFTs(); // Refresh the list after minting
      return tx;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mint NFT';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buyNFT = useCallback(async (tokenId: number) => {
    try {
      setLoading(true);
      setError(null);
      const contract = await getSignedContract();
      const details = await contract.getInvoice(tokenId);
      const tx = await contract.buy(tokenId, { value: details[1] });
      await tx.wait();
      toast.success('NFT purchased successfully!');
      await loadNFTs(); // Refresh the list after buying
      return tx;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to buy NFT';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const listNFT = useCallback(async (tokenId: number, price: number) => {
    try {
      setLoading(true);
      setError(null);
      const contract = await getSignedContract();
      const tx = await contract.setCompliant(tokenId, parseEther(price.toString()), true);
      await tx.wait();
      toast.success('NFT listed successfully!');
      await loadNFTs(); // Refresh the list after listing
      return tx;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to list NFT';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadNFTs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const contract = await getSignedContract();

      // Fetch first 10 NFTs
      const nftPromises = Array.from({ length: 10 }, (_, i) =>
        contract.getInvoice(i + 1).catch(() => null)
      );
      const frozenPromises = Array.from({ length: 10 }, (_, i) =>
        contract.frozen(i + 1).catch(() => false)
      );

      const [results, frozenResults] = await Promise.all([
        Promise.all(nftPromises),
        Promise.all(frozenPromises)
      ]);

      const validNFTs = results.reduce((acc, result, index) => {
        if (result) {
          acc.push({
            tokenId: index + 1,
            seller: result[0],
            price: formatEther(result[1]),
            isForSale: true,
            complianceVerified: result[2],
            isFrozen: frozenResults[index] || false,
          });
        }
        return acc;
      }, [] as NFT[]);

      setNfts(validNFTs);
      return validNFTs;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load NFTs';
      setError(errorMessage);
      toast.error(errorMessage);
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
      toast.success('Compliance status updated successfully!');
      await loadNFTs(); // Refresh the list after updating compliance
      return tx;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set compliance';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setFreeze = useCallback(async (id: number, freeze: boolean) => {
    try {
      setLoading(true);
      setError(null);
      const contract = await getSignedContract();
      const tx = await contract.setFreeze(id, freeze);
      await tx.wait();
      toast.success(`NFT ${freeze ? 'frozen' : 'unfrozen'} successfully!`);
      await loadNFTs(); // Refresh the list after freezing/unfreezing
      return tx;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set freeze status';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    loading,
    error,
    nfts,
    mintNFT,
    buyNFT,
    listNFT,
    loadNFTs,
    setCompliant,
    setFreeze,
  };
} 