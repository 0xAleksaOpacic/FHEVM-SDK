# useFhevmPublicDecrypt

Decrypt values marked as publicly decryptable. No signature required - anyone can decrypt these values through the FHEVM gateway or relayer. Works without wallet connection.

**Returns:** `{ decrypt: (handle: string | string[]) => Promise<DecryptedValue>, isDecrypting: boolean, error: Error | null }`

> **Note:** Values must be explicitly marked as publicly decryptable in the smart contract using `TFHE.allowThis(handle)`.

## Usage

```tsx
import { useFhevmPublicDecrypt } from '@fhevm/react-sdk';
import { useState } from 'react';

function PublicCounter() {
  const [count, setCount] = useState<bigint | null>(null);
  const { decrypt, isDecrypting } = useFhevmPublicDecrypt();

  async function handleDecrypt(handle: string) {
    try {
      const value = await decrypt(handle);
      setCount(value as bigint);
    } catch (err) {
      console.error('Decryption failed:', err);
    }
  }

  return (
    <div>
      <button onClick={() => handleDecrypt('0x...')} disabled={isDecrypting}>
        {isDecrypting ? 'Loading...' : 'Get Public Count'}
      </button>
      {count !== null && <p>Count: {count.toString()}</p>}
    </div>
  );
}
```

## Batch Decryption

Decrypt multiple public values in a single request:

```tsx
const { decrypt, isDecrypting } = useFhevmPublicDecrypt();

async function handleBatchDecrypt() {
  const handles = ['0x...', '0x...', '0x...'];
  
  const decrypted = await decrypt(handles);
  
  setStats({
    totalUsers: decrypted[handles[0]],
    totalTransactions: decrypted[handles[1]],
    totalVolume: decrypted[handles[2]],
  });
}
```