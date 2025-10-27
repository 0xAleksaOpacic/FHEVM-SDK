import 'dotenv/config';

export type NetworkMode = 'localhost' | 'sepolia';

// Network mode (defaults to localhost)
export const NETWORK_MODE = (process.env.NETWORK_MODE || 'localhost') as NetworkMode;

// RPC URL (always has a default)
export const RPC_URL: string = NETWORK_MODE === 'sepolia' 
  ? (process.env.SEPOLIA_RPC_URL || '')
  : (process.env.LOCALHOST_RPC_URL || 'http://127.0.0.1:8545');

// Contract address (always has a default for localhost)
export const CONTRACT_ADDRESS: string = NETWORK_MODE === 'sepolia'
  ? (process.env.SEPOLIA_COUNTER_ADDRESS || '')
  : (process.env.LOCALHOST_COUNTER_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3');

// Private key (always has a default for localhost - Hardhat test account #0)
export const PRIVATE_KEY: string = NETWORK_MODE === 'sepolia'
  ? (process.env.PRIVATE_KEY || '')
  : (process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');

// Contract ABI
export const COUNTER_ABI = [
  'function incrementPublic(bytes32 inputHandle, bytes inputProof) external',
  'function getPublicCount() external view returns (uint256)',
];

