"use client"
import React, { useState, useEffect } from 'react';
import { useGLEIFContract } from '../hooks/useGLEIFContract';
import { useInvoiceNFT } from '../hooks/useInvoiceNFT';
import { Marketplace } from './Marketplace';
import { useWallet } from '@/hooks/useWallet';
import { Toaster } from 'react-hot-toast';

interface NFT {
  tokenId: number;
  price: string;
  isForSale: boolean;
  complianceVerified: boolean;
  isFrozen: boolean;
}

export function InvoiceNFTManager() {
  const { loading: oracleLoading, error: oracleError, contractState, loadContractState } = useGLEIFContract();
  const { loading: nftLoading, error: nftError, nfts, mintNFT, buyNFT, listNFT, loadNFTs, setCompliant, setFreeze } = useInvoiceNFT();
  const [newNFTPrice, setNewNFTPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { account, loading: walletLoading, error: walletError, connectWallet } = useWallet();
  const [compliancePrice, setCompliancePrice] = useState('');
  const [isCompliant, setIsCompliant] = useState(true);

  useEffect(() => {
    loadNFTs();
  }, []);

  const handleMintNFT = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNFTPrice) return;

    try {
      setLoading(true);
      await mintNFT(parseFloat(newNFTPrice));
      setNewNFTPrice('');
    } catch (err) {
      console.error('Failed to mint NFT:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNFT = async (tokenId: number) => {
    try {
      setLoading(true);
      await buyNFT(tokenId);
    } catch (err) {
      console.error('Failed to buy NFT:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleListNFT = async (tokenId: number, price: string) => {
    try {
      setLoading(true);
      await listNFT(tokenId, parseFloat(price));
    } catch (err) {
      console.error('Failed to list NFT:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetCompliance = async (id: number) => {
    if (!compliancePrice || !account) return;

    try {
      await setCompliant(id, parseFloat(compliancePrice), isCompliant);
      setCompliancePrice('');
      setIsCompliant(true);
      // await loadInvoices();
    } catch (err) {
      console.error('Failed to set compliance:', err);
    }
  };

  const handleSetFreeze = async (id: number, freeze: boolean) => {
    if (!account) {
      await connectWallet();
      return;
    }

    try {
      await setFreeze(id, freeze);
      await loadNFTs();
    } catch (err) {
      console.error('Failed to set freeze status:', err);
    }
  };

  if (oracleLoading || nftLoading || loading) return <div>Loading...</div>;
  if (oracleError) return <div>Oracle Error: {oracleError}</div>;
  if (nftError) return <div>NFT Error: {nftError}</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4 text-black">
      <Toaster position="top-right" />

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
            disabled={nftLoading}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          disabled={nftLoading}
        >
          {nftLoading ? 'Creating...' : 'Mint NFT'}
        </button>
      </form>

      {/* NFT List */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Your NFTs</h3>
        {nftLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : nftError ? (
          <div className="text-red-500 text-center p-4 bg-red-50 rounded">
            {nftError}
          </div>
        ) : (
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
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full disabled:opacity-50"
                    disabled={nftLoading}
                  >
                    {nftLoading ? 'Processing...' : 'Buy NFT'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleListNFT(nft.tokenId, nft.price)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 w-full disabled:opacity-50"
                    disabled={nftLoading}
                  >
                    {nftLoading ? 'Processing...' : 'List for Sale'}
                  </button>
                )}
                <button
                  onClick={() => handleSetFreeze(nft.tokenId, !nft.isFrozen)}
                  className={`${nft.isFrozen ? 'bg-red-500' : 'bg-yellow-500'
                    } text-white px-4 py-2 rounded hover:opacity-90`}
                >
                  {nft.isFrozen ? 'Unfreeze' : 'Freeze'}
                </button>
                {/* <button
                  onClick={() => handleSetCompliance(nft.tokenId)}
                  className={`${nft.isCompliant ? 'bg-green-500' : 'bg-red-500'
                    } text-white px-4 py-2 rounded hover:opacity-90`}
                >
                  {nft.isCompliant ? 'Compliant' : 'Non-Compliant'}
                </button> */}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contract State */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Contract State</h3>
        <p>Current State: {contractState}</p>
      </div>
    </div>
  );
} 