# useFhevmUserDecrypt

Decrypt encrypted values that require user signature (EIP-712) for access control. Supports single and batch decryption with optional signature caching to reduce wallet popups. Requires active wallet connection.

**Options:** `{ contractAddress: string, cacheType?: 'none' | 'session' | 'persistent', duration?: number }`  
**Returns:** `{ decrypt: (handle: string | string[]) => Promise<DecryptedValue>, clearCache: () => Promise<void>, isDecrypting: boolean, error: Error | null }`

> **Note:** Batch decryption requires only ONE signature for all handles.

## Usage

```tsx
import { useFhevmUserDecrypt } from '@fhevm/react-sdk';
import { useState } from 'react';

function UserBalance() {
  const [balance, setBalance] = useState<bigint | null>(null);
  const { decrypt, isDecrypting } = useFhevmUserDecrypt({
    contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    cacheType: 'session',
  });

  async function handleDecrypt(handle: string) {
    try {
      const value = await decrypt(handle);
      setBalance(value as bigint);
    } catch (err) {
      console.error('Decryption failed:', err);
    }
  }

  return (
    <div>
      <button onClick={() => handleDecrypt('0x...')} disabled={isDecrypting}>
        {isDecrypting ? 'Decrypting...' : 'Decrypt Balance'}
      </button>
      {balance !== null && <p>Balance: {balance.toString()}</p>}
    </div>
  );
}
```

## Batch Decryption

Decrypt multiple values with a single signature. The hook automatically batches the request, so only ONE wallet popup appears for all handles:

```tsx
const { decrypt, isDecrypting } = useFhevmUserDecrypt({
  contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  cacheType: 'persistent',
});

async function handleBatchDecrypt() {
  const handles = [
    '0x...', // balance
    '0x...', // age
    '0x...', // score
  ];
  
  // Only ONE signature requested for all handles
  const decrypted = await decrypt(handles);
  
  setData({
    balance: decrypted[handles[0]],
    age: decrypted[handles[1]],
    score: decrypted[handles[2]],
  });
}
```

## Signature Caching

Control how signatures are cached to reduce wallet popups:

- **`none`** (default) - Always request signature. Most secure.
- **`session`** - Cache in `sessionStorage` until tab closes.
- **`persistent`** - Cache in `IndexedDB` for `duration` days (default 7).

Call `clearCache()` to invalidate cached signatures (e.g., on logout).
