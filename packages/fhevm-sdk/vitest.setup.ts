import { vi } from 'vitest';


vi.mock('@zama-fhe/relayer-sdk/web', () => ({
  SepoliaConfig: {
    aclContractAddress: '0x687820221192C5B662b25367F70076A37bc79b6c',
    kmsContractAddress: '0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC',
    inputVerifierContractAddress: '0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4',
    chainId: 11155111,
    gatewayChainId: 55815,
    verifyingContractAddressDecryption: '0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1',
    verifyingContractAddressInputVerification: '0x7048C39f048125eDa9d678AEbaDfB22F7900a29F',
    relayerUrl: 'https://relayer.testnet.zama.cloud',
  },
}));

