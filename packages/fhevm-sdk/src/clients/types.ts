import type { FhevmInstance, FhevmInstanceConfig } from '@zama-fhe/relayer-sdk/web';
import type { StorageAdapter } from '../storage';
import type { DecryptedValue, DecryptedValues, UserDecryptParams } from '../actions/decryption';

export interface Eip1193Provider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
}

export interface FhevmConfig {
  /**
   * EIP-1193 provider or RPC URL
   */
  provider: string | Eip1193Provider;
  /**
   * FHEVM chain configuration
   */
  chain: FhevmInstanceConfig;
  /**
   * Storage adapter for caching public keys (defaults to IndexedDB)
   */
  storage?: StorageAdapter;
  /**
   * Enable debug logging
   */
  debug?: boolean;
}

export const FhevmClientStatus = {
  IDLE: 'idle',
  LOADING: 'loading',
  READY: 'ready',
  ERROR: 'error',
} as const;

export type FhevmStatus = typeof FhevmClientStatus[keyof typeof FhevmClientStatus];

export interface FhevmClient {
  config: FhevmConfig;
  getStatus(): FhevmStatus;
  initialize(): Promise<void>;
  getInstance(): FhevmInstance | undefined;
  isReady(): boolean;
  publicDecrypt(handles: string[]): Promise<DecryptedValues>;
  userDecrypt(params: UserDecryptParams): Promise<DecryptedValue | DecryptedValues>;
}

