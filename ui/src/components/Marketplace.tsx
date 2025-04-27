"use client"
import React, { useState, useEffect } from 'react';
import { useMarketplace, MarketplaceInvoice } from '../hooks/useMarketplace';
import { useWallet } from '../hooks/useWallet';

export function Marketplace() {
  const {
    loading: marketplaceLoading,
    error: marketplaceError,
    createInvoice,
    buyInvoice,
    getInvoiceDetails,
    setCompliant,
    setFreeze,
  } = useMarketplace();

  const { account, loading: walletLoading, error: walletError, connectWallet } = useWallet();

  const [invoices, setInvoices] = useState<MarketplaceInvoice[]>([]);
  const [newInvoicePrice, setNewInvoicePrice] = useState('');
  const [selectedInvoice] = useState<MarketplaceInvoice | null>(null);
  const [compliancePrice, setCompliancePrice] = useState('');
  const [isCompliant, setIsCompliant] = useState(true);

  useEffect(() => {
    if (account) {
      loadInvoices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  const loadInvoices = async () => {
    try {
      // TODO: Implement a way to get all invoices
      // For now, we'll just load a few example invoices
      const exampleInvoices = await Promise.all([
        getInvoiceDetails(1),
        getInvoiceDetails(2),
        // getInvoiceDetails(3),
      ]);
      setInvoices(exampleInvoices);
    } catch (err) {
      console.error('Failed to load invoices:', err);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoicePrice || !account) return;

    try {
      await createInvoice(parseFloat(newInvoicePrice));
      setNewInvoicePrice('');
      await loadInvoices();
    } catch (err) {
      console.error('Failed to create invoice:', err);
    }
  };

  const handleBuyInvoice = async (id: number) => {
    if (!account) {
      await connectWallet();
      return;
    }

    try {
      await buyInvoice(id);
      await loadInvoices();
    } catch (err) {
      console.error('Failed to buy invoice:', err);
    }
  };

  const handleSetCompliance = async (id: number) => {
    if (!compliancePrice || !account) return;

    try {
      await setCompliant(id, parseFloat(compliancePrice), isCompliant);
      setCompliancePrice('');
      setIsCompliant(true);
      await loadInvoices();
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
      await loadInvoices();
    } catch (err) {
      console.error('Failed to set freeze status:', err);
    }
  };

  if (marketplaceLoading || walletLoading) return <div>Loading...</div>;
  if (marketplaceError) return <div>Marketplace Error: {marketplaceError}</div>;
  if (walletError) return <div>Wallet Error: {walletError}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Invoice Marketplace</h2>

      {!account ? (
        <button
          onClick={connectWallet}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-6"
        >
          Connect Wallet
        </button>
      ) : (
        <>
          {/* Create Invoice Form */}
          <form onSubmit={handleCreateInvoice} className="mb-6">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Invoice Price (ETH)</label>
              <input
                type="number"
                value={newInvoicePrice}
                onChange={(e) => setNewInvoicePrice(e.target.value)}
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
              Create Invoice
            </button>
          </form>

          {/* Invoice List */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Available Invoices</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="border rounded p-4">
                  <div className="mb-2">
                    <span className="font-semibold">ID:</span> {invoice.id}
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">Owner:</span> {invoice.owner}
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">Price:</span> {invoice.price} ETH
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">Compliance:</span>{' '}
                    {invoice.isCompliant ? 'Verified' : 'Not Verified'}
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">Frozen:</span>{' '}
                    {invoice.isFrozen ? 'Yes' : 'No'}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleBuyInvoice(invoice.id)}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Buy
                    </button>
                    <button
                      onClick={() => handleSetFreeze(invoice.id, !invoice.isFrozen)}
                      className={`${invoice.isFrozen ? 'bg-red-500' : 'bg-yellow-500'
                        } text-white px-4 py-2 rounded hover:opacity-90`}
                    >
                      {invoice.isFrozen ? 'Unfreeze' : 'Freeze'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Form */}
          {selectedInvoice && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Set Compliance</h3>
              <form onSubmit={(e) => { e.preventDefault(); handleSetCompliance(selectedInvoice.id); }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">New Price (ETH)</label>
                  <input
                    type="number"
                    value={compliancePrice}
                    onChange={(e) => setCompliancePrice(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Enter new price"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isCompliant}
                      onChange={(e) => setIsCompliant(e.target.checked)}
                      className="mr-2"
                    />
                    Is Compliant
                  </label>
                </div>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Update Compliance
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
} 