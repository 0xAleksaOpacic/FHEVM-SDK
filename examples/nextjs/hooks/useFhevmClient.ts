'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { initializeFhevmClient } from '@/lib/fhevm/client';
import { FhevmClientStatus, type FhevmStatus } from '@fhevm/sdk';
import { NETWORK_MODE } from '@/config';

/**
 * React hook for managing FHEVM client lifecycle
 * Automatically initializes when wallet is connected
 * Network mode is determined by NEXT_PUBLIC_NETWORK_MODE env var
 */
export function useFhevmClient() {
  const { isConnected } = useAccount();
  const [client, setClient] = useState<any>(null);
  const [status, setStatus] = useState<FhevmStatus>(FhevmClientStatus.IDLE);

  useEffect(() => {
    // Reset when wallet disconnects
    if (!isConnected) {
      setClient(null);
      setStatus(FhevmClientStatus.IDLE);
      return;
    }

    // Initialize FHEVM client with configured network mode
    async function init() {
      try {
        setStatus(FhevmClientStatus.LOADING);
        const fhevmClient = await initializeFhevmClient(NETWORK_MODE);
        setClient(fhevmClient);
        setStatus(FhevmClientStatus.READY);
      } catch (err) {
        console.error('FHEVM init error:', err);
        setStatus(FhevmClientStatus.ERROR);
      }
    }

    init();
  }, [isConnected]);

  return {
    client,
    status,
    isReady: status === FhevmClientStatus.READY && client?.isReady(),
    mode: NETWORK_MODE, // Expose current network mode
  };
}

