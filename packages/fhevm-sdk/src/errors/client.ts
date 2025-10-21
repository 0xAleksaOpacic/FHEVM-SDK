export const ErrorCodes = {
  INVALID_CONFIG: 'INVALID_CONFIG',
  INIT_FAILED: 'INIT_FAILED',
  NOT_INITIALIZED: 'NOT_INITIALIZED',
  ENCRYPT_FAILED: 'ENCRYPT_FAILED',
  DECRYPT_FAILED: 'DECRYPT_FAILED',
  BROWSER_ONLY: 'BROWSER_ONLY',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

