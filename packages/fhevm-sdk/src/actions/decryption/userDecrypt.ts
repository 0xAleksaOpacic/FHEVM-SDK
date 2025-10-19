import type { FhevmInstance } from '@zama-fhe/relayer-sdk/web';
import type { UserDecryptParams, DecryptedValue } from './types';

/**
 * Performs user decryption on a single ciphertext handle.
 * 
 * This simplifies the complex 8-parameter userDecrypt call from the underlying SDK
 * by automatically handling:
 * - Ephemeral keypair generation
 * - EIP-712 signature creation
 * - Timestamp management
 * - Address extraction
 * 
 * @param instance - The FHEVM instance
 * @param params - Decryption parameters
 * @returns The decrypted value (bigint, boolean, or string)
 * 
 * @example
 * ```typescript
 * import { useWalletClient } from 'wagmi';
 * 
 * const { data: walletClient } = useWalletClient();
 * 
 * const value = await userDecrypt(instance, {
 *   handle: '0x123...',
 *   contractAddress: '0xabc...',
 *   signer: walletClient,
 *   duration: 7, // optional, defaults to 7 days
 * });
 * ```
 */
export async function userDecrypt(
  instance: FhevmInstance,
  params: UserDecryptParams
): Promise<DecryptedValue> {
  const { handle, contractAddress, signer, duration = 7 } = params;

  // Generate ephemeral keypair for this decryption request
  const keypair = instance.generateKeypair();

  // Prepare request data
  const handleContractPairs = [{ handle, contractAddress }];
  const contractAddresses = [contractAddress];
  const startTimestamp = Math.floor(Date.now() / 1000).toString();
  const durationDays = duration.toString();

  // Create EIP-712 signature data
  const eip712 = instance.createEIP712(
    keypair.publicKey,
    contractAddresses,
    startTimestamp,
    durationDays
  );

  // Sign with Viem-compatible signer
  const signature = await signer.signTypedData({
    domain: eip712.domain,
    types: eip712.types,
    primaryType: 'UserDecryptRequestVerification',
    message: eip712.message,
  });

  // Get user address from signer
  const userAddress = signer.account.address;

  // Call underlying SDK with all required parameters
  const result = await instance.userDecrypt(
    handleContractPairs,
    keypair.privateKey,
    keypair.publicKey,
    signature.replace('0x', ''), // Strip 0x prefix for SDK
    contractAddresses,
    userAddress,
    startTimestamp,
    durationDays
  );

  // Return the decrypted value for the requested handle
  return result[handle];
}

