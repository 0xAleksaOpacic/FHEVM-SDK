export { createClient, FhevmClientStatus } from './clients/createClient';
export { FhevmError, ErrorCodes } from './errors';
export { sepolia, chains, getChainById, isSupportedChain, getSupportedChainIds } from './chains';
export { createMockInstance } from './test-utils';

export type { FhevmClient, FhevmConfig, FhevmStatus } from './clients/createClient';
export type { Eip1193Provider, FhevmInstance, FhevmChain } from './types';
export type { ErrorCode } from './errors';
