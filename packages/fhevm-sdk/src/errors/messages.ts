export const ClientErrorMessages = {
  ALREADY_INITIALIZING: 'Already initializing',
  PROVIDER_REQUIRED: 'Provider is required',
  CHAIN_OR_CHAIN_ID_REQUIRED: 'Either chain or chainId must be provided',
  CHAIN_ID_POSITIVE: 'ChainId must be positive',
  UNSUPPORTED_CHAIN: (chainId: number, supportedChains: string) => 
    `Chain ${chainId} is not supported. Supported chains: ${supportedChains}. Please provide a custom chainConfig.`,
  INIT_FAILED: 'Failed to initialize FHEVM',
} as const;

