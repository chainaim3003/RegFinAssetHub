import { Contract, JsonRpcProvider, BrowserProvider } from 'ethers';

export const ASSET_HUB_CONFIG = {
  name: 'Westend Asset Hub',
  rpc: 'https://westend-asset-hub-eth-rpc.polkadot.io',
  chainId: 420420421,
  blockExplorer: 'https://westend-asset-hub.subscan.io/',
};

const ULTRA_MINIMAL_INVOICE_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "buy",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      }
    ],
    "name": "create",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      }
    ],
    "name": "Created",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isCompliant",
        "type": "bool"
      }
    ],
    "name": "setCompliant",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "freeze",
        "type": "bool"
      }
    ],
    "name": "setFreeze",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "to",
        "type": "address"
      }
    ],
    "name": "Transferred",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "frozen",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "getInvoice",
    "outputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "forSale",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]

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