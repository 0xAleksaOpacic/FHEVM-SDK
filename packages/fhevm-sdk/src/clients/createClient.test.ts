import { describe, it, expect, beforeEach } from 'vitest';
import { createClient, FhevmClientStatus } from './createClient';
import { ClientErrorMessages } from '../errors';
import type { FhevmConfig } from './createClient';

describe('createClient', () => {
  let config: FhevmConfig;

  beforeEach(() => {
    config = {
      provider: 'http://localhost:8545',
      chainId: 31337,
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

  it('should throw if chainId is invalid', () => {
    const invalidConfig = { ...config, chainId: undefined as any };
    
    expect(() => createClient(invalidConfig)).toThrow(ClientErrorMessages.INVALID_CHAIN_ID);
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
