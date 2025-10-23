import { describe, it, expect } from 'vitest';
import { createClient } from './createClient';
import { FhevmClientStatus } from './types';
import { ClientErrorMessages } from '../errors';
import { sepolia } from '../chains';
import type { FhevmConfig } from './types';

/**
 * Unit tests for createClient
 * 
 * Note: These tests focus on testing our validation logic and client structure.
 */
describe('createClient', () => {
  it('should create client with valid config', () => {
    const config: FhevmConfig = {
      provider: 'http://localhost:8545',
      chain: sepolia,
    };
    
    const client = createClient(config);
    
    expect(client).toBeDefined();
    expect(client.getStatus()).toBe(FhevmClientStatus.IDLE);
    expect(client.isReady()).toBe(false);
    expect(client.getInstance()).toBeUndefined();
  });

  it('should throw if provider is missing', () => {
    const invalidConfig = { 
      provider: '',
      chain: sepolia,
    };

    expect(() => createClient(invalidConfig as FhevmConfig)).toThrow(ClientErrorMessages.PROVIDER_REQUIRED);
  });

  it('should throw if chain is missing', () => {
    const invalidConfig = { 
      provider: 'http://localhost:8545',
    };

    expect(() => createClient(invalidConfig as any)).toThrow(ClientErrorMessages.CHAIN_OR_CHAIN_ID_REQUIRED);
  });
});
