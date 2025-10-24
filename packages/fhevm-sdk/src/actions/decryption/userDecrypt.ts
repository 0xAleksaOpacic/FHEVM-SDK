import type { FhevmInstance } from '@zama-fhe/relayer-sdk/web';
import type { UserDecryptParams, DecryptedValue } from './types';

/**
 * Performs user decryption on one or more ciphertext handles.
 * 
 * This simplifies the complex 8-parameter userDecrypt call from the underlying SDK
 * by automatically handling:
 * - Ephemeral keypair generation
 * - EIP-712 signature creation
 * - Timestamp management
 * - Address extraction
 * 
 * Supports both single and batch decryption:
 * - Single: Pass `handle` → returns `DecryptedValue`
 * - Batch: Pass `handles` → returns `Record<string, DecryptedValue>`
 * 
 * For batch operations, ONE signature covers ALL handles - no multiple wallet popups!
 * 
 * @param instance - The FHEVM instance
 * @param params - Decryption parameters
 * @returns The decrypted value(s)
 * 
 * @example
 * ```typescript
 * import { useWalletClient } from 'wagmi';
 * 
 * const { data: walletClient } = useWalletClient();
 * 
 * // Single handle
 * const value = await userDecrypt(instance, {
 *   handle: '0x123...',
 *   contractAddress: '0xabc...',
 *   signer: walletClient,
 *   duration: 7, // optional, defaults to 7 days
 * });
 * 
 * // Batch handles (ONE signature for all!)
 * const values = await userDecrypt(instance, {
 *   handles: ['0x123...', '0x456...', '0x789...'],
 *   contractAddress: '0xabc...',
 *   signer: walletClient,
 *   duration: 7,
 * });
 * ```
 */
export async function userDecrypt(
  instance: FhevmInstance,
  params: UserDecryptParams
): Promise<DecryptedValue | Record<string, DecryptedValue>> {
  // Extract parameters (single or batch)
  const isSingle = 'handle' in params;
  const handles = isSingle ? [params.handle] : params.handles;
  const { contractAddress, signer, duration = 7 } = params;

  // Generate ephemeral keypair for this decryption request
  const keypair = instance.generateKeypair();

  // Prepare request data for all handles
  const handleContractPairs = handles.map(h => ({ 
    handle: h, 
    contractAddress 
  }));
  const contractAddresses = [contractAddress];
  const startTimestamp = Math.floor(Date.now() / 1000).toString();
  const durationDays = duration.toString();

  // Create EIP-712 signature data (covers ALL handles)
  const eip712 = instance.createEIP712(
    keypair.publicKey,
    contractAddresses,
    startTimestamp,
    durationDays
  );

  // Sign with Viem-compatible signer (ONE signature for all handles)
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

  // Return single value or full record based on input
  if (isSingle) {
    return result[params.handle];
  } else {
    return result;
  }
}

