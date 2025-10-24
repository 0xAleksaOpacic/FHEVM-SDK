import { ref } from 'vue';
import { useFhevm } from './useFhevm';

export interface UseFhevmUserDecryptOptions {
  /**
   * The contract address where the encrypted value is stored
   */
  contractAddress: string;
}

/**
 * Composable for user-specific decryption of encrypted values
 * Requires user signature (EIP-712) to prove ownership
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useFhevmUserDecrypt } from '@fhevm/vue-sdk';
 * import { useVueDapp } from '@vue-dapp/core';
 * 
 * const { wallet } = useVueDapp();
 * const { decrypt, isDecrypting } = useFhevmUserDecrypt({ 
 *   contractAddress: '0x...' 
 * });
 * 
 * // Pass wallet as parameter
 * const value = await decrypt('0x123...', wallet);
 * </script>
 * ```
 */
export function useFhevmUserDecrypt({ contractAddress }: UseFhevmUserDecryptOptions) {
  const { client, isReady } = useFhevm();
  const isDecrypting = ref(false);
  const error = ref<Error | null>(null);

  const decrypt = async (
    handle: string,
    wallet: any // vue-dapp wallet
  ): Promise<bigint | boolean | string> => {
    if (!isReady.value || !client.value) {
      throw new Error('FHEVM client is not ready');
    }

    if (!wallet || !wallet.address) {
      throw new Error('Wallet not connected');
    }

    isDecrypting.value = true;
    error.value = null;

    try {
      // Create signer adapter for vue-dapp wallet
      const signer = {
        account: {
          address: wallet.address,
        },
        signTypedData: async (args: any) => {
          // Use ethers to sign with vue-dapp's provider
          const { BrowserProvider } = await import('ethers');
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

      // Decrypt using SDK
      const decrypted = await client.value.userDecrypt({
        handle,
        contractAddress,
        signer,
      });

      return decrypted;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('User decryption failed');
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

