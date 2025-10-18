import type { StorageAdapter, CachedPublicData } from '../types';

/**
 * Create an in-memory storage adapter for FHEVM public data.
 * Useful for testing or environments where persistent storage is not available.
 * 
 * @returns In-memory storage adapter
 */
export function createInMemoryStorage(): StorageAdapter {
  const cache = new Map<string, CachedPublicData>();

  return {
    async getPublicKey(aclAddress: string): Promise<CachedPublicData | null> {
      return cache.get(aclAddress) || null;
    },

    async setPublicKey(
      aclAddress: string,
      publicKeyId: string,
      publicKey: Uint8Array
    ): Promise<void> {
      cache.set(aclAddress, {
        publicKeyId,
        publicKey,
        timestamp: Date.now(),
      });
    },

    async clearCache(): Promise<void> {
      cache.clear();
    },
  };
}

