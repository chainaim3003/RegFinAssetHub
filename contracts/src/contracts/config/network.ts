import { Mina } from 'o1js';

// Configure the network
const minaGraphqlEndpoint = 'https://api.minascan.io/node/devnet/v1/graphql'; // Replace with your preferred GraphQL endpoint

// Initialize the network
export function initializeNetwork() {
   const network = Mina.Network({
      mina: minaGraphqlEndpoint,
      archive: 'https://api.minascan.io/archive', // Replace with your preferred archive endpoint
   });

   Mina.setActiveInstance(network);
} 