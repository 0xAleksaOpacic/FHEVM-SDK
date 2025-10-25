import type { StorageAdapter, CachedPublicKey, CachedPublicParams, CachedSignature } from '../types';

/**
 * Create an in-memory storage adapter for FHEVM data.
 * Useful for testing or environments where persistent storage is not available.
 * 
 * @returns In-memory storage adapter
 */
export function createInMemoryStorage(): StorageAdapter {
  const keyCache = new Map<string, CachedPublicKey>();
  const paramsCache = new Map<string, Record<number, CachedPublicParams>>();
  const signatureCache = new Map<string, CachedSignature>();

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

    async getSignature(key: string): Promise<CachedSignature | null> {
      return signatureCache.get(key) || null;
    },

    async setSignature(key: string, signature: CachedSignature): Promise<void> {
      signatureCache.set(key, signature);
    },

    async clearPublicKeys(): Promise<void> {
      keyCache.clear();
    },

    async clearPublicParams(): Promise<void> {
      paramsCache.clear();
    },

    async clearSignatures(): Promise<void> {
      signatureCache.clear();
    },

    async clearAll(): Promise<void> {
      keyCache.clear();
      paramsCache.clear();
      signatureCache.clear();
    },
  };
}

