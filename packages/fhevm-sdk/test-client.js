/**
 * Quick test to verify createClient works
 */

import { createClient } from './dist/index.js';

console.log('Testing FHEVM SDK...\n');

// Test 1: Create client
console.log('✓ Creating client...');
const client = createClient({
  provider: 'http://localhost:8545',
  chainId: 31337,
  debug: true
});

console.log('✓ Client created');
console.log('  Status:', client.status);
console.log('  Config:', client.config);
console.log('');

// Test 2: Initialize
console.log('✓ Initializing...');
await client.initialize();

console.log('✓ Initialized');
console.log('  Status:', client.status);
console.log('  Is ready?', client.isReady());
console.log('');

// Test 3: Try to initialize again (should be ok)
console.log('✓ Initialize again (should skip)...');
await client.initialize();
console.log('✓ Still works');
console.log('');

console.log('🎉 All tests passed!');

