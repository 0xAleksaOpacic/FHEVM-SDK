import { describe, it, expect } from 'vitest';
import { getChainById, isSupportedChain, getSupportedChainIds } from './utils';
import { sepolia } from './index';

describe('chains/utils', () => {
  describe('getChainById', () => {
    it('should return Sepolia for chainId 11155111', () => {
      const chain = getChainById(sepolia.id);
      
      expect(chain).toBeDefined();
      expect(chain).toEqual(sepolia);
    });

    it('should return undefined for unknown chainId', () => {
      const chain = getChainById(99999);
      
      expect(chain).toBeUndefined();
    });
  });

  describe('isSupportedChain', () => {
    it('should return true for Sepolia (11155111)', () => {
      expect(isSupportedChain(sepolia.id)).toBe(true);
    });

    it('should return false for unknown chain', () => {
      expect(isSupportedChain(99999)).toBe(false);
    });
  });

  describe('getSupportedChainIds', () => {
    it('should return array with [11155111]', () => {
      const chainIds = getSupportedChainIds();
      
      expect(chainIds).toEqual([sepolia.id]);
      expect(chainIds).toHaveLength(1);
    });
  });
});

