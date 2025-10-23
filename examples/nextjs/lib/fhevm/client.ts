// FHEVM client initialization for localhost mock mode

import { LOCALHOST_FHEVM_CONFIG, LOCALHOST_RPC_URL } from '@/config/localhost';

/**
 * Initializes the FHEVM mock client for localhost Hardhat node
 * Uses createMockClient from @fhevm/sdk/mock for local development
 */
export async function initializeFhevmClient() {
  // Dynamic imports to avoid SSR issues
  const { JsonRpcProvider } = await import('ethers');
  const { createMockClient } = await import('@fhevm/sdk/mock');
  
  // Create ethers provider using configured RPC URL
  const provider = new JsonRpcProvider(LOCALHOST_RPC_URL);
  
  // Create and return mock client
  const client = await createMockClient(provider, LOCALHOST_FHEVM_CONFIG);
  
  return client;
}

