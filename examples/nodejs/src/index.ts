import 'dotenv/config';
import { createNodeClient, sepolia, localhost } from '@fhevm/sdk/node';
import { createMockClient } from '@fhevm/sdk/mock';
import { JsonRpcProvider, Wallet, Contract } from 'ethers';

// Configuration from environment
const NETWORK_MODE = (process.env.NETWORK_MODE || 'localhost') as 'localhost' | 'sepolia';
const RPC_URL = NETWORK_MODE === 'sepolia' 
  ? process.env.SEPOLIA_RPC_URL 
  : process.env.LOCALHOST_RPC_URL || 'http://127.0.0.1:8545';
const CONTRACT_ADDRESS = NETWORK_MODE === 'sepolia'
  ? process.env.SEPOLIA_COUNTER_ADDRESS
  : process.env.LOCALHOST_COUNTER_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Contract ABI (from Next.js example)
const COUNTER_ABI = [
  'function incrementPublic(bytes32 inputHandle, bytes inputProof) external',
  'function getPublicCount() external view returns (uint256)',
];

async function main() {
  console.log('');
  console.log('🚀 FHEVM Node.js CLI Demo');
  console.log('========================');
  console.log(`📍 Network: ${NETWORK_MODE}`);
  console.log(`🔗 RPC: ${RPC_URL}`);
  console.log(`📝 Contract: ${CONTRACT_ADDRESS}`);
  console.log('');

  // Validate config
  if (!PRIVATE_KEY) {
    console.error('❌ Error: PRIVATE_KEY not set in .env');
    process.exit(1);
  }

  if (!RPC_URL) {
    console.error('❌ Error: RPC_URL not set in .env');
    process.exit(1);
  }

  if (!CONTRACT_ADDRESS) {
    console.error('❌ Error: CONTRACT_ADDRESS not set in .env');
    process.exit(1);
  }

  // 1. Setup provider
  const provider = new JsonRpcProvider(RPC_URL);
  
  // 2. Initialize FHEVM client
  console.log('🔐 Initializing FHEVM client...');
  
  let fhevmClient;
  
  if (NETWORK_MODE === 'localhost') {
    // Use mock client for localhost (no real FHE)
    fhevmClient = await createMockClient(provider, localhost);
  } else {
    // Use real client for Sepolia
    fhevmClient = createNodeClient({
      chain: sepolia,
      provider: RPC_URL,
      debug: true,
    });
    await fhevmClient.initialize();
  }
  
  console.log('✅ FHEVM client initialized');
  console.log('');

  // 3. Setup wallet & contract
  console.log('🔑 Setting up wallet...');
  const wallet = new Wallet(PRIVATE_KEY, provider);
  const walletAddress = wallet.address;
  console.log(`✅ Wallet address: ${walletAddress}`);
  
  const contract = new Contract(CONTRACT_ADDRESS, COUNTER_ABI, wallet);
  console.log('✅ Contract instance created');
  console.log('');

  // 4. Create encrypted input
  console.log('🔒 Encrypting value: 5');
  const instance = fhevmClient.getInstance();
  if (!instance) {
    console.error('❌ FHEVM instance not available');
    process.exit(1);
  }

  const encryptedInput = instance.createEncryptedInput(CONTRACT_ADDRESS, walletAddress);
  encryptedInput.add32(5);
  const { handles, inputProof } = await encryptedInput.encrypt();
  
  console.log(`✅ Encrypted (handle: ${handles[0].length} bytes, proof: ${inputProof.length} bytes)`);
  console.log('');

  // 5. Send transaction
  console.log('📤 Sending increment transaction...');
  try {
    const tx = await contract.incrementPublic(handles[0], inputProof);
    console.log(`⏳ Transaction sent: ${tx.hash}`);
    
    console.log('⏳ Waiting for confirmation...');
    const receipt = await tx.wait();
    console.log(`✅ Transaction confirmed in block ${receipt?.blockNumber}`);
    console.log('');
  } catch (error: any) {
    console.error('❌ Transaction failed:', error.message);
    console.log('');
  }

  // 6. Get encrypted handle from contract
  console.log('📦 Reading public counter handle...');
  try {
    const handle = await contract.getPublicCount();
    console.log(`✅ Got handle: ${handle.toString()}`);
    console.log('');

    // 7. Decrypt the value
    console.log('🔓 Decrypting public counter...');
    
    // Convert to 32-byte hex (same as Next.js handleToHex)
    const handleHex = '0x' + BigInt(handle).toString(16).padStart(64, '0');
    
    const decrypted = await fhevmClient.publicDecrypt([handleHex]);
    const decryptedValue = decrypted[handleHex];
    
    console.log(`✅ Decrypted value: ${decryptedValue}`);
    console.log('');
  } catch (error: any) {
    console.error('❌ Decryption failed:', error.message);
    console.log('');
  }

  console.log('🎉 Demo complete!');
  console.log('');
}

// Run the demo
main().catch((error) => {
  console.error('');
  console.error('💥 Fatal error:', error.message);
  console.error('');
  process.exit(1);
});

