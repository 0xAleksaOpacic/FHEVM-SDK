import type { FhevmInstanceConfig } from '@zama-fhe/relayer-sdk/web';
import { getRelayerSDK, isRelayerSDKLoaded } from '../clients/utils/relayerLoader';

/**
 * Localhost chain configuration for Hardhat FHEVM
 * Uses deterministic contract addresses from fhevm-hardhat-template
 */
export const localhost: FhevmInstanceConfig = {
  chainId: 31337,
  gatewayChainId: 55815,
  aclContractAddress: '0x50157CFfD6bBFA2DECe204a89ec419c23ef5755D',
  kmsContractAddress: '0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC',
  inputVerifierContractAddress: '0x901F8942346f7AB3a01F6D7613119Bca447Bb030',
  verifyingContractAddressDecryption: '0xa02Cda4Ca3a71D7C46997716F4283aa851C28812',
  verifyingContractAddressInputVerification: '0xCD3ab3bd6bcc0c0bf3E27912a92043e817B1cf69',
};

/**
 * Sepolia chain configuration.
 * Lazy-loads from the relayer SDK when accessed.
 */
let _sepoliaConfig: FhevmInstanceConfig | null = null;

export const sepolia: FhevmInstanceConfig = new Proxy({} as FhevmInstanceConfig, {
  get(target, prop) {
    // Load config if available and not cached
    if (!_sepoliaConfig && isRelayerSDKLoaded()) {
      const sdk = getRelayerSDK();
      _sepoliaConfig = sdk.SepoliaConfig;
    }
    
    if (_sepoliaConfig) {
      return (_sepoliaConfig as any)[prop];
    }
    
    // SDK not loaded yet - throw error
    throw new Error(
      `[FHEVM SDK] Sepolia config accessed before SDK is loaded. ` +
      `Make sure to call client.initialize() before using the config.`
    );
  },
  
  // Support for spread operator: { ...sepolia }
  ownKeys(target) {
    if (!_sepoliaConfig && isRelayerSDKLoaded()) {
      const sdk = getRelayerSDK();
      _sepoliaConfig = sdk.SepoliaConfig;
    }
    
    if (_sepoliaConfig) {
      return Reflect.ownKeys(_sepoliaConfig);
    }
    
    return [];
  },
  
  getOwnPropertyDescriptor(target, prop) {
    if (!_sepoliaConfig && isRelayerSDKLoaded()) {
      const sdk = getRelayerSDK();
      _sepoliaConfig = sdk.SepoliaConfig;
    }
    
    if (_sepoliaConfig) {
      return Object.getOwnPropertyDescriptor(_sepoliaConfig, prop);
    }
    
    return undefined;
  }
});

export { chains, getChainById, isSupportedChain, getSupportedChainIds } from './utils';

