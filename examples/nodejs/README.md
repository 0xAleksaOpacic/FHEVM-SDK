# FHEVM Node.js CLI Example

This Node.js project is a CLI example. It shows how to use `@fhevm/sdk/node` to initialize a Node client, encrypt inputs, send transactions, and decrypt values with the [`FHECounter` contract](../../packages/hardhat/contracts/FHECounter.sol). It works on `localhost` and `sepolia`.

This example uses `ethers` for provider, wallet, and contract interactions.

## 🚀 Running the example

> **Localhost works out of the box**
> If you want to run it on localhost, just do (from root):
> 
> ```bash
> # Run local hardhat node with all contracts
> pnpm chain
> # Run example
> pnpm nodejs-example
> ```
> 

### Config

Create `.env` in this folder based on [`env.example`](./env.example).

To run on Sepolia network set in `.env`:

```bash
NETWORK_MODE=sepolia
PRIVATE_KEY=your_private_key_here
```

> **📌 Note**  
> By default this example uses a pre-deployed [`FHECounter` contract](../../packages/hardhat/contracts/FHECounter.sol) at `0x6134E9810A204661eaB5a189A44BB7F1CB2a4196` with RPC `https://ethereum-sepolia-rpc.publicnode.com`.

To replace any contract address or RPC, see all variables in [`env.example`](./env.example).

## 📁 Folder structure

```
examples/nodejs/
├── src/
│   ├── index.ts          # Main CLI: init client, encrypt, tx, decrypt
│   ├── config.ts         # Reads env, selects mode, provides ABI
│   └── validator.ts      # Validates Sepolia config (RPC, key, address)
├── env.example           # All supported variables and defaults
├── package.json
└── tsconfig.json
```
