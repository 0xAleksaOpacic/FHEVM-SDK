import { COUNTER_ABI } from './contracts';

// Default addresses for fhevm-hardhat-template
// These work out of the box with our Hardhat setup
// Override via environment variables if using different network (Anvil, manual deployment, etc.)
const DEFAULT_LOCALHOST_CONFIG = {
  chainId: 31337,
  gatewayChainId: 55815,
  aclContractAddress: '0x50157CFfD6bBFA2DECe204a89ec419c23ef5755D',
  kmsContractAddress: '0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC',
  inputVerifierContractAddress: '0x901F8942346f7AB3a01F6D7613119Bca447Bb030',
  verifyingContractAddressDecryption: '0xa02Cda4Ca3a71D7C46997716F4283aa851C28812',
  verifyingContractAddressInputVerification: '0xCD3ab3bd6bcc0c0bf3E27912a92043e817B1cf69',
  rpcUrl: 'http://localhost:8545',
  counterAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
};

// FHEVM configuration with optional environment variable overrides
export const LOCALHOST_FHEVM_CONFIG = {
  chainId: Number(process.env.NEXT_PUBLIC_LOCALHOST_CHAIN_ID) || DEFAULT_LOCALHOST_CONFIG.chainId,
  gatewayChainId: Number(process.env.NEXT_PUBLIC_LOCALHOST_GATEWAY_CHAIN_ID) || DEFAULT_LOCALHOST_CONFIG.gatewayChainId,
  aclContractAddress: process.env.NEXT_PUBLIC_LOCALHOST_ACL_ADDRESS || DEFAULT_LOCALHOST_CONFIG.aclContractAddress,
  kmsContractAddress: process.env.NEXT_PUBLIC_LOCALHOST_KMS_ADDRESS || DEFAULT_LOCALHOST_CONFIG.kmsContractAddress,
  inputVerifierContractAddress: process.env.NEXT_PUBLIC_LOCALHOST_INPUT_VERIFIER_ADDRESS || DEFAULT_LOCALHOST_CONFIG.inputVerifierContractAddress,
  verifyingContractAddressDecryption: process.env.NEXT_PUBLIC_LOCALHOST_DECRYPTION_ORACLE_ADDRESS || DEFAULT_LOCALHOST_CONFIG.verifyingContractAddressDecryption,
  verifyingContractAddressInputVerification: process.env.NEXT_PUBLIC_LOCALHOST_COPROCESSOR_ADDRESS || DEFAULT_LOCALHOST_CONFIG.verifyingContractAddressInputVerification,
} as const;

export const LOCALHOST_RPC_URL = 
  process.env.NEXT_PUBLIC_LOCALHOST_RPC_URL || DEFAULT_LOCALHOST_CONFIG.rpcUrl;

export const LOCALHOST_COUNTER_ADDRESS = 
  process.env.NEXT_PUBLIC_LOCALHOST_COUNTER_ADDRESS || DEFAULT_LOCALHOST_CONFIG.counterAddress;

// Full contract config for localhost
export const LOCALHOST_COUNTER = {
  address: LOCALHOST_COUNTER_ADDRESS,
  abi: COUNTER_ABI,
} as const;