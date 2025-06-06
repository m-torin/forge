import { describe, expect, it } from 'vitest';

import * as clientExports from '../client';
import * as serverExports from '../server';
import * as sharedExports from '../shared';

describe('Feature Flags Package Exports', () => {
  describe('Server exports', () => {
    it('should export flag function', () => {
      expect(serverExports.flag).toBeDefined();
      expect(typeof serverExports.flag).toBe('function');
    });

    it('should export dedupe function', () => {
      expect(serverExports.dedupe).toBeDefined();
      expect(typeof serverExports.dedupe).toBe('function');
    });

    it('should export precompute function', () => {
      expect(serverExports.precompute).toBeDefined();
      expect(typeof serverExports.precompute).toBe('function');
    });

    it('should export generatePermutations function', () => {
      expect(serverExports.generatePermutations).toBeDefined();
      expect(typeof serverExports.generatePermutations).toBe('function');
    });

    it('should export helper functions', () => {
      expect(serverExports.getFlagContext).toBeDefined();
      expect(serverExports.evaluateFlags).toBeDefined();
    });
  });

  describe('Client exports', () => {
    it('should export useFlag hook', () => {
      expect(clientExports.useFlag).toBeDefined();
      expect(typeof clientExports.useFlag).toBe('function');
    });

    it('should export flag function for client', () => {
      expect(clientExports.flag).toBeDefined();
    });
  });

  describe('Shared exports', () => {
    it('should export utility functions', () => {
      expect(sharedExports.getOrGenerateVisitorId).toBeDefined();
      expect(sharedExports.generateVisitorId).toBeDefined();
      expect(sharedExports.parseOverrides).toBeDefined();
    });
  });
});
