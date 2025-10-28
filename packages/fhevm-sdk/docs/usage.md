# Usage Examples

Complete examples for web, mock, and Node.js clients.

## Web Client

For browser applications on Sepolia testnet:

```typescript
import { createClient, sepolia } from '@fhevm/sdk';

// Create client
const client = await createClient({
  network: 'sepolia',
  chainConfig: sepolia,
  provider: window.ethereum
});

// Initialize
await client.initialize();

// Encrypt values
const instance = client.getInstance();
const encryptedInput = instance.createEncryptedInput(
  contractAddress,
  userAddress
);

encryptedInput.add64(100).addBool(true);
const { handles, inputProof } = encryptedInput.encrypt();

// Use handles and inputProof in your contract transaction

// Decrypt values
// User decryption (requires signature)
const value = await client.userDecrypt({
  handle: '0x123...',
  contractAddress: '0xabc...',
  signer: walletClient // wagmi wallet client
});

// Public decryption (no signature)
const publicValue = await client.publicDecrypt(['0x456...']);
```

## Mock Client

For localhost testing with Hardhat:

```typescript
import { createMockClient, localhost } from '@fhevm/sdk/mock';
import { JsonRpcProvider } from 'ethers';

// Create mock client
const provider = new JsonRpcProvider('http://127.0.0.1:8545');

const client = await createMockClient(provider, localhost);

// Initialize (instant for mock)
await client.initialize();

// Encrypt values
const instance = client.getInstance();
const encryptedInput = instance.createEncryptedInput(
  contractAddress,
  userAddress
);

encryptedInput.add64(100);
const { handles, inputProof } = encryptedInput.encrypt();

// Decrypt values (same API as web client)
const value = await client.userDecrypt({
  handle: handles[0],
  contractAddress,
  signer: ethersWallet // ethers signer
});
```

## Node.js Client

For backend services and CLI tools:

```typescript
import { createNodeClient, sepolia } from '@fhevm/sdk/node';
import { Wallet, JsonRpcProvider } from 'ethers';

// 1. Create Node.js client
const client = await createNodeClient({
  network: 'sepolia',
  chainConfig: sepolia,
  provider: 'https://ethereum-sepolia-rpc.publicnode.com'
});

// 2. Initialize
await client.initialize();

// 3. Encrypt values
const instance = client.getInstance();
const provider = new JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');
const wallet = new Wallet(privateKey, provider);

const encryptedInput = instance.createEncryptedInput(
  contractAddress,
  wallet.address
);

encryptedInput.add64(100);
const { handles, inputProof } = encryptedInput.encrypt();

// 4. Decrypt values
const value = await client.userDecrypt({
  handle: handles[0],
  contractAddress,
  signer: wallet // ethers wallet
});
```

## Complete Example

See the [Node.js CLI example](../../../examples/nodejs) for a complete working implementation using `@fhevm/sdk/node`.

> **Note:** For React and Vue examples, see [`@fhevm/react-sdk`](../../fhevm-react-sdk) and [`@fhevm/vue-sdk`](../../fhevm-vue-sdk) which provide higher-level abstractions.

