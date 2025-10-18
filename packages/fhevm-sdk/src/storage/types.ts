/**
 * Cached public data (keys and params)
 */
export type CachedPublicData = {
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
  getPublicKey(aclAddress: string): Promise<CachedPublicData | null>;
  
  /**
   * Cache public key for an ACL address
   */
  setPublicKey(
    aclAddress: string,
    publicKeyId: string,
    publicKey: Uint8Array
  ): Promise<void>;
  
  /**
   * Clear all cached public data
   */
  clearCache(): Promise<void>;
};

