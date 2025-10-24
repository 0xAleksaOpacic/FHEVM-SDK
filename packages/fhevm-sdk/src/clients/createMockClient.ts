import type { FhevmInstance } from '@zama-fhe/relayer-sdk/web';
import type { FhevmClient } from '../clients/types';
import { FhevmClientStatus } from '../clients/types';
import type { UserDecryptParams, DecryptedValue, DecryptedValues } from '../actions/decryption';
import { userDecrypt, publicDecrypt } from '../actions/decryption';

// TODO: should be exported from @fhevm/mock-utils
export interface MockClientConfig {
  chainId: number;
  gatewayChainId: number;
  aclContractAddress: string;
  kmsContractAddress: string;
  inputVerifierContractAddress: string;
  verifyingContractAddressDecryption: string;
  verifyingContractAddressInputVerification: string;
}

/**
 * Creates an FHEVM client for local mock mode
 * Requires ethers.JsonRpcProvider to be passed by user
 */
export async function createMockClient(
  ethersProvider: any,
  config: MockClientConfig
): Promise<Omit<FhevmClient, 'config'>> {
  // Dynamically import to avoid bundling
  const { MockFhevmInstance, contracts } = await import('@fhevm/mock-utils');
  
  // Query the InputVerifier contract to get its actual EIP712 domain
  const inputVerifier = await contracts.InputVerifier.create(
    ethersProvider,
    config.inputVerifierContractAddress
  );
  
  const inputVerifierDomain = inputVerifier.eip712Domain;
  
  // Auto-correct verifyingContractAddressInputVerification if needed
  if (config.verifyingContractAddressInputVerification !== inputVerifierDomain.verifyingContract) {
    config.verifyingContractAddressInputVerification = inputVerifierDomain.verifyingContract;
  }
  
  // Auto-correct gatewayChainId from InputVerifier if needed
  if (config.gatewayChainId !== Number(inputVerifierDomain.chainId)) {
    config.gatewayChainId = Number(inputVerifierDomain.chainId);
  }
  
  // Query the KMSVerifier contract to get its actual EIP712 domain
  const kmsVerifier = await contracts.KMSVerifier.create(
    ethersProvider,
    config.kmsContractAddress
  );
  
  const kmsVerifierDomain = kmsVerifier.eip712Domain;
  
  // Auto-correct verifyingContractAddressDecryption if needed
  if (config.verifyingContractAddressDecryption !== kmsVerifierDomain.verifyingContract) {
    config.verifyingContractAddressDecryption = kmsVerifierDomain.verifyingContract;
  }
  
  const instance: FhevmInstance = await MockFhevmInstance.create(
    ethersProvider,
    ethersProvider,
    config
  );
  
  return {
    async initialize(): Promise<void> {
      // Mock is already initialized
    },
    
    getStatus() {
      return FhevmClientStatus.READY;
    },
    
    isReady(): boolean {
      return true;
    },
    
    getInstance(): FhevmInstance | undefined {
      return instance;
    },
    
    async publicDecrypt(handles: string[]): Promise<DecryptedValues> {
      return await publicDecrypt(instance, handles);
    },
    
    async userDecrypt(params: UserDecryptParams): Promise<DecryptedValue | DecryptedValues> {
      return await userDecrypt(instance, params);
    }
  };
}

