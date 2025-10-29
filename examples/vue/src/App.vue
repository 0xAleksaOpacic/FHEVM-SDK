<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { BrowserWalletConnector, useVueDapp } from '@vue-dapp/core';
import { VueDappModal, useVueDappModal } from '@vue-dapp/modal';
import { useFhevm, useFhevmEncrypt, useFhevmPublicDecrypt, useFhevmUserDecrypt, FhevmClientStatus, FhevmCacheType } from '@fhevm/vue-sdk';
import '@vue-dapp/modal/dist/style.css';
import { NETWORK_MODE } from './config';
import { LOCALHOST_COUNTER_ADDRESS } from './config/localhost';
import { SEPOLIA_COUNTER_ADDRESS } from './config/sepolia';
import { sendIncrementTx, getPublicCounterHandle, getUserCounterHandle } from '@/lib/contracts/counter';

const { addConnectors, isConnected, wallet, disconnect } = useVueDapp();
const { open } = useVueDappModal();

// FHEVM client from plugin
const { status, isReady, network } = useFhevm();

// Contract address based on network
const contractAddress = NETWORK_MODE === 'localhost' ? LOCALHOST_COUNTER_ADDRESS : SEPOLIA_COUNTER_ADDRESS;

// Encryption and decryption hooks
const { createInput } = useFhevmEncrypt({ contractAddress });
const { decrypt: publicDecrypt } = useFhevmPublicDecrypt();
const { decrypt: userDecrypt, clearCache } = useFhevmUserDecrypt({ contractAddress, cacheType: FhevmCacheType.Persistent });

// Add wallet connectors on mount
onMounted(() => {
  addConnectors([
    new BrowserWalletConnector(),
  ]);
});

// Mock state for demo
const userValue = ref<string>('-');
const publicValue = ref<string>('-');
const loading = ref<string>('');
const txStatus = ref<string>('');

// Computed status text
const statusText = computed(() => {
  if (status.value === FhevmClientStatus.LOADING) return 'Loading...';
  if (status.value === FhevmClientStatus.READY) return 'Ready ✓';
  if (status.value === FhevmClientStatus.ERROR) return 'Error';
  return 'Idle';
});

// Handlers
const handleIncrement = async (type: 'user' | 'public') => {
  try {
    // Set loading state first and force UI update
    loading.value = `increment-${type}`;
    txStatus.value = '⏳ Encrypting value...';
    
    // Small delay to ensure UI updates before encryption starts
    await new Promise(resolve => setTimeout(resolve, 0));

    if (!wallet.address) {
      throw new Error('Wallet not connected');
    }

    // Create encrypted input
    const input = createInput(wallet.address);
    input.add32(1);
    const encrypted = await input.encrypt();

    txStatus.value = '⏳ Sending transaction...';
    await sendIncrementTx(encrypted.handles[0], encrypted.inputProof, type, NETWORK_MODE);

    txStatus.value = `✓ ${type === 'public' ? 'Public' : 'User'} counter incremented!`;
    setTimeout(() => { txStatus.value = ''; }, 3000);
  } catch (error) {
    console.error('Increment error:', error);
    txStatus.value = `✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    setTimeout(() => { txStatus.value = ''; }, 3000);
  } finally {
    loading.value = '';
  }
};

const handleDecryptUser = async () => {
  try {
    loading.value = 'decrypt-user';
    userValue.value = '⏳ Decrypting...';
    const handle = await getUserCounterHandle(NETWORK_MODE);
    const decryptedValue = await userDecrypt(handle, wallet);
    userValue.value = decryptedValue.toString();
  } catch (error) {
    console.error('Decrypt user error:', error);
    userValue.value = '✗ Error';
  } finally {
    loading.value = '';
  }
};

const handleDecryptPublic = async () => {
  try {
    loading.value = 'decrypt-public';
    publicValue.value = '⏳ Decrypting...';
    const handle = await getPublicCounterHandle(NETWORK_MODE);
    const decryptedValue = await publicDecrypt(handle);
    publicValue.value = decryptedValue.toString();
  } catch (error) {
    console.error('Decrypt public error:', error);
    publicValue.value = '✗ Error';
  } finally {
    loading.value = '';
  }
};

// Disconnect handler with cache clearing
const handleDisconnect = async () => {
  // Clear signature cache on disconnect
  await clearCache();
  disconnect();
};

// Connect/disconnect handlers
const handleConnectClick = () => {
  if (isConnected.value) {
    handleDisconnect();
  } else {
    open();
  }
};
</script>

<template>
  <main class="container">
    <div class="card">
      <h1 style="text-align: center">FHEVM SDK Vue Demo</h1>
      <p class="subtitle">
        Build confidential applications with Fully Homomorphic Encryption
      </p>
      <p style="text-align: center; font-size: 0.875rem; opacity: 0.7; margin-top: 0.5rem">
        Network: <strong>{{ network === 'localhost' ? 'Localhost' : 'Sepolia' }}</strong>
      </p>
      
      <!-- Wallet Connection -->
      <section class="section">
        <h2>1. Connect Wallet</h2>
        <button 
          v-if="!isConnected"
          @click="handleConnectClick"
          class="btn-primary"
        >
          Connect Wallet
        </button>
        <div v-else class="wallet-info">
          <div style="flex: 1">
            <p style="margin-bottom: 0.25rem; font-size: 0.875rem; opacity: 0.7">Connected Address</p>
            <p class="wallet-address">{{ wallet.address?.slice(0, 8) }}...{{ wallet.address?.slice(-6) }}</p>
          </div>
          <button @click="handleConnectClick" class="btn-secondary">
            Disconnect
          </button>
        </div>
      </section>

      <!-- FHEVM Status -->
      <section v-if="isConnected" class="section">
        <h2>2. FHEVM Initialization</h2>
        <div class="status-badge">
          <span :class="isReady ? 'status-ready' : 'status-loading'">
            {{ statusText }}
          </span>
        </div>
      </section>

      <!-- Counter Demo -->
      <section v-if="isConnected && isReady" class="section">
        <h2>3. Encrypted Counter Demo</h2>
        <p style="margin-bottom: 1.5rem; font-size: 0.95rem">
          Interact with encrypted data on the blockchain using FHE.
        </p>

        <!-- Transaction Status -->
        <div 
          v-if="txStatus"
          :style="{ 
            padding: '1rem', 
            marginBottom: '1.5rem', 
            backgroundColor: txStatus.startsWith('✓') ? 'rgba(76, 175, 80, 0.1)' : txStatus.startsWith('✗') ? 'rgba(244, 67, 54, 0.1)' : 'rgba(255, 193, 7, 0.1)',
            border: `2px solid ${txStatus.startsWith('✓') ? '#4CAF50' : txStatus.startsWith('✗') ? '#f44336' : '#FFC107'}`,
            borderRadius: '8px',
            textAlign: 'center',
            fontWeight: 500
          }"
        >
          {{ txStatus }}
        </div>

        <!-- User Counter (Private Decryption) -->
        <div style="margin-bottom: 2rem; padding: 1.5rem; background-color: rgba(0,0,0,0.1); border-radius: 8px">
          <h3 style="margin-top: 0; margin-bottom: 0.5rem">👤 User Counter (Private)</h3>
          <p style="font-size: 0.875rem; opacity: 0.8; margin-bottom: 1rem">
            Only you can decrypt this value using <code style="background-color: rgba(0,0,0,0.2); padding: 2px 6px; border-radius: 4px">userDecrypt()</code>
          </p>
          <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: 1rem">
            <button 
              class="btn-primary" 
              @click="handleIncrement('user')"
              :disabled="loading === 'increment-user'"
            >
              {{ loading === 'increment-user' ? 'Incrementing...' : 'Increment User Counter' }}
            </button>
            <button 
              class="btn-secondary" 
              @click="handleDecryptUser"
              :disabled="loading === 'decrypt-user'"
            >
              {{ loading === 'decrypt-user' ? 'Decrypting...' : 'Decrypt My Value' }}
            </button>
          </div>
          <div style="padding: 1rem; background-color: rgba(255,255,255,0.1); border-radius: 6px">
            <p style="margin: 0; font-size: 0.875rem">
              Decrypted Value: <strong style="font-size: 1.25rem">{{ userValue }}</strong>
            </p>
          </div>
        </div>

        <!-- Public Counter (Public Decryption) -->
        <div style="padding: 1.5rem; background-color: rgba(0,0,0,0.1); border-radius: 8px">
          <h3 style="margin-top: 0; margin-bottom: 0.5rem">🌍 Public Counter</h3>
          <p style="font-size: 0.875rem; opacity: 0.8; margin-bottom: 1rem">
            Anyone can decrypt this value using <code style="background-color: rgba(0,0,0,0.2); padding: 2px 6px; border-radius: 4px">publicDecrypt()</code>
          </p>
          <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: 1rem">
            <button 
              class="btn-primary" 
              @click="handleIncrement('public')"
              :disabled="loading === 'increment-public'"
            >
              {{ loading === 'increment-public' ? 'Incrementing...' : 'Increment Public Counter' }}
            </button>
            <button 
              class="btn-secondary" 
              @click="handleDecryptPublic"
              :disabled="loading === 'decrypt-public'"
            >
              {{ loading === 'decrypt-public' ? 'Decrypting...' : 'Decrypt Public Value' }}
            </button>
          </div>
          <div style="padding: 1rem; background-color: rgba(255,255,255,0.1); border-radius: 6px">
            <p style="margin: 0; font-size: 0.875rem">
              Decrypted Value: <strong style="font-size: 1.25rem">{{ publicValue }}</strong>
            </p>
          </div>
        </div>
      </section>
    </div>

    <!-- VueDapp Modal for wallet selection -->
    <VueDappModal dark auto-connect />
  </main>
</template>
