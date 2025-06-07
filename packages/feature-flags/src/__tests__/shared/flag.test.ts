import { describe, expect, it } from 'vitest';

import { Flag } from '../../shared/flag';

import type { FlagMetadata } from '../../shared/types';

describe('Flag', () => {
  describe('constructor', () => {
    it('should create a flag with default values', () => {
      const flag = new Flag('test-flag');

      expect(flag.key).toBe('test-flag');
      expect(flag.value).toBe(false);
      expect(flag.enabled).toBe(false);
      expect(flag.metadata).toEqual({});
    });

    it('should create a flag with custom values', () => {
      const flag = new Flag('test-flag', true, {
        createdAt: new Date('2023-01-01'),
        description: 'Test flag',
      });

      expect(flag.key).toBe('test-flag');
      expect(flag.value).toBe(true);
      expect(flag.enabled).toBe(true);
      expect(flag.metadata.description).toBe('Test flag');
    });

    it('should handle complex flag values', () => {
      const complexValue = {
        config: { timeout: 5000 },
        percentage: 50,
        variants: ['A', 'B'],
      };

      const flag = new Flag('complex-flag', complexValue);

      expect(flag.value).toEqual(complexValue);
      expect(flag.enabled).toBe(true);
    });

    it('should handle string values', () => {
      const flag = new Flag('string-flag', 'variant-a');

      expect(flag.value).toBe('variant-a');
      expect(flag.enabled).toBe(true);
    });

    it('should handle number values', () => {
      const flag = new Flag('number-flag', 42);

      expect(flag.value).toBe(42);
      expect(flag.enabled).toBe(true);
    });

    it('should consider empty string as disabled', () => {
      const flag = new Flag('empty-flag', '');

      expect(flag.value).toBe('');
      expect(flag.enabled).toBe(false);
    });

    it('should consider zero as disabled', () => {
      const flag = new Flag('zero-flag', 0);

      expect(flag.value).toBe(0);
      expect(flag.enabled).toBe(false);
    });

    it('should consider null as disabled', () => {
      const flag = new Flag('null-flag', null);

      expect(flag.value).toBe(null);
      expect(flag.enabled).toBe(false);
    });
  });

  describe('isEnabled', () => {
    it('should return true for boolean true', () => {
      const flag = new Flag('bool-flag', true);
      expect(flag.isEnabled()).toBe(true);
    });

    it('should return false for boolean false', () => {
      const flag = new Flag('bool-flag', false);
      expect(flag.isEnabled()).toBe(false);
    });

    it('should return true for non-empty strings', () => {
      const flag = new Flag('string-flag', 'enabled');
      expect(flag.isEnabled()).toBe(true);
    });

    it('should return true for positive numbers', () => {
      const flag = new Flag('number-flag', 100);
      expect(flag.isEnabled()).toBe(true);
    });

    it('should return true for objects', () => {
      const flag = new Flag('object-flag', { enabled: true });
      expect(flag.isEnabled()).toBe(true);
    });

    it('should return true for arrays', () => {
      const flag = new Flag('array-flag', ['A', 'B']);
      expect(flag.isEnabled()).toBe(true);
    });
  });

  describe('getValue', () => {
    it('should return the flag value', () => {
      const flag = new Flag('test-flag', 'value');
      expect(flag.getValue()).toBe('value');
    });

    it('should return complex values', () => {
      const value = { variant: 'A', weight: 0.5 };
      const flag = new Flag('complex-flag', value);
      expect(flag.getValue()).toEqual(value);
    });
  });

  describe('getMetadata', () => {
    it('should return metadata', () => {
      const metadata: FlagMetadata = {
        description: 'Test flag',
        owner: 'team-a',
        tags: ['experimental', 'frontend'],
      };

      const flag = new Flag('test-flag', true, metadata);
      expect(flag.getMetadata()).toEqual(metadata);
    });

    it('should return empty object when no metadata', () => {
      const flag = new Flag('test-flag');
      expect(flag.getMetadata()).toEqual({});
    });
  });

  describe('toJSON', () => {
    it('should serialize flag to JSON', () => {
      const flag = new Flag('test-flag', true, {
        description: 'Test flag',
      });

      const json = flag.toJSON();

      expect(json).toEqual({
        enabled: true,
        key: 'test-flag',
        metadata: {
          description: 'Test flag',
        },
        value: true,
      });
    });

    it('should handle complex values in JSON', () => {
      const flag = new Flag('complex-flag', {
        variants: ['A', 'B', 'C'],
        weights: [0.33, 0.33, 0.34],
      });

      const json = flag.toJSON();

      expect(json.value).toEqual({
        variants: ['A', 'B', 'C'],
        weights: [0.33, 0.33, 0.34],
      });
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      const flag = new Flag('test-flag', true);
      expect(flag.toString()).toBe('[Flag test-flag: true]');
    });

    it('should handle complex values in string', () => {
      const flag = new Flag('complex-flag', { variant: 'A' });
      expect(flag.toString()).toBe('[Flag complex-flag: {"variant":"A"}]');
    });
  });

  describe('static methods', () => {
    describe('fromJSON', () => {
      it('should create flag from JSON', () => {
        const json = {
          key: 'test-flag',
          metadata: { description: 'Test' },
          value: true,
        };

        const flag = Flag.fromJSON(json);

        expect(flag.key).toBe('test-flag');
        expect(flag.value).toBe(true);
        expect(flag.metadata).toEqual({ description: 'Test' });
      });

      it('should handle missing metadata', () => {
        const json = {
          key: 'test-flag',
          value: 'enabled',
        };

        const flag = Flag.fromJSON(json);

        expect(flag.metadata).toEqual({});
      });
    });

    describe('create', () => {
      it('should create flag with builder pattern', () => {
        const flag = Flag.create('test-flag').withValue(true).withMetadata({ description: 'Test' });

        expect(flag.key).toBe('test-flag');
        expect(flag.value).toBe(true);
        expect(flag.metadata.description).toBe('Test');
      });
    });
  });

  describe('edge cases', () => {
    it('should handle undefined value', () => {
      const flag = new Flag('undefined-flag', undefined);

      expect(flag.value).toBeUndefined();
      expect(flag.enabled).toBe(false);
    });

    it('should handle NaN value', () => {
      const flag = new Flag('nan-flag', NaN);

      expect(flag.value).toBeNaN();
      expect(flag.enabled).toBe(false);
    });

    it('should handle empty array', () => {
      const flag = new Flag('empty-array-flag', []);

      expect(flag.value).toEqual([]);
      expect(flag.enabled).toBe(false);
    });

    it('should handle empty object', () => {
      const flag = new Flag('empty-object-flag', {});

      expect(flag.value).toEqual({});
      expect(flag.enabled).toBe(true); // Objects are truthy
    });
  });

  describe('immutability', () => {
    it('should not allow modification of metadata', () => {
      const metadata = { description: 'Original' };
      const flag = new Flag('test-flag', true, metadata);

      // Modify original
      metadata.description = 'Modified';

      // Flag should retain original value
      expect(flag.getMetadata().description).toBe('Original');
    });

    it('should not allow modification of returned metadata', () => {
      const flag = new Flag('test-flag', true, { description: 'Original' });

      const metadata = flag.getMetadata();
      metadata.description = 'Modified';

      // Flag should retain original value
      expect(flag.getMetadata().description).toBe('Original');
    });
  });
});
