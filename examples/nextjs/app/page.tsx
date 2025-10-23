'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useState } from 'react';
import Image from 'next/image';
import logo from './assets/logo.svg';
import { FhevmClientStatus } from '@fhevm/sdk';
import { useFhevmClient } from '@/hooks/useFhevmClient';
import {
  incrementCounter,
  decryptUserCounter,
  decryptPublicCounter,
} from '@/lib/contracts/counter';

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { client, status, isReady, mode } = useFhevmClient();

  const [userValue, setUserValue] = useState<string>('-');
  const [publicValue, setPublicValue] = useState<string>('-');
  const [loading, setLoading] = useState<string>('');
  const [txStatus, setTxStatus] = useState<string>('');

  const handleIncrement = async (type: 'user' | 'public') => {
    if (!client || !address) return;
    setLoading(`increment-${type}`);
    setTxStatus('Encrypting value...');

    try {
      setTxStatus('Sending transaction...');
      await incrementCounter(client, address, type, mode);

      setTxStatus(`✓ ${type === 'user' ? 'User' : 'Public'} counter incremented successfully!`);
      setTimeout(() => setTxStatus(''), 3000);
    } catch (err) {
      console.error('Increment error:', err);
      setTxStatus('✗ Transaction failed');
      setTimeout(() => setTxStatus(''), 3000);
    } finally {
      setLoading('');
    }
  };

  const handleDecryptUser = async () => {
    if (!client || !address) return;
    setLoading('decrypt-user');

    try {
      const value = await decryptUserCounter(client, address, mode);
      setUserValue(value);
    } catch (err) {
      console.error('Decrypt error:', err);
      setUserValue('Error');
    } finally {
      setLoading('');
    }
  };

  const handleDecryptPublic = async () => {
    if (!client) return;
    setLoading('decrypt-public');

    try {
      const value = await decryptPublicCounter(client, mode);
      setPublicValue(value);
    } catch (err) {
      console.error('Decrypt error:', err);
      setPublicValue('Error');
    } finally {
      setLoading('');
    }
  };

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
        <p style={{ textAlign: 'center', fontSize: '0.875rem', opacity: 0.7, marginTop: '0.5rem' }}>
          Network: <strong>{mode === 'sepolia' ? 'Sepolia Testnet' : 'Localhost'}</strong>
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
                {status === FhevmClientStatus.READY ? '✓' : status === FhevmClientStatus.ERROR ? '✗' : '⏳'}
              </span>
              <span className={status === FhevmClientStatus.READY ? 'status-ready' : 'status-loading'}>
                {status === FhevmClientStatus.READY ? 'Ready' : status === FhevmClientStatus.ERROR ? 'Error' : 'Loading...'}
              </span>
            </div>
          </section>
        )}

        {/* Counter Demo */}
        {isConnected && isReady && (
          <section className="section">
            <h2>3. Encrypted Counter Demo</h2>
            <p style={{ marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              Interact with encrypted data on the blockchain using FHE.
            </p>

            {/* Transaction Status */}
            {txStatus && (
              <div style={{ 
                padding: '1rem', 
                marginBottom: '1.5rem', 
                backgroundColor: txStatus.startsWith('✓') ? 'rgba(76, 175, 80, 0.1)' : txStatus.startsWith('✗') ? 'rgba(244, 67, 54, 0.1)' : 'rgba(255, 193, 7, 0.1)',
                border: `2px solid ${txStatus.startsWith('✓') ? '#4CAF50' : txStatus.startsWith('✗') ? '#f44336' : '#FFC107'}`,
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: 500
              }}>
                {txStatus}
              </div>
            )}

            {/* User Counter (Private Decryption) */}
            <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '8px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>👤 User Counter (Private)</h3>
              <p style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '1rem' }}>
                Only you can decrypt this value using <code style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '4px' }}>userDecrypt()</code>
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
                <button 
                  className="btn-primary" 
                  onClick={() => handleIncrement('user')}
                  disabled={loading === 'increment-user'}
                >
                  {loading === 'increment-user' ? 'Incrementing...' : 'Increment User Counter'}
                </button>
                <button 
                  className="btn-secondary" 
                  onClick={handleDecryptUser}
                  disabled={loading === 'decrypt-user'}
                >
                  {loading === 'decrypt-user' ? 'Decrypting...' : 'Decrypt My Value'}
                </button>
              </div>
              <div style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '6px' }}>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>
                  Decrypted Value: <strong style={{ fontSize: '1.25rem' }}>{userValue}</strong>
                </p>
              </div>
            </div>

            {/* Public Counter (Public Decryption) */}
            <div style={{ padding: '1.5rem', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '8px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>🌍 Public Counter</h3>
              <p style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '1rem' }}>
                Anyone can decrypt this value using <code style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '4px' }}>publicDecrypt()</code>
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
                <button 
                  className="btn-primary" 
                  onClick={() => handleIncrement('public')}
                  disabled={loading === 'increment-public'}
                >
                  {loading === 'increment-public' ? 'Incrementing...' : 'Increment Public Counter'}
                </button>
                <button 
                  className="btn-secondary" 
                  onClick={handleDecryptPublic}
                  disabled={loading === 'decrypt-public'}
                >
                  {loading === 'decrypt-public' ? 'Decrypting...' : 'Decrypt Public Value'}
                </button>
              </div>
              <div style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '6px' }}>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>
                  Decrypted Value: <strong style={{ fontSize: '1.25rem' }}>{publicValue}</strong>
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

