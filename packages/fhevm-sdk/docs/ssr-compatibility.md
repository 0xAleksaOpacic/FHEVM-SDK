# SSR Compatibility

The SDK is fully compatible with server-side rendering (SSR) frameworks like Next.js and Nuxt.

## The Problem

The underlying `@zama-fhe/relayer-sdk` uses browser-specific APIs (WASM, `window.ethereum`, `globalThis`) that don't exist during server-side rendering. This causes SSR frameworks to fail during build or server rendering with errors like "window is not defined" or "WebAssembly is not defined".

## The Solution

The SDK solves this by **lazy-loading browser dependencies** only when the code runs in the browser:

1. **Environment detection** - Check if running in browser (`typeof window !== 'undefined'`)
2. **Dynamic imports** - Load `@zama-fhe/relayer-sdk/web` only in browser environment
3. **Deferred initialization** - WASM and SDK initialization happen on first client creation

This approach ensures:
- ✅ SSR builds succeed without browser dependencies
- ✅ No runtime errors from missing browser globals
- ✅ Optimized bundle size (no server-side overhead)

## Usage

> **Note:** This applies to direct usage of `@fhevm/sdk`. If using [`@fhevm/react-sdk`](../../fhevm-react-sdk) or [`@fhevm/vue-sdk`](../../fhevm-vue-sdk), SSR compatibility is handled automatically.

From the user's perspective, nothing changes. Simply initialize the client in browser-only lifecycle hooks:

```typescript
// React - use useEffect
useEffect(() => {
  createClient({ network: 'sepolia', chainConfig }).then(setClient);
}, []);

// Vue - use onMounted
onMounted(async () => {
  client.value = await createClient({ network: 'sepolia', chainConfig });
});
```

> **Best Practice:** Always initialize inside `useEffect` (React) or `onMounted` (Vue), never at module or component top level.