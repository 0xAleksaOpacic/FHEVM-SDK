import { createContext } from 'react';
import type { FhevmClient, FhevmStatus } from '@fhevm/sdk';

export type NetworkMode = 'localhost' | 'sepolia';

/**
 * Context value provided by FhevmProvider
 */
export interface FhevmContextValue {
  /**
   * FHEVM client instance
   */
  client: FhevmClient | null;
  
  /**
   * Current client status
   */
  status: FhevmStatus;
  
  /**
   * Whether the client is ready to use
   */
  isReady: boolean;
  
  /**
   * Current network mode
   */
  network: NetworkMode;
}

/**
 * React context for FHEVM client state
 */
export const FhevmContext = createContext<FhevmContextValue | null>(null);

