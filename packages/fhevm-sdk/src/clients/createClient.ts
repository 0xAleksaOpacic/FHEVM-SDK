import type { FhevmInstance } from '@zama-fhe/relayer-sdk/web';
import type { FhevmConfig, FhevmClient, FhevmStatus } from './types';
import { FhevmClientStatus } from './types';
import { FhevmError, ErrorCodes, ClientErrorMessages } from '../errors';
import { createLogger } from '../utils/logger';
import { loadRelayerSDK } from './utils/relayerLoader';
import { validateConfig } from './utils/validateConfig';
import { createIndexedDBStorage } from '../storage';
import { publicDecrypt as publicDecryptAction, userDecrypt as userDecryptAction } from '../actions/decryption';
import type { DecryptedValues, UserDecryptParams, DecryptedValue } from '../actions/decryption';

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
  
  const storage = config.storage || createIndexedDBStorage();
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

      // Lazy-load the relayer SDK
      const sdk = await loadRelayerSDK();

      const instanceConfig = config.chain;
      const resolvedChainId = instanceConfig.chainId;
      const aclAddress = instanceConfig.aclContractAddress;
      
      logger.debug('Initializing FHEVM...', { chainId: resolvedChainId });

      // Try to load cached public key and params
      const cachedKey = await storage.getPublicKey(aclAddress);
      const cachedParams = await storage.getPublicParams(aclAddress);
      
      if (cachedKey) {
        logger.debug('Using cached public key', { publicKeyId: cachedKey.publicKeyId });
      }
      
      if (cachedParams) {
        const paramSizes = Object.keys(cachedParams);
        logger.debug('Using cached public params', { sizes: paramSizes });
      }

      // Create instance with cached data if available
      instance = await sdk.createInstance({
        ...instanceConfig,
        network: config.provider,
        publicKey: cachedKey ? {
          data: cachedKey.publicKey,
          id: cachedKey.publicKeyId,
        } : undefined,
        publicParams: cachedParams || undefined,
      });

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
   * Performs user-specific decryption requiring EIP-712 signature
   * Supports both single and batch decryption
   * 
   * @param params - Decryption parameters including handle(s), contractAddress, signer, and optional duration
   * @returns The decrypted value(s) - single value or record based on input
   * @throws {FhevmError} If client is not initialized
   */
  async function userDecrypt(params: UserDecryptParams): Promise<DecryptedValue | DecryptedValues> {
    if (!instance) {
      throw new FhevmError(
        ErrorCodes.NOT_INITIALIZED,
        ClientErrorMessages.NOT_INITIALIZED
      );
    }
    
    return await userDecryptAction(instance, params);
  }
  
  return {
    config,
    getStatus,
    initialize,
    getInstance,
    isReady,
    publicDecrypt,
    userDecrypt,
  };
}

