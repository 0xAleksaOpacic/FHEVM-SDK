export const COUNTER_ABI = [
  'function increment(bytes32 inputHandle, bytes inputProof) external',
  'function incrementPublic(bytes32 inputHandle, bytes inputProof) external',
  'function getCount() external view returns (uint256)',
  'function getPublicCount() external view returns (uint256)',
] as const;

