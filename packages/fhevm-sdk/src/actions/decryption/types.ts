export type DecryptedValue = bigint | boolean | string;

export type DecryptedValues = Record<string, DecryptedValue>;

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
};

