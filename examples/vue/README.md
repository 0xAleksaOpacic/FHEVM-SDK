# FHEVM Vue Example

A Vue 3 + TypeScript demo application showcasing Fully Homomorphic Encryption (FHE) on the blockchain.

## Features

- 🔐 Wallet connection with [vue-dapp](https://github.com/ethaccount/vue-dapp)
- ⚡ Vue 3 Composition API
- 📦 TypeScript support
- 🎨 Zama-inspired design
- 🔌 Multiple wallet support (MetaMask, WalletConnect, Coinbase)

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## Project Structure

```
src/
├── App.vue            # Main component
├── main.ts            # App entry point (Pinia + Vue setup)
├── assets/            # Static assets (logo, etc)
└── style.css          # Global styles
```

## Wallet Integration

This example uses [vue-dapp](https://github.com/ethaccount/vue-dapp), which provides:

- 🔌 Easy wallet connection (similar to wagmi for React)
- 🎨 Built-in wallet modal
- 🔄 Auto-connect on page reload
- ✅ Proper disconnect functionality
- 📱 Multiple wallet support

## Status

This is a UI shell with wallet connection only. FHEVM functionality will be added once `@fhevm/vue-sdk` is ready.

## Coming Soon

- `@fhevm/vue-sdk` integration
- Encrypted counter demo
- User & public decryption

## Dependencies

- **vue-dapp**: Wallet connection library
- **pinia**: State management (required by vue-dapp)
- **ethers**: Ethereum library (for future FHEVM integration)
