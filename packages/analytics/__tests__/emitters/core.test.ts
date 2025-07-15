/**
 * Comprehensive tests for core analytics emitters
 * Tests the primary emitter functions following Segment.io specification
 */

import { alias, group, identify, page, track } from '#/shared/emitters/emitters';
import { describe, expect, test } from 'vitest';
import { createEmitterTestSuite, createScenarios, createTestData } from '../setup';

import type {
  EmitterAliasPayload,
  EmitterGroupPayload,
  EmitterIdentifyPayload,
  EmitterPagePayload,
  EmitterTrackPayload,
} from '#/shared/emitters/emitter-types';

describe('core Analytics Emitters', () => {
  const testOptions = createTestData.options();

  // Use factory-based testing for identify emitter
  createEmitterTestSuite<EmitterIdentifyPayload>({
    emitterName: 'identify',
    emitterFunction: identify,
    expectedType: 'identify',
    scenarios: [
      createScenarios.minimal('identify', ['user-123'], { userId: 'user-123' }),
      createScenarios.fullOptions('identify', ['user-123', createTestData.userTraits()], {
        userId: 'user-123',
        traits: createTestData.userTraits(),
      }),
      createScenarios.typeSafety('identify', ['user-123'], 'identify'),
      createScenarios.edgeCases('identify', [''], 'handles empty user ID'),
      {
        name: 'traits handling',
        description: 'should handle various trait types correctly',
        args: ['user-123', createTestData.userTraits()],
        validate: result => {
          expect(result.traits).toBeDefined();
          expect(typeof result.traits?.name).toBe('string');
          expect(typeof result.traits?.age).toBe('number');
          expect(typeof result.traits?.email).toBe('string');
        },
      },
      {
        name: 'undefined traits',
        description: 'should handle undefined traits gracefully',
        args: ['user-123', undefined],
        validate: result => {
          expect(result.userId).toBe('user-123');
          expect(result.traits).toBeUndefined();
        },
      },
    ],
  });

  // Use factory-based testing for track emitter
  createEmitterTestSuite<EmitterTrackPayload>({
    emitterName: 'track',
    emitterFunction: track,
    expectedType: 'track',
    scenarios: [
      createScenarios.minimal('track', ['Button Clicked'], { event: 'Button Clicked' }),
      createScenarios.fullOptions('track', ['Purchase Completed', { page: 'checkout' }], {
        event: 'Purchase Completed',
        properties: { page: 'checkout' },
      }),
      createScenarios.typeSafety('track', ['Test Event'], 'track'),
      createScenarios.edgeCases('track', [''], 'handles empty event name'),
      {
        name: 'properties handling',
        description: 'should handle complex property types correctly',
        args: [
          'Order Completed',
          {
            currency: 'USD',
            total: 26.98,
            products: [
              { id: 'prod-1', name: 'Product 1', price: 10.99 },
              { id: 'prod-2', name: 'Product 2', price: 15.99 },
            ],
            metadata: {
              feature_flags: { new_checkout: true, recommendations: false },
              source: 'mobile_app',
              version: '2.1.0',
            },
          },
        ],
        validate: result => {
          expect(result.properties).toBeDefined();
          expect(Array.isArray(result.properties?.products)).toBeTruthy();
          expect(typeof result.properties?.metadata).toBe('object');
          expect(typeof result.properties?.total).toBe('number');
        },
      },
      {
        name: 'special characters',
        description: 'should handle event names with special characters',
        args: ['Event with spaces & symbols!@#$%'],
        validate: result => {
          expect(result.event).toBe('Event with spaces & symbols!@#$%');
          expect(result.type).toBe('track');
        },
      },
    ],
  });

  // Use factory-based testing for page emitter
  createEmitterTestSuite<EmitterPagePayload>({
    emitterName: 'page',
    emitterFunction: page,
    expectedType: 'page',
    scenarios: [
      createScenarios.minimal('page', [], {}),
      createScenarios.fullOptions('page', ['blog', 'Article', { author: 'John' }], {
        name: 'Article',
        properties: { author: 'John', category: 'blog' },
      }),
      createScenarios.typeSafety('page', ['marketing', 'Landing Page'], 'page'),
      {
        name: 'category handling',
        description: 'should merge category into properties correctly',
        args: [
          'new_category',
          'Page Name',
          { category: 'existing_category', existing_prop: 'value' },
        ],
        validate: result => {
          expect(result.properties?.category).toBe('new_category');
          expect(result.properties?.existing_prop).toBe('value');
        },
      },
    ],
  });

  // Use factory-based testing for remaining emitters
  createEmitterTestSuite({
    emitterName: 'group',
    emitterFunction: group,
    expectedType: 'group',
    scenarios: [
      createScenarios.minimal('group', ['group-123'], { groupId: 'group-123' }),
      createScenarios.fullOptions('group', ['group-123', createTestData.groupTraits()], {
        groupId: 'group-123',
        traits: createTestData.groupTraits(),
      }),
      createScenarios.typeSafety('group', ['group-123'], 'group'),
    ],
  });

  createEmitterTestSuite<EmitterAliasPayload>({
    emitterName: 'alias',
    emitterFunction: alias,
    expectedType: 'alias',
    scenarios: [
      createScenarios.minimal('alias', ['new-user-id', 'old-user-id'], {
        userId: 'new-user-id',
        previousId: 'old-user-id',
      }),
      createScenarios.fullOptions('alias', ['new-user-id', 'old-user-id'], {
        userId: 'new-user-id',
        previousId: 'old-user-id',
      }),
      createScenarios.typeSafety('alias', ['new-id', 'old-id'], 'alias'),
    ],
  });

  // Performance tests using factory
  describe('performance tests', () => {
    test('should handle large payloads efficiently', () => {
      const largeProperties = Array.from({ length: 100 }, (_, i) => [
        `prop_${i}`,
        `value_${i}`,
      ]).reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

      const start = performance.now();
      const result = track('Large Payload Test', largeProperties);
      const duration = performance.now() - start;

      expect(result.properties).toStrictEqual(largeProperties);
      expect(duration).toBeLessThan(10);
    });

    test('should handle many emitter calls efficiently', () => {
      const start = performance.now();
      const results = Array.from({ length: 1000 }, (_, i) => track(`Event ${i}`, { index: i }));
      const duration = performance.now() - start;

      expect(results).toHaveLength(1000);
      expect(results[0].event).toBe('Event 0');
      expect(results[999].event).toBe('Event 999');
      expect(duration).toBeLessThan(100);
    });
  });

  // Context and integration tests
  describe('context and integration handling', () => {
    test('should handle complex context objects', () => {
      const complexContext = createTestData.context({
        device: { manufacturer: 'Apple', model: 'iPhone 15' },
        location: { city: 'San Francisco', region: 'CA' },
      });

      const result = track('Complex Context Test', {}, { context: complexContext });

      expect(result.context).toStrictEqual(complexContext);
      expect(result.context?.device?.manufacturer).toBe('Apple');
      expect(result.context?.location?.city).toBe('San Francisco');
    });

    test('should handle integration settings correctly', () => {
      const integrations = {
        'Google Analytics': { trackingId: 'GA-123456789' },
        'Facebook Pixel': false,
        Mixpanel: true,
      };

      const result = track('Integration Test', {}, { integrations });
      expect(result.integrations).toStrictEqual(integrations);
    });

    test('should maintain proper TypeScript types', () => {
      const trackResult: EmitterTrackPayload = track('Test');
      const identifyResult: EmitterIdentifyPayload = identify('user-123');
      const pageResult: EmitterPagePayload = page();
      const groupResult: EmitterGroupPayload = group('group-123');
      const aliasResult: EmitterAliasPayload = alias('new-id', 'old-id');

      expect(trackResult.type).toBe('track');
      expect(identifyResult.type).toBe('identify');
      expect(pageResult.type).toBe('page');
      expect(groupResult.type).toBe('group');
      expect(aliasResult.type).toBe('alias');
    });
  });
});
