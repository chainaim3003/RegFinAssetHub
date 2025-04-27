import { useState, useCallback } from 'react';
import { getSignedContract } from '../utils/contracts';
import { parseEther, formatEther } from 'ethers';

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

  const mintNFT = useCallback(async (price: number) => {
    try {
      setLoading(true);
      setError(null);
      const contract = await getSignedContract();
      const tx = await contract.create(parseEther(price.toString()));
      await tx.wait();
      return tx;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mint NFT');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const buyNFT = useCallback(async (tokenId: number) => {
    try {
      setLoading(true);
      setError(null);
      const contract = await getSignedContract();
      const details = await contract.getInvoice(tokenId);
      const tx = await contract.buy(tokenId, { value: details[1] });
      await tx.wait();
      return tx;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to buy NFT');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const listNFT = useCallback(async (tokenId: number, price: number) => {
    try {
      setLoading(true);
      setError(null);
      const contract = await getSignedContract();
      const tx = await contract.setCompliant(tokenId, parseEther(price.toString()), true);
      await tx.wait();
      return tx;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to list NFT');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadNFTs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const contract = await getSignedContract();

      // Fetch first 10 NFTs (you might want to implement a way to get all NFTs)
      const nftPromises = Array.from({ length: 10 }, (_, i) =>
        contract.getInvoice(i + 1).catch(() => null)
      );

      const results = await Promise.all(nftPromises);
      const validNFTs = results.reduce((acc, result, index) => {
        if (result) {
          acc.push({
            tokenId: index + 1,
            seller: result[0],
            price: formatEther(result[1]),
            isForSale: true,
            complianceVerified: result[2],
            isFrozen: false, // TODO: Add frozen status check
          });
        }
        return acc;
      }, [] as NFT[]);

      return validNFTs;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load NFTs');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    mintNFT,
    buyNFT,
    listNFT,
    loadNFTs,
  };
} 