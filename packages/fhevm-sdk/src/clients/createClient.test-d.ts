import { expectTypeOf, test } from 'vitest';
import { createClient } from './createClient';
import type { FhevmConfig, FhevmStatus } from './createClient';
import type { FhevmInstance } from '../types';
import type { FhevmInstanceConfig } from '@zama-fhe/relayer-sdk/web';
import { sepolia } from '../chains';

test('createClient returns FhevmClient', () => {
  const config: FhevmConfig = {
    provider: 'http://localhost:8545',
    chain: sepolia,
  };

  const client = createClient(config);
  expectTypeOf(client).toHaveProperty('getStatus');
  expectTypeOf(client).toHaveProperty('initialize');
  expectTypeOf(client).toHaveProperty('getInstance');
  expectTypeOf(client).toHaveProperty('isReady');
});

test('FhevmClient method signatures', () => {
  const config: FhevmConfig = {
    provider: 'http://localhost:8545',
    chain: sepolia,
  };
  const client = createClient(config);

  expectTypeOf(client.getStatus()).toEqualTypeOf<FhevmStatus>();
  expectTypeOf(client.initialize).returns.resolves.toBeVoid();
  expectTypeOf(client.getInstance()).toEqualTypeOf<FhevmInstance | undefined>();
  expectTypeOf(client.isReady()).toEqualTypeOf<boolean>();
});

test('FhevmConfig accepts chain config', () => {
  const config: FhevmConfig = {
    provider: 'http://localhost:8545',
    chain: sepolia,
  };
  
  expectTypeOf(config.chain).toMatchTypeOf<FhevmInstanceConfig>();
});

