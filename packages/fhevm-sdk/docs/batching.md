# Request Batching

The SDK provides batching methods to combine multiple encryption or decryption operations into a single network request, reducing overhead and improving performance.

## Encryption Batching

Encryption batching works out of the box through the relayer SDK's `createEncryptedInput()` method, which accepts multiple values:

```typescript
const instance = client.getInstance();

// Batch multiple values in one encryption request
const encryptedInput = instance.createEncryptedInput(
  contractAddress,
  userAddress
);

encryptedInput
  .add64(100)
  .addAddress('0x123...')
  .addBool(true);

const { handles, inputProof } = encryptedInput.encrypt();

// All three values encrypted in a single network call
// Use handles and inputProof in your contract transaction
```

## Decryption Batching

The SDK improves the decryption interface by allowing you to pass multiple handles at once.

### User Decryption (with signature)

Instead of requesting a signature for each handle separately, batch multiple handles with a **single signature**:

```typescript
// Single handle
const value = await client.userDecrypt({
  handle: '0x123...',
  contractAddress: '0xabc...',
  signer: walletClient
});

// Multiple handles - ONE signature for all!
const values = await client.userDecrypt({
  handles: ['0x123...', '0x456...', '0x789...'],
  contractAddress: '0xabc...',
  signer: walletClient
});

// Returns: { '0x123...': 100n, '0x456...': 200n, '0x789...': 300n }
```

### Public Decryption (no signature)

Batch multiple public handles in one request:

```typescript
// Decrypt multiple public handles at once
const values = await client.publicDecrypt([
  '0x123...',
  '0x456...',
  '0x789...'
]);

// Returns: { '0x123...': 100n, '0x456...': 200n, '0x789...': 300n }
```
