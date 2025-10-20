'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useEffect, useState } from 'react';
import { createClient, sepolia } from '@fhevm/sdk';
import type { FhevmClient } from '@fhevm/sdk';

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  
  const [fhevmClient, setFhevmClient] = useState<FhevmClient | null>(null);
  const [fhevmStatus, setFhevmStatus] = useState<string>('idle');

  // Initialize FHEVM client
  useEffect(() => {
    if (!isConnected) return;

    const client = createClient({
      provider: window.ethereum,
      chain: sepolia,
    });

    setFhevmClient(client);
    setFhevmStatus('initializing...');

    client.initialize()
      .then(() => {
        setFhevmStatus(client.isReady() ? 'ready' : 'error');
      })
      .catch((err) => {
        console.error('FHEVM init error:', err);
        setFhevmStatus('error');
      });
  }, [isConnected]);

  return (
    <main className="container">
      <div className="card">
        <h1>🔐 FHEVM Counter Demo</h1>
        
        {/* Wallet Connection */}
        <section className="section">
          <h2>1. Connect Wallet</h2>
          {!isConnected ? (
            <button 
              onClick={() => connect({ connector: connectors[0] })}
              className="btn-primary"
            >
              Connect MetaMask
            </button>
          ) : (
            <div>
              <p>✅ Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
              <button onClick={() => disconnect()} className="btn-secondary">
                Disconnect
              </button>
            </div>
          )}
        </section>

        {/* FHEVM Status */}
        {isConnected && (
          <section className="section">
            <h2>2. FHEVM Status</h2>
            <p>
              Status: <span className={fhevmStatus === 'ready' ? 'status-ready' : 'status-loading'}>
                {fhevmStatus}
              </span>
            </p>
          </section>
        )}

        {/* Counter Demo (placeholder) */}
        {fhevmClient?.isReady() && (
          <section className="section">
            <h2>3. Encrypted Counter</h2>
            <p className="placeholder">
              🚧 Contract interaction coming next...
            </p>
            <div className="button-group">
              <button className="btn-primary" disabled>
                Increment Counter
              </button>
              <button className="btn-secondary" disabled>
                User Decrypt
              </button>
              <button className="btn-secondary" disabled>
                Public Decrypt
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

