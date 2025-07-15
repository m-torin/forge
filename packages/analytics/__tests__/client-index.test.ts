/**
 * Tests for client/index.ts - client-side analytics functionality
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('client/index.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('exports', () => {
    it('should export client analytics functions', async () => {
      const clientIndex = await import('@/client/index');

      expect(clientIndex).toHaveProperty('createClientAnalytics');
      expect(clientIndex).toHaveProperty('createClientAnalyticsUninitialized');
      expect(typeof clientIndex.createClientAnalytics).toBe('function');
      expect(typeof clientIndex.createClientAnalyticsUninitialized).toBe('function');
    });

    it('should export emitter functions', async () => {
      const clientIndex = await import('@/client/index');

      expect(clientIndex).toHaveProperty('track');
      expect(clientIndex).toHaveProperty('identify');
      expect(clientIndex).toHaveProperty('page');
      expect(clientIndex).toHaveProperty('group');
      expect(clientIndex).toHaveProperty('alias');
      expect(typeof clientIndex.track).toBe('function');
      expect(typeof clientIndex.identify).toBe('function');
      expect(typeof clientIndex.page).toBe('function');
      expect(typeof clientIndex.group).toBe('function');
      expect(typeof clientIndex.alias).toBe('function');
    });

    it('should export ecommerce emitters', async () => {
      const clientIndex = await import('@/client/index');

      expect(clientIndex).toHaveProperty('ecommerce');
      expect(typeof clientIndex.ecommerce).toBe('object');
    });

    it('should export utility functions', async () => {
      const clientIndex = await import('@/client/index');

      expect(clientIndex).toHaveProperty('createEmitterProcessor');
      expect(clientIndex).toHaveProperty('processEmitterPayload');
      expect(typeof clientIndex.createEmitterProcessor).toBe('function');
      expect(typeof clientIndex.processEmitterPayload).toBe('function');
    });
  });

  describe('createClientAnalytics', () => {
    it('should create client analytics instance with config', async () => {
      const { createClientAnalytics } = await import('@/client/index');

      const config = {
        providers: {
          console: {},
        },
      };

      const analytics = await createClientAnalytics(config);

      expect(analytics).toBeDefined();
      expect(typeof analytics.track).toBe('function');
      expect(typeof analytics.identify).toBe('function');
      expect(typeof analytics.page).toBe('function');
      expect(typeof analytics.group).toBe('function');
      expect(typeof analytics.alias).toBe('function');
    });

    it('should create uninitialized analytics', async () => {
      const { createClientAnalyticsUninitialized } = await import('@/client/index');

      const config = {
        providers: {
          console: {},
        },
      };

      const analytics = createClientAnalyticsUninitialized(config);

      expect(analytics).toBeDefined();
      expect(typeof analytics.track).toBe('function');
    });
  });

  describe('emitter functions', () => {
    it('should use track emitter', async () => {
      const { track, createClientAnalytics } = await import('@/client/index');

      const config = {
        providers: {
          console: {},
        },
      };

      const analytics = await createClientAnalytics(config);
      const trackEmitter = track('test_event', { key: 'value' });

      expect(trackEmitter).toBeDefined();
      await expect(analytics.emit(trackEmitter)).resolves.toBeUndefined();
    });

    it('should use identify emitter', async () => {
      const { identify, createClientAnalytics } = await import('@/client/index');

      const config = {
        providers: {
          console: {},
        },
      };

      const analytics = await createClientAnalytics(config);
      const identifyEmitter = identify('user-123', { name: 'Test User' });

      expect(identifyEmitter).toBeDefined();
      await expect(analytics.emit(identifyEmitter)).resolves.toBeUndefined();
    });

    it('should use page emitter', async () => {
      const { page, createClientAnalytics } = await import('@/client/index');

      const config = {
        providers: {
          console: {},
        },
      };

      const analytics = await createClientAnalytics(config);
      const pageEmitter = page('Test Page');

      expect(pageEmitter).toBeDefined();
      await expect(analytics.emit(pageEmitter)).resolves.toBeUndefined();
    });

    it('should use ecommerce emitters', async () => {
      const { ecommerce, createClientAnalytics } = await import('@/client/index');

      const config = {
        providers: {
          console: {},
        },
      };

      const analytics = await createClientAnalytics(config);
      const productViewEmitter = ecommerce.productViewed({
        product_id: 'test-product',
        name: 'Test Product',
        price: 99.99,
      });

      expect(productViewEmitter).toBeDefined();
      await expect(analytics.emit(productViewEmitter)).resolves.toBeUndefined();
    });
  });

  describe('emitter processing', () => {
    it('should process emitter payloads', async () => {
      const { track } = await import('@/client/index');

      const trackEmitter = track('test_event', { key: 'value' });

      expect(trackEmitter).toBeDefined();
      expect(trackEmitter).toHaveProperty('type');
      expect(trackEmitter.type).toBe('track');
    });

    it('should create emitter processor', async () => {
      const { createEmitterProcessor, createClientAnalytics } = await import('@/client/index');

      const config = {
        providers: {
          console: {},
        },
      };

      const analytics = await createClientAnalytics(config);
      const processor = createEmitterProcessor(analytics);

      expect(processor).toBeDefined();
      expect(typeof processor).toBe('function');
    });
  });

  describe('error handling', () => {
    it('should handle client analytics creation errors', async () => {
      const { createClientAnalyticsUninitialized } = await import('@/client/index');

      const invalidConfig = {} as any;

      expect(() => createClientAnalyticsUninitialized(invalidConfig)).not.toThrow();
    });

    it('should handle emitter creation errors', async () => {
      const { track } = await import('@/client/index');

      expect(() => track('test_event', {})).not.toThrow();
    });
  });
});
