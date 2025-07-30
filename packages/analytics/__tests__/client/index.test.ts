/**
 * Tests for client/index.ts - client-side analytics functionality
 */

import { beforeEach, describe, expect, vi } from 'vitest';
import { createAnalyticsTestConfig, createTestAnalytics } from '../setup';

describe('client/index.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('exports', () => {
    test('should export client analytics functions', async () => {
      const clientIndex = await import('#/client/index');

      expect(clientIndex).toHaveProperty('createClientAnalytics');
      expect(clientIndex).toHaveProperty('createClientAnalyticsUninitialized');
      expect(typeof clientIndex.createClientAnalytics).toBe('function');
      expect(typeof clientIndex.createClientAnalyticsUninitialized).toBe('function');
    });

    test('should export emitter functions', async () => {
      const clientIndex = await import('#/client/index');

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

    test('should export ecommerce emitters', async () => {
      const clientIndex = await import('#/client/index');

      expect(clientIndex).toHaveProperty('ecommerce');
      expect(typeof clientIndex.ecommerce).toBe('object');
    });

    test('should export utility functions', async () => {
      const clientIndex = await import('#/client/index');

      expect(clientIndex).toHaveProperty('createEmitterProcessor');
      expect(clientIndex).toHaveProperty('processEmitterPayload');
      expect(typeof clientIndex.createEmitterProcessor).toBe('function');
      expect(typeof clientIndex.processEmitterPayload).toBe('function');
    });
  });

  describe('createClientAnalytics', () => {
    test('should create client analytics instance with config', async () => {
      const analytics = await createTestAnalytics();

      expect(analytics).toBeDefined();
      expect(typeof analytics.track).toBe('function');
      expect(typeof analytics.identify).toBe('function');
      expect(typeof analytics.page).toBe('function');
      expect(typeof analytics.group).toBe('function');
      expect(typeof analytics.alias).toBe('function');
    });

    test('should create uninitialized analytics', async () => {
      const { createClientAnalyticsUninitialized } = await import('#/client/index');
      const config = createAnalyticsTestConfig();

      const analytics = createClientAnalyticsUninitialized(config);

      expect(analytics).toBeDefined();
      expect(typeof analytics.track).toBe('function');
    });
  });

  describe('emitter functions', () => {
    test('should use track emitter', async () => {
      const { track } = await import('#/client/index');
      const analytics = await createTestAnalytics();
      const trackEmitter = track('test_event', { key: 'value' });

      expect(trackEmitter).toBeDefined();
      await expect(analytics.emit(trackEmitter)).resolves.toBeUndefined();
    });

    test('should use identify emitter', async () => {
      const { identify } = await import('#/client/index');
      const analytics = await createTestAnalytics();
      const identifyEmitter = identify('user-123', { name: 'Test User' });

      expect(identifyEmitter).toBeDefined();
      await expect(analytics.emit(identifyEmitter)).resolves.toBeUndefined();
    });

    test('should use page emitter', async () => {
      const { page } = await import('#/client/index');
      const analytics = await createTestAnalytics();
      const pageEmitter = page('Test Page');

      expect(pageEmitter).toBeDefined();
      await expect(analytics.emit(pageEmitter)).resolves.toBeUndefined();
    });

    test('should use ecommerce emitters', async () => {
      const { ecommerce } = await import('#/client/index');
      const analytics = await createTestAnalytics();
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
    test('should process emitter payloads', async () => {
      const { track } = await import('#/client/index');
      const trackEmitter = track('test_event', { key: 'value' });

      expect(trackEmitter).toBeDefined();
      expect(trackEmitter).toHaveProperty('type');
      expect(trackEmitter.type).toBe('track');
    });

    test('should create emitter processor', async () => {
      const { createEmitterProcessor } = await import('#/client/index');
      const analytics = await createTestAnalytics();
      const processor = createEmitterProcessor(analytics);

      expect(processor).toBeDefined();
      expect(typeof processor).toBe('function');
    });
  });

  describe('error handling', () => {
    test('should handle client analytics creation errors', async () => {
      const { createClientAnalyticsUninitialized } = await import('#/client/index');

      const invalidConfig = {} as any;

      expect(() => createClientAnalyticsUninitialized(invalidConfig)).not.toThrow();
    });

    test('should handle emitter creation errors', async () => {
      const { track } = await import('#/client/index');

      expect(() => track('test_event', {})).not.toThrow();
    });
  });
});
