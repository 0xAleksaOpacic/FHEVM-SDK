export type DecryptedValue = bigint | boolean | string;

export type DecryptedValues = Record<string, DecryptedValue>;

export enum FhevmCacheType {
  None = 'none',
  Session = 'session',
  Persistent = 'persistent',
}

export interface FhevmSigner {
  account: {
    address: string;
  };
  signTypedData(args: {
    account?: { address: string };
    domain: any;
    types: any;
    primaryType: string;
    message: any;
  }): Promise<string>;
}

export type UserDecryptParams = {
  handle: string;
  contractAddress: string;
  signer: FhevmSigner;
  duration?: number;
  cacheType?: FhevmCacheType;
} | {
  handles: string[];
  contractAddress: string;
  signer: FhevmSigner;
  duration?: number;
  cacheType?: FhevmCacheType;
};

