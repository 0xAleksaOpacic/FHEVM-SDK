import type { StorageAdapter, CachedPublicKey, CachedPublicParams } from '../types';

/**
 * Create an in-memory storage adapter for FHEVM public data.
 * Useful for testing or environments where persistent storage is not available.
 * 
 * @returns In-memory storage adapter
 */
export function createInMemoryStorage(): StorageAdapter {
  const keyCache = new Map<string, CachedPublicKey>();
  const paramsCache = new Map<string, Record<number, CachedPublicParams>>();

  return {
    async getPublicKey(aclAddress: string): Promise<CachedPublicKey | null> {
      return keyCache.get(aclAddress) || null;
    },

    async setPublicKey(
      aclAddress: string,
      publicKeyId: string,
      publicKey: Uint8Array
    ): Promise<void> {
      keyCache.set(aclAddress, {
        publicKeyId,
        publicKey,
        timestamp: Date.now(),
      });
    },

    async getPublicParams(aclAddress: string): Promise<Record<number, CachedPublicParams> | null> {
      return paramsCache.get(aclAddress) || null;
    },

    async setPublicParams(
      aclAddress: string,
      publicParams: Record<number, CachedPublicParams>
    ): Promise<void> {
      paramsCache.set(aclAddress, publicParams);
    },

    async clearCache(): Promise<void> {
      keyCache.clear();
      paramsCache.clear();
    },
  };
}

