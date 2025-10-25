import { ref } from 'vue';
import { useFhevm } from './useFhevm';
import { FhevmCacheType, createSessionStorage, createIndexedDBStorage } from '@fhevm/sdk';

export interface UseFhevmUserDecryptOptions {
  /**
   * The contract address where the encrypted value is stored
   */
  contractAddress: string;
  
  /**
   * Caching strategy for signatures
   * - 'none': No caching, always request signature (default)
   * - 'session': Cache until tab closes
   * - 'persistent': Cache across sessions (expires after duration)
   */
  cacheType?: FhevmCacheType;
  
  /**
   * Signature validity duration in days (default: 7)
   * Only applies when cacheType is set
   */
  duration?: number;
}

/**
 * Composable for user-specific decryption of encrypted values
 * Requires user signature (EIP-712) to prove ownership
 * 
 * Supports both single and batch decryption:
 * - Single: `decrypt(handle, wallet)` → returns `bigint | boolean | string`
 * - Batch: `decrypt([handle1, handle2], wallet)` → returns `Record<string, bigint | boolean | string>`
 * 
 * For batch operations, only ONE signature is required for all handles!
 * 
 * Signature caching reduces wallet popups:
 * - `cacheType: 'session'` - cached until tab closes
 * - `cacheType: 'persistent'` - cached for `duration` days
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useFhevmUserDecrypt, FhevmCacheType } from '@fhevm/vue-sdk';
 * import { useVueDapp } from '@vue-dapp/core';
 * 
 * const { wallet } = useVueDapp();
 * const { decrypt, clearCache, isDecrypting } = useFhevmUserDecrypt({ 
 *   contractAddress: '0x...',
 *   cacheType: FhevmCacheType.Session,
 *   duration: 7
 * });
 * 
 * // Single decryption
 * const value = await decrypt('0x123...', wallet);
 * 
 * // Batch decryption (ONE signature!)
 * const values = await decrypt(['0x123...', '0x456...'], wallet);
 * 
 * // Clear cache on logout
 * await clearCache();
 * </script>
 * ```
 */
export function useFhevmUserDecrypt({ 
  contractAddress, 
  cacheType, 
  duration 
}: UseFhevmUserDecryptOptions) {
  const { client, isReady } = useFhevm();
  const isDecrypting = ref(false);
  const error = ref<Error | null>(null);

  // Single handle overload
  function decrypt(handle: string, wallet: any): Promise<bigint | boolean | string>;
  // Batch handles overload
  function decrypt(handles: string[], wallet: any): Promise<Record<string, bigint | boolean | string>>;
  // Implementation
  async function decrypt(
    handleOrHandles: string | string[],
    wallet: any // vue-dapp wallet
  ): Promise<bigint | boolean | string | Record<string, bigint | boolean | string>> {
    if (!isReady.value || !client.value) {
      throw new Error('FHEVM client is not ready');
    }

    if (!wallet || !wallet.address) {
      throw new Error('Wallet not connected');
    }

    isDecrypting.value = true;
    error.value = null;

    try {
      const isSingle = typeof handleOrHandles === 'string';

      // Create signer adapter for vue-dapp wallet
      const { BrowserProvider, getAddress } = await import('ethers');
      const checksummedAddress = getAddress(wallet.address); // Ensure proper checksum
      
      const signer = {
        account: {
          address: checksummedAddress,
        },
        signTypedData: async (args: any) => {
          // Use ethers to sign with vue-dapp's provider
          const provider = new BrowserProvider((window as any).ethereum);
          const ethersSigner = await provider.getSigner();
          
          // Ethers v6 expects types WITHOUT EIP712Domain (domain passed separately)
          // SDK provides Viem-format types (with EIP712Domain), so we need to remove it
          const { EIP712Domain, ...typesWithoutDomain } = args.types;
          
          // Sign using ethers
          return await ethersSigner.signTypedData(
            args.domain,
            typesWithoutDomain,
            args.message
          );
        },
      };

      // Decrypt using SDK (single or batch)
      if (isSingle) {
        const decrypted = await client.value.userDecrypt({
          handle: handleOrHandles,
          contractAddress,
          signer,
          cacheType,
          duration,
        });
        return decrypted;
      } else {
        const decrypted = await client.value.userDecrypt({
          handles: handleOrHandles,
          contractAddress,
          signer,
          cacheType,
          duration,
        });
        return decrypted;
      }
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('User decryption failed');
      error.value = errorObj;
      throw errorObj;
    } finally {
      isDecrypting.value = false;
    }
  }

  /**
   * Clear all cached signatures
   * Useful for logout or when user wants to invalidate cached signatures
   */
  const clearCache = async () => {
    if (!cacheType || cacheType === 'none') return;
    
    try {
      const storage = cacheType === 'session' 
        ? createSessionStorage() 
        : createIndexedDBStorage();
      
      await storage.clearSignatures();
    } catch (err) {
      console.error('[useFhevmUserDecrypt] Failed to clear cache:', err);
    }
  };

  return {
    decrypt,
    clearCache,
    isDecrypting,
    error,
  };
}

