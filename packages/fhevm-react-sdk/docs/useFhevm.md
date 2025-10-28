# useFhevm

Access FHEVM client instance and status from context. Must be used within a component wrapped by `FhevmProvider`.

> **Note:** Most applications should use the specialized hooks (`useFhevmEncrypt`, `useFhevmUserDecrypt`, `useFhevmPublicDecrypt`) instead of accessing the client directly.

## Returns

```typescript
{
  client: FhevmClient | null;
  status: FhevmStatus;           // IDLE | LOADING | READY | ERROR
  isReady: boolean;              // true when status === READY
  network: 'localhost' | 'sepolia';
}
```

## Usage

```tsx
import { useFhevm, FhevmClientStatus } from '@fhevm/react-sdk';

function MyComponent() {
  const { client, status, isReady, network } = useFhevm();

  if (status === FhevmClientStatus.LOADING) {
    return <div>Initializing FHEVM...</div>;
  }

  if (status === FhevmClientStatus.ERROR) {
    return <div>Failed to initialize</div>;
  }

  if (!isReady) {
    return null;
  }

  return <div>Connected to {network}</div>;
}
```

## Client Status

The `status` field reflects the provider's lifecycle:

- **`IDLE`** - Initial state before initialization
- **`LOADING`** - Client is being created, SDK loaded, keys fetched
- **`READY`** - Client initialized and ready for operations
- **`ERROR`** - Initialization failed

Use `isReady` as a shorthand for `status === FhevmClientStatus.READY && client !== null`.
