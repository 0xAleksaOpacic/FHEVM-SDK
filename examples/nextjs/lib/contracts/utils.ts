/**
 * Converts a BigNumber handle to a 32-byte hex string
 * Required format for FHEVM SDK decryption methods
 */
export function handleToHex(handle: any): string {
  return '0x' + handle.toString(16).padStart(64, '0');
}

/**
 * Gets an ethers signer from the browser's Ethereum provider
 */
export async function getEthersSigner() {
  const { BrowserProvider } = await import('ethers');
  const provider = new BrowserProvider(window.ethereum);
  return await provider.getSigner();
}

/**
 * Creates an ethers contract instance
 */
export async function getEthersContract(
  address: string,
  abi: any,
  signerOrProvider?: any
) {
  const { Contract } = await import('ethers');
  return new Contract(address, abi, signerOrProvider);
}

