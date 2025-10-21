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
    '@fhevm/mock-utils'
  ],
  
  // Keep these external (not bundled, resolved from node_modules)
  external: [
    '@zama-fhe/relayer-sdk',
    'idb'
  ]
});

