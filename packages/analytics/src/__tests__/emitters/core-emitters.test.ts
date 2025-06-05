/**
 * Comprehensive tests for core analytics emitters
 * Tests the primary emitter functions following Segment.io specification
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  track,
  identify,
  page,
  screen,
  group,
  alias
} from '../../shared/emitters/emitters';
import type {
  EmitterTrackPayload,
  EmitterIdentifyPayload,
  EmitterPagePayload,
  EmitterScreenPayload,
  EmitterGroupPayload,
  EmitterAliasPayload,
  EmitterOptions,
  EmitterContext
} from '../../shared/emitters/emitter-types';

describe('Core Analytics Emitters', () => {
  let mockTimestamp: number;
  let mockContext: EmitterContext;
  let mockOptions: EmitterOptions;

  beforeEach(() => {
    mockTimestamp = Date.now();
    mockContext = {
      app: {
        name: 'Test App',
        version: '1.0.0'
      },
      page: {
        path: '/test',
        url: 'https://example.com/test',
        title: 'Test Page'
      },
      campaign: {
        source: 'google',
        medium: 'cpc',
        name: 'test-campaign'
      }
    };
    mockOptions = {
      timestamp: mockTimestamp,
      context: mockContext,
      anonymousId: 'anon-123',
      integrations: {
        'Google Analytics': true,
        'Facebook Pixel': false
      }
    };
  });

  describe('identify() emitter', () => {
    it('should create valid identify payload with minimal params', () => {
      const result = identify('user-123');
      
      expect(result).toEqual({
        type: 'identify',
        userId: 'user-123'
      });
    });

    it('should create identify payload with traits', () => {
      const traits = {
        email: 'user@example.com',
        name: 'John Doe',
        plan: 'premium',
        age: 25
      };

      const result = identify('user-123', traits);
      
      expect(result).toEqual({
        type: 'identify',
        userId: 'user-123',
        traits
      });
    });

    it('should create identify payload with full options', () => {
      const traits = { email: 'user@example.com' };
      const result = identify('user-123', traits, mockOptions);
      
      expect(result).toEqual({
        type: 'identify',
        userId: 'user-123',
        traits,
        timestamp: mockTimestamp,
        context: mockContext,
        anonymousId: 'anon-123',
        integrations: mockOptions.integrations
      });
    });

    it('should handle empty traits object', () => {
      const result = identify('user-123', {});
      
      expect(result).toEqual({
        type: 'identify',
        userId: 'user-123',
        traits: {}
      });
    });

    it('should handle undefined traits', () => {
      const result = identify('user-123', undefined);
      
      expect(result).toEqual({
        type: 'identify',
        userId: 'user-123'
      });
    });

    it('should preserve trait types correctly', () => {
      const traits = {
        string: 'text',
        number: 42,
        boolean: true,
        array: ['a', 'b', 'c'],
        object: { nested: 'value' },
        date: new Date('2024-01-01'),
        null: null,
        undefined: undefined
      };

      const result = identify('user-123', traits);
      
      expect(result.traits).toEqual(traits);
      expect(typeof result.traits?.string).toBe('string');
      expect(typeof result.traits?.number).toBe('number');
      expect(typeof result.traits?.boolean).toBe('boolean');
      expect(Array.isArray(result.traits?.array)).toBe(true);
    });
  });

  describe('track() emitter', () => {
    it('should create valid track payload with minimal params', () => {
      const result = track('Button Clicked');
      
      expect(result).toEqual({
        type: 'track',
        event: 'Button Clicked'
      });
    });

    it('should create track payload with properties', () => {
      const properties = {
        button_id: 'cta-primary',
        page: 'homepage',
        variant: 'blue',
        revenue: 29.99
      };

      const result = track('Button Clicked', properties);
      
      expect(result).toEqual({
        type: 'track',
        event: 'Button Clicked',
        properties
      });
    });

    it('should create track payload with full options', () => {
      const properties = { page: 'checkout' };
      const result = track('Purchase Completed', properties, mockOptions);
      
      expect(result).toEqual({
        type: 'track',
        event: 'Purchase Completed',
        properties,
        timestamp: mockTimestamp,
        context: mockContext,
        anonymousId: 'anon-123',
        integrations: mockOptions.integrations
      });
    });

    it('should handle complex property types', () => {
      const properties = {
        products: [
          { id: 'prod-1', name: 'Product 1', price: 10.99 },
          { id: 'prod-2', name: 'Product 2', price: 15.99 }
        ],
        metadata: {
          source: 'mobile_app',
          version: '2.1.0',
          feature_flags: {
            new_checkout: true,
            recommendations: false
          }
        },
        total: 26.98,
        currency: 'USD',
        timestamp: new Date().toISOString()
      };

      const result = track('Order Completed', properties);
      
      expect(result.properties).toEqual(properties);
      expect(Array.isArray(result.properties?.products)).toBe(true);
      expect(typeof result.properties?.metadata).toBe('object');
    });

    it('should handle event names with special characters', () => {
      const specialEvents = [
        'Event with spaces',
        'Event-with-dashes',
        'Event_with_underscores',
        'Event.with.dots',
        'Event (with parentheses)',
        'Event/with/slashes',
        'Event:with:colons'
      ];

      specialEvents.forEach(eventName => {
        const result = track(eventName);
        expect(result.event).toBe(eventName);
        expect(result.type).toBe('track');
      });
    });

    it('should handle empty properties object', () => {
      const result = track('Event', {});
      
      expect(result).toEqual({
        type: 'track',
        event: 'Event',
        properties: {}
      });
    });
  });

  describe('page() emitter', () => {
    it('should create valid page payload with no params', () => {
      const result = page();
      
      expect(result).toEqual({
        type: 'page'
      });
    });

    it('should create page payload with category only', () => {
      const result = page('marketing');
      
      expect(result).toEqual({
        type: 'page',
        properties: {
          category: 'marketing'
        }
      });
    });

    it('should create page payload with category and name', () => {
      const result = page('marketing', 'Landing Page');
      
      expect(result).toEqual({
        type: 'page',
        name: 'Landing Page',
        properties: {
          category: 'marketing'
        }
      });
    });

    it('should create page payload with all parameters', () => {
      const properties = {
        url: 'https://example.com/products',
        path: '/products',
        title: 'Product Catalog',
        referrer: 'https://google.com'
      };

      const result = page('ecommerce', 'Product Catalog', properties);
      
      expect(result).toEqual({
        type: 'page',
        name: 'Product Catalog',
        properties: {
          ...properties,
          category: 'ecommerce'
        }
      });
    });

    it('should merge category into properties correctly', () => {
      const properties = {
        existing_prop: 'value',
        category: 'existing_category'  // Should be overridden
      };

      const result = page('new_category', 'Page Name', properties);
      
      expect(result.properties?.category).toBe('new_category');
      expect(result.properties?.existing_prop).toBe('value');
    });

    it('should handle full options', () => {
      const result = page('blog', 'Article', { author: 'John' }, mockOptions);
      
      expect(result).toEqual({
        type: 'page',
        name: 'Article',
        properties: {
          author: 'John',
          category: 'blog'
        },
        timestamp: mockTimestamp,
        context: mockContext,
        anonymousId: 'anon-123',
        integrations: mockOptions.integrations
      });
    });
  });

  describe('screen() emitter', () => {
    it('should create valid screen payload with minimal params', () => {
      const result = screen('Home Screen');
      
      expect(result).toEqual({
        type: 'screen',
        name: 'Home Screen'
      });
    });

    it('should create screen payload with properties', () => {
      const properties = {
        version: '2.1.0',
        build: '1234',
        previous_screen: 'Login Screen'
      };

      const result = screen('Dashboard', properties);
      
      expect(result).toEqual({
        type: 'screen',
        name: 'Dashboard',
        properties
      });
    });

    it('should create screen payload with full options', () => {
      const properties = { tab: 'profile' };
      const result = screen('Settings Screen', properties, mockOptions);
      
      expect(result).toEqual({
        type: 'screen',
        name: 'Settings Screen',
        properties,
        timestamp: mockTimestamp,
        context: mockContext,
        anonymousId: 'anon-123',
        integrations: mockOptions.integrations
      });
    });
  });

  describe('group() emitter', () => {
    it('should create valid group payload with minimal params', () => {
      const result = group('group-123');
      
      expect(result).toEqual({
        type: 'group',
        groupId: 'group-123'
      });
    });

    it('should create group payload with traits', () => {
      const traits = {
        name: 'Acme Corp',
        industry: 'Technology',
        employees: 100,
        plan: 'enterprise'
      };

      const result = group('group-123', traits);
      
      expect(result).toEqual({
        type: 'group',
        groupId: 'group-123',
        traits
      });
    });

    it('should create group payload with full options', () => {
      const traits = { name: 'Test Organization' };
      const result = group('group-123', traits, mockOptions);
      
      expect(result).toEqual({
        type: 'group',
        groupId: 'group-123',
        traits,
        timestamp: mockTimestamp,
        context: mockContext,
        anonymousId: 'anon-123',
        integrations: mockOptions.integrations
      });
    });
  });

  describe('alias() emitter', () => {
    it('should create valid alias payload with minimal params', () => {
      const result = alias('new-user-id');
      
      expect(result).toEqual({
        type: 'alias',
        userId: 'new-user-id'
      });
    });

    it('should create alias payload with previous user ID', () => {
      const result = alias('new-user-id', 'old-user-id');
      
      expect(result).toEqual({
        type: 'alias',
        userId: 'new-user-id',
        previousId: 'old-user-id'
      });
    });

    it('should create alias payload with full options', () => {
      const result = alias('new-user-id', 'old-user-id', mockOptions);
      
      expect(result).toEqual({
        type: 'alias',
        userId: 'new-user-id',
        previousId: 'old-user-id',
        timestamp: mockTimestamp,
        context: mockContext,
        anonymousId: 'anon-123',
        integrations: mockOptions.integrations
      });
    });
  });

  describe('Options handling', () => {
    it('should handle partial options correctly', () => {
      const partialOptions: EmitterOptions = {
        timestamp: mockTimestamp,
        context: { app: { name: 'Test' } }
      };

      const result = track('Test Event', {}, partialOptions);
      
      expect(result.timestamp).toBe(mockTimestamp);
      expect(result.context).toEqual({ app: { name: 'Test' } });
      expect(result.anonymousId).toBeUndefined();
      expect(result.integrations).toBeUndefined();
    });

    it('should handle empty options object', () => {
      const result = track('Test Event', {}, {});
      
      expect(result).toEqual({
        type: 'track',
        event: 'Test Event',
        properties: {}
      });
    });

    it('should handle undefined options', () => {
      const result = track('Test Event', {}, undefined);
      
      expect(result).toEqual({
        type: 'track',
        event: 'Test Event',
        properties: {}
      });
    });
  });

  describe('Context handling', () => {
    it('should handle complex context objects', () => {
      const complexContext: EmitterContext = {
        app: {
          name: 'My App',
          version: '1.2.3',
          build: '456',
          namespace: 'com.example.app'
        },
        campaign: {
          name: 'Summer Sale',
          source: 'email',
          medium: 'newsletter',
          term: 'discount',
          content: 'cta-button',
          custom_param: 'custom_value'
        },
        device: {
          id: 'device-123',
          manufacturer: 'Apple',
          model: 'iPhone 15',
          name: 'John\'s iPhone',
          type: 'mobile',
          version: '17.0',
          advertisingId: 'ad-id-123',
          adTrackingEnabled: true
        },
        ip: '192.168.1.1',
        library: {
          name: '@repo/analytics',
          version: '1.0.0'
        },
        locale: 'en-US',
        location: {
          city: 'San Francisco',
          country: 'United States',
          latitude: 37.7749,
          longitude: -122.4194,
          region: 'CA'
        },
        network: {
          bluetooth: false,
          carrier: 'Verizon',
          cellular: true,
          wifi: true
        },
        os: {
          name: 'iOS',
          version: '17.0'
        },
        page: {
          path: '/products/123',
          referrer: 'https://google.com/search',
          search: '?utm_source=google',
          title: 'Product Details',
          url: 'https://example.com/products/123'
        },
        screen: {
          density: 3,
          height: 812,
          width: 375
        },
        timezone: 'America/Los_Angeles',
        traits: {
          email: 'user@example.com',
          name: 'John Doe'
        },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
      };

      const result = track('Complex Context Test', {}, { context: complexContext });
      
      expect(result.context).toEqual(complexContext);
      expect(result.context?.app?.name).toBe('My App');
      expect(result.context?.device?.manufacturer).toBe('Apple');
      expect(result.context?.location?.city).toBe('San Francisco');
    });
  });

  describe('Integration settings', () => {
    it('should handle integration settings correctly', () => {
      const integrations = {
        'Google Analytics': {
          trackingId: 'GA-123456789'
        },
        'Facebook Pixel': false,
        'Mixpanel': true,
        'Custom Integration': {
          apiKey: 'custom-key',
          endpoint: 'https://api.custom.com'
        }
      };

      const result = track('Integration Test', {}, { integrations });
      
      expect(result.integrations).toEqual(integrations);
    });
  });

  describe('Type safety and validation', () => {
    it('should maintain proper TypeScript types', () => {
      // Test that return types are properly typed
      const trackResult: EmitterTrackPayload = track('Test');
      const identifyResult: EmitterIdentifyPayload = identify('user-123');
      const pageResult: EmitterPagePayload = page();
      const groupResult: EmitterGroupPayload = group('group-123');
      const aliasResult: EmitterAliasPayload = alias('new-id');

      expect(trackResult.type).toBe('track');
      expect(identifyResult.type).toBe('identify');
      expect(pageResult.type).toBe('page');
      expect(groupResult.type).toBe('group');
      expect(aliasResult.type).toBe('alias');
    });

    it('should handle edge cases gracefully', () => {
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

  describe('Performance considerations', () => {
    it('should handle large payloads efficiently', () => {
      const largeProperties = Array.from({ length: 100 }, (_, i) => [`prop_${i}`, `value_${i}`])
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

      const start = performance.now();
      const result = track('Large Payload Test', largeProperties);
      const duration = performance.now() - start;

      expect(result.properties).toEqual(largeProperties);
      expect(duration).toBeLessThan(10); // Should complete in <10ms
    });

    it('should handle many emitter calls efficiently', () => {
      const start = performance.now();
      
      const results = Array.from({ length: 1000 }, (_, i) => 
        track(`Event ${i}`, { index: i })
      );
      
      const duration = performance.now() - start;

      expect(results).toHaveLength(1000);
      expect(results[0].event).toBe('Event 0');
      expect(results[999].event).toBe('Event 999');
      expect(duration).toBeLessThan(100); // Should complete in <100ms
    });
  });
});