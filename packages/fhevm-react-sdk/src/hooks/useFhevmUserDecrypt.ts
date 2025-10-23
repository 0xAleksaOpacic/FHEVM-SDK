import { useState, useCallback } from 'react';
import { useFhevm } from './useFhevm';

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
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const decrypt = useCallback(
    async (handle: string, userAddress: string): Promise<bigint | boolean | string> => {
      if (!isReady || !client) {
        throw new Error('FHEVM client is not ready');
      }

      setIsDecrypting(true);
      setError(null);

      try {
        // Get ethers signer and create Viem-compatible adapter
        const { BrowserProvider } = await import('ethers');
        const provider = new BrowserProvider((window as any).ethereum);
        const ethersSigner = await provider.getSigner();

        // Create Viem-compatible signer for SDK
        const viemSigner = {
          account: {
            address: userAddress as `0x${string}`,
          },
          signTypedData: async (args: any) => {
            // Remove EIP712Domain from types for ethers v6 compatibility
            const { EIP712Domain, ...typesWithoutDomain } = args.types;
            return await ethersSigner.signTypedData(
              args.domain,
              typesWithoutDomain,
              args.message
            );
          },
        };

        // Decrypt using SDK
        const decrypted = await client.userDecrypt({
          handle,
          contractAddress,
          signer: viemSigner,
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
    [client, isReady, contractAddress]
  );

  return {
    decrypt,
    isDecrypting,
    error,
  };
}

