import { useCallback } from 'react';
import { useFhevm } from './useFhevm';

export interface UseFhevmEncryptOptions {
  /**
   * The contract address to encrypt for
   */
  contractAddress: string;
}

/**
 * Hook for creating encrypted inputs for FHEVM contracts
 * 
 * @example
 * ```tsx
 * const { createInput, isReady } = useFhevmEncrypt({ 
 *   contractAddress: '0x...' 
 * });
 * 
 * if (isReady) {
 *   const input = createInput(userAddress);
 *   input.add32(1);
 *   input.add64(100n);
 *   const encrypted = await input.encrypt();
 *   // Use encrypted.handles[0] and encrypted.inputProof
 * }
 * ```
 */
export function useFhevmEncrypt({ contractAddress }: UseFhevmEncryptOptions) {
  const { client, isReady } = useFhevm();

  const createInput = useCallback(
    (userAddress: string) => {
      if (!isReady || !client) {
        throw new Error('FHEVM client is not ready');
      }

      const instance = client.getInstance();
      if (!instance) {
        throw new Error('FHEVM instance not initialized');
      }

      return instance.createEncryptedInput(contractAddress, userAddress);
    },
    [client, isReady, contractAddress]
  );

  return {
    createInput,
    isReady,
  };
}
