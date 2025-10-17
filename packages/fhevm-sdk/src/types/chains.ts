import type { FhevmInstanceConfig } from '@zama-fhe/relayer-sdk/web';

/**
 * FHEVM chain configuration
 */
export interface FhevmChain {
  /**
   * Chain ID
   */
  id: number;
  /**
   * Human-readable chain name
   */
  name: string;
  /**
   * Whether this is a testnet
   */
  testnet?: boolean;
  /**
   * FHEVM instance configuration for this chain
   */
  config: FhevmInstanceConfig;
}

