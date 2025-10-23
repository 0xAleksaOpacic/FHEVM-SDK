import { COUNTER_ABI } from './contracts';

/**
 * Localhost configuration
 * FHEVM addresses are provided by @fhevm/sdk's localhost export
 * Only RPC URL and example contract addresses are needed here
 */

export const LOCALHOST_RPC_URL = 
  process.env.NEXT_PUBLIC_LOCALHOST_RPC_URL || 'http://localhost:8545';

export const LOCALHOST_COUNTER_ADDRESS = 
  process.env.NEXT_PUBLIC_LOCALHOST_COUNTER_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';

// Full contract config for localhost
export const LOCALHOST_COUNTER = {
  address: LOCALHOST_COUNTER_ADDRESS,
  abi: COUNTER_ABI,
} as const;