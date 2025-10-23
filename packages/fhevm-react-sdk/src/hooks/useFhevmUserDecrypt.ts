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
 */
export function useFhevmUserDecrypt({ contractAddress }: UseFhevmUserDecryptOptions) {
  const { client, isReady } = useFhevm();
  const { data: walletClient } = useWalletClient();
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const decrypt = useCallback(
    async (handle: string): Promise<bigint | boolean | string> => {
      if (!isReady || !client) {
        throw new Error('FHEVM client is not ready');
      }

      if (!walletClient) {
        throw new Error('Wallet not connected');
      }

      setIsDecrypting(true);
      setError(null);

      try {
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

        // Decrypt using SDK
        const decrypted = await client.userDecrypt({
          handle,
          contractAddress,
          signer,
        });

        return decrypted;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('User decryption failed');
        setError(error);
        throw error;
      } finally {
        setIsDecrypting(false);
      }
    },
    [client, isReady, contractAddress, walletClient]
  );

  return {
    decrypt,
    isDecrypting,
    error,
  };
}

