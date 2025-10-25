import type { FhevmInstance } from '@zama-fhe/relayer-sdk/node';
import type { FhevmConfig, FhevmClient, FhevmStatus } from './types';
import { FhevmClientStatus } from './types';
import { FhevmError, ErrorCodes, ClientErrorMessages } from '../errors';
import { createLogger } from '../utils/logger';
import { validateConfig } from './utils/validateConfig';
import { createInMemoryStorage } from '../storage';
import { publicDecrypt as publicDecryptAction, userDecrypt as userDecryptAction } from '../actions/decryption';
import type { DecryptedValues, UserDecryptParams, DecryptedValue } from '../actions/decryption';

/**
 * Creates an FHEVM client instance for Node.js environments.
 * 
 * This client uses in-memory storage (no IndexedDB/sessionStorage).
 * For production, consider implementing custom storage adapters.
 * 
 * @param config - Client configuration
 * @returns Node.js client with initialize, getInstance, isReady, and getStatus
 */
export function createNodeClient(config: FhevmConfig): FhevmClient {
  validateConfig(config);
  
  let status: FhevmStatus = FhevmClientStatus.IDLE;
  let instance: FhevmInstance | undefined;
  let error: Error | undefined;
  
  // Node.js uses in-memory storage (no browser storage available)
  const storage = config.storage || createInMemoryStorage();
  const logger = createLogger('FHEVM-Node', config.debug || false);
  
  /**
   * Initializes the FHEVM client by loading the Node.js SDK
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

      // Direct import for Node.js
      const sdk = await import('@zama-fhe/relayer-sdk/node');
      const { createInstance } = sdk;

      const instanceConfig = config.chain;
      const resolvedChainId = instanceConfig.chainId;
      const aclAddress = instanceConfig.aclContractAddress;
      
      logger.debug('Initializing FHEVM (Node.js)...', { chainId: resolvedChainId });

      // Try to load cached public key and params
      const cachedKey = await storage.getPublicKey(aclAddress);
      const cachedParams = await storage.getPublicParams(aclAddress);
      
      if (cachedKey) {
        logger.debug('Using cached public key', { publicKeyId: cachedKey.publicKeyId });
      }
      
      if (cachedParams) {
        logger.debug('Using cached public params');
      }

      // Create instance with cached data if available
      const createInstanceConfig: any = {
        ...instanceConfig,
        publicKey: cachedKey ? {
          data: cachedKey.publicKey,
          id: cachedKey.publicKeyId,
        } : undefined,
        publicParams: cachedParams || undefined,
      };
      
      // Only set network if not already provided in instanceConfig
      if (!instanceConfig.network && config.provider) {
        createInstanceConfig.network = config.provider;
      }
      
      instance = await createInstance(createInstanceConfig);

      // Save to cache if not cached
      if (!cachedKey) {
        const currentKey = instance.getPublicKey();
        if (currentKey) {
          logger.debug('Caching public key', { publicKeyId: currentKey.publicKeyId });
          await storage.setPublicKey(aclAddress, currentKey.publicKeyId, currentKey.publicKey);
        }
      }

      if (!cachedParams) {
        // Fetch and cache all available public params
        const allParams: Record<number, { publicParamsId: string; publicParams: Uint8Array }> = {};
        
        for (const bits of Object.keys(sdk.ENCRYPTION_TYPES)) {
          const bitSize = Number(bits);
          const params = instance.getPublicParams(bitSize as keyof typeof sdk.ENCRYPTION_TYPES);
          if (params) {
            allParams[bitSize] = {
              publicParamsId: params.publicParamsId,
              publicParams: params.publicParams,
            };
          }
        }

        if (Object.keys(allParams).length > 0) {
          logger.debug('Caching public params', { sizes: Object.keys(allParams) });
          await storage.setPublicParams(aclAddress, allParams);
        }
      }
      
      status = FhevmClientStatus.READY;
      logger.debug('FHEVM initialized successfully (Node.js)', { chainId: resolvedChainId });
      
    } catch (e) {
      status = FhevmClientStatus.ERROR;
      error = e instanceof Error ? e : new Error('Unknown error during initialization');
      logger.debug('FHEVM initialization failed', error);
      throw new FhevmError(ErrorCodes.INIT_FAILED, ClientErrorMessages.INIT_FAILED, error);
    }
  }
  
  /**
   * Gets the FHEVM instance (must be initialized first)
   * 
   * @returns The FHEVM instance
   * @throws {FhevmError} If not initialized
   */
  function getInstance(): FhevmInstance {
    if (!instance) {
      throw new FhevmError(
        ErrorCodes.NOT_INITIALIZED,
        ClientErrorMessages.NOT_INITIALIZED
      );
    }
    return instance;
  }
  
  /**
   * Checks if the client is ready for operations
   */
  function isReady(): boolean {
    return status === FhevmClientStatus.READY && instance !== undefined;
  }
  
  /**
   * Gets the current client status
   */
  function getStatus(): FhevmStatus {
    return status;
  }

  /**
   * Performs public decryption on publicly decryptable handles
   * 
   * @param handles - Array of ciphertext handles to decrypt
   * @returns Map of handle to decrypted value
   * @throws {FhevmError} If client is not initialized
   */
  async function publicDecrypt(handles: string[]): Promise<DecryptedValues> {
    if (!instance) {
      throw new FhevmError(
        ErrorCodes.NOT_INITIALIZED,
        ClientErrorMessages.NOT_INITIALIZED
      );
    }
    
    return await publicDecryptAction(instance, handles);
  }

  /**
   * Performs user decryption with signature caching support.
   * 
   * Note: Node.js client only supports in-memory caching.
   */
  async function userDecrypt(params: UserDecryptParams): Promise<DecryptedValue | DecryptedValues> {
    const currentInstance = getInstance();
    return await userDecryptAction(currentInstance, params);
  }
  
  return {
    config,
    initialize,
    getInstance,
    isReady,
    getStatus,
    publicDecrypt,
    userDecrypt,
  };
}

