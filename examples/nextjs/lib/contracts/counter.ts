import { LOCALHOST_COUNTER, LOCALHOST_RPC_URL } from '@/config/localhost';
import { SEPOLIA_COUNTER, SEPOLIA_RPC_URL } from '@/config/sepolia';
import { handleToHex, getEthersSigner, getEthersContract } from './utils';
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
 * Sends transaction to increment the counter with already encrypted data
 */
export async function sendIncrementTx(
  handle: Uint8Array,
  inputProof: Uint8Array,
  counterType: 'user' | 'public',
  mode: NetworkMode,
  walletClient: any
) {
  const config = getCounterConfig(mode);

  // Get signer and contract using Wagmi's wallet client
  const signer = await getEthersSigner(walletClient);
  const contract = await getEthersContract(
    config.address,
    config.abi,
    signer
  );

  // Call the appropriate method
  const method = counterType === 'public' ? 'incrementPublic' : 'increment';
  const tx = await contract[method](handle, inputProof);
  
  await tx.wait();
}

/**
 * Gets the user counter handle from the contract
 */
export async function getUserCounterHandle(mode: NetworkMode): Promise<string> {
  const config = getCounterConfig(mode);
  const rpcUrl = getRpcUrl(mode);
  const { Contract, JsonRpcProvider } = await import('ethers');
  
  const provider = new JsonRpcProvider(rpcUrl);
  const contract = new Contract(config.address, config.abi, provider);
  const handle = await contract.getCount();
  
  return handleToHex(handle);
}

/**
 * Gets the public counter handle from the contract
 */
export async function getPublicCounterHandle(mode: NetworkMode): Promise<string> {
  const config = getCounterConfig(mode);
  const rpcUrl = getRpcUrl(mode);
  const { Contract, JsonRpcProvider } = await import('ethers');
  
  const provider = new JsonRpcProvider(rpcUrl);
  const contract = new Contract(config.address, config.abi, provider);
  const handle = await contract.getPublicCount();
  
  return handleToHex(handle);
}

