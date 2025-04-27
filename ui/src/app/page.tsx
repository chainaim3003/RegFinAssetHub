'use client';

import { useState, useEffect } from 'react';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import WalletSelector from '../components/WalletSelector';
import {
  freezeAccount,
  getAccountBalance
} from '../polkadot/api';
import { OracleManager } from '../components/OracleManager';
import { useGLEIFContract } from '../hooks/useGLEIFContract';
import { GLEIFProof, GLEIFPublicOutput } from '@contracts/src/contracts/GLEIFZKProgramWithSign';
import { InvoiceNFTManager } from '@/components/InvoiceNFTManager';
import { useWallet } from '@/hooks/useWallet';
import { useInvoiceNFT } from '../hooks/useInvoiceNFT';
import { Field, CircuitString } from 'o1js';

type ComplianceStatus = 'PENDING' | 'VALID' | 'INVALID' | 'FROZEN';

interface ComplianceProof {
  type: 'GIELF' | 'ComposedLevel';
  status: ComplianceStatus;
  timestamp: number;
}

export default function Home() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [selectedAccount, setSelectedAccount] = useState<InjectedAccountWithMeta | null>(null);
  const [complianceProof, setComplianceProof] = useState<ComplianceProof | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [transferAmount, setTransferAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const { verifyCompliance, contractState, loadContractState } = useGLEIFContract();
  const { account, loading: walletLoading, error, connectWallet } = useWallet();
  const { nfts, setCompliant, loadNFTs } = useInvoiceNFT();
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);

  useEffect(() => {
    if (account) {
      loadNFTs();
    }
  }, [account, loadNFTs]);

  const handleAccountSelect = (account: InjectedAccountWithMeta) => {
    setSelectedAccount(account);
    setCurrentStep(2);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleVerifyCompliance = async (proofType: 'GIELF' | 'ComposedLevel') => {
    if (!selectedAccount || !selectedTokenId) {
      setStatus('Please select a token first');
      return;
    }

    setLoading(true);
    setStatus('Verifying compliance...');
    try {
      // Create a GLEIF proof
      const proof = new GLEIFProof({
        proof: {},
        publicInput: new Field(0),
        publicOutput: new GLEIFPublicOutput({
          name: CircuitString.fromString(''),
          id: CircuitString.fromString('')
        }),
        maxProofsVerified: 0
      });

      // Verify compliance using the GLEIF contract
      await verifyCompliance(proof);
      // await loadContractState(); // Refresh contract state

      // Update compliance status in the smart contract
      await setCompliant(selectedTokenId, 0, true);

      setComplianceProof({
        type: proofType,
        status: 'VALID',
        timestamp: Date.now()
      });

      setStatus('Compliance verified successfully');
      if (contractState !== null) setCurrentStep(3);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setStatus(`Error verifying compliance: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!selectedAccount || !complianceProof || complianceProof.status !== 'VALID') {
      setStatus('Cannot transfer: Compliance not verified or invalid');
      return;
    }

    setLoading(true);
    setStatus('Processing transfer...');
    try {
      // Implement transfer logic here
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStatus('Transfer completed successfully');
      setCurrentStep(4);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setStatus(`Error processing transfer: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFreezeAccount = async () => {
    if (!selectedAccount) return;

    setLoading(true);
    setStatus('Freezing account...');
    try {
      await freezeAccount(
        1000, // USDC asset ID
        selectedAccount.address,
        selectedAccount
      );
      setComplianceProof(prev => prev ? { ...prev, status: 'FROZEN' } : null);
      setStatus('Account frozen successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setStatus(`Error freezing account: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckBalance = async () => {
    if (!selectedAccount) return;

    setLoading(true);
    setStatus('Checking balance...');
    try {
      const balance = await getAccountBalance(selectedAccount.address);
      setBalances(prev => ({
        ...prev,
        [selectedAccount.address]: balance
      }));
      setStatus('Balance updated');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setStatus(`Error checking balance: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (step: number) => {
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'current';
    return 'upcoming';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-12 text-center text-black">
          Web3 AssetHub Compliance
        </h1>
        <div className="flex justify-between items-center mb-8">
          {!account ? (
            <button
              onClick={connectWallet}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                Connected: {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            </div>
          )}
        </div>

        {/* {loading && <div className="text-center py-4">Loading...</div>} */}
        {/* {error && <div className="text-red-500 text-center py-4">{error}</div>} */}

        {account && (
          <div className="space-y-8">
            {/* <OracleManager /> */}
            <InvoiceNFTManager />
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {[
              { number: 1, title: 'Connect Wallet' },
              { number: 2, title: 'Verify Compliance' },
              { number: 3, title: 'Transfer Assets' },
              { number: 4, title: 'Complete' }
            ].map((step) => (
              <div key={step.number} className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${getStepStatus(step.number) === 'completed' ? 'bg-green-500' :
                    getStepStatus(step.number) === 'current' ? 'bg-blue-500' : 'bg-gray-300'}
                  text-white font-semibold
                `}>
                  {step.number}
                </div>
                <span className="mt-2 text-sm font-medium text-black">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Navigation */}
          {currentStep > 1 && (
            <div className="mb-6">
              <button
                onClick={handleBack}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Previous Step
              </button>
            </div>
          )}

          {/* Step 1: Wallet Connection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-black">Connect Your Wallet</h2>
              <p className="text-black">Select your Polkadot account to begin the compliance verification process.</p>
              <WalletSelector
                onSelect={handleAccountSelect}
                selectedAddress={selectedAccount?.address}
              />
            </div>
          )}

          {/* Step 2: Compliance Verification */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-black">Verify Compliance</h2>

              {/* Token Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Token
                </label>
                <select
                  value={selectedTokenId || ''}
                  onChange={(e) => setSelectedTokenId(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                >
                  <option value="">Select a token</option>
                  {nfts.map((nft) => (
                    <option key={nft.tokenId} value={nft.tokenId}>
                      Token ID: {nft.tokenId} - {nft.complianceVerified ? 'Verified' : 'Not Verified'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleVerifyCompliance('GIELF')}
                  disabled={loading || !selectedTokenId}
                  className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <h3 className="font-semibold text-black">GIELF Proof</h3>
                  <p className="text-sm text-black">Verify using GIELF compliance standard</p>
                </button>
                <button
                  onClick={() => handleVerifyCompliance('ComposedLevel')}
                  disabled={loading || !selectedTokenId}
                  className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <h3 className="font-semibold text-black">ComposedLevel Proof</h3>
                  <p className="text-sm text-black">Verify using ComposedLevel compliance standard</p>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Asset Transfer */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-black">Transfer Assets</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    placeholder="Enter recipient address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Amount (USDC)
                  </label>
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    placeholder="Enter amount"
                  />
                </div>
                <button
                  onClick={handleTransfer}
                  disabled={loading || !transferAmount || !recipientAddress}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  Transfer USDC
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Completion */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-black">Transfer Complete</h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-black">Your transfer has been completed successfully!</p>
              </div>
            </div>
          )}

          {/* Status and Compliance Info */}
          {status && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-black">{status}</p>
            </div>
          )}

          {complianceProof && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-black mb-2">Compliance Status</h3>
              <div className="flex items-center space-x-2">
                <div className={`
                  w-3 h-3 rounded-full
                  ${complianceProof.status === 'VALID' ? 'bg-green-500' :
                    complianceProof.status === 'INVALID' ? 'bg-red-500' :
                      complianceProof.status === 'FROZEN' ? 'bg-gray-500' : 'bg-yellow-500'}
                `} />
                <span className="text-black">
                  {complianceProof.type} Proof: {complianceProof.status}
                </span>
              </div>
            </div>
          )}

          {/* Account Management */}
          {selectedAccount && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-black mb-4">Account Management</h3>
              <div className="flex space-x-4">
                <button
                  onClick={handleCheckBalance}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-black transition-colors"
                >
                  Check Balance
                </button>
                <button
                  onClick={handleFreezeAccount}
                  disabled={loading}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 rounded-md text-black transition-colors"
                >
                  Freeze Account
                </button>
              </div>
            </div>
          )}

          {/* Balance Display */}
          {Object.keys(balances).length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-black mb-2">Account Balances</h3>
              <div className="space-y-2">
                {Object.entries(balances).map(([address, balance]) => (
                  <p key={address} className="text-black">
                    <span className="font-medium">{address.slice(0, 6)}...{address.slice(-4)}:</span> {balance}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Oracle Management Section */}
        <div className="mt-8 text-black">
          <h2 className="text-2xl font-semibold mb-4 text-gray-600">Oracle Management</h2>
          <OracleManager />
        </div>

        {/* Contract State Display */}
        <div className="mt-8 text-gray-600">
          <h2 className="text-2xl font-semibold mb-4">Contract State</h2>
          <div className="bg-white p-6 rounded-lg shadow">
            <p>Current State: {contractState}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
