import { useState, useCallback } from 'react';
import { useFhevm } from './useFhevm';

/**
 * Hook for public decryption of encrypted values
 * Anyone can decrypt values that were marked as publicly decryptable
 */
export function useFhevmPublicDecrypt() {
  const { client, isReady } = useFhevm();
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const decrypt = useCallback(
    async (handle: string): Promise<bigint | boolean | string> => {
      if (!isReady || !client) {
        throw new Error('FHEVM client is not ready');
      }

      setIsDecrypting(true);
      setError(null);

      try {
        const decrypted = await client.publicDecrypt([handle]);
        return decrypted[handle];
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Public decryption failed');
        setError(error);
        throw error;
      } finally {
        setIsDecrypting(false);
      }
    },
    [client, isReady]
  );

  return {
    decrypt,
    isDecrypting,
    error,
  };
}

