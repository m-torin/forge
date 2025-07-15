/**
 * Tests for basic type imports and structure
 */

import { describe, expect, it } from 'vitest';

describe('Shared Types', () => {
  describe('type imports', () => {
    it('should import types module without errors', async () => {
      expect(async () => {
        await import('@/shared/types/types');
      }).not.toThrow();
    });

    it('should import console types without errors', async () => {
      expect(async () => {
        await import('@/shared/types/console-types');
      }).not.toThrow();
    });

    it('should import posthog types without errors', async () => {
      expect(async () => {
        await import('@/shared/types/posthog-types');
      }).not.toThrow();
    });

    it('should import segment types without errors', async () => {
      expect(async () => {
        await import('@/shared/types/segment-types');
      }).not.toThrow();
    });

    it('should import vercel types without errors', async () => {
      expect(async () => {
        await import('@/shared/types/vercel-types');
      }).not.toThrow();
    });
  });

  describe('main types export', () => {
    it('should export index types without errors', async () => {
      expect(async () => {
        await import('@/types');
      }).not.toThrow();
    });
  });
});
