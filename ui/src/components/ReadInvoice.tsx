'use client';

import React, { useState, useEffect } from 'react';
import { getContract } from '../utils/contracts';
import { formatEther } from 'ethers';

interface Invoice {
  owner: string;
  price: string;
  isCompliant: boolean;
}

const ReadInvoice = () => {
  const [invoices, setInvoices] = useState<Record<number, Invoice>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const contract = getContract();

        // Fetch first 10 invoices (you might want to implement a way to get all invoices)
        const invoicePromises = Array.from({ length: 10 }, (_, i) =>
          contract.getInvoice(i + 1).catch(() => null)
        );

        const results = await Promise.all(invoicePromises);
        const validInvoices = results.reduce((acc, result, index) => {
          if (result) {
            acc[index + 1] = {
              owner: result[0],
              price: formatEther(result[1]),
              isCompliant: result[2],
            };
          }
          return acc;
        }, {} as Record<number, Invoice>);

        setInvoices(validInvoices);
        setError(null);
      } catch (err) {
        console.error('Error fetching invoices:', err);
        setError('Failed to fetch data from the contract');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();

    // Poll for updates every 10 seconds
    const interval = setInterval(fetchInvoices, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border border-pink-500 rounded-lg p-4 shadow-md bg-white text-pink-500 max-w-4xl mx-auto">
      <h2 className="text-lg font-bold text-center mb-4">Invoice List</h2>
      {loading ? (
        <div className="flex justify-center my-4">
          <div className="w-6 h-6 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(invoices).map(([id, invoice]) => (
            <div key={id} className="border border-pink-200 rounded-lg p-4">
              <div className="mb-2">
                <span className="font-semibold">ID:</span> {id}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Owner:</span>{' '}
                <span className="font-mono text-sm">
                  {`${invoice.owner.slice(0, 6)}...${invoice.owner.slice(-4)}`}
                </span>
              </div>
              <div className="mb-2">
                <span className="font-semibold">Price:</span> {invoice.price} ETH
              </div>
              <div className="mb-2">
                <span className="font-semibold">Compliance:</span>{' '}
                {invoice.isCompliant ? 'Verified' : 'Not Verified'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReadInvoice; 