import type { Eip1193Provider, FhevmInstance } from '../types';
import { FhevmError, ErrorCodes, ClientErrorMessages } from '../errors';
import { createLogger } from '../utils/logger';

export interface FhevmConfig {
  provider: string | Eip1193Provider;
  chainId: number;
  mockChains?: Record<number, string>;
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
}

/**
 * Creates an FHEVM client instance
 * 
 * @param config - Client configuration including provider and chainId
 * @returns FHEVM client with initialize, getInstance, and isReady methods
 * 
 * @example
 * ```typescript
 * const client = createClient({
 *   provider: window.ethereum,
 *   chainId: 11155111,
 *   debug: true
 * });
 * 
 * await client.initialize();
 * ```
 */
export function createClient(config: FhevmConfig): FhevmClient {
  validateConfig(config);
  
  let status: FhevmStatus = FhevmClientStatus.IDLE;
  let instance: FhevmInstance | undefined;
  let error: Error | undefined;
  
  const logger = createLogger('FHEVM', config.debug || false);
  
  /**
   * Initializes the FHEVM client by loading the SDK and fetching public keys
   * 
   * @throws {FhevmError} If initialization fails or is already in progress
   */
  async function initialize(): Promise<void> {
    if (status === FhevmClientStatus.LOADING) {
      throw new FhevmError(ErrorCodes.INIT_FAILED, ClientErrorMessages.ALREADY_INITIALIZING);
    }
    
    if (status === FhevmClientStatus.READY) {
      logger.debug('Already initialized');
      return;
    }
    
    try {
      status = FhevmClientStatus.LOADING;
      logger.debug('Initializing FHEVM...');
      
      // TODO: Implement actual initialization
      // - Load FHEVM SDK (relayer-sdk)
      // - Detect chain and verify it's supported
      // - Fetch public keys from KMS
      // - Create FhevmInstance
      await new Promise(resolve => setTimeout(resolve, 100));
      
      status = FhevmClientStatus.READY;
      logger.debug('FHEVM initialized successfully');
      
    } catch (e) {
      status = FhevmClientStatus.ERROR;
      error = e as Error;
      logger.error('Initialization failed:', error);
      throw new FhevmError(
        ErrorCodes.INIT_FAILED,
        ClientErrorMessages.INIT_FAILED,
        error
      );
    }
  }
  
  /**
   * Returns the current status of the client
   * 
   * @returns Current status (idle, loading, ready, or error)
   */
  function getStatus(): FhevmStatus {
    return status;
  }
  
  /**
   * Returns the FHEVM instance if initialized
   * 
   * @returns The FHEVM instance or undefined if not initialized
   */
  function getInstance(): FhevmInstance | undefined {
    return instance;
  }
  
  /**
   * Checks if the client is ready to use
   * 
   * @returns True if client is initialized and ready
   */
  function isReady(): boolean {
    return status === FhevmClientStatus.READY;
  }
  
  return {
    config,
    getStatus,
    initialize,
    getInstance,
    isReady,
  };
}

/**
 * Validates the client configuration
 * 
 * @param config - Configuration to validate
 * @throws {FhevmError} If configuration is invalid
 */
function validateConfig(config: FhevmConfig): void {
  if (!config.provider) {
    throw new FhevmError(
      ErrorCodes.INVALID_CONFIG,
      ClientErrorMessages.PROVIDER_REQUIRED
    );
  }
  
  if (!config.chainId || typeof config.chainId !== 'number') {
    throw new FhevmError(
      ErrorCodes.INVALID_CONFIG,
      ClientErrorMessages.INVALID_CHAIN_ID
    );
  }
  
  if (config.chainId <= 0) {
    throw new FhevmError(
      ErrorCodes.INVALID_CONFIG,
      ClientErrorMessages.CHAIN_ID_POSITIVE
    );
  }
}

