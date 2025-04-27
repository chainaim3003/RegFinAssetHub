import { Contract, JsonRpcProvider, BrowserProvider } from 'ethers';

export const ASSET_HUB_CONFIG = {
  name: 'Westend Asset Hub',
  rpc: 'https://westend-asset-hub-eth-rpc.polkadot.io',
  chainId: 420420421,
  blockExplorer: 'https://westend-asset-hub.subscan.io/',
};

const ULTRA_MINIMAL_INVOICE_ABI = [
  {
    inputs: [{ name: 'price', type: 'uint256' }],
    name: 'create',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'id', type: 'uint256' }],
    name: 'buy',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ name: 'id', type: 'uint256' }],
    name: 'getInvoice',
    outputs: [
      { name: 'owner', type: 'address' },
      { name: 'price', type: 'uint256' },
      { name: 'forSale', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'id', type: 'uint256' },
      { name: 'price', type: 'uint256' },
      { name: 'isCompliant', type: 'bool' },
    ],
    name: 'setCompliant',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'id', type: 'uint256' },
      { name: 'freeze', type: 'bool' },
    ],
    name: 'setFreeze',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

let providerInstance: JsonRpcProvider | null = null;
let contractInstance: Contract | null = null;

export function getProvider() {
  if (!providerInstance) {
    providerInstance = new JsonRpcProvider(ASSET_HUB_CONFIG.rpc, {
      chainId: ASSET_HUB_CONFIG.chainId,
      name: ASSET_HUB_CONFIG.name,
    });
  }
  return providerInstance;
}

export async function getSigner() {
  if (typeof window !== 'undefined' && window.ethereum) {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const ethersProvider = new BrowserProvider(window.ethereum);
    return ethersProvider.getSigner();
  }
  throw new Error('No Ethereum browser provider detected');
}

export function getContract() {
  if (!contractInstance) {
    const provider = getProvider();
    contractInstance = new Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '',
      ULTRA_MINIMAL_INVOICE_ABI,
      provider
    );
  }
  return contractInstance;
}

export async function getSignedContract() {
  const signer = await getSigner();
  return new Contract(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '',
    ULTRA_MINIMAL_INVOICE_ABI,
    signer
  );
}

export { ULTRA_MINIMAL_INVOICE_ABI }; 