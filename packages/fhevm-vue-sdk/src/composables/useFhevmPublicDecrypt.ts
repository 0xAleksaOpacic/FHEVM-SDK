import { ref } from 'vue';
import { useFhevm } from './useFhevm';

/**
 * Composable for public decryption of encrypted values
 * Anyone can decrypt values that were marked as publicly decryptable
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useFhevmPublicDecrypt } from '@fhevm/vue-sdk';
 * 
 * const { decrypt, isDecrypting, error } = useFhevmPublicDecrypt();
 * 
 * const value = await decrypt('0x123...');
 * </script>
 * ```
 */
export function useFhevmPublicDecrypt() {
  const { client, isReady } = useFhevm();
  const isDecrypting = ref(false);
  const error = ref<Error | null>(null);

  const decrypt = async (handle: string): Promise<bigint | boolean | string> => {
    if (!isReady.value || !client.value) {
      throw new Error('FHEVM client is not ready');
    }

    isDecrypting.value = true;
    error.value = null;

    try {
      const decrypted = await client.value.publicDecrypt([handle]);
      return decrypted[handle];
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Public decryption failed');
      error.value = errorObj;
      throw errorObj;
    } finally {
      isDecrypting.value = false;
    }
  };

  return {
    decrypt,
    isDecrypting,
    error,
  };
}

