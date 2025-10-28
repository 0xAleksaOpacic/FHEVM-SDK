# FHEVM Vue Example

This Vue 3 project is an example dapp for Vue applications. It shows how to use [@fhevm/vue-sdk](../../packages/fhevm-vue-sdk/) in a Vue app to initialize the FHEVM plugin, use composables for encryption and decryption, and interact with the [`FHECounter` contract](../../packages/hardhat/contracts/FHECounter.sol). It works out of the box on `localhost` and `sepolia`.

This example uses [ethers](https://docs.ethers.org/v6/) for contract interactions.

## 🚀 Running the example

> **Localhost works out of the box**
> If you want to run it on localhost, just do (from root):
> 
> ```bash
> # Run local hardhat node with all contracts
> pnpm chain 
> # Run example
> pnpm vue-example
> ```
> 
> Make sure to check the MetaMask localhost setup: [`docs/metamask-localhost.md`](../../docs/metamask-localhost.md)
> Use a single wallet extension for reliable detection.

### Config

Create `.env.local` in this folder based on [`env.example`](./env.example).

To run on Sepolia network set:

```bash
VITE_NETWORK_MODE=sepolia
```

Ensure MetaMask is on Sepolia. See [`docs/metamask-sepolia.md`](../../docs/metamask-sepolia.md).

> **📌 Note**  
> By default this example uses a pre-deployed [`FHECounter` contract](../../packages/hardhat/contracts/FHECounter.sol) at `0x6134E9810A204661eaB5a189A44BB7F1CB2a4196` with RPC `https://ethereum-sepolia-rpc.publicnode.com`.

To replace any contract address or RPC, see all variables in [`env.example`](./env.example).

## 📁 Folder structure

```
examples/vue/
├── src/
│   ├── App.vue                # Uses composables for encryption and decryption
│   ├── main.ts                # Initializes polyfills and installs FHEVM plugin
│   ├── config/                # Configuration and default values (mode, RPC, addresses)
│   │   ├── index.ts
│   │   ├── localhost.ts
│   │   └── sepolia.ts
│   └── lib/
│       └── contracts/
│           └── counter.ts     # Contract interaction helpers
├── env.example                # All supported variables and defaults
├── vite.config.ts             # Vite config for WASM and deps
└── package.json
```
