import { COUNTER_ABI } from './contracts';

// NOTE: FHEVM contract addresses (ACL, KMS, InputVerifier, etc.) 
// are built into the SDK's 'sepolia' export and match official docs.
// No need to hardcode them here!

// Sepolia RPC URL
// Default: PublicNode's free RPC endpoint
// Override via NEXT_PUBLIC_SEPOLIA_RPC_URL if needed
export const SEPOLIA_RPC_URL = 
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';

// FHECounter contract deployed on Sepolia
// Default: 0x6134E9810A204661eaB5a189A44BB7F1CB2a4196
// Override via NEXT_PUBLIC_SEPOLIA_COUNTER_ADDRESS if you deploy your own
export const SEPOLIA_COUNTER_ADDRESS = 
  process.env.NEXT_PUBLIC_SEPOLIA_COUNTER_ADDRESS || '0x6134E9810A204661eaB5a189A44BB7F1CB2a4196';

// Full contract config for Sepolia
export const SEPOLIA_COUNTER = {
  address: SEPOLIA_COUNTER_ADDRESS,
  abi: COUNTER_ABI,
} as const;

