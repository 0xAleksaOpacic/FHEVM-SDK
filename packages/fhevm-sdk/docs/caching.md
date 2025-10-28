# Caching

The SDK caches frequently accessed data to minimize redundant network requests. Caching is configured when creating the client via the `cacheType` parameter.

> **Note:** Caching is available for web (`createClient`) and Node.js (`createNodeClient`) clients. Mock clients (`createMockClient`) do not use caching as they operate entirely locally.

## What gets cached

1. **Public Keys** - FHEVM network public keys (used for encryption)
2. **Public Parameters** - Cryptographic parameters needed for FHE operations
3. **User Signatures** - EIP-712 signatures for decryption authorization (default 7 days, configurable via `duration` parameter in `userDecrypt`)

## Cache Types

### Web Client

Web clients support three cache types:

#### `persistent` (default)
Uses IndexedDB. Data survives browser restarts. Recommended for production.

```typescript
import { createClient } from '@fhevm/sdk';

const client = await createClient({
  network: 'sepolia',
  chainConfig: { /* ... */ },
  cacheType: 'persistent' // IndexedDB (default)
});
```

#### `session`
Uses sessionStorage. Data cleared when browser tab closes. Useful for privacy-sensitive applications.

```typescript
const client = await createClient({
  network: 'sepolia',
  chainConfig: { /* ... */ },
  cacheType: 'session'
});
```

#### `none`
Disables all caching. Useful for testing or when you don't want to persist any data.

```typescript
const client = await createClient({
  network: 'sepolia',
  chainConfig: { /* ... */ },
  cacheType: 'none'
});
```

### Node.js Client

Node.js clients automatically use in-memory storage for `persistent` and `session` cache types since browser APIs (IndexedDB, sessionStorage) are unavailable. The SDK detects the environment automatically.

- `cacheType: 'persistent'` → in-memory storage (cleared on process restart)
- `cacheType: 'session'` → in-memory storage (cleared on process restart)
- `cacheType: 'none'` → no caching

```typescript
import { createNodeClient } from '@fhevm/sdk/node';

const client = await createNodeClient({
  network: 'sepolia',
  chainConfig: { /* ... */ },
  cacheType: 'persistent' // Uses in-memory storage in Node.js
});
```

## Clearing Cache

To clear cached data, create a storage connection using one of the available storage adapters:
- `createIndexedDBStorage()` - for persistent browser storage
- `createSessionStorage()` - for session-only browser storage
- `createInMemoryStorage()` - for in-memory storage (Node.js or temporary)

The SDK provides methods to clear all cached data or clear specific cache types individually:

```typescript
import { createIndexedDBStorage } from '@fhevm/sdk/storage';

const storage = createIndexedDBStorage();

// Clear everything (keys, params, and signatures)
await storage.clearAll();

// Or clear individually:
await storage.clearSignatures();   // Clear only user signatures
await storage.clearPublicKeys();    // Clear only public keys
await storage.clearPublicParams();  // Clear only public parameters
```

> **Note:** `@fhevm/react-sdk` and `@fhevm/vue-sdk` wrap this functionality in their `useFhevmUserDecrypt` hook via a `clearCache()` function, so you don't need to connect to storage directly when using these SDKs.


## Custom Storage Adapters

You can implement custom storage by providing your own adapter:

```typescript
import { createClient } from '@fhevm/sdk';
import type { StorageAdapter } from '@fhevm/sdk/storage';

const customStorage: StorageAdapter = {
  async get(key: string) { /* ... */ },
  async set(key: string, value: string) { /* ... */ },
  async delete(key: string) { /* ... */ },
  async clear() { /* ... */ }
};

const client = await createClient({
  network: 'sepolia',
  chainConfig: { /* ... */ },
  storage: customStorage
});
```

