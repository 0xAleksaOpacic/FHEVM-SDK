import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  
  // Bundle these dependencies inside the package
  noExternal: [
    '@zama-fhe/relayer-sdk',
    '@fhevm/mock-utils'
  ],
  
  // Keep these external (optional dependencies)
  external: [
    'idb'
  ]
});

