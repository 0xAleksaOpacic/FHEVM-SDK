export type NetworkMode = 'localhost' | 'sepolia';

/**
 * Network mode from environment variable
 * Defaults to 'localhost' for local development
 * Set NEXT_PUBLIC_NETWORK_MODE=sepolia to use Sepolia testnet
 */
export const NETWORK_MODE: NetworkMode = 
  (process.env.NEXT_PUBLIC_NETWORK_MODE as NetworkMode) || 'localhost';

