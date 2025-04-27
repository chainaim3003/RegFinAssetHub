"use client"
import { useState, useEffect, useCallback } from 'react';

export function useWallet() {
  const [account, setAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!window.ethereum) {
        throw new Error('Please install MetaMask to use this feature');
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      setAccount(accounts[0]);
      return accounts[0];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
  }, []);

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }
        } catch (err) {
          console.error('Failed to check wallet connection:', err);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        setAccount(accounts[0] || null);
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => { });
      }
    };
  }, []);

  return {
    account,
    loading,
    error,
    connectWallet,
    disconnectWallet,
  };
} 