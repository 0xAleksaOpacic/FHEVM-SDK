'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, sepolia, localhost } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected } from 'wagmi/connectors';
import { ReactNode } from 'react';
import { FhevmProvider } from '@fhevm/react-sdk';
import { NETWORK_MODE } from '@/config';
import { LOCALHOST_RPC_URL } from '@/config/localhost';
import { SEPOLIA_RPC_URL } from '@/config/sepolia';

// Wagmi config - include multiple chains so we can detect which network user is on
const config = createConfig({
  chains: [sepolia, localhost, mainnet],
  connectors: [injected()],
  transports: {
    [sepolia.id]: http(),
    [localhost.id]: http(),
    [mainnet.id]: http(),
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

