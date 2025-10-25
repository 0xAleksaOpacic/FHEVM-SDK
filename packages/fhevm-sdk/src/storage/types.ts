/**
 * Public params for a specific bit size
 */
export type CachedPublicParams = {
  publicParamsId: string;
  publicParams: Uint8Array;
};

/**
 * Cached public key data
 */
export type CachedPublicKey = {
  publicKeyId: string;
  publicKey: Uint8Array;
  timestamp: number;
};

/**
 * Cached signature data for user decryption
 */
export type CachedSignature = {
  signature: string;
  publicKey: string;
  privateKey: string;
  userAddress: string;
  contractAddress: string;
  chainId: number;
  startTimestamp: number;
  durationDays: number;
  expiresAt: number;
  cachedAt: number;
};

/**
 * Storage adapter interface for signature caching
 * Used by sessionStorage (signature-only) and full storage adapters
 */
export type SignatureCacheStorage = {
  /**
   * Get cached signature by key
   */
  getSignature(key: string): Promise<CachedSignature | null>;
  
  /**
   * Cache signature by key
   */
  setSignature(key: string, signature: CachedSignature): Promise<void>;
  
  /**
   * Clear only cached signatures
   */
  clearSignatures(): Promise<void>;
};

/**
 * Full storage adapter interface for caching FHEVM data
 * Extends SignatureCacheStorage and adds public key/params storage
 */
export type StorageAdapter = SignatureCacheStorage & {
  /**
   * Get cached public key for an ACL address
   */
  getPublicKey(aclAddress: string): Promise<CachedPublicKey | null>;
  
  /**
   * Cache public key for an ACL address
   */
  setPublicKey(
    aclAddress: string,
    publicKeyId: string,
    publicKey: Uint8Array
  ): Promise<void>;

  /**
   * Get cached public params for an ACL address
   */
  getPublicParams(aclAddress: string): Promise<Record<number, CachedPublicParams> | null>;
  
  /**
   * Cache public params for an ACL address
   */
  setPublicParams(
    aclAddress: string,
    publicParams: Record<number, CachedPublicParams>
  ): Promise<void>;
  
  /**
   * Clear only cached public keys
   */
  clearPublicKeys(): Promise<void>;
  
  /**
   * Clear only cached public params
   */
  clearPublicParams(): Promise<void>;
  
  /**
   * Clear all cached data (keys + params + signatures)
   */
  clearAll(): Promise<void>;
};

