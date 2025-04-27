import { Mina } from 'o1js';

// Configure the network
// const networkId = NetworkId.TESTNET;
const minaGraphqlEndpoint = 'https://api.testnet.minaexplorer.com/graphql';

// Initialize the network
export function initializeNetwork() {
  const network = Mina.Network({
    mina: minaGraphqlEndpoint,
    archive: 'https://api.testnet.minaexplorer.com/archive',
  });

  Mina.setActiveInstance(network);
}

// Contract address
export const CONTRACT_ADDRESS = 'B62qpZLhm42GTo1YD2LZEjUEfR73BAihanC2uDVqP3QCPkKDMCbZ155'; 