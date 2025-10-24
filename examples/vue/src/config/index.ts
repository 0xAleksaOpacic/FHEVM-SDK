export type NetworkMode = 'localhost' | 'sepolia';

/**
 * Network mode from environment variable
 * Defaults to 'localhost' for local development
 * Set VITE_NETWORK_MODE=sepolia to use Sepolia testnet
 */
export const NETWORK_MODE: NetworkMode = 
  (import.meta.env.VITE_NETWORK_MODE as NetworkMode) || 'localhost';

