import { useState, useCallback } from 'react';
import { useFhevm } from './useFhevm';
import { useWalletClient } from 'wagmi';

export interface UseFhevmUserDecryptOptions {
  /**
   * The contract address where the encrypted value is stored
   */
  contractAddress: string;
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
 */
export function useFhevmUserDecrypt({ contractAddress }: UseFhevmUserDecryptOptions) {
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
          });
          resolve(decrypted);
        } else {
          const decrypted = await client.userDecrypt({
            handles: handleOrHandles,
            contractAddress,
            signer,
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

  return {
    decrypt,
    isDecrypting,
    error,
  };
}

