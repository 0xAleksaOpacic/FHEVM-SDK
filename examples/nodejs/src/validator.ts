import type { NetworkMode } from './config';

/**
 * Validates that required environment variables are set for Sepolia mode
 * Exits with error if validation fails
 */
export function validateSepoliaConfig(mode: NetworkMode): void {
  if (mode !== 'sepolia') return;

  if (!process.env.PRIVATE_KEY) {
    console.error('❌ Error: PRIVATE_KEY required for Sepolia. Set it in .env file.');
    process.exit(1);
  }

  if (!process.env.SEPOLIA_RPC_URL) {
    console.error('❌ Error: SEPOLIA_RPC_URL required for Sepolia. Set it in .env file.');
    process.exit(1);
  }

  if (!process.env.SEPOLIA_COUNTER_ADDRESS) {
    console.error('❌ Error: SEPOLIA_COUNTER_ADDRESS required for Sepolia. Set it in .env file.');
    process.exit(1);
  }
}

