import { useState, useCallback } from 'react';
import { useFhevm } from './useFhevm';
import { useWalletClient } from 'wagmi';
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
 * Hook for user-specific decryption of encrypted values
 * Requires user signature (EIP-712) to prove ownership
 * 
 * Supports both single and batch decryption:
 * - Single: `decrypt(handle)` → returns `bigint | boolean | string`
 * - Batch: `decrypt([handle1, handle2])` → returns `Record<string, bigint | boolean | string>`
 * 
 * For batch operations, only ONE signature is required for all handles!
 * 
 * Signature caching reduces wallet popups:
 * - `cacheType: 'session'` - cached until tab closes
 * - `cacheType: 'persistent'` - cached for `duration` days
 */
export function useFhevmUserDecrypt({ 
  contractAddress, 
  cacheType, 
  duration 
}: UseFhevmUserDecryptOptions) {
  const { client, isReady } = useFhevm();
  const { data: walletClient } = useWalletClient();
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Single handle overload
  function decrypt(handle: string): Promise<bigint | boolean | string>;
  // Batch handles overload
  function decrypt(handles: string[]): Promise<Record<string, bigint | boolean | string>>;
  // Implementation
  function decrypt(
    handleOrHandles: string | string[]
  ): Promise<bigint | boolean | string | Record<string, bigint | boolean | string>> {
    return new Promise(async (resolve, reject) => {
      if (!isReady || !client) {
        reject(new Error('FHEVM client is not ready'));
        return;
      }

      if (!walletClient) {
        reject(new Error('Wallet not connected'));
        return;
      }

      setIsDecrypting(true);
      setError(null);

      try {
        const isSingle = typeof handleOrHandles === 'string';

        // Adapt wagmi's walletClient to SDK's FhevmSigner interface
        const signer = {
          account: {
            address: walletClient.account.address,
          },
          signTypedData: async (args: any) => {
            return await walletClient.signTypedData({
              account: walletClient.account,
              domain: args.domain,
              types: args.types,
              primaryType: args.primaryType,
              message: args.message,
            });
          },
        };

        // Decrypt using SDK (single or batch)
        if (isSingle) {
          const decrypted = await client.userDecrypt({
            handle: handleOrHandles,
            contractAddress,
            signer,
            cacheType,
            duration,
          });
          resolve(decrypted);
        } else {
          const decrypted = await client.userDecrypt({
            handles: handleOrHandles,
            contractAddress,
            signer,
            cacheType,
            duration,
          });
          resolve(decrypted);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('User decryption failed');
        setError(error);
        reject(error);
      } finally {
        setIsDecrypting(false);
      }
    });
  }

  /**
   * Clear all cached signatures
   * Useful for logout or when user wants to invalidate cached signatures
   */
  const clearCache = useCallback(async () => {
    if (!cacheType || cacheType === 'none') return;
    
    try {
      const storage = cacheType === 'session' 
        ? createSessionStorage() 
        : createIndexedDBStorage();
      
      await storage.clearSignatures();
    } catch (err) {
      console.error('[useFhevmUserDecrypt] Failed to clear cache:', err);
    }
  }, [cacheType]);

  return {
    decrypt,
    clearCache,
    isDecrypting,
    error,
  };
}

