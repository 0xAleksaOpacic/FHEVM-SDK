import { openDB, IDBPDatabase, DBSchema } from 'idb';
import type { StorageAdapter, CachedPublicKey, CachedPublicParams, CachedSignature } from '../types';
import { StorageMessages } from './messages';

interface IndexedDBSchema extends DBSchema {
  publicData: {
    key: string;
    value: CachedPublicKey | Record<number, CachedPublicParams> | CachedSignature;
  };
}

const DB_NAME = 'fhevm-sdk';
const DB_VERSION = 1;
const STORE_NAME = 'publicData';

/**
 * Create IndexedDB storage adapter
 *
 * @returns Storage adapter using IndexedDB
 */
export function createIndexedDBStorage(): StorageAdapter {
  let dbPromise: Promise<IDBPDatabase<IndexedDBSchema>> | undefined;

  async function getDB(): Promise<IDBPDatabase<IndexedDBSchema> | null> {
    if (typeof (globalThis as any).indexedDB === 'undefined') {
      return null;
    }

    if (!dbPromise) {
      dbPromise = openDB<IndexedDBSchema>(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        },
      });
    }

    try {
      return await dbPromise;
    } catch (error) {
      console.warn(`[fhevm-sdk] ${StorageMessages.INDEXEDDB_OPEN_FAILED}:`, error);
      return null;
    }
  }

  return {
    async getPublicKey(aclAddress: string): Promise<CachedPublicKey | null> {
      const db = await getDB();
      if (!db) return null;

      try {
        const data = await db.get(STORE_NAME, `${aclAddress}:key`);
        return (data as CachedPublicKey) || null;
      } catch (error) {
        console.warn(`[fhevm-sdk] ${StorageMessages.GET_FAILED}:`, error);
        return null;
      }
    },

    async setPublicKey(
      aclAddress: string,
      publicKeyId: string,
      publicKey: Uint8Array
    ): Promise<void> {
      const db = await getDB();
      if (!db) return;

      try {
        await db.put(STORE_NAME, {
          publicKeyId,
          publicKey,
          timestamp: Date.now(),
        }, `${aclAddress}:key`);
      } catch (error) {
        console.warn(`[fhevm-sdk] ${StorageMessages.SET_FAILED}:`, error);
      }
    },

    async getPublicParams(aclAddress: string): Promise<Record<number, CachedPublicParams> | null> {
      const db = await getDB();
      if (!db) return null;

      try {
        const data = await db.get(STORE_NAME, `${aclAddress}:params`);
        return (data as Record<number, CachedPublicParams>) || null;
      } catch (error) {
        console.warn(`[fhevm-sdk] ${StorageMessages.GET_FAILED}:`, error);
        return null;
      }
    },

    async setPublicParams(
      aclAddress: string,
      publicParams: Record<number, CachedPublicParams>
    ): Promise<void> {
      const db = await getDB();
      if (!db) return;

      try {
        await db.put(STORE_NAME, publicParams, `${aclAddress}:params`);
      } catch (error) {
        console.warn(`[fhevm-sdk] ${StorageMessages.SET_FAILED}:`, error);
      }
    },

    async getSignature(key: string): Promise<CachedSignature | null> {
      const db = await getDB();
      if (!db) return null;

      try {
        const data = await db.get(STORE_NAME, `signature:${key}`);
        return (data as CachedSignature) || null;
      } catch (error) {
        console.warn(`[fhevm-sdk] ${StorageMessages.GET_FAILED}:`, error);
        return null;
      }
    },

    async setSignature(key: string, signature: CachedSignature): Promise<void> {
      const db = await getDB();
      if (!db) return;

      try {
        await db.put(STORE_NAME, signature, `signature:${key}`);
      } catch (error) {
        console.warn(`[fhevm-sdk] ${StorageMessages.SET_FAILED}:`, error);
      }
    },

    async clearPublicKeys(): Promise<void> {
      const db = await getDB();
      if (!db) return;

      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const keys = await store.getAllKeys();
        
        for (const key of keys) {
          if (typeof key === 'string' && key.endsWith(':key')) {
            await store.delete(key);
          }
        }
        
        await tx.done;
      } catch (error) {
        console.warn(`[fhevm-sdk] ${StorageMessages.CLEAR_FAILED}:`, error);
      }
    },

    async clearPublicParams(): Promise<void> {
      const db = await getDB();
      if (!db) return;

      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const keys = await store.getAllKeys();
        
        for (const key of keys) {
          if (typeof key === 'string' && key.endsWith(':params')) {
            await store.delete(key);
          }
        }
        
        await tx.done;
      } catch (error) {
        console.warn(`[fhevm-sdk] ${StorageMessages.CLEAR_FAILED}:`, error);
      }
    },

    async clearSignatures(): Promise<void> {
      const db = await getDB();
      if (!db) return;

      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const keys = await store.getAllKeys();
        
        for (const key of keys) {
          if (typeof key === 'string' && key.startsWith('signature:')) {
            await store.delete(key);
          }
        }
        
        await tx.done;
      } catch (error) {
        console.warn(`[fhevm-sdk] ${StorageMessages.CLEAR_FAILED}:`, error);
      }
    },

    async clearAll(): Promise<void> {
      const db = await getDB();
      if (!db) return;

      try {
        await db.clear(STORE_NAME);
      } catch (error) {
        console.warn(`[fhevm-sdk] ${StorageMessages.CLEAR_FAILED}:`, error);
      }
    },
  };
}

