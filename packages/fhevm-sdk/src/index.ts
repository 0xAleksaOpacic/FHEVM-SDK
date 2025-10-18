export { createClient, FhevmClientStatus } from './clients/createClient';
export { FhevmError, ErrorCodes } from './errors';
export { sepolia, chains, getChainById, isSupportedChain, getSupportedChainIds } from './chains';
export { createMockInstance } from './test-utils';
export { createIndexedDBStorage, createInMemoryStorage } from './storage';

export type { FhevmClient, FhevmConfig, FhevmStatus } from './clients/createClient';
export type { Eip1193Provider, FhevmInstance } from './types';
export type { ErrorCode } from './errors';
export type { StorageAdapter, CachedPublicKey, CachedPublicParams } from './storage';
