'use client';

import { useEffect, useState } from 'react';
import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';


interface WalletSelectorProps {
  onSelect: (account: InjectedAccountWithMeta) => void;
  selectedAddress?: string;
}

export default function WalletSelector({ onSelect, selectedAddress }: WalletSelectorProps) {
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Enable the extension
        await web3Enable('Polkadot AssetHub DApp');

        // Get all accounts
        const allAccounts = await web3Accounts();
        setAccounts(allAccounts);
      } catch (err) {
        setError('Failed to load accounts. Please make sure the Polkadot extension is installed and unlocked.');
        console.error('Error loading accounts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAccounts();
  }, []);

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Loading accounts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-700">No accounts found. Please add an account to your Polkadot extension.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label htmlFor="wallet-select" className="block text-sm font-medium text-gray-700">
        Select Account
      </label>
      <select
        id="wallet-select"
        value={selectedAddress || ''}
        onChange={(e) => {
          const selectedAccount = accounts.find(acc => acc.address === e.target.value);
          if (selectedAccount) {
            onSelect(selectedAccount);
          }
        }}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select an account</option>
        {accounts.map((account) => (
          <option key={account.address} value={account.address}>
            {account.meta.name} ({account.address.slice(0, 6)}...{account.address.slice(-4)})
          </option>
        ))}
      </select>
    </div>
  );
} 