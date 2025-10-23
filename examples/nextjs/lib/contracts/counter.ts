import { LOCALHOST_COUNTER, LOCALHOST_RPC_URL } from '@/config/localhost';
import { SEPOLIA_COUNTER, SEPOLIA_RPC_URL } from '@/config/sepolia';
import { handleToHex, getEthersSigner, getEthersContract } from './utils';
import { createViemCompatibleSigner } from '@/lib/fhevm/adapters';
import type { FhevmClient } from '@fhevm/sdk';
import type { NetworkMode } from '@/config';

/**
 * Get contract configuration based on network mode
 */
function getCounterConfig(mode: NetworkMode) {
  return mode === 'localhost' ? LOCALHOST_COUNTER : SEPOLIA_COUNTER;
}

/**
 * Get RPC URL based on network mode
 */
function getRpcUrl(mode: NetworkMode) {
  return mode === 'localhost' ? LOCALHOST_RPC_URL : SEPOLIA_RPC_URL;
}

/**
 * Increments the counter (user or public) with an encrypted value
 */
export async function incrementCounter(
  fhevmClient: FhevmClient,
  userAddress: string,
  counterType: 'user' | 'public',
  mode: NetworkMode
) {
  const config = getCounterConfig(mode);

  // Create encrypted input
  const instance = fhevmClient.getInstance();
  if (!instance) {
    throw new Error('FHEVM instance not initialized');
  }
  

  const input = instance.createEncryptedInput(config.address, userAddress);
  input.add32(1); // Increment by 1

  const encryptedData = await input.encrypt();

  // Get signer and contract
  const signer = await getEthersSigner();
  const contract = await getEthersContract(
    config.address,
    config.abi,
    signer
  );

  // Call the appropriate method
  const method = counterType === 'public' ? 'incrementPublic' : 'increment';
  const tx = await contract[method](
    encryptedData.handles[0],
    encryptedData.inputProof
  );
  
  await tx.wait();
}

/**
 * Decrypts the user counter value (requires signature)
 */
export async function decryptUserCounter(
  fhevmClient: FhevmClient,
  userAddress: string,
  mode: NetworkMode
) {
  const config = getCounterConfig(mode);
  const { Contract, BrowserProvider } = await import('ethers');
  
  // Get contract and handle
  const provider = new BrowserProvider(window.ethereum);
  const ethersSigner = await provider.getSigner();
  const contract = new Contract(
    config.address,
    config.abi,
    provider
  );

  const handle = await contract.getCount();
  const handleHex = handleToHex(handle);

  // Create Viem-compatible signer for SDK
  const viemSigner = createViemCompatibleSigner(ethersSigner, userAddress);
  
  // Decrypt using SDK
  const decrypted = await fhevmClient.userDecrypt({
    handle: handleHex,
    contractAddress: config.address,
    signer: viemSigner,
  });

  return decrypted.toString();
}

/**
 * Decrypts the public counter value (no signature required)
 */
export async function decryptPublicCounter(
  fhevmClient: FhevmClient,
  mode: NetworkMode
) {
  const config = getCounterConfig(mode);
  const rpcUrl = getRpcUrl(mode);
  const { Contract, JsonRpcProvider } = await import('ethers');
  
  // Get contract and handle
  const provider = new JsonRpcProvider(rpcUrl);
  const contract = new Contract(
    config.address,
    config.abi,
    provider
  );

  const handle = await contract.getPublicCount();
  const handleHex = handleToHex(handle);

  // Decrypt using SDK
  const decrypted = await fhevmClient.publicDecrypt([handleHex]);
  
  return decrypted[handleHex].toString();
}

