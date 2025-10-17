import type { FhevmInstance } from '../types';

/**
 * Creates a mock FHEVM instance for testing
 * 
 * This is a minimal stub that satisfies the FhevmInstance interface.
 * Methods will be added as needed when tests require them.
 * 
 * @returns Mock FHEVM instance
 * 
 * @example
 * ```typescript
 * const instance = await createMockInstance();
 * ```
 */
export async function createMockInstance(): Promise<FhevmInstance> {
  return {} as FhevmInstance;
}

