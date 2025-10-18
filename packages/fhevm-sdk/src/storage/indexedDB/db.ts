import { openDB, IDBPDatabase, DBSchema } from 'idb';
import type { StorageAdapter, CachedPublicKey, CachedPublicParams } from '../types';
import { StorageMessages } from './messages';

interface IndexedDBSchema extends DBSchema {
  publicData: {
    key: string;
    value: CachedPublicKey | Record<number, CachedPublicParams>;
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

    async clearCache(): Promise<void> {
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

