import { initFhevmPolyfills } from '@fhevm/vue-sdk';

// Initialize polyfills before any other imports
initFhevmPolyfills();

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createFhevmPlugin } from '@fhevm/vue-sdk';
import './style.css';
import App from './App.vue';
import { NETWORK_MODE } from './config';
import { LOCALHOST_RPC_URL } from './config/localhost';
import { SEPOLIA_RPC_URL } from './config/sepolia';

// FHEVM config based on network mode
const fhevmRpcUrl = NETWORK_MODE === 'localhost' ? LOCALHOST_RPC_URL : SEPOLIA_RPC_URL;

const app = createApp(App);

// Install plugins
app.use(createPinia());
app.use(createFhevmPlugin({
  network: NETWORK_MODE,
  rpcUrl: fhevmRpcUrl,
}));

app.mount('#app');
