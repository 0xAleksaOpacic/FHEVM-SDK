# useFhevmUserDecrypt

Decrypt encrypted values that require user signature (EIP-712) for access control. Supports single and batch decryption with optional signature caching to reduce wallet popups. Requires active wallet connection.

**Options:** `{ contractAddress: string, cacheType?: 'none' | 'session' | 'persistent', duration?: number }`  
**Returns:** `{ decrypt: (handle: string | string[]) => Promise<DecryptedValue>, clearCache: () => Promise<void>, isDecrypting: Ref<boolean>, error: Ref<Error | null> }`

> **Note:** Batch decryption requires only ONE signature for all handles.

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useFhevmUserDecrypt } from '@fhevm/vue-sdk';

const balance = ref<bigint | null>(null);
const { decrypt, isDecrypting } = useFhevmUserDecrypt({
  contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  cacheType: 'session',
});

async function handleDecrypt(handle: string) {
  try {
    const value = await decrypt(handle);
    balance.value = value as bigint;
  } catch (err) {
    console.error('Decryption failed:', err);
  }
}
</script>

<template>
  <div>
    <button @click="handleDecrypt('0x...')" :disabled="isDecrypting">
      {{ isDecrypting ? 'Decrypting...' : 'Decrypt Balance' }}
    </button>
    <p v-if="balance !== null">Balance: {{ balance.toString() }}</p>
  </div>
</template>
```

## Batch Decryption

Decrypt multiple values with a single signature. The composable automatically batches the request, so only ONE wallet popup appears for all handles:

```vue
<script setup lang="ts">
const { decrypt, isDecrypting } = useFhevmUserDecrypt({
  contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  cacheType: 'persistent',
});

async function handleBatchDecrypt() {
  const handles = [
    '0x...', // balance
    '0x...', // age
    '0x...', // score
  ];
  
  // Only ONE signature requested for all handles
  const decrypted = await decrypt(handles);
  
  data.value = {
    balance: decrypted[handles[0]],
    age: decrypted[handles[1]],
    score: decrypted[handles[2]],
  };
}
</script>
```

## Signature Caching

Control how signatures are cached to reduce wallet popups:

- **`none`** (default) - Always request signature. Most secure.
- **`session`** - Cache in `sessionStorage` until tab closes.
- **`persistent`** - Cache in `IndexedDB` for `duration` days (default 7).

Call `clearCache()` to invalidate cached signatures (e.g., on logout).

