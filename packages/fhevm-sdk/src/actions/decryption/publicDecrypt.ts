import type { FhevmInstance } from '@zama-fhe/relayer-sdk/web';
import type { DecryptedValues } from './types';

/**
 * Performs public decryption on publicly decryptable handles
 * 
 * @param instance - The FHEVM instance
 * @param handles - Array of ciphertext handles to decrypt
 * @returns Map of handle to decrypted value
 */
export async function publicDecrypt(
  instance: FhevmInstance,
  handles: string[]
): Promise<DecryptedValues> {
  return await instance.publicDecrypt(handles);
}

