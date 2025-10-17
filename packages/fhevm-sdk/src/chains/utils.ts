import { sepolia } from './definitions/sepolia';

/**
 * All supported FHEVM chains
 */
export const chains = [sepolia] as const;

/**
 * Get chain configuration by chain ID
 * 
 * @param chainId - Chain ID to look up
 * @returns Chain configuration or undefined if not found
 */
export function getChainById(chainId: number) {
  return chains.find(chain => chain.id === chainId);
}

/**
 * Check if a chain is supported
 * 
 * @param chainId - Chain ID to check
 * @returns True if chain is supported
 */
export function isSupportedChain(chainId: number): boolean {
  return chains.some(chain => chain.id === chainId);
}

/**
 * Get list of all supported chain IDs
 * 
 * @returns Array of supported chain IDs
 */
export function getSupportedChainIds(): number[] {
  return chains.map(chain => chain.id);
}

