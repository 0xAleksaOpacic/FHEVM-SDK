import { useState, useCallback } from 'react';
import { useFhevm } from './useFhevm';

/**
 * Hook for public decryption of encrypted values
 * Anyone can decrypt values that were marked as publicly decryptable
 * 
 * Supports both single and batch decryption:
 * - Single: `decrypt(handle)` → returns `bigint | boolean | string`
 * - Batch: `decrypt([handle1, handle2])` → returns `Record<string, bigint | boolean | string>`
 */
export function useFhevmPublicDecrypt() {
  const { client, isReady } = useFhevm();
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

      setIsDecrypting(true);
      setError(null);

      try {
        const isSingle = typeof handleOrHandles === 'string';
        const handles = isSingle ? [handleOrHandles] : handleOrHandles;
        
        const decrypted = await client.publicDecrypt(handles);
        
        if (isSingle) {
          resolve(decrypted[handleOrHandles as string]);
        } else {
          resolve(decrypted);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Public decryption failed');
        setError(error);
        reject(error);
      } finally {
        setIsDecrypting(false);
      }
    });
  }

  return {
    decrypt,
    isDecrypting,
    error,
  };
}

