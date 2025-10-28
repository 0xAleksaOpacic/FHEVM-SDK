# useFhevmPublicDecrypt

Decrypt values marked as publicly decryptable. No signature required - anyone can decrypt these values through the FHEVM gateway or relayer. Works without wallet connection.

**Returns:** `{ decrypt: (handle: string | string[]) => Promise<DecryptedValue>, isDecrypting: Ref<boolean>, error: Ref<Error | null> }`

> **Note:** Values must be explicitly marked as publicly decryptable in the smart contract using `TFHE.allowThis(handle)`.

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useFhevmPublicDecrypt } from '@fhevm/vue-sdk';

const count = ref<bigint | null>(null);
const { decrypt, isDecrypting } = useFhevmPublicDecrypt();

async function handleDecrypt(handle: string) {
  try {
    const value = await decrypt(handle);
    count.value = value as bigint;
  } catch (err) {
    console.error('Decryption failed:', err);
  }
}
</script>

<template>
  <div>
    <button @click="handleDecrypt('0x...')" :disabled="isDecrypting">
      {{ isDecrypting ? 'Loading...' : 'Get Public Count' }}
    </button>
    <p v-if="count !== null">Count: {{ count.toString() }}</p>
  </div>
</template>
```

## Batch Decryption

Decrypt multiple public values in a single request:

```vue
<script setup lang="ts">
const { decrypt, isDecrypting } = useFhevmPublicDecrypt();

async function handleBatchDecrypt() {
  const handles = ['0x...', '0x...', '0x...'];
  
  const decrypted = await decrypt(handles);
  
  stats.value = {
    totalUsers: decrypted[handles[0]],
    totalTransactions: decrypted[handles[1]],
    totalVolume: decrypted[handles[2]],
  };
}
</script>
```

