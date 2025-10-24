import { inject } from 'vue';
import { FHEVM_INJECTION_KEY } from '../plugin';

/**
 * Composable to access FHEVM client from the plugin context
 * 
 * @returns FHEVM context containing client, status, isReady, and network
 * @throws Error if used outside of a Vue app with FHEVM plugin installed
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useFhevm } from '@fhevm/vue-sdk';
 * 
 * const { client, isReady, status, network } = useFhevm();
 * </script>
 * ```
 */
export function useFhevm() {
  const context = inject(FHEVM_INJECTION_KEY);
  
  if (!context) {
    throw new Error(
      'useFhevm must be used within a Vue app that has the FHEVM plugin installed. ' +
      'Make sure you called app.use(createFhevmPlugin({ ... })) in your main.ts'
    );
  }
  
  return context;
}

