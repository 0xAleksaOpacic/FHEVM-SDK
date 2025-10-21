import type { FhevmInstanceConfig } from '@zama-fhe/relayer-sdk/web';
import { getRelayerSDK, isRelayerSDKLoaded } from '../internal/relayerLoader';

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

