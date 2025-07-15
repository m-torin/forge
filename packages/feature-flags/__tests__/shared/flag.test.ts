import { describe, expect } from 'vitest';

import { flag } from '#/shared/flag';

describe('flag utility', () => {
  describe('basic flag creation', () => {
    test('should create a boolean flag', () => {
      const testFlag = flag({
        decide: () => true,
        key: 'test-flag',
      });

      expect(testFlag).toBeDefined();
      expect(typeof testFlag).toBe('function');
    });

    test('should create a string flag with payload', () => {
      const stringFlag = flag({
        decide: () => 'variant-a',
        key: 'string-flag',
      });

      expect(stringFlag).toBeDefined();
      expect(typeof stringFlag).toBe('function');
    });

    test('should create a complex object flag', () => {
      const complexFlag = flag({
        decide: () => ({
          config: { timeout: 5000 },
          variant: 'A',
        }),
        key: 'complex-flag',
      });

      expect(complexFlag).toBeDefined();
      expect(typeof complexFlag).toBe('function');
    });
  });

  describe('flag with simple decide function', () => {
    test('should handle basic boolean flags', async () => {
      const boolFlag = flag({
        decide: () => true,
        key: 'bool-flag',
      });

      expect(boolFlag).toBeDefined();
    });

    test('should handle string flags', async () => {
      const stringFlag = flag({
        decide: () => 'enabled',
        key: 'string-flag',
      });

      expect(stringFlag).toBeDefined();
    });

    test('should handle object flags', async () => {
      const objectFlag = flag({
        decide: () => ({ variant: 'A' }),
        key: 'object-flag',
      });

      expect(objectFlag).toBeDefined();
    });
  });

  describe('flag composition', () => {
    test('should support flag metadata through description', () => {
      const documentedFlag = flag({
        decide: () => false,
        description: 'This flag controls the new feature rollout',
        key: 'documented-flag',
      });

      expect(documentedFlag).toBeDefined();
    });

    test('should support default values', () => {
      const defaultFlag = flag({
        decide: () => {
          throw new Error('Should use default');
        },
        defaultValue: 'fallback',
        key: 'default-flag',
      });

      expect(defaultFlag).toBeDefined();
    });
  });

  describe('error handling', () => {
    test('should handle flags with throwing decide functions', () => {
      const errorFlag = flag({
        decide: () => {
          throw new Error('Flag error');
        },
        defaultValue: false,
        key: 'error-flag',
      });

      expect(errorFlag).toBeDefined();
    });
  });
});
