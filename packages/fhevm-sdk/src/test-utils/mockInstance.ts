import type { FhevmInstance } from '../types';

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
  } as FhevmInstance;
}

