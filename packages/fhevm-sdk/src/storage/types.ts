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
 * Storage adapter interface for caching FHEVM public data
 */
export type StorageAdapter = {
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
   * Clear all cached public data
   */
  clearCache(): Promise<void>;
};

