// Adapters for ethers ↔ Viem compatibility

/**
 * Wraps an ethers signer to match the Viem WalletClient interface
 * This is needed because our SDK's userDecrypt expects a Viem-style signer,
 * but we're using ethers for contract interactions
 */
export function createViemCompatibleSigner(ethersSigner: any, address: string) {
  return {
    account: {
      address: address as `0x${string}`,
    },
    signTypedData: async (args: any) => {
      // Ethers v6 signTypedData expects types WITHOUT EIP712Domain
      // (the domain is passed separately)
      const { EIP712Domain, ...typesWithoutDomain } = args.types;
      
      return await ethersSigner.signTypedData(
        args.domain,
        typesWithoutDomain,
        args.message
      );
    },
  };
}

