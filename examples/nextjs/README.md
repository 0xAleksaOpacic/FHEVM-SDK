# FHEVM Next.js Example

Minimal Next.js app demonstrating `@fhevm/sdk` with Wagmi.

## Features

- ✅ Wallet connection (MetaMask)
- ✅ FHEVM client initialization
- 🚧 Encrypted counter contract (coming next)
- 🚧 User decryption (private data)
- 🚧 Public decryption (public data)

## Setup

```bash
# From monorepo root
pnpm install

# Build SDK
cd packages/fhevm-sdk
pnpm build

# Run example
cd examples/nextjs
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Stack

- Next.js 15 (App Router)
- Wagmi v2 (Viem-based)
- @fhevm/sdk (workspace)
- React 18

