'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import logo from './assets/logo.svg';

// Localhost FHEVM configuration (from fhevm_relayer_metadata)
const localhostConfig = {
  chainId: 31337,
  gatewayChainId: 55815,
  aclContractAddress: '0x50157CFfD6bBFA2DECe204a89ec419c23ef5755D', // ACLAddress
  kmsContractAddress: '0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC', // KMSVerifierAddress
  inputVerifierContractAddress: '0x901F8942346f7AB3a01F6D7613119Bca447Bb030', // InputVerifierAddress
  verifyingContractAddressDecryption: '0xa02Cda4Ca3a71D7C46997716F4283aa851C28812', // DecryptionOracleAddress
  verifyingContractAddressInputVerification: '0xCD3ab3bd6bcc0c0bf3E27912a92043e817B1cf69', // CoprocessorAddress (gateway InputVerification contract)
};

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

// Minimal ABI for our counter contract
const CONTRACT_ABI = [
  'function increment(bytes32 inputHandle, bytes inputProof) external',
  'function incrementPublic(bytes32 inputHandle, bytes inputProof) external',
  'function getCount() external view returns (uint256)',
  'function getPublicCount() external view returns (uint256)',
];

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  
  const [fhevmClient, setFhevmClient] = useState<any>(null);
  const [fhevmStatus, setFhevmStatus] = useState<string>('idle');
  const [userValue, setUserValue] = useState<string>('-');
  const [publicValue, setPublicValue] = useState<string>('-');
  const [loading, setLoading] = useState<string>('');
  const [txStatus, setTxStatus] = useState<string>('');

  // Initialize FHEVM mock client
  useEffect(() => {
    if (!isConnected) return;

    async function initMockClient() {
      try {
        setFhevmStatus('initializing...');

        // Dynamically import to avoid SSR issues
        const { JsonRpcProvider } = await import('ethers');
        const { createMockClient } = await import('@fhevm/sdk/mock');

        // Create ethers provider
        const provider = new JsonRpcProvider('http://localhost:8545');

        // Create mock client
        const client = await createMockClient(provider, localhostConfig);

        setFhevmClient(client);
        setFhevmStatus('ready');
      } catch (err) {
        console.error('FHEVM init error:', err);
        setFhevmStatus('error');
      }
    }

    initMockClient();
  }, [isConnected]);

  const handleIncrementUser = async () => {
    if (!fhevmClient || !address) return;
    setLoading('increment-user');
    setTxStatus('Encrypting value...');
    
    try {
      const { Contract, BrowserProvider } = await import('ethers');
      const instance = fhevmClient.getInstance();
      
      // Create encrypted input
      const input = instance.createEncryptedInput(CONTRACT_ADDRESS, address);
      input.add32(1); // Increment by 1
      const encryptedData = await input.encrypt();
      
      setTxStatus('Sending transaction...');
      
      // Get signer
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Create contract instance
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      // Send transaction
      const tx = await contract.increment(encryptedData.handles[0], encryptedData.inputProof);
      
      setTxStatus('Waiting for confirmation...');
      await tx.wait();
      
      setTxStatus('✓ User counter incremented successfully!');
      setTimeout(() => setTxStatus(''), 3000);
    } catch (err) {
      console.error('Increment error:', err);
      setTxStatus('✗ Transaction failed');
      setTimeout(() => setTxStatus(''), 3000);
    } finally {
      setLoading('');
    }
  };

  const handleIncrementPublic = async () => {
    if (!fhevmClient || !address) return;
    setLoading('increment-public');
    setTxStatus('Encrypting value...');
    
    try {
      const { Contract, BrowserProvider } = await import('ethers');
      const instance = fhevmClient.getInstance();
      
      // Create encrypted input
      const input = instance.createEncryptedInput(CONTRACT_ADDRESS, address);
      input.add32(1); // Increment by 1
      const encryptedData = await input.encrypt();
      
      setTxStatus('Sending transaction...');
      
      // Get signer
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Create contract instance
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      // Send transaction
      const tx = await contract.incrementPublic(encryptedData.handles[0], encryptedData.inputProof);
      
      setTxStatus('Waiting for confirmation...');
      await tx.wait();
      
      setTxStatus('✓ Public counter incremented successfully!');
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
    if (!fhevmClient || !address) return;
    setLoading('decrypt-user');
    
    try {
      const { Contract, BrowserProvider } = await import('ethers');
      
      // Get contract instance
      const provider = new BrowserProvider(window.ethereum);
      const ethersSigner = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      // Get encrypted handle (returns BigNumber)
      const handle = await contract.getCount();
      
      // Convert BigNumber to 32-byte hex string (0x + 64 hex chars)
      const handleHex = '0x' + handle.toString(16).padStart(64, '0');
      
      // Wrap ethers signer to match Viem WalletClient interface
      const viemCompatibleSigner = {
        account: {
          address: address as `0x${string}`,
        },
        signTypedData: async (args: any) => {
          // Ethers v6 signTypedData expects types WITHOUT EIP712Domain
          const { EIP712Domain, ...typesWithoutDomain } = args.types;
          
          return await ethersSigner.signTypedData(
            args.domain,
            typesWithoutDomain,  // Remove EIP712Domain from types
            args.message
          );
        },
      };
      
      // Decrypt using SDK
      const decrypted = await fhevmClient.userDecrypt({
        handle: handleHex,
        contractAddress: CONTRACT_ADDRESS,
        signer: viemCompatibleSigner,
      });
      
      setUserValue(decrypted.toString());
    } catch (err) {
      console.error('Decrypt error:', err);
      setUserValue('Error');
    } finally {
      setLoading('');
    }
  };

  const handleDecryptPublic = async () => {
    if (!fhevmClient) return;
    setLoading('decrypt-public');
    
    try {
      const { Contract, JsonRpcProvider } = await import('ethers');
      
      // Get contract instance
      const provider = new JsonRpcProvider('http://localhost:8545');
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      // Get encrypted handle (returns BigNumber)
      const handle = await contract.getPublicCount();
      
      // Convert BigNumber to 32-byte hex string (0x + 64 hex chars)
      const handleHex = '0x' + handle.toString(16).padStart(64, '0');
      
      // Decrypt using SDK
      const decrypted = await fhevmClient.publicDecrypt([handleHex]);
      
      setPublicValue(decrypted[handleHex].toString());
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

        {/* Counter Demo */}
        {isConnected && fhevmClient?.isReady() && (
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
                  onClick={handleIncrementUser}
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
                  onClick={handleIncrementPublic}
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

