import { describe, it, expect, beforeEach } from 'vitest';
import { createClient } from './createClient';
import { FhevmClientStatus } from './types';
import { ClientErrorMessages } from '../errors';
import { sepolia } from '../chains';
import { createInMemoryStorage } from '../storage';
import type { FhevmConfig } from './types';

describe('createClient', () => {
  let config: FhevmConfig;

  beforeEach(() => {
    config = {
      provider: 'http://localhost:8545',
      chain: sepolia,
      storage: createInMemoryStorage(),
    };
  });

  it('should create client with valid config', () => {
    const client = createClient(config);
    
    expect(client).toBeDefined();
    expect(client.config).toEqual(config);
    expect(client.getStatus()).toBe(FhevmClientStatus.IDLE);
    expect(client.isReady()).toBe(false);
  });

  it('should throw if provider is missing', () => {
    const invalidConfig = { ...config, provider: '' };

    expect(() => createClient(invalidConfig as FhevmConfig)).toThrow(ClientErrorMessages.PROVIDER_REQUIRED);
  });

  it('should throw if chain is missing', () => {
    const invalidConfig = { provider: 'http://localhost:8545' };

    expect(() => createClient(invalidConfig as FhevmConfig)).toThrow(ClientErrorMessages.CHAIN_OR_CHAIN_ID_REQUIRED);
  });

  it('should transition through initialization states', async () => {
    const client = createClient(config);
    
    // Before initialization
    expect(client.getStatus()).toBe(FhevmClientStatus.IDLE);
    expect(client.isReady()).toBe(false);
    expect(client.getInstance()).toBeUndefined();
    
    // During initialization
    const initPromise = client.initialize();
    expect(client.getStatus()).toBe(FhevmClientStatus.LOADING);
    expect(client.isReady()).toBe(false);
    
    // After initialization
    await initPromise;
    expect(client.getStatus()).toBe(FhevmClientStatus.READY);
    expect(client.isReady()).toBe(true);
  });

  it('should handle multiple initialize calls', async () => {
    const client = createClient(config);
    
    await client.initialize();
    expect(client.getStatus()).toBe(FhevmClientStatus.READY);
    
    // Should not throw or change status
    await client.initialize();
    expect(client.getStatus()).toBe(FhevmClientStatus.READY);
  });

  it('should throw if initialize is called while loading', async () => {
    const client = createClient(config);
    
    const firstInit = client.initialize();
    
    await expect(client.initialize()).rejects.toThrow(ClientErrorMessages.ALREADY_INITIALIZING);
    
    await firstInit;
  });
});
