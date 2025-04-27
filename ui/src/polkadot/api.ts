import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring';
import { KeyringPair } from '@polkadot/keyring/types';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { AccountInfo } from '@polkadot/types/interfaces';
import { u32 } from '@polkadot/types';

// Testnet WebSocket URL
const WS_URL = 'wss://westend-asset-hub-rpc.polkadot.io';

let api: ApiPromise | null = null;

export async function getApi(): Promise<ApiPromise> {
  if (!api) {
    const wsProvider = new WsProvider(WS_URL);
    api = await ApiPromise.create({ provider: wsProvider });
  }
  return api;
}

export interface Account {
  name: string;
  mnemonic: string;
  address: string;
}

export const TEST_ACCOUNTS: Record<string, Account> = {
  buyer: {
    name: 'Buyer',
    mnemonic: process.env.ACCOUNT_SEED || '', // Replace with actual mnemonic
    address: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty'
  },
  seller: {
    name: 'Seller',
    mnemonic: process.env.ACCOUNT_SEED || '', // Replace with actual mnemonic
    address: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y'
  },
  freezer: {
    name: 'Freezer',
    mnemonic: process.env.ACCOUNT_SEED || '', // Replace with actual mnemonic
    address: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy'
  }
};

export function getAccountPair(account: InjectedAccountWithMeta): KeyringPair {
  const keyring = new Keyring({ type: 'sr25519' });
  return keyring.addFromAddress(account.address);
}

export async function getAccountBalance(address: string): Promise<string> {
  const api = await getApi();
  const accountInfo = await api.query.system.account(address) as unknown as AccountInfo;
  return accountInfo.data.free.toString();
}

export async function createAsset(admin: InjectedAccountWithMeta, name: string, symbol: string, decimals: number, minBalance: number) {
  const api = await getApi();
  const adminPair = getAccountPair(admin);
  const nextAssetId = await api.query.assets.nextAssetId() as unknown as u32;
  const assetId = nextAssetId.toNumber();

  return api.tx.assets.create(
    assetId,
    adminPair.address,
    minBalance
  ).signAndSend(adminPair);
}

export async function mintAsset(assetId: number, to: string, amount: number, issuer: InjectedAccountWithMeta) {
  const api = await getApi();
  const issuerPair = getAccountPair(issuer);

  return api.tx.assets.mint(
    assetId,
    to,
    amount
  ).signAndSend(issuerPair);
}

export async function setAssetMetadata(assetId: number, name: string, symbol: string, decimals: number, admin: InjectedAccountWithMeta) {
  const api = await getApi();
  const adminPair = getAccountPair(admin);

  return api.tx.assets.setMetadata(
    assetId,
    name,
    symbol,
    decimals
  ).signAndSend(adminPair);
}

export async function setAssetAttribute(assetId: number, key: string, value: string, admin: InjectedAccountWithMeta) {
  const api = await getApi();
  const adminPair = getAccountPair(admin);

  return api.tx.assets.setAttribute(
    assetId,
    key,
    value
  ).signAndSend(adminPair);
}

export async function freezeAccount(assetId: number, target: string, freezer: InjectedAccountWithMeta) {
  const api = await getApi();
  const freezerPair = getAccountPair(freezer);

  return api.tx.assets.freeze(
    assetId,
    target
  ).signAndSend(freezerPair);
} 