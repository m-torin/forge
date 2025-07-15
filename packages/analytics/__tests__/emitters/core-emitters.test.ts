/**
 * Comprehensive tests for core analytics emitters
 * Tests the primary emitter functions following Segment.io specification
 */

import { beforeEach, describe, expect } from 'vitest';

import { alias, group, identify, page, screen, track } from '@/shared/emitters/emitters';

import type {
  EmitterAliasPayload,
  EmitterContext,
  EmitterGroupPayload,
  EmitterIdentifyPayload,
  EmitterOptions,
  EmitterPagePayload,
  EmitterTrackPayload,
} from '@/shared/emitters/emitter-types';

describe('core Analytics Emitters', () => {
  let mockTimestamp: Date;
  let mockContext: EmitterContext;
  let mockOptions: EmitterOptions;

  beforeEach(() => {
    mockTimestamp = new Date();
    mockContext = {
      app: {
        name: 'Test App',
        version: '1.0.0',
      },
      campaign: {
        name: 'test-campaign',
        medium: 'cpc',
        source: 'google',
      },
      page: {
        url: 'https://example.com/test',
        path: '/test',
        title: 'Test Page',
      },
    };
    mockOptions = {
      anonymousId: 'anon-123',
      context: mockContext,
      integrations: {
        'Facebook Pixel': false,
        'Google Analytics': true,
      },
      timestamp: mockTimestamp,
    };
  });

  describe('identify() emitter', () => {
    test('should create valid identify payload with minimal params', () => {
      const result = identify('user-123');

      expect(result).toStrictEqual({
        type: 'identify',
        userId: 'user-123',
      });
    });

    test('should create identify payload with traits', () => {
      const traits = {
        name: 'John Doe',
        age: 25,
        email: 'user@example.com',
        plan: 'premium',
      };

      const result = identify('user-123', traits);

      expect(result).toStrictEqual({
        type: 'identify',
        traits,
        userId: 'user-123',
      });
    });

    test('should create identify payload with full options', () => {
      const traits = { email: 'user@example.com' };
      const result = identify('user-123', traits, mockOptions);

      expect(result).toStrictEqual({
        type: 'identify',
        anonymousId: 'anon-123',
        context: mockContext,
        integrations: mockOptions.integrations,
        timestamp: mockTimestamp,
        traits,
        userId: 'user-123',
      });
    });

    test('should handle empty traits object', () => {
      const result = identify('user-123', {});

      expect(result).toStrictEqual({
        type: 'identify',
        traits: {},
        userId: 'user-123',
      });
    });

    test('should handle undefined traits', () => {
      const result = identify('user-123', undefined);

      expect(result).toStrictEqual({
        type: 'identify',
        userId: 'user-123',
      });
    });

    test('should preserve trait types correctly', () => {
      const traits = {
        array: ['a', 'b', 'c'],
        boolean: true,
        date: new Date('2024-01-01'),
        null: null,
        number: 42,
        object: { nested: 'value' },
        string: 'text',
        undefined: undefined,
      };

      const result = identify('user-123', traits);

      expect(result.traits).toStrictEqual(traits);
      expect(typeof result.traits?.string).toBe('string');
      expect(typeof result.traits?.number).toBe('number');
      expect(typeof result.traits?.boolean).toBe('boolean');
      expect(Array.isArray(result.traits?.array)).toBeTruthy();
    });
  });

  describe('track() emitter', () => {
    test('should create valid track payload with minimal params', () => {
      const result = track('Button Clicked');

      expect(result).toStrictEqual({
        type: 'track',
        event: 'Button Clicked',
      });
    });

    test('should create track payload with properties', () => {
      const properties = {
        button_id: 'cta-primary',
        page: 'homepage',
        revenue: 29.99,
        variant: 'blue',
      };

      const result = track('Button Clicked', properties);

      expect(result).toStrictEqual({
        type: 'track',
        event: 'Button Clicked',
        properties,
      });
    });

    test('should create track payload with full options', () => {
      const properties = { page: 'checkout' };
      const result = track('Purchase Completed', properties, mockOptions);

      expect(result).toStrictEqual({
        type: 'track',
        anonymousId: 'anon-123',
        context: mockContext,
        event: 'Purchase Completed',
        integrations: mockOptions.integrations,
        properties,
        timestamp: mockTimestamp,
      });
    });

    test('should handle complex property types', () => {
      const properties = {
        currency: 'USD',
        metadata: {
          feature_flags: {
            new_checkout: true,
            recommendations: false,
          },
          source: 'mobile_app',
          version: '2.1.0',
        },
        products: [
          { id: 'prod-1', name: 'Product 1', price: 10.99 },
          { id: 'prod-2', name: 'Product 2', price: 15.99 },
        ],
        timestamp: new Date().toISOString(),
        total: 26.98,
      };

      const result = track('Order Completed', properties);

      expect(result.properties).toStrictEqual(properties);
      expect(Array.isArray(result.properties?.products)).toBeTruthy();
      expect(typeof result.properties?.metadata).toBe('object');
    });

    test('should handle event names with special characters', () => {
      const specialEvents = [
        'Event with spaces',
        'Event-with-dashes',
        'Event_with_underscores',
        'Event.with.dots',
        'Event (with parentheses)',
        'Event/with/slashes',
        'Event:with:colons',
      ];

      specialEvents.forEach(eventName => {
        const result = track(eventName);
        expect(result.event).toBe(eventName);
        expect(result.type).toBe('track');
      });
    });

    test('should handle empty properties object', () => {
      const result = track('Event', {});

      expect(result).toStrictEqual({
        type: 'track',
        event: 'Event',
        properties: {},
      });
    });
  });

  describe('page() emitter', () => {
    test('should create valid page payload with no params', () => {
      const result = page();

      expect(result).toStrictEqual({
        type: 'page',
      });
    });

    test('should create page payload with category only', () => {
      const result = page('marketing');

      expect(result).toStrictEqual({
        type: 'page',
        properties: {
          category: 'marketing',
        },
      });
    });

    test('should create page payload with category and name', () => {
      const result = page('marketing', 'Landing Page');

      expect(result).toStrictEqual({
        name: 'Landing Page',
        type: 'page',
        properties: {
          category: 'marketing',
        },
      });
    });

    test('should create page payload with all parameters', () => {
      const properties = {
        url: 'https://example.com/products',
        path: '/products',
        referrer: 'https://google.com',
        title: 'Product Catalog',
      };

      const result = page('ecommerce', 'Product Catalog', properties);

      expect(result).toStrictEqual({
        name: 'Product Catalog',
        type: 'page',
        properties: {
          ...properties,
          category: 'ecommerce',
        },
      });
    });

    test('should merge category into properties correctly', () => {
      const properties = {
        category: 'existing_category', // Should be overridden
        existing_prop: 'value',
      };

      const result = page('new_category', 'Page Name', properties);

      expect(result.properties?.category).toBe('new_category');
      expect(result.properties?.existing_prop).toBe('value');
    });

    test('should handle full options', () => {
      const result = page('blog', 'Article', { author: 'John' }, mockOptions);

      expect(result).toStrictEqual({
        name: 'Article',
        type: 'page',
        anonymousId: 'anon-123',
        context: mockContext,
        integrations: mockOptions.integrations,
        properties: {
          author: 'John',
          category: 'blog',
        },
        timestamp: mockTimestamp,
      });
    });
  });

  describe('screen() emitter', () => {
    test('should create valid screen payload with minimal params', () => {
      const result = screen('Home Screen');

      expect(result).toStrictEqual({
        name: 'Home Screen',
        type: 'screen',
      });
    });

    test('should create screen payload with properties', () => {
      const properties = {
        build: '1234',
        previous_screen: 'Login Screen',
        version: '2.1.0',
      };

      const result = screen('Dashboard', properties);

      expect(result).toStrictEqual({
        name: 'Dashboard',
        type: 'screen',
        properties,
      });
    });

    test('should create screen payload with full options', () => {
      const properties = { tab: 'profile' };
      const result = screen('Settings Screen', properties, mockOptions);

      expect(result).toStrictEqual({
        name: 'Settings Screen',
        type: 'screen',
        anonymousId: 'anon-123',
        context: mockContext,
        integrations: mockOptions.integrations,
        properties,
        timestamp: mockTimestamp,
      });
    });
  });

  describe('group() emitter', () => {
    test('should create valid group payload with minimal params', () => {
      const result = group('group-123');

      expect(result).toStrictEqual({
        type: 'group',
        groupId: 'group-123',
      });
    });

    test('should create group payload with traits', () => {
      const traits = {
        name: 'Acme Corp',
        employees: 100,
        industry: 'Technology',
        plan: 'enterprise',
      };

      const result = group('group-123', traits);

      expect(result).toStrictEqual({
        type: 'group',
        groupId: 'group-123',
        traits,
      });
    });

    test('should create group payload with full options', () => {
      const traits = { name: 'Test Organization' };
      const result = group('group-123', traits, mockOptions);

      expect(result).toStrictEqual({
        type: 'group',
        anonymousId: 'anon-123',
        context: mockContext,
        groupId: 'group-123',
        integrations: mockOptions.integrations,
        timestamp: mockTimestamp,
        traits,
      });
    });
  });

  describe('alias() emitter', () => {
    test('should create valid alias payload with minimal params', () => {
      const result = alias('new-user-id', 'old-user-id');

      expect(result).toStrictEqual({
        type: 'alias',
        previousId: 'old-user-id',
        userId: 'new-user-id',
      });
    });

    test('should create alias payload with previous user ID', () => {
      const result = alias('new-user-id', 'old-user-id');

      expect(result).toStrictEqual({
        type: 'alias',
        previousId: 'old-user-id',
        userId: 'new-user-id',
      });
    });

    test('should create alias payload with full options', () => {
      const result = alias('new-user-id', 'old-user-id', mockOptions);

      expect(result).toStrictEqual({
        type: 'alias',
        anonymousId: 'anon-123',
        context: mockContext,
        integrations: mockOptions.integrations,
        previousId: 'old-user-id',
        timestamp: mockTimestamp,
        userId: 'new-user-id',
      });
    });
  });

  describe('options handling', () => {
    test('should handle partial options correctly', () => {
      const partialOptions: EmitterOptions = {
        context: { app: { name: 'Test' } },
        timestamp: mockTimestamp,
      };

      const result = track('Test Event', {}, partialOptions);

      expect(result.timestamp).toBe(mockTimestamp);
      expect(result.context).toStrictEqual({ app: { name: 'Test' } });
      expect(result.anonymousId).toBeUndefined();
      expect(result.integrations).toBeUndefined();
    });

    test('should handle empty options object', () => {
      const result = track('Test Event', {}, {});

      expect(result).toStrictEqual({
        type: 'track',
        event: 'Test Event',
        properties: {},
      });
    });

    test('should handle undefined options', () => {
      const result = track('Test Event', {}, undefined);

      expect(result).toStrictEqual({
        type: 'track',
        event: 'Test Event',
        properties: {},
      });
    });
  });

  describe('context handling', () => {
    test('should handle complex context objects', () => {
      const complexContext: EmitterContext = {
        app: {
          name: 'My App',
          namespace: 'com.example.app',
          build: '456',
          version: '1.2.3',
        },
        campaign: {
          name: 'Summer Sale',
          content: 'cta-button',
          custom_param: 'custom_value',
          medium: 'newsletter',
          source: 'email',
          term: 'discount',
        },
        device: {
          id: 'device-123',
          name: "John's iPhone",
          type: 'mobile',
          adTrackingEnabled: true,
          advertisingId: 'ad-id-123',
          manufacturer: 'Apple',
          model: 'iPhone 15',
          version: '17.0',
        },
        ip: '192.168.1.1',
        library: {
          name: '@repo/analytics',
          version: '1.0.0',
        },
        locale: 'en-US',
        location: {
          city: 'San Francisco',
          country: 'United States',
          latitude: 37.7749,
          longitude: -122.4194,
          region: 'CA',
        },
        network: {
          bluetooth: false,
          carrier: 'Verizon',
          cellular: true,
          wifi: true,
        },
        os: {
          name: 'iOS',
          version: '17.0',
        },
        page: {
          url: 'https://example.com/products/123',
          path: '/products/123',
          referrer: 'https://google.com/search',
          search: '?utm_source=google',
          title: 'Product Details',
        },
        screen: {
          width: 375,
          density: 3,
          height: 812,
        },
        timezone: 'America/Los_Angeles',
        traits: {
          name: 'John Doe',
          email: 'user@example.com',
        },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
      };

      const result = track('Complex Context Test', {}, { context: complexContext });

      expect(result.context).toStrictEqual(complexContext);
      expect(result.context?.app?.name).toBe('My App');
      expect(result.context?.device?.manufacturer).toBe('Apple');
      expect(result.context?.location?.city).toBe('San Francisco');
    });
  });

  describe('integration settings', () => {
    test('should handle integration settings correctly', () => {
      const integrations = {
        'Custom Integration': {
          apiKey: 'custom-key',
          endpoint: 'https://api.custom.com',
        },
        'Facebook Pixel': false,
        'Google Analytics': {
          trackingId: 'GA-123456789',
        },
        Mixpanel: true,
      };

      const result = track('Integration Test', {}, { integrations });

      expect(result.integrations).toStrictEqual(integrations);
    });
  });

  describe('type safety and validation', () => {
    test('should maintain proper TypeScript types', () => {
      // Test that return types are properly typed
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

    test('should handle edge cases gracefully', () => {
      // Empty strings
      expect(track('').event).toBe('');
      expect(identify('').userId).toBe('');

      // Special characters in IDs
      const specialId = 'user@example.com:123/456';
      expect(identify(specialId).userId).toBe(specialId);

      // Very long strings
      const longString = 'a'.repeat(1000);
      expect(track(longString).event).toBe(longString);
    });
  });

  describe('performance considerations', () => {
    test('should handle large payloads efficiently', () => {
      const largeProperties = Array.from({ length: 100 }, (_, i) => [
        `prop_${i}`,
        `value_${i}`,
      ]).reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

      const start = performance.now();
      const result = track('Large Payload Test', largeProperties);
      const duration = performance.now() - start;

      expect(result.properties).toStrictEqual(largeProperties);
      expect(duration).toBeLessThan(10); // Should complete in <10ms
    });

    test('should handle many emitter calls efficiently', () => {
      const start = performance.now();

      const results = Array.from({ length: 1000 }, (_, i) => track(`Event ${i}`, { index: i }));

      const duration = performance.now() - start;

      expect(results).toHaveLength(1000);
      expect(results[0].event).toBe('Event 0');
      expect(results[999].event).toBe('Event 999');
      expect(duration).toBeLessThan(100); // Should complete in <100ms
    });
  });
});
