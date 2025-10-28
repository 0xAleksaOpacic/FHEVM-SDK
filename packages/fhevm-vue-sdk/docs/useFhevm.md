# useFhevm

Access FHEVM client instance and status from plugin injection. Must be used within a component of an app where `createFhevmPlugin` is installed.

> **Note:** Most applications should use the specialized composables (`useFhevmEncrypt`, `useFhevmUserDecrypt`, `useFhevmPublicDecrypt`) instead of accessing the client directly.

## Returns

```typescript
{
  client: Ref<FhevmClient | null>;
  status: Ref<FhevmStatus>;      // IDLE | LOADING | READY | ERROR
  isReady: ComputedRef<boolean>; // true when status === READY
  network: 'localhost' | 'sepolia';
}
```

## Usage

```vue
<script setup lang="ts">
import { useFhevm, FhevmClientStatus } from '@fhevm/vue-sdk';

const { client, status, isReady, network } = useFhevm();
</script>

<template>
  <div v-if="status === FhevmClientStatus.LOADING">
    Initializing FHEVM...
  </div>
  <div v-else-if="status === FhevmClientStatus.ERROR">
    Failed to initialize
  </div>
  <div v-else-if="!isReady">
    Not ready
  </div>
  <div v-else>
    Connected to {{ network }}
  </div>
</template>
```

## Client Status

The `status` ref reflects the plugin's lifecycle:

- **`IDLE`** - Initial state before initialization
- **`LOADING`** - Client is being created, SDK loaded, keys fetched
- **`READY`** - Client initialized and ready for operations
- **`ERROR`** - Initialization failed

Use `isReady` as a shorthand for `status.value === FhevmClientStatus.READY && client.value !== null`.