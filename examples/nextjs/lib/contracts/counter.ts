import { LOCALHOST_COUNTER, LOCALHOST_RPC_URL } from '@/config/localhost';
import { handleToHex, getEthersSigner, getEthersContract } from './utils';
import { createViemCompatibleSigner } from '@/lib/fhevm/adapters';
import type { FhevmClient } from '@fhevm/sdk';

/**
 * Increments the counter (user or public) with an encrypted value
 */
export async function incrementCounter(
  fhevmClient: FhevmClient,
  userAddress: string,
  counterType: 'user' | 'public'
) {
  // Create encrypted input
  const instance = fhevmClient.getInstance();
  if (!instance) {
    throw new Error('FHEVM instance not initialized');
  }
  
  const input = instance.createEncryptedInput(LOCALHOST_COUNTER.address, userAddress);
  input.add32(1); // Increment by 1
  const encryptedData = await input.encrypt();

  // Get signer and contract
  const signer = await getEthersSigner();
  const contract = await getEthersContract(
    LOCALHOST_COUNTER.address,
    LOCALHOST_COUNTER.abi,
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
  userAddress: string
) {
  const { Contract, BrowserProvider } = await import('ethers');
  
  // Get contract and handle
  const provider = new BrowserProvider(window.ethereum);
  const ethersSigner = await provider.getSigner();
  const contract = new Contract(
    LOCALHOST_COUNTER.address,
    LOCALHOST_COUNTER.abi,
    provider
  );

  const handle = await contract.getCount();
  const handleHex = handleToHex(handle);

  // Create Viem-compatible signer for SDK
  const viemSigner = createViemCompatibleSigner(ethersSigner, userAddress);
  
  // Decrypt using SDK
  const decrypted = await fhevmClient.userDecrypt({
    handle: handleHex,
    contractAddress: LOCALHOST_COUNTER.address,
    signer: viemSigner,
  });

  return decrypted.toString();
}

/**
 * Decrypts the public counter value (no signature required)
 */
export async function decryptPublicCounter(fhevmClient: FhevmClient) {
  const { Contract, JsonRpcProvider } = await import('ethers');
  
  // Get contract and handle
  const provider = new JsonRpcProvider(LOCALHOST_RPC_URL);
  const contract = new Contract(
    LOCALHOST_COUNTER.address,
    LOCALHOST_COUNTER.abi,
    provider
  );

  const handle = await contract.getPublicCount();
  const handleHex = handleToHex(handle);

  // Decrypt using SDK
  const decrypted = await fhevmClient.publicDecrypt([handleHex]);
  
  return decrypted[handleHex].toString();
}

