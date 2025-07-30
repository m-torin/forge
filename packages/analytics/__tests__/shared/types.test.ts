/**
 * Tests for basic type imports and structure
 */

import { describe, expect } from 'vitest';

describe('shared Types', () => {
  describe('type imports', () => {
    test('should import types module without errors', async () => {
      expect(async () => {
        await import('#/shared/types/types');
      }).not.toThrow();
    });

    test('should import console types without errors', async () => {
      expect(async () => {
        await import('#/shared/types/console-types');
      }).not.toThrow();
    });

    test('should import posthog types without errors', async () => {
      expect(async () => {
        await import('#/shared/types/posthog-types');
      }).not.toThrow();
    });

    test('should import segment types without errors', async () => {
      expect(async () => {
        await import('#/shared/types/segment-types');
      }).not.toThrow();
    });

    test('should import vercel types without errors', async () => {
      expect(async () => {
        await import('#/shared/types/vercel-types');
      }).not.toThrow();
    });
  });

  describe('main types export', () => {
    test('should export index types without errors', async () => {
      expect(async () => {
        await import('#/types');
      }).not.toThrow();
    });
  });
});
