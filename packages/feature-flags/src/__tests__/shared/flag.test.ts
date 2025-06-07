import { describe, expect, it } from 'vitest';

import { flag } from '../../shared/flag';

describe('flag utility', () => {
  describe('basic flag creation', () => {
    it('should create a boolean flag', () => {
      const testFlag = flag({
        key: 'test-flag',
        decide: () => true,
      });

      expect(testFlag).toBeDefined();
      expect(typeof testFlag).toBe('function');
    });

    it('should create a string flag with payload', () => {
      const stringFlag = flag({
        key: 'string-flag',
        decide: () => 'variant-a',
      });

      expect(stringFlag).toBeDefined();
      expect(typeof stringFlag).toBe('function');
    });

    it('should create a complex object flag', () => {
      const complexFlag = flag({
        key: 'complex-flag',
        decide: () => ({
          variant: 'A',
          config: { timeout: 5000 },
        }),
      });

      expect(complexFlag).toBeDefined();
      expect(typeof complexFlag).toBe('function');
    });
  });

  describe('flag with simple decide function', () => {
    it('should handle basic boolean flags', async () => {
      const boolFlag = flag({
        key: 'bool-flag',
        decide: () => true,
      });

      expect(boolFlag).toBeDefined();
    });

    it('should handle string flags', async () => {
      const stringFlag = flag({
        key: 'string-flag',
        decide: () => 'enabled',
      });

      expect(stringFlag).toBeDefined();
    });

    it('should handle object flags', async () => {
      const objectFlag = flag({
        key: 'object-flag',
        decide: () => ({ variant: 'A' }),
      });

      expect(objectFlag).toBeDefined();
    });
  });

  describe('flag composition', () => {
    it('should support flag metadata through description', () => {
      const documentedFlag = flag({
        key: 'documented-flag',
        description: 'This flag controls the new feature rollout',
        decide: () => false,
      });

      expect(documentedFlag).toBeDefined();
    });

    it('should support default values', () => {
      const defaultFlag = flag({
        key: 'default-flag',
        decide: () => {
          throw new Error('Should use default');
        },
        defaultValue: 'fallback',
      });

      expect(defaultFlag).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle flags with throwing decide functions', () => {
      const errorFlag = flag({
        key: 'error-flag',
        decide: () => {
          throw new Error('Flag error');
        },
        defaultValue: false,
      });

      expect(errorFlag).toBeDefined();
    });
  });
});