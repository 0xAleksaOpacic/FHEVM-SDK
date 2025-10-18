import type { Eip1193Provider, FhevmInstance, FhevmChain } from '../types';
import { FhevmError, ErrorCodes, ClientErrorMessages } from '../errors';
import { createLogger } from '../utils/logger';
import { createInstance } from '@zama-fhe/relayer-sdk/web';
import { validateConfig } from './utils/validateConfig';
import { createIndexedDBStorage } from '../storage';

export interface FhevmConfig {
  /**
   * EIP-1193 provider or RPC URL
   */
  provider: string | Eip1193Provider;
  /**
   * FHEVM chain to use (recommended)
   * Import from '@fhevm-sdk/chains'
   */
  chain: FhevmChain;
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
}

/**
 * Creates an FHEVM client instance.
 * @param config - Client configuration.
 * @returns Client with initialize, getInstance, isReady, and getStatus.
 */
export function createClient(config: FhevmConfig): FhevmClient {
  validateConfig(config);
  
  let status: FhevmStatus = FhevmClientStatus.IDLE;
  let instance: FhevmInstance | undefined;
  let error: Error | undefined;
  
  const storage = createIndexedDBStorage();
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

      const { config: instanceConfig, id: resolvedChainId } = config.chain;
      const aclAddress = instanceConfig.aclContractAddress;
      
      logger.debug('Initializing FHEVM...', { chainId: resolvedChainId });

      // Try to load cached public key
      const cached = await storage.getPublicKey(aclAddress);
      
      if (cached) {
        logger.debug('Using cached public key', { publicKeyId: cached.publicKeyId });
      }

      // Create instance with cached key if available
      instance = await createInstance({
        ...instanceConfig,
        network: config.provider,
        publicKey: cached ? {
          data: cached.publicKey,
          id: cached.publicKeyId,
        } : undefined,
      });

      // Save to cache if not cached
      if (!cached) {
        const current = instance.getPublicKey();
        if (current) {
          logger.debug('Caching public key', { publicKeyId: current.publicKeyId });
          await storage.setPublicKey(aclAddress, current.publicKeyId, current.publicKey);
        }
      }

      status = FhevmClientStatus.READY;
      logger.debug('FHEVM initialized successfully', { chainId: resolvedChainId });
      
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

