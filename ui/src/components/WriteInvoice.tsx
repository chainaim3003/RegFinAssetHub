'use client';

import { useState } from 'react';
import { getSignedContract } from '../utils/contracts';
import { parseEther } from 'ethers';

interface WriteInvoiceProps {
  account: string | null;
  onSuccess?: () => void;
}

const WriteInvoice = ({ account, onSuccess }: WriteInvoiceProps) => {
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState({ type: 'info' | 'error' | 'success', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!account) {
      setStatus({ type: 'error', message: 'Please connect your wallet first' });
      return;
    }

    if (!price || isNaN(Number(price))) {
      setStatus({ type: 'error', message: 'Please enter a valid price' });
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus({ type: 'info', message: 'Initiating transaction...' });

      const contract = await getSignedContract();

      setStatus({
        type: 'info',
        message: 'Please confirm the transaction in your wallet...',
      });

      const tx = await contract.create(parseEther(price));

      setStatus({
        type: 'info',
        message: 'Transaction submitted. Waiting for confirmation...',
      });

      const receipt = await tx.wait();

      setStatus({
        type: 'success',
        message: `Invoice created! Transaction hash: ${receipt.hash}`,
      });
      setPrice('');
      onSuccess?.();
    } catch (err) {
      console.error('Error creating invoice:', err);

      if (err.code === 4001) {
        setStatus({ type: 'error', message: 'Transaction rejected by user.' });
      } else {
        setStatus({
          type: 'error',
          message: `Error: ${err.message || 'Failed to create invoice'}`,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBuy = async (id: number) => {
    if (!account) {
      setStatus({ type: 'error', message: 'Please connect your wallet first' });
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus({ type: 'info', message: 'Initiating transaction...' });

      const contract = await getSignedContract();

      setStatus({
        type: 'info',
        message: 'Please confirm the transaction in your wallet...',
      });

      const tx = await contract.buy(id);

      setStatus({
        type: 'info',
        message: 'Transaction submitted. Waiting for confirmation...',
      });

      const receipt = await tx.wait();

      setStatus({
        type: 'success',
        message: `Invoice purchased! Transaction hash: ${receipt.hash}`,
      });
      onSuccess?.();
    } catch (err) {
      console.error('Error buying invoice:', err);

      if (err.code === 4001) {
        setStatus({ type: 'error', message: 'Transaction rejected by user.' });
      } else {
        setStatus({
          type: 'error',
          message: `Error: ${err.message || 'Failed to buy invoice'}`,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border border-pink-500 rounded-lg p-4 shadow-md bg-white text-pink-500 max-w-sm mx-auto space-y-4">
      <h2 className="text-lg font-bold">Create New Invoice</h2>
      {status.message && (
        <div
          className={`p-2 rounded-md break-words h-fit text-sm ${status.type === 'error'
            ? 'bg-red-100 text-red-500'
            : status.type === 'success'
              ? 'bg-green-100 text-green-700'
              : 'bg-blue-100 text-blue-700'
            }`}
        >
          {status.message}
        </div>
      )}
      <form onSubmit={handleCreate} className="space-y-4">
        <input
          type="number"
          placeholder="Price in ETH"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          disabled={isSubmitting || !account}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
          step="0.01"
          min="0"
        />
        <button
          type="submit"
          disabled={isSubmitting || !account}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-gray-300"
        >
          {isSubmitting ? 'Creating...' : 'Create Invoice'}
        </button>
      </form>
      {!account && (
        <p className="text-sm text-gray-500">
          Connect your wallet to create an invoice.
        </p>
      )}
    </div>
  );
};

export default WriteInvoice; 