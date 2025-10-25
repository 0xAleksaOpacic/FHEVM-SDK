# FHEVM Node.js CLI Example

A simple command-line demo showcasing FHEVM encryption and decryption in a Node.js environment.

## Features

- 🔐 Initialize FHEVM client for Node.js
- 🔒 Encrypt values using FHE
- 📤 Send encrypted transactions
- 🔓 Decrypt public values
- 🌐 Works with localhost (Hardhat) and Sepolia testnet

## Prerequisites

1. **Node.js** >= 20.0.0
2. **Running Hardhat node** (for localhost mode):
   ```bash
   # From repo root
   pnpm chain
   ```
3. **Test wallet with ETH** (for Sepolia mode)

## Quick Start

### 1. Install Dependencies

```bash
# From repo root
pnpm install
```

### 2. Configure Environment

```bash
cd examples/nodejs
cp env.example .env
# Edit .env with your settings
```

### 3. Run the Demo

**Localhost (Hardhat):**
```bash
pnpm start
```

**Sepolia Testnet:**
```bash
# Edit .env:
# - Set NETWORK_MODE=sepolia
# - Set your PRIVATE_KEY
# - Set SEPOLIA_COUNTER_ADDRESS

pnpm start
```

## What It Does

The CLI demonstrates a complete FHEVM workflow:

1. ✅ **Initialize** - Connects to FHEVM network and fetches public keys
2. ✅ **Encrypt** - Creates encrypted input for value `5`
3. ✅ **Transaction** - Sends encrypted value to counter contract
4. ✅ **Read** - Gets encrypted counter handle from contract
5. ✅ **Decrypt** - Decrypts the public counter value

## Expected Output

```
🚀 FHEVM Node.js CLI Demo
========================
📍 Network: localhost
🔗 RPC: http://localhost:8545
📝 Contract: 0x5FbDB2315678afecb367f032d93F642f64180aa3

🔐 Initializing FHEVM client...
✅ FHEVM client initialized

🔑 Setting up wallet...
✅ Wallet address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
✅ Contract instance created

🔒 Encrypting value: 5
✅ Encrypted handle: 0xd8c546ed63b49509...
✅ Input proof length: 896 bytes

📤 Sending increment transaction...
⏳ Transaction sent: 0xabc123...
⏳ Waiting for confirmation...
✅ Transaction confirmed in block 42

📦 Reading public counter handle...
✅ Got handle: 0xd8c546ed63b49509...

🔓 Decrypting public counter...
✅ Decrypted value: 5

🎉 Demo complete!
```

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NETWORK_MODE` | Yes | `localhost` or `sepolia` |
| `PRIVATE_KEY` | Yes | Your wallet private key (test wallet only!) |
| `LOCALHOST_RPC_URL` | No | Default: `http://localhost:8545` |
| `LOCALHOST_COUNTER_ADDRESS` | No | Default: Hardhat deterministic address |
| `SEPOLIA_RPC_URL` | Sepolia | Public RPC endpoint |
| `SEPOLIA_COUNTER_ADDRESS` | Sepolia | Your deployed counter address |

### Security Notes

⚠️ **Never commit your private key to git!**
- Use test wallets only
- Keep `.env` in `.gitignore`
- For production, use key management services (AWS KMS, Azure Key Vault, etc.)

## How It Works

### FHEVM Client

```typescript
import { createNodeClient, sepolia } from '@fhevm/sdk/node';

const client = createNodeClient({
  chain: sepolia,
  provider: 'https://ethereum-sepolia-rpc.publicnode.com',
});

await client.initialize();
```

**Node.js Differences from Browser:**
- Uses `@fhevm/sdk/node` (not `/web`)
- In-memory storage (no IndexedDB)
- Direct SDK import (no lazy loading)

### Encryption

```typescript
const instance = client.getInstance();
const input = instance.createEncryptedInput(contractAddress, userAddress);
input.add32(5);
const { handles, inputProof } = input.encrypt();
```

### Decryption

```typescript
const decrypted = await client.publicDecrypt([handle]);
console.log(decrypted[handle]); // 5n
```

**Note:** Node.js backend can only use **public decryption**. User-specific decryption requires wallet signatures (frontend only).

## Limitations

- ❌ **No user decryption** - Can't decrypt user-specific values (requires wallet signature)
- ✅ **Public decryption only** - Can decrypt publicly accessible values
- ⚠️ **Server wallet** - Transactions signed by server private key

## Troubleshooting

### "PRIVATE_KEY not set"
Copy `env.example` to `.env` and set your private key.

### "Transaction failed"
- Check wallet has ETH for gas
- Check contract address is correct
- Check network mode matches deployed contract

### "FHEVM initialization failed"
- Check RPC URL is accessible
- Check network mode is correct
- Check internet connection

## Next Steps

- Integrate into your backend API (Express, Fastify)
- Add more complex encryption examples
- Implement monitoring/automation scripts
- Connect to your own smart contracts

## Learn More

- [FHEVM SDK Documentation](../../packages/fhevm-sdk/README.md)
- [React Example](../nextjs/README.md)
- [Vue Example](../vue/README.md)

