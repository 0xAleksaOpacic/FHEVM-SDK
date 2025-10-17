import { SepoliaConfig } from '@zama-fhe/relayer-sdk/web';
import type { FhevmChain } from '../../types';

/**
 * FHEVM Sepolia testnet configuration
 * 
 * @see https://docs.zama.ai/protocol/solidity-guides/smart-contract/configure/contract_addresses
 */
export const sepolia = {
  id: 11155111,
  name: 'Sepolia',
  testnet: true,
  config: SepoliaConfig,
} as const satisfies FhevmChain;

