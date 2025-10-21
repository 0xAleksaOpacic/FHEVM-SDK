'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useEffect, useState } from 'react';
import { createClient, sepolia } from '@fhevm/sdk';
import type { FhevmClient } from '@fhevm/sdk';
import Image from 'next/image';
import logo from './assets/logo.svg';

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
      <div className="header">
        <Image src={logo} alt="Zama Logo" className="logo" priority />
      </div>
      
      <div className="card">
        <h1 style={{ textAlign: 'center' }}>FHEVM SDK Next.js Demo</h1>
        <p className="subtitle">
          Build confidential applications with Fully Homomorphic Encryption
        </p>
        
        {/* Wallet Connection */}
        <section className="section">
          <h2>1. Connect Wallet</h2>
          {!isConnected ? (
            <button 
              onClick={() => connect({ connector: connectors[0] })}
              className="btn-primary"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="wallet-info">
              <div style={{ flex: 1 }}>
                <p style={{ marginBottom: '0.25rem', fontSize: '0.875rem', opacity: 0.7 }}>Connected Address</p>
                <p className="wallet-address">{address?.slice(0, 8)}...{address?.slice(-6)}</p>
              </div>
              <button onClick={() => disconnect()} className="btn-secondary">
                Disconnect
              </button>
            </div>
          )}
        </section>

        {/* FHEVM Status */}
        {isConnected && (
          <section className="section">
            <h2>2. FHEVM Initialization</h2>
            <div className="status-badge">
              <span style={{ fontSize: '1.25rem' }}>
                {fhevmStatus === 'ready' ? '✓' : fhevmStatus === 'error' ? '✗' : '⏳'}
              </span>
              <span className={fhevmStatus === 'ready' ? 'status-ready' : 'status-loading'}>
                {fhevmStatus === 'ready' ? 'Ready' : fhevmStatus === 'error' ? 'Error' : 'Initializing...'}
              </span>
            </div>
          </section>
        )}

        {/* Counter Demo (placeholder) */}
        {isConnected && fhevmClient?.isReady() && (
          <section className="section">
            <h2>3. Encrypted Counter Demo</h2>
            <p className="placeholder">
              🚧 Contract interactions coming soon...
            </p>
            <p style={{ marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              This demo will show how to interact with encrypted data on the blockchain using FHE.
            </p>
            <div className="button-group">
              <button className="btn-primary" disabled>
                Increment Counter
              </button>
              <button className="btn-secondary" disabled>
                Decrypt (User)
              </button>
              <button className="btn-secondary" disabled>
                Decrypt (Public)
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

