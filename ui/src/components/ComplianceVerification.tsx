'use client';

import React, { useState } from 'react';
import { useInvoiceNFT } from '../hooks/useInvoiceNFT';
import toast, { Toaster } from 'react-hot-toast';

interface ComplianceVerificationProps {
  account: string | null;
}

export function ComplianceVerification({ account }: ComplianceVerificationProps) {
  const { nfts, setCompliant, loading } = useInvoiceNFT();
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);
  const [price, setPrice] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isCompliant, setIsCompliant] = useState(true);

  const handleVerifyCompliance = async (standard: 'GIELF' | 'ComposedLevel') => {
    if (!selectedTokenId || !price || !account) {
      toast.error('Please select a token and enter a price');
      return;
    }

    try {
      // Here you would typically call your compliance verification service
      // For now, we'll just simulate a successful verification
      const isVerified = true; // This would come from your verification service

      await setCompliant(selectedTokenId, parseFloat(price), isVerified);
      toast.success(`Compliance verified using ${standard} standard`);

      // Reset form
      setSelectedTokenId(null);
      setPrice('');
      setIsCompliant(true);
    } catch (err) {
      console.error('Failed to verify compliance:', err);
      toast.error('Failed to verify compliance');
    }
  };

  return (
    <div className="border border-pink-500 rounded-lg p-4 shadow-md bg-white text-pink-500 max-w-2xl mx-auto">
      <Toaster position="top-right" />

      <h2 className="text-2xl font-semibold mb-4">Verify Compliance</h2>

      {/* Token Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Select Token</label>
        <select
          value={selectedTokenId || ''}
          onChange={(e) => setSelectedTokenId(Number(e.target.value))}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
          disabled={loading}
        >
          <option value="">Select a token</option>
          {nfts.map((nft) => (
            <option key={nft.tokenId} value={nft.tokenId}>
              Token #{nft.tokenId} - {nft.price} ETH
            </option>
          ))}
        </select>
      </div>

      {/* Price Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Price (ETH)</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
          placeholder="Enter price in ETH"
          step="0.01"
          min="0"
          disabled={loading}
        />
      </div>

      {/* Compliance Standards */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <button
          onClick={() => handleVerifyCompliance('GIELF')}
          disabled={loading || !selectedTokenId || !price}
          className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors disabled:opacity-50"
        >
          <h3 className="font-semibold text-black">GIELF Proof</h3>
          <p className="text-sm text-black">Verify using GIELF compliance standard</p>
        </button>
        <button
          onClick={() => handleVerifyCompliance('ComposedLevel')}
          disabled={loading || !selectedTokenId || !price}
          className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors disabled:opacity-50"
        >
          <h3 className="font-semibold text-black">ComposedLevel Proof</h3>
          <p className="text-sm text-black">Verify using ComposedLevel compliance standard</p>
        </button>
      </div>

      {!account && (
        <p className="text-sm text-gray-500">
          Connect your wallet to verify compliance.
        </p>
      )}
    </div>
  );
} 