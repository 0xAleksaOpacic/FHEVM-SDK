# createFhevmPlugin

Vue plugin that manages FHEVM client lifecycle and provides access to encryption/decryption functionality throughout your application via Vue's provide/inject pattern.

> **Note:** The plugin automatically handles SSR by lazy-loading browser dependencies (`ethers`, `@fhevm/sdk`), safe for Nuxt 3 and other SSR frameworks.

## Basic Usage

Install the plugin at app level:

```typescript
import { createApp } from 'vue';
import { createFhevmPlugin } from '@fhevm/vue-sdk';
import App from './App.vue';

const app = createApp(App);

app.use(createFhevmPlugin({
  network: 'localhost',
  rpcUrl: 'http://localhost:8545',
}));

app.mount('#app');
```

## Options

```typescript
app.use(createFhevmPlugin({
  network: 'localhost',                    // 'localhost' | 'sepolia'
  rpcUrl: 'http://localhost:8545',         // RPC endpoint
  chainConfig: { aclAddress: '0x...' },   // Optional: override default config
  debug: true,                             // Optional: enable debug logs
  onStatusChange: (status) => {},          // Optional: lifecycle callback
  onError: (error) => {},                  // Optional: error callback
}));
```

### `network` (required)

Determines which FHEVM client to create. `localhost` uses `createMockClient` from `@fhevm/sdk/mock` which simulates FHE operations without real gateway keys, ideal for local Hardhat development. `sepolia` uses `createClient` from `@fhevm/sdk` which connects to real FHEVM infrastructure on Sepolia testnet.

### `rpcUrl` (required)

Blockchain RPC endpoint. For localhost, typically `http://localhost:8545` (Hardhat default). For Sepolia, use any Ethereum RPC provider (Infura, Alchemy, public nodes).

### `chainConfig` (optional)

Overrides default chain configuration from `@fhevm/sdk`. Plugin merges your overrides with built-in `localhost` or `sepolia` config. Useful for custom contract deployments or testing different FHEVM contract addresses.

### `debug` (optional)

Enables verbose logging for client initialization, encryption, and decryption operations. Logs appear in browser console.

### `onStatusChange` (optional)

Callback fired when client transitions through lifecycle states: `IDLE` → `LOADING` → `READY`/`ERROR`. Use this to show loading indicators or error messages at the app level.

### `onError` (optional)

Callback fired when client initialization fails. Receives the error object for custom error handling or logging.

## Client Lifecycle

The plugin manages four states:

1. **IDLE** - Initial state before initialization starts
2. **LOADING** - Client is being created, SDK loaded, keys fetched
3. **READY** - Client initialized, ready for encryption/decryption
4. **ERROR** - Initialization failed (network issues, invalid config, etc.)

Access current state in any component via `useFhevm()`:

```vue
<script setup lang="ts">
import { useFhevm, FhevmClientStatus } from '@fhevm/vue-sdk';

const { status, isReady } = useFhevm();
</script>

<template>
  <div v-if="status === FhevmClientStatus.LOADING">Loading...</div>
  <div v-else-if="status === FhevmClientStatus.ERROR">Failed to load</div>
  <div v-else-if="isReady">Ready!</div>
</template>
```