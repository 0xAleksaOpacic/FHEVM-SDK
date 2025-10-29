# Deploy to Sepolia

Guide for deploying the [`FHECounter`](../packages/hardhat/contracts/FHECounter.sol) contract to Sepolia testnet.

## Prerequisites

1. **Get Sepolia ETH**: You need testnet ETH to deploy. Get it from faucets:
   - [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
   - [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)
   - [QuickNode Sepolia Faucet](https://faucet.quicknode.com/ethereum/sepolia)

2. **Export Private Key from MetaMask**:
   - Open MetaMask
   - Click the three dots menu → Account Details
   - Click "Show private key"
   - Enter your password and copy the key

## Setup

Create a `.env` file in the **root directory** with your deployer private key:

```bash
# Required: Your deployer wallet private key (must have Sepolia ETH)
DEPLOYER_PRIVATE_KEY=0x1234567890abcdef...

# Optional: Custom Sepolia RPC (defaults to https://ethereum-sepolia-rpc.publicnode.com)
SEPOLIA_RPC_URL=https://rpc.sepolia.org
```

> **⚠️ Security Warning**  
> Never commit `.env` files or expose your private key. The `.env` file is already in `.gitignore`.

Check your deployer address and balance before deploying:
```bash
pnpm deployer:info
```

This will show your deployer address and current Sepolia ETH balance. Make sure you have enough ETH before proceeding.

## Deploy

From the root directory, run:

```bash
pnpm deploy:sepolia
```

The script will:
1. Connect to Sepolia network
2. Deploy the `FHECounter` contract
3. Output the deployed contract address

### Example Output

```bash
deploying "FHECounter" (tx: 0x1234...)
FHECounter deployed at 0x6134E9810A204661eaB5a189A44BB7F1CB2a4196
```

## After Deployment

1. **Save the contract address** from the output
2. **Update your examples** to use the new address:
   - For Next.js: Set `NEXT_PUBLIC_SEPOLIA_COUNTER_ADDRESS` in `examples/nextjs/.env.local`
   - For Vue: Set `VITE_SEPOLIA_COUNTER_ADDRESS` in `examples/vue/.env.local`
   - For Node.js: Set `SEPOLIA_COUNTER_ADDRESS` in `examples/nodejs/.env`

3. **Verify on Etherscan** (optional):
   ```bash
   cd packages/hardhat
   npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
   ```

## Troubleshooting

### "Insufficient funds"
You don't have enough Sepolia ETH. Get more from faucets listed above.

### "Invalid private key"
Ensure your `DEPLOYER_PRIVATE_KEY` in `.env` starts with `0x` and is 66 characters long.

### "Network not found"
Make sure you're running the command from the root directory where `.env` is located.

### Custom RPC Issues
If deployment fails, try using a different RPC URL in `SEPOLIA_RPC_URL`. Public RPCs:
- `https://ethereum-sepolia-rpc.publicnode.com`
- `https://rpc.sepolia.org`
- `https://eth-sepolia.public.blastapi.io`

