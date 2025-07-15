/**
 * Tests for shared emitters index exports
 */

import { describe, expect, it } from 'vitest';

describe('Shared Emitters Index', () => {
  describe('emitter exports', () => {
    it('should export core emitters', async () => {
      const emittersModule = await import('@/shared/emitters');

      // Core emitters
      expect(emittersModule).toHaveProperty('track');
      expect(emittersModule).toHaveProperty('identify');
      expect(emittersModule).toHaveProperty('page');
      expect(emittersModule).toHaveProperty('group');
      expect(emittersModule).toHaveProperty('alias');
      expect(emittersModule).toHaveProperty('screen');
    });

    it('should export utility functions', async () => {
      const emittersModule = await import('@/shared/emitters');

      // Utilities
      expect(emittersModule).toHaveProperty('createUserSession');
      expect(emittersModule).toHaveProperty('createAnonymousSession');
      expect(emittersModule).toHaveProperty('withUTM');
      expect(emittersModule).toHaveProperty('withMetadata');
    });

    it('should export builders and helpers', async () => {
      const emittersModule = await import('@/shared/emitters');

      // Builders
      expect(emittersModule).toHaveProperty('PayloadBuilder');
      expect(emittersModule).toHaveProperty('ContextBuilder');
      expect(emittersModule).toHaveProperty('EventBatch');
    });

    it('should export type guards', async () => {
      const emittersModule = await import('@/shared/emitters');

      // Type guards
      expect(emittersModule).toHaveProperty('isTrackPayload');
      expect(emittersModule).toHaveProperty('isIdentifyPayload');
      expect(emittersModule).toHaveProperty('isPagePayload');
      expect(emittersModule).toHaveProperty('isGroupPayload');
      expect(emittersModule).toHaveProperty('isAliasPayload');
    });

    it('should export ecommerce namespace', async () => {
      const emittersModule = await import('@/shared/emitters');

      expect(emittersModule).toHaveProperty('ecommerce');
      expect(typeof emittersModule.ecommerce).toBe('object');
    });
  });

  describe('function types', () => {
    it('should export functions as functions', async () => {
      const { track, identify, page, group, alias } = await import('@/shared/emitters');

      expect(typeof track).toBe('function');
      expect(typeof identify).toBe('function');
      expect(typeof page).toBe('function');
      expect(typeof group).toBe('function');
      expect(typeof alias).toBe('function');
    });

    it('should export builders as constructors', async () => {
      const { PayloadBuilder, ContextBuilder, EventBatch } = await import('@/shared/emitters');

      expect(typeof PayloadBuilder).toBe('function');
      expect(typeof ContextBuilder).toBe('function');
      expect(typeof EventBatch).toBe('function');
    });
  });
});
