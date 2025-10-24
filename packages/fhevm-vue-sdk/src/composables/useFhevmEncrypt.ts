import { computed } from 'vue';
import { useFhevm } from './useFhevm';

export interface UseFhevmEncryptOptions {
  /**
   * The contract address to encrypt for
   */
  contractAddress: string;
}

/**
 * Composable for creating encrypted inputs for FHEVM contracts
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useFhevmEncrypt } from '@fhevm/vue-sdk';
 * 
 * const { createInput, isReady } = useFhevmEncrypt({ 
 *   contractAddress: '0x...' 
 * });
 * 
 * if (isReady.value) {
 *   const input = createInput(userAddress);
 *   input.add32(1);
 *   input.add64(100n);
 *   const encrypted = await input.encrypt();
 *   // Use encrypted.handles[0] and encrypted.inputProof
 * }
 * </script>
 * ```
 */
export function useFhevmEncrypt({ contractAddress }: UseFhevmEncryptOptions) {
  const { client, isReady } = useFhevm();

  const createInput = (userAddress: string) => {
    if (!isReady.value || !client.value) {
      throw new Error('FHEVM client is not ready');
    }

    const instance = client.value.getInstance();
    if (!instance) {
      throw new Error('FHEVM instance not initialized');
    }

    return instance.createEncryptedInput(contractAddress, userAddress);
  };

  return {
    createInput,
    isReady: computed(() => isReady.value), // Return computed for consistency
  };
}

