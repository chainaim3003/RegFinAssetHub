// import { ApiPromise, WsProvider } from '@polkadot/api';

// export interface AccountInfo {
//   nonce: number;
//   balance: {
//     free: bigint;
//   };
// }

// let api: ApiPromise | null = null;

// export async function initializeApi() {
//   if (!api) {
//     const wsProvider = new WsProvider('wss://rpc.polkadot.io');
//     api = await ApiPromise.create({ provider: wsProvider });
//   }
//   return api;
// }

// export async function getAccountInfo(address: string): Promise<AccountInfo> {
//   const api = await initializeApi();
//   const { nonce, data: balance } = await api.query.system.account(address);

//   return {
//     nonce: nonce.toNumber(),
//     balance: {
//       free: balance.free.toBigInt()
//     }
//   };
// }

// // Verify the connection by getting the chain's genesis hash
// // console.log('Genesis Hash:', (api).genesisHash.toHex());


// // // Get the minimum balance required for a new account
// // const minBalance = api.consts.balances.existentialDeposit.toNumber();

// // // Example address
// // const address = '5DTestUPts3kjeXSTMyerHihn1uwMfLj8vU8sqF7qYrFabHE';

// // // Get current timestamp
// // const timestamp = await api.query.timestamp.now();

// // // Get account information
// // const { nonce, data: balance } = await api.query.system.account(address);

// // console.log(`
// //   Timestamp: ${timestamp}
// //   Free Balance: ${balance.free}
// //   Nonce: ${nonce}
// // `);


// // export { nonce, data, minBalance }