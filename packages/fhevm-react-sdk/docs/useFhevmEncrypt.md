# useFhevmEncrypt

Create encrypted inputs for FHEVM smart contracts. Returns a factory function that produces `EncryptedInput` instances bound to a specific contract address. Each input is bound to prevent encrypted values from being used with unintended contracts.

**Options:** `{ contractAddress: string }`  
**Returns:** `{ createInput: (userAddress: string) => EncryptedInput, isReady: boolean }`

> **Note:** If you need to encrypt for multiple contracts, create separate hook instances.

## Usage

```tsx
import { useFhevmEncrypt } from '@fhevm/react-sdk';
import { useAccount } from 'wagmi';

function EncryptDemo() {
  const { address } = useAccount();
  const { createInput, isReady } = useFhevmEncrypt({
    contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  });

  async function handleEncrypt() {
    if (!isReady || !address) return;

    // Create encrypted input bound to contract and user
    const input = createInput(address);
    
    // Add values to encrypt
    input.add32(42);
    input.add64(100n);
    input.addBool(true);
    
    // Encrypt all values in a single operation
    const { handles, inputProof } = await input.encrypt();
    
    // Use in contract call
    await contract.myMethod(handles[0], handles[1], handles[2], inputProof);
  }

  return (
    <button onClick={handleEncrypt} disabled={!isReady}>
      Encrypt & Submit
    </button>
  );
}
```

## Supported Types

The `EncryptedInput` instance supports all FHEVM encrypted types: `add8`, `add16`, `add32`, `add64`, `add128`, `add256`, `addBool`, `addAddress`. See [official Zama documentation](https://docs.zama.ai/protocol/relayer-sdk-guides/fhevm-relayer/input) for complete type reference.

## Batch Encryption

All values added to a single input are encrypted together in one operation. The `encrypt()` method returns an array of handles (one per added value) and a single proof that covers all values:

```tsx
const input = createInput(address);
input.add32(10);    // handles[0]
input.add32(20);    // handles[1]
input.add64(30n);   // handles[2]

const { handles, inputProof } = await input.encrypt();

// Single proof validates all three encrypted values
await contract.batchOperation(handles[0], handles[1], handles[2], inputProof);
```
