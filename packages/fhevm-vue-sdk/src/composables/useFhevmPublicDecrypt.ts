import { ref } from 'vue';
import { useFhevm } from './useFhevm';

/**
 * Composable for public decryption of encrypted values
 * Anyone can decrypt values that were marked as publicly decryptable
 * 
 * Supports both single and batch decryption:
 * - Single: `decrypt(handle)` → returns `bigint | boolean | string`
 * - Batch: `decrypt([handle1, handle2])` → returns `Record<string, bigint | boolean | string>`
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useFhevmPublicDecrypt } from '@fhevm/vue-sdk';
 * 
 * const { decrypt, isDecrypting, error } = useFhevmPublicDecrypt();
 * 
 * // Single decryption
 * const value = await decrypt('0x123...');
 * 
 * // Batch decryption
 * const values = await decrypt(['0x123...', '0x456...']);
 * </script>
 * ```
 */
export function useFhevmPublicDecrypt() {
  const { client, isReady } = useFhevm();
  const isDecrypting = ref(false);
  const error = ref<Error | null>(null);

  // Single handle overload
  function decrypt(handle: string): Promise<bigint | boolean | string>;
  // Batch handles overload
  function decrypt(handles: string[]): Promise<Record<string, bigint | boolean | string>>;
  // Implementation
  async function decrypt(
    handleOrHandles: string | string[]
  ): Promise<bigint | boolean | string | Record<string, bigint | boolean | string>> {
    if (!isReady.value || !client.value) {
      throw new Error('FHEVM client is not ready');
    }

    isDecrypting.value = true;
    error.value = null;

    try {
      const isSingle = typeof handleOrHandles === 'string';
      const handles = isSingle ? [handleOrHandles] : handleOrHandles;
      
      const decrypted = await client.value.publicDecrypt(handles);
      
      if (isSingle) {
        return decrypted[handleOrHandles as string];
      } else {
        return decrypted;
      }
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Public decryption failed');
      error.value = errorObj;
      throw errorObj;
    } finally {
      isDecrypting.value = false;
    }
  }

  return {
    decrypt,
    isDecrypting,
    error,
  };
}

