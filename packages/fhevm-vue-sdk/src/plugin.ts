import { ref, computed } from 'vue';
import type { Ref, ComputedRef, App, InjectionKey, Plugin } from 'vue';
import { FhevmClientStatus } from '@fhevm/sdk';
import type { FhevmClient, FhevmStatus, FhevmInstanceConfig, Eip1193Provider } from '@fhevm/sdk';

export type NetworkMode = 'localhost' | 'sepolia';

export interface FhevmPluginOptions {
  network: NetworkMode;
  rpcUrl: string;
  chainConfig?: Partial<FhevmInstanceConfig>;
  debug?: boolean;
  onStatusChange?: (status: FhevmStatus) => void;
  onError?: (error: Error) => void;
}

export interface FhevmContext {
  client: Ref<FhevmClient | null>;
  status: Ref<FhevmStatus>;
  isReady: ComputedRef<boolean>;
  network: NetworkMode;
}

export const FHEVM_INJECTION_KEY: InjectionKey<FhevmContext> = Symbol('fhevm');

/**
 * Creates a Vue plugin for FHEVM client management
 * 
 * @example
 * ```typescript
 * import { createFhevmPlugin } from '@fhevm/vue-sdk';
 * 
 * app.use(createFhevmPlugin({
 *   network: 'localhost',
 *   rpcUrl: 'http://localhost:8545'
 * }));
 * ```
 */
export function createFhevmPlugin(options: FhevmPluginOptions): Plugin {
  return {
    install(app: App) {
      const { network, rpcUrl, chainConfig, debug, onStatusChange, onError } = options;

      // Reactive state
      const client = ref<FhevmClient | null>(null);
      const status = ref<FhevmStatus>(FhevmClientStatus.IDLE);
      const isReady = computed(() => 
        status.value === FhevmClientStatus.READY && client.value !== null
      );

      // Initialize client
      async function initializeClient() {
        try {
          status.value = FhevmClientStatus.LOADING;
          onStatusChange?.(status.value);

          let fhevmClient: any;

          if (network === 'localhost') {
            // Create mock client for localhost
            const { JsonRpcProvider } = await import('ethers');
            const { createMockClient } = await import('@fhevm/sdk/mock');
            const { localhost } = await import('@fhevm/sdk');
            
            const finalConfig: FhevmInstanceConfig = {
              ...localhost,
              ...chainConfig,
            };
            
            const provider = new JsonRpcProvider(rpcUrl);
            fhevmClient = await createMockClient(provider, finalConfig as any);
          } else {
            // Create real client for sepolia
            const { createClient, loadRelayerSDK } = await import('@fhevm/sdk');
            
            // Load relayer SDK first to enable access to sepolia config
            await loadRelayerSDK();
            
            // Now we can safely access sepolia config
            const { sepolia } = await import('@fhevm/sdk');
            const finalConfig: FhevmInstanceConfig = {
              ...sepolia,
              ...chainConfig,
            };
            
            // SepoliaConfig already has network configured, no need to override
            fhevmClient = createClient({
              chain: finalConfig,
              debug,
            });
            
            await fhevmClient.initialize();
          }

          client.value = fhevmClient;
          status.value = FhevmClientStatus.READY;
          onStatusChange?.(status.value);
        } catch (error) {
          const err = error instanceof Error ? error : new Error('Failed to initialize FHEVM client');
          console.error('[FHEVM Plugin] Initialization failed:', err);
          console.error('[FHEVM Plugin] Error stack:', err.stack);
          console.error('[FHEVM Plugin] Error details:', {
            message: err.message,
            name: err.name,
            cause: (err as any).cause,
          });
          status.value = FhevmClientStatus.ERROR;
          onStatusChange?.(status.value);
          onError?.(err);
        }
      }

      // Start initialization
      initializeClient();

      // Provide context to all components
      app.provide(FHEVM_INJECTION_KEY, {
        client,
        status,
        isReady,
        network,
      });
    },
  };
}

