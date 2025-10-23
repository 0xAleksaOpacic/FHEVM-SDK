import { useContext } from 'react';
import { FhevmContext } from '../FhevmContext';

/**
 * Hook to access FHEVM client from context
 * 
 * @returns FHEVM context value containing client, status, isReady, and network
 * @throws Error if used outside of FhevmProvider
 */
export function useFhevm() {
  const context = useContext(FhevmContext);
  
  if (!context) {
    throw new Error('useFhevm must be used within FhevmProvider');
  }
  
  return context;
}

