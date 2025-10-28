# Configuration

The SDK supports two network modes: **localhost** (for local Hardhat development) and **Sepolia** (for testnet). Each mode requires FHEVM contract addresses (ACL, KMS Verifier, Input Verifier, TFHE Executor, etc.). See [Zama's official contract addresses](https://docs.zama.ai/protocol/solidity-guides/smart-contract/configure/contract_addresses) for the complete list.

## Default Configurations

Import pre-configured chain configs directly from the SDK:

```typescript
import { createClient, localhost, sepolia } from '@fhevm/sdk';

// Localhost (Hardhat)
const localClient = await createClient({
  network: 'localhost',
  chainConfig: localhost // Hardhat deterministic addresses
});

// Sepolia testnet
const sepoliaClient = await createClient({
  network: 'sepolia',
  chainConfig: sepolia // Zama's official Sepolia addresses
});
```

> **Note:** `localhost` and `sepolia` are exported from `@fhevm/sdk`, `@fhevm/sdk/mock`, and `@fhevm/sdk/node`.

## Custom Configuration

Override specific addresses or provide a completely custom configuration:

```typescript
import { createClient, sepolia } from '@fhevm/sdk';

// Partial override - keep defaults, change specific addresses
const client = await createClient({
  network: 'sepolia',
  chainConfig: {
    ...sepolia,
    aclContractAddress: '0xYourCustomAddress'
  }
});

// Full custom config - provide all addresses
const customClient = await createClient({
  network: 'custom',
  chainConfig: {
    chainId: 123456,
    aclContractAddress: '0x...',
    kmsVerifierContractAddress: '0x...',
    inputVerifierContractAddress: '0x...',
    tfheExecutorContractAddress: '0x...'
  }
});
```

## ChainConfig Type

```typescript
type ChainConfig = {
  chainId: number;
  aclContractAddress: string;
  kmsVerifierContractAddress: string;
  inputVerifierContractAddress: string;
  tfheExecutorContractAddress: string;
};
```
