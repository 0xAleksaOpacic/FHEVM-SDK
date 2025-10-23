'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected } from 'wagmi/connectors';
import { ReactNode } from 'react';
import { FhevmProvider } from '@fhevm/react-sdk';
import { NETWORK_MODE } from '@/config';
import { LOCALHOST_RPC_URL } from '@/config/localhost';
import { SEPOLIA_RPC_URL } from '@/config/sepolia';

// Wagmi config
const config = createConfig({
  chains: [sepolia],
  connectors: [injected()],
  transports: {
    [sepolia.id]: http(),
  },
});

// React Query client
const queryClient = new QueryClient();

// FHEVM config based on network mode
const fhevmRpcUrl = NETWORK_MODE === 'localhost' ? LOCALHOST_RPC_URL : SEPOLIA_RPC_URL;

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <FhevmProvider network={NETWORK_MODE} rpcUrl={fhevmRpcUrl}>
          {children}
        </FhevmProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

