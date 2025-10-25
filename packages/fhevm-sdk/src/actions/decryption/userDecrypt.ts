import type { FhevmInstance } from '@zama-fhe/relayer-sdk/web';
import type { UserDecryptParams, DecryptedValue, FhevmCacheType } from './types';
import type { SignatureCacheStorage, CachedSignature } from '../../storage/types';
import { createSessionStorage } from '../../storage/sessionStorage/db';
import { createIndexedDBStorage } from '../../storage/indexedDB/db';

/**
 * Get storage adapter based on cache type
 */
function getSignatureStorage(cacheType?: FhevmCacheType): SignatureCacheStorage | null {
  if (!cacheType || cacheType === 'none') return null;
  if (cacheType === 'session') return createSessionStorage();
  if (cacheType === 'persistent') return createIndexedDBStorage();
  return null;
}

/**
 * Generate cache key for signature storage
 */
function generateCacheKey(userAddress: string, chainId: number, contractAddress: string): string {
  return `${userAddress.toLowerCase()}:${chainId}:${contractAddress.toLowerCase()}`;
}

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
  const { contractAddress, signer, duration = 7, cacheType } = params;

  const userAddress = signer.account.address;
  const storage = getSignatureStorage(cacheType);
  
  // Variables that will be set from cache or generated
  let keypair: { publicKey: string; privateKey: string };
  let signature: string;
  let startTimestamp: string;
  let durationDays: string;

  // Generate EIP-712 to get chainId
  const tempKeypair = instance.generateKeypair();
  const contractAddresses = [contractAddress];
  const tempStartTimestamp = Math.floor(Date.now() / 1000).toString();
  const tempDurationDays = duration.toString();

  const eip712 = instance.createEIP712(
    tempKeypair.publicKey,
    contractAddresses,
    tempStartTimestamp,
    tempDurationDays
  );

  // Extract chainId from EIP-712 domain
  const chainId = eip712.domain.chainId;

  // Check cache
  let cachedSig: CachedSignature | null = null;
  
  if (storage && chainId) {
    const cacheKey = generateCacheKey(userAddress, chainId, contractAddress);
    cachedSig = await storage.getSignature(cacheKey);
    
    // Validate cached signature
    if (cachedSig && Date.now() > cachedSig.expiresAt) {
      // Expired - clear it
      await storage.clearSignatures();
      cachedSig = null;
    }
  }

  // Use cached or create new signature
  if (cachedSig) {
    // Reuse cached signature (no wallet popup!)
    keypair = {
      publicKey: cachedSig.publicKey,
      privateKey: cachedSig.privateKey,
    };
    signature = cachedSig.signature;
    startTimestamp = cachedSig.startTimestamp.toString();
    durationDays = cachedSig.durationDays.toString();
  } else {
    // No cache - use the temp values we generated and sign
    keypair = tempKeypair;
    startTimestamp = tempStartTimestamp;
    durationDays = tempDurationDays;

    // Sign with Viem-compatible signer (ONE signature for all handles)
    const signatureWithPrefix = await signer.signTypedData({
      domain: eip712.domain,
      types: eip712.types,
      primaryType: 'UserDecryptRequestVerification',
      message: eip712.message,
    });
    
    signature = signatureWithPrefix.replace('0x', ''); // Strip 0x prefix for SDK

    // Cache the new signature
    if (storage && chainId) {
      const cacheKey = generateCacheKey(userAddress, chainId, contractAddress);
      const expiresAt = (parseInt(startTimestamp) + duration * 24 * 60 * 60) * 1000;
      
      await storage.setSignature(cacheKey, {
        signature,
        publicKey: keypair.publicKey,
        privateKey: keypair.privateKey,
        userAddress,
        contractAddress,
        chainId,
        startTimestamp: parseInt(startTimestamp),
        durationDays: duration,
        expiresAt,
        cachedAt: Date.now(),
      });
    }
  }

  // Prepare request data for all handles
  const handleContractPairs = handles.map(h => ({ 
    handle: h, 
    contractAddress 
  }));

  // Call underlying SDK with all required parameters
  const result = await instance.userDecrypt(
    handleContractPairs,
    keypair.privateKey,
    keypair.publicKey,
    signature,
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

