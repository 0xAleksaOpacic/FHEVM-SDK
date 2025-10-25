import type { SignatureCacheStorage, CachedSignature } from '../types';
import { StorageMessages } from './messages';

const STORAGE_PREFIX = 'fhevm-signature:';

/**
 * Create sessionStorage adapter for signature caching
 * Data persists during page reloads but is cleared when the browser tab closes
 * 
 * @returns Storage adapter using sessionStorage (signature-only)
 */
export function createSessionStorage(): SignatureCacheStorage {
  // Check if sessionStorage is available (SSR-safe)
  const isAvailable = typeof globalThis !== 'undefined' && 'sessionStorage' in globalThis;
  const storage = isAvailable ? (globalThis as any).sessionStorage : null;

  return {
    async getSignature(key: string): Promise<CachedSignature | null> {
      if (!storage) return null;

      try {
        const data = storage.getItem(`${STORAGE_PREFIX}${key}`);
        if (!data) return null;

        const parsed = JSON.parse(data) as CachedSignature;
        
        // Check if signature is expired
        if (Date.now() > parsed.expiresAt) {
          // Auto-remove expired signature
          storage.removeItem(`${STORAGE_PREFIX}${key}`);
          return null;
        }

        return parsed;
      } catch (error) {
        console.warn(`[fhevm-sdk] ${StorageMessages.GET_FAILED}:`, error);
        return null;
      }
    },

    async setSignature(key: string, signature: CachedSignature): Promise<void> {
      if (!storage) return;

      try {
        storage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(signature));
      } catch (error) {
        console.warn(`[fhevm-sdk] ${StorageMessages.SET_FAILED}:`, error);
      }
    },

    async clearSignatures(): Promise<void> {
      if (!storage) return;

      try {
        // Find and remove all signature keys
        const keysToRemove: string[] = [];
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key?.startsWith(STORAGE_PREFIX)) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => storage.removeItem(key));
      } catch (error) {
        console.warn(`[fhevm-sdk] ${StorageMessages.CLEAR_FAILED}:`, error);
      }
    },
  };
}

