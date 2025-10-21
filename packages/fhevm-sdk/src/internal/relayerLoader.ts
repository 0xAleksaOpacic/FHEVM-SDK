import { FhevmError, ErrorCodes, ClientErrorMessages } from '../errors';

type RelayerSDK = typeof import('@zama-fhe/relayer-sdk/web');

let _sdk: RelayerSDK | null = null;
let _loadingPromise: Promise<RelayerSDK> | null = null;

/**
 * Lazy-loads the FHEVM relayer SDK.
 * Only works in browser environments.
 * Caches the SDK after first load.
 * 
 * @returns Promise that resolves to the loaded SDK
 * @throws {FhevmError} If called in a non-browser environment
 */
export async function loadRelayerSDK(): Promise<RelayerSDK> {
  // Browser-only check
  if (typeof globalThis === 'undefined' || !('window' in globalThis)) {
    throw new FhevmError(
      ErrorCodes.BROWSER_ONLY,
      ClientErrorMessages.BROWSER_ONLY
    );
  }
  
  // Return cached SDK
  if (_sdk) {
    return _sdk;
  }
  
  // Return ongoing load promise to avoid duplicate loads
  if (_loadingPromise) {
    return _loadingPromise;
  }
  
  // Polyfill 'global' for browser environments
  // The relayer SDK expects 'global' (Node.js convention) but browsers only have 'window'
  if (typeof (globalThis as any).global === 'undefined') {
    (globalThis as any).global = globalThis;
  }
  
  // Start new load
  _loadingPromise = import('@zama-fhe/relayer-sdk/web').then(async sdk => {
    // Initialize WASM before using the SDK
    if ('initSDK' in sdk && typeof sdk.initSDK === 'function') {
      await sdk.initSDK();
    }
    
    _sdk = sdk;
    _loadingPromise = null;
    return sdk;
  });
  
  return _loadingPromise;
}

/**
 * Gets the SDK synchronously (must be loaded first).
 * 
 * @returns The loaded SDK
 * @throws {FhevmError} If SDK is not loaded yet
 */
export function getRelayerSDK(): RelayerSDK {
  if (!_sdk) {
    throw new FhevmError(
      ErrorCodes.NOT_INITIALIZED,
      'Relayer SDK not loaded. Call initialize() first.'
    );
  }
  return _sdk;
}

/**
 * Checks if the SDK is loaded.
 * 
 * @returns True if SDK is loaded, false otherwise
 */
export function isRelayerSDKLoaded(): boolean {
  return _sdk !== null;
}

