import type { FhevmInstance } from '@zama-fhe/relayer-sdk/web';

/**
 * Creates a mock FHEVM instance for testing
 * 
 * This is a minimal stub that satisfies the FhevmInstance interface.
 * Methods are added as needed by tests.
 * 
 * @returns Mock FHEVM instance
 */
export async function createMockInstance(): Promise<FhevmInstance> {
  return {
    getPublicKey: () => ({
      publicKey: new Uint8Array([1, 2, 3]),
      publicKeyId: 'mock-key-id',
    }),
    getPublicParams: (bits: number) => ({
      publicParams: new Uint8Array([4, 5, 6]),
      publicParamsId: `mock-params-${bits}`,
    }),
  } as FhevmInstance;
}

