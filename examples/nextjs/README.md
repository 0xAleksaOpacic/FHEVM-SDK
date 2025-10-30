# FHEVM Next.js Example

This Next.js project is an example dapp for React applications. It shows how to use [@fhevm/react-sdk](../../packages/fhevm-react-sdk/) in a React app to initialize `FhevmProvider`, use hooks for encryption and decryption, and interact with the [`FHECounter` contract](../../packages/hardhat/contracts/FHECounter.sol). It works out of the box on `localhost` and `sepolia`.

This example uses [wagmi](https://wagmi.sh) for wallet connections and [ethers](https://docs.ethers.org/v6/) for contract interactions.

**🌐 Live Demo**: [fhevm-sdk-nextjs-example.vercel.app](https://fhevm-sdk-nextjs-example.vercel.app/)

## 🎥 6‑minute overview

[Watch the demo on Google Drive](https://drive.google.com/file/d/1DGKS88R7bqAX3uShnLN54GeUbyxh4ZnP/preview)


## 🚀 Running the example

> **Localhost works out of the box**
> If you want to run it on localhost, just do (from root):
> 
> ```bash
> # Run local hardhat node with all contracts
> pnpm chain 
> # Run example
> pnpm nextjs-example
> ```
> 
> Make sure to check the MetaMask localhost setup: [`docs/metamask-localhost.md`](../../docs/metamask-localhost.md)
> Use a single wallet extension for reliable detection.

### Config

Create `.env.local` in this folder based on [`env.example`](./env.example).

To run on Sepolia network set:

```bash
NEXT_PUBLIC_NETWORK_MODE=sepolia
```

Ensure MetaMask is on Sepolia. See [`docs/metamask-sepolia.md`](../../docs/metamask-sepolia.md).

> **📌 Note**  
> By default this example uses a pre-deployed [`FHECounter` contract](../../packages/hardhat/contracts/FHECounter.sol) at `0x6134E9810A204661eaB5a189A44BB7F1CB2a4196` with RPC `https://ethereum-sepolia-rpc.publicnode.com`.

To replace any contract address or RPC, see all variables in [`env.example`](./env.example).

## 📁 Folder structure

```
examples/nextjs/
├── app/
│   ├── page.tsx            # Uses hooks for encryption and decryption
│   └── providers.tsx       # Initializes FhevmProvider
├── config/                 # Configuration and default values (mode, RPC, addresses)
│   ├── index.ts
│   ├── localhost.ts
│   └── sepolia.ts
├── lib/
│   └── contracts/
│       └── counter.ts      # Contract interaction helpers
├── env.example             # All supported variables and defaults
└── package.json
```

