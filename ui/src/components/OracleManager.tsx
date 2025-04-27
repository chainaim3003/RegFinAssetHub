"use client"
import React, { useState, useEffect } from 'react';
import { useContract } from '../hooks/useContract';
import { useGLEIFContract } from '../hooks/useGLEIFContract';

export function OracleManager() {
  const { loading: oracleLoading, error: oracleError, addOracle, listOracles, removeOracle } = useContract();
  const { loading: gleifLoading, error: gleifError, contractState, loadContractState } = useGLEIFContract();
  const [oracles, setOracles] = useState<string[]>([]);
  const [newOracleName, setNewOracleName] = useState('');
  const [newOracleKey, setNewOracleKey] = useState('');

  useEffect(() => {
    loadOracles();
    loadContractState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadOracles = async () => {
    const oracleList = await listOracles();
    setOracles(oracleList);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAddOracle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOracleName || !newOracleKey) return;

    await addOracle(newOracleName, newOracleKey);
    setNewOracleName('');
    setNewOracleKey('');
    await loadOracles();
  };

  const handleRemoveOracle = async (name: string) => {
    await removeOracle(name);
    await loadOracles();
  };

  if (oracleLoading || gleifLoading) return <div>Loading...</div>;
  if (oracleError) return <div>Oracle Error: {oracleError}</div>;
  if (gleifError) return <div>GLEIF Error: {gleifError}</div>;

  return (
    <div className="p-4 text-black">
      <h2 className="text-2xl font-bold mb-4">Oracle Management</h2>

      {/* Add Oracle Form */}
      {/* <form onSubmit={handleAddOracle} className="mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Oracle Name</label>
          <input
            type="text"
            value={newOracleName}
            onChange={(e) => setNewOracleName(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter oracle name"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Private Key</label>
          <input
            type="text"
            value={newOracleKey}
            onChange={(e) => setNewOracleKey(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter private key"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Oracle
        </button>
      </form> */}

      {/* Oracle List */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Registered Oracles</h3>
        <ul className="space-y-2">
          {oracles.map((oracle) => (
            <li key={oracle} className="flex items-center justify-between p-2 bg-gray-100 rounded">
              <span>{oracle}</span>
              <button
                onClick={() => handleRemoveOracle(oracle)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* GLEIF Contract State */}
      <div>
        <h3 className="text-xl font-semibold mb-2">GLEIF Contract State</h3>
        <p>Current State: {contractState}</p>
      </div>
    </div>
  );
} 