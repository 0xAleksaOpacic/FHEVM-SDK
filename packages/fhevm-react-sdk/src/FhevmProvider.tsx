import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { FhevmClientStatus } from '@fhevm/sdk';
import type { FhevmClient, FhevmStatus, FhevmInstanceConfig, Eip1193Provider } from '@fhevm/sdk';
import { FhevmContext, type NetworkMode } from './FhevmContext';

export interface FhevmProviderProps {
  /**
   * Network mode
   */
  network: NetworkMode;
  
  /**
   * RPC URL for the network
   */
  rpcUrl: string;
  
  /**
   * Optional chain configuration overrides
   */
  chainConfig?: Partial<FhevmInstanceConfig>;
  
  /**
   * Enable debug logging
   */
  debug?: boolean;
  
  /**
   * Callback when client status changes
   */
  onStatusChange?: (status: FhevmStatus) => void;
  
  /**
   * Callback when errors occur
   */
  onError?: (error: Error) => void;
  
  children: ReactNode;
}

/**
 * Provider component for FHEVM client
 * Manages client lifecycle and provides context to child components
 */
export function FhevmProvider({
  network,
  rpcUrl,
  chainConfig,
  debug,
  onStatusChange,
  onError,
  children,
}: FhevmProviderProps) {
  const [client, setClient] = useState<FhevmClient | null>(null);
  const [status, setStatus] = useState<FhevmStatus>(FhevmClientStatus.IDLE);

  // Update status callback when status changes
  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  // Initialize client
  useEffect(() => {
    let cancelled = false;

    async function initializeClient() {
      try {
        // Clear old client when deps change
        setClient(null);
        setStatus(FhevmClientStatus.LOADING);

        // Get default config from SDK
        const { localhost, sepolia } = await import('@fhevm/sdk');
        const defaultConfig = network === 'localhost' ? localhost : sepolia;
        
        // Merge with user overrides
        const finalConfig: FhevmInstanceConfig = {
          ...defaultConfig,
          ...chainConfig,
        };

        let fhevmClient: any; // Mock client returns different type than standard client

        if (network === 'localhost') {
          // Create mock client for localhost
          const { JsonRpcProvider } = await import('ethers');
          const { createMockClient } = await import('@fhevm/sdk/mock');
          
          const provider = new JsonRpcProvider(rpcUrl);
          fhevmClient = await createMockClient(provider, finalConfig as any);
        } else {
          // Create real client for sepolia
          const { createClient } = await import('@fhevm/sdk');
          
          fhevmClient = createClient({
            provider: (window as any).ethereum as Eip1193Provider,
            chain: finalConfig,
            debug,
          });
          
          await fhevmClient.initialize();
        }

        if (!cancelled) {
          setClient(fhevmClient);
          setStatus(FhevmClientStatus.READY);
        }
      } catch (error) {
        if (!cancelled) {
          const err = error instanceof Error ? error : new Error('Failed to initialize FHEVM client');
          setStatus(FhevmClientStatus.ERROR);
          onError?.(err);
        }
      }
    }

    initializeClient();

    return () => {
      cancelled = true;
      // Clear client on unmount
      setClient(null);
      setStatus(FhevmClientStatus.IDLE);
    };
  }, [network, rpcUrl, chainConfig, debug, onError]);

  const contextValue = {
    client,
    status,
    isReady: status === FhevmClientStatus.READY && client !== null,
    network,
  };

  return (
    <FhevmContext.Provider value={contextValue}>
      {children}
    </FhevmContext.Provider>
  );
}

