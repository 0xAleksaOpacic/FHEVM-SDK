import { expectTypeOf, test } from 'vitest';
import { createClient } from './createClient';
import type { FhevmConfig, FhevmStatus } from './createClient';
import type { FhevmInstance } from '../types';

test('createClient returns FhevmClient', () => {
  const config: FhevmConfig = {
    provider: 'http://localhost:8545',
    chainId: 31337,
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
    chainId: 31337,
  };
  const client = createClient(config);
  
  expectTypeOf(client.getStatus()).toEqualTypeOf<FhevmStatus>();
  expectTypeOf(client.initialize).returns.resolves.toBeVoid();
  expectTypeOf(client.getInstance()).toEqualTypeOf<FhevmInstance | undefined>();
  expectTypeOf(client.isReady()).toEqualTypeOf<boolean>();
});
