import type { FhevmConfig } from '../createClient';
import { FhevmError, ErrorCodes, ClientErrorMessages } from '../../errors';

/**
 * Validate client configuration.
 *
 * @param config - Client configuration to validate.
 * @throws {FhevmError} If required fields are missing or chain is unsupported.
 */
export function validateConfig(config: FhevmConfig): void {
  // Provider is only required if chain config doesn't already have network
  const chainHasNetwork = config.chain && 'network' in config.chain && config.chain.network;
  
  if (!config.provider && !chainHasNetwork) {
    throw new FhevmError(
      ErrorCodes.INVALID_CONFIG,
      ClientErrorMessages.PROVIDER_REQUIRED
    );
  }

  if (!config.chain) {
    throw new FhevmError(
      ErrorCodes.INVALID_CONFIG,
      ClientErrorMessages.CHAIN_OR_CHAIN_ID_REQUIRED
    );
  }
}


