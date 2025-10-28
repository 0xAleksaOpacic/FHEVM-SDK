# @fhevm/sdk

Framework-agnostic TypeScript SDK that wraps [@zama-fhe/relayer-sdk](https://www.npmjs.com/package/@zama-fhe/relayer-sdk) with improved developer experience for building FHEVM dapps. Provides unified client initialization, SSR compatibility, built-in caching (IndexedDB, session, in-memory), default chain configs (localhost, Sepolia), and streamlined encryption/decryption APIs. Supports browser environments (web client, mock client for local testing) and Node.js (server-side client).

> **Framework SDKs:** For React and Vue applications, use [`@fhevm/react-sdk`](../fhevm-react-sdk) or [`@fhevm/vue-sdk`](../fhevm-vue-sdk) which provide hooks/composables built on top of this SDK.

## 📦 Installation

> **Note:** Packages are not published to npm yet. Use the monorepo workspace for development.

```bash
pnpm add @fhevm/sdk
```

**Package exports and sizes** (excludes external dependencies):

| Export | Bundle Size | External Dependencies |
|--------|-------------|----------------------|
| `@fhevm/sdk` | ~20 KB | `@zama-fhe/relayer-sdk`, `idb` |
| `@fhevm/sdk/mock` | ~429 KB (includes mock-utils) | `ethers` |
| `@fhevm/sdk/node` | ~19 KB | `@zama-fhe/relayer-sdk` |

**Peer dependencies:** `ethers@^6.0.0`

## ✨ Features

- **Default Chain Configs** - Pre-configured for localhost and Sepolia networks with all FHEVM contract addresses ([docs](./docs/configuration.md))
- **Request Batching** - Automatically batches multiple encryption/decryption requests to reduce network calls ([docs](./docs/batching.md))
- **Smart Caching** - Caches public keys, params, and user signatures with configurable storage ([docs](./docs/caching.md))
- **SSR Compatible** - Lazy-loads browser dependencies for Next.js, Nuxt, and other SSR frameworks ([docs](./docs/ssr-compatibility.md))

## 📦 Package Exports

Each export provides client initialization and encryption/decryption APIs matching the `@zama-fhe/relayer-sdk` interface.

### `@fhevm/sdk`
Web client for browser environments. Use this for production dapps on Sepolia.

### `@fhevm/sdk/mock`
Mock client for localhost testing (web and Node.js). Simulates FHE operations without requiring real FHEVM gateway keys, enabling local Hardhat development.

### `@fhevm/sdk/node`
Node.js client for server-side applications. Use this for backend services, CLI tools, or scripts.

See [usage examples](./docs/usage.md) for complete code samples.


## 📁 Folder Structure

```
packages/fhevm-sdk/
├── src/
│   ├── clients/              # Client initialization (web, mock, node)
│   ├── actions/              # Encryption and decryption APIs
│   ├── chains/               # Chain configurations (localhost, Sepolia)
│   ├── storage/              # Storage adapters (IndexedDB, session, in-memory)
│   ├── errors/               # Error handling
│   ├── index.ts              # Main export (@fhevm/sdk)
│   └── index.node.ts         # Node.js export (@fhevm/sdk/node)
├── package.json
└── tsconfig.json
```

