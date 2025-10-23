// FHEVM client initialization for localhost and Sepolia

import { LOCALHOST_FHEVM_CONFIG, LOCALHOST_RPC_URL } from '@/config/localhost';
import type { NetworkMode } from '@/config';

/**
 * Initializes the FHEVM client based on network mode
 * - localhost: Uses createMockClient for local Hardhat node
 * - sepolia: Uses createClient with real FHEVM infrastructure
 */
export async function initializeFhevmClient(mode: NetworkMode) {
  if (mode === 'localhost') {
    // Mock client for localhost development
    const { JsonRpcProvider } = await import('ethers');
    const { createMockClient } = await import('@fhevm/sdk/mock');
    
    const provider = new JsonRpcProvider(LOCALHOST_RPC_URL);
    const client = await createMockClient(provider, LOCALHOST_FHEVM_CONFIG);
    
    return client;
  } else {
    // Real client for Sepolia testnet
    const { createClient, sepolia } = await import('@fhevm/sdk');
    
    const client = createClient({
      provider: window.ethereum,  // Use MetaMask/injected provider
      chain: sepolia,              // Built-in Sepolia config from SDK
      debug: true,                 // Enable debug logging
    });
    
    console.log('[FHEVM] Client created, initializing...');
    await client.initialize();
    console.log('[FHEVM] Client initialized successfully!');
    return client;
  }
}

