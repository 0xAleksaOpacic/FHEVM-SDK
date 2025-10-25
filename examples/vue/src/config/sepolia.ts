import { COUNTER_ABI } from './contracts';

/**
 * Sepolia testnet configuration
 */

export const SEPOLIA_RPC_URL = 
  import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';

export const SEPOLIA_COUNTER_ADDRESS = 
  import.meta.env.VITE_SEPOLIA_COUNTER_ADDRESS || '0x6134E9810A204661eaB5a189A44BB7F1CB2a4196';

// Full contract config for Sepolia
export const SEPOLIA_COUNTER = {
  address: SEPOLIA_COUNTER_ADDRESS,
  abi: COUNTER_ABI,
} as const;

