"use client"
import React, { useState, useEffect } from 'react';
import { useGLEIFContract } from '../hooks/useGLEIFContract';
import { useInvoiceNFT } from '../hooks/useInvoiceNFT';
import { Marketplace } from './Marketplace';

interface NFT {
  tokenId: number;
  price: string;
  isForSale: boolean;
  complianceVerified: boolean;
  isFrozen: boolean;
}

export function InvoiceNFTManager() {
  const { loading: oracleLoading, error: oracleError, contractState } = useGLEIFContract();
  const { loading: nftLoading, error: nftError, mintNFT, buyNFT, listNFT, loadNFTs } = useInvoiceNFT();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [newNFTPrice, setNewNFTPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNFTs().then(setNfts).catch(console.error);
  }, []);

  const handleMintNFT = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNFTPrice) return;

    try {
      setLoading(true);
      await mintNFT(parseFloat(newNFTPrice));
      setNewNFTPrice('');
      const updatedNFTs = await loadNFTs();
      setNfts(updatedNFTs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mint NFT');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNFT = async (tokenId: number) => {
    try {
      setLoading(true);
      await buyNFT(tokenId);
      const updatedNFTs = await loadNFTs();
      setNfts(updatedNFTs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to buy NFT');
    } finally {
      setLoading(false);
    }
  };

  const handleListNFT = async (tokenId: number, price: string) => {
    try {
      setLoading(true);
      await listNFT(tokenId, parseFloat(price));
      const updatedNFTs = await loadNFTs();
      setNfts(updatedNFTs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to list NFT');
    } finally {
      setLoading(false);
    }
  };

  if (oracleLoading || nftLoading || loading) return <div>Loading...</div>;
  if (oracleError) return <div>Oracle Error: {oracleError}</div>;
  if (nftError) return <div>NFT Error: {nftError}</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4 text-black">
      <h2 className="text-2xl font-bold mb-4">Invoice NFT Management</h2>

      {/* Mint NFT Form */}
      <form onSubmit={handleMintNFT} className="mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">NFT Price (ETH)</label>
          <input
            type="number"
            value={newNFTPrice}
            onChange={(e) => setNewNFTPrice(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter price in ETH"
            step="0.01"
            min="0"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Mint NFT
        </button>
      </form>

      {/* NFT List */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Your NFTs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nfts.map((nft) => (
            <div key={nft.tokenId} className="border rounded p-4">
              <div className="mb-2">
                <span className="font-semibold">Token ID:</span> {nft.tokenId}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Price:</span> {nft.price} ETH
              </div>
              <div className="mb-2">
                <span className="font-semibold">Status:</span>{' '}
                {nft.isForSale ? 'For Sale' : 'Not for Sale'}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Compliance:</span>{' '}
                {nft.complianceVerified ? 'Verified' : 'Not Verified'}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Frozen:</span>{' '}
                {nft.isFrozen ? 'Yes' : 'No'}
              </div>
              {nft.isForSale ? (
                <button
                  onClick={() => handleBuyNFT(nft.tokenId)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
                >
                  Buy NFT
                </button>
              ) : (
                <button
                  onClick={() => handleListNFT(nft.tokenId, nft.price)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 w-full"
                >
                  List for Sale
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contract State */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Contract State</h3>
        <p>Current State: {contractState}</p>
      </div>

      {/* Marketplace */}
      <div className="mt-8 border-t pt-8">
        <Marketplace />
      </div>
    </div>
  );
} 