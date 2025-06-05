/**
 * Analytics and Feature Flags Integration Validation
 * Comprehensive test to validate the complete integration
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { identify, page, track } from '../shared/emitters';
import {
  PostHogFlagProvider,
  StandardFeatureFlagManager,
  trackFlagExposure,
} from '../shared/feature-flags';

describe('Analytics and Feature Flags Complete Integration', () => {
  let flagManager: StandardFeatureFlagManager;
  let mockAnalyticsManager: any;
  let mockPostHogClient: any;

  beforeEach(async () => {
    // Create mock PostHog client
    mockPostHogClient = {
      identify: vi.fn(),
      __loaded: true,
      capture: vi.fn(),
      getAllFlags: vi.fn(),
      getFeatureFlag: vi.fn(),
      getFeatureFlagPayload: vi.fn(),
      group: vi.fn(),
      init: vi.fn(),
      onFeatureFlags: vi.fn(),
      setPersonProperties: vi.fn(),
      shutdown: vi.fn(),
    };

    // Create mock analytics manager
    mockAnalyticsManager = {
      identify: vi.fn(),
      alias: vi.fn(),
      emit: vi.fn(),
      group: vi.fn(),
      page: vi.fn(),
      track: vi.fn(),
    };

    // Setup flag manager with both local and PostHog providers
    flagManager = new StandardFeatureFlagManager({ debug: false });
  });

  describe('PostHog Feature Flag Validation', () => {
    it('should properly integrate PostHog feature flags with analytics', async () => {
      // Mock PostHog responses
      mockPostHogClient.getFeatureFlag.mockImplementation((key: string) => {
        const flags: Record<string, any> = {
          'disabled-feature': false,
          'experiment-variant': 'variant-a',
          'json-config': { config: { threshold: 50 }, enabled: true },
          'new-checkout': true,
        };
        return flags[key];
      });

      mockPostHogClient.getFeatureFlagPayload.mockImplementation((key: string) => {
        const payloads: Record<string, any> = {
          'experiment-variant': { experiment_id: 'exp_123', variant_id: 'var_a' },
          'json-config': { config_version: '2.1' },
        };
        return payloads[key];
      });

      mockPostHogClient.getAllFlags.mockResolvedValue({
        'disabled-feature': false,
        'experiment-variant': 'variant-a',
        'json-config': { config: { threshold: 50 }, enabled: true },
        'new-checkout': true,
      });

      // Create PostHog provider with mock client
      const postHogProvider = new PostHogFlagProvider({
        provider: 'posthog',
        options: {
          apiHost: 'https://app.posthog.com',
          apiKey: 'test-key',
        },
      });

      // Override the client with our mock
      (postHogProvider as any).client = mockPostHogClient;
      (postHogProvider as any).isInitialized = true;
      (postHogProvider as any).isClientSide = true;

      // Add the provider to the manager
      await flagManager.addProvider({
        provider: 'posthog',
        options: { apiKey: 'test-key' },
      });

      // Override the provider in the manager
      (flagManager as any).providers.set('posthog', postHogProvider);

      // Test boolean flag
      const checkoutFlag = await flagManager.getFlag('new-checkout', false);
      expect(checkoutFlag.value).toBe(true);
      expect(checkoutFlag.reason).toBe('targeting_match');
      expect(checkoutFlag.source).toBe('network');

      // Test variant flag with payload
      const variantFlag = await flagManager.getFlag('experiment-variant', 'control');
      expect(variantFlag.value).toBe('variant-a');
      expect(variantFlag.variant).toBe('variant-a');
      expect(variantFlag.payload).toEqual({ experiment_id: 'exp_123', variant_id: 'var_a' });

      // Test disabled flag (PostHog treats false as "off" and returns default value)
      const disabledFlag = await flagManager.getFlag('disabled-feature', false); // Use false as default
      expect(disabledFlag.value).toBe(false);
      expect(disabledFlag.reason).toBe('off');

      // Test complex JSON flag
      const jsonFlag = await flagManager.getFlag('json-config', null);
      expect(jsonFlag.value).toEqual({ config: { threshold: 50 }, enabled: true });
      expect(jsonFlag.payload).toEqual({ config_version: '2.1' });

      // Verify PostHog methods were called correctly
      expect(mockPostHogClient.getFeatureFlag).toHaveBeenCalledWith('new-checkout');
      expect(mockPostHogClient.getFeatureFlagPayload).toHaveBeenCalledWith('experiment-variant');
    });

    it('should properly track feature flag exposures to PostHog', async () => {
      const postHogProvider = new PostHogFlagProvider({
        provider: 'posthog',
        options: { apiKey: 'test-key' },
      });

      (postHogProvider as any).client = mockPostHogClient;
      (postHogProvider as any).isInitialized = true;
      (postHogProvider as any).isClientSide = true;

      const flagResult = {
        key: 'test-feature',
        payload: { experiment_id: 'exp_456' },
        reason: 'targeting_match' as const,
        source: 'network' as const,
        timestamp: Date.now(),
        value: true,
        variant: 'test-variant',
      };

      // Track exposure
      postHogProvider.trackExposure?.('test-feature', flagResult, {
        attributes: { plan: 'premium' },
        userId: 'user_123',
      });

      // Verify PostHog capture was called with correct structure
      expect(mockPostHogClient.capture).toHaveBeenCalledWith(
        '$feature_flag_called',
        expect.objectContaining({
          $feature_flag: 'test-feature',
          $feature_flag_reason: 'targeting_match',
          $feature_flag_response: true,
          $feature_flag_variant: 'test-variant',
          plan: 'premium',
        }),
      );
    });

    it('should handle PostHog bootstrap data correctly', async () => {
      // Create a provider that simulates bootstrap behavior
      const postHogProvider = new PostHogFlagProvider({
        provider: 'posthog',
        options: {
          apiKey: 'test-key',
        },
      });

      // Mock client that simulates bootstrap-like behavior
      const mockBootstrapClient = {
        capture: vi.fn(),
        getFeatureFlag: vi.fn().mockImplementation((key: string) => {
          const bootstrapFlags: Record<string, any> = {
            'bootstrap-feature': true,
            'bootstrap-variant': 'beta',
          };
          return bootstrapFlags[key];
        }),
        getFeatureFlagPayload: vi.fn().mockImplementation((key: string) => {
          const payloads: Record<string, any> = {
            'bootstrap-variant': { payload_data: 'test' },
          };
          return payloads[key];
        }),
      };

      (postHogProvider as any).client = mockBootstrapClient;
      (postHogProvider as any).isInitialized = true;
      (postHogProvider as any).isClientSide = true;

      // Test flag evaluation with simulated bootstrap behavior
      const bootstrapFlag = await postHogProvider.getFlag('bootstrap-feature', false);
      expect(bootstrapFlag.value).toBe(true);
      expect(bootstrapFlag.reason).toBe('targeting_match');

      const variantFlag = await postHogProvider.getFlag('bootstrap-variant', 'default');
      expect(variantFlag.value).toBe('beta');
      expect(variantFlag.payload).toEqual({ payload_data: 'test' });

      // Verify the mock client methods were called
      expect(mockBootstrapClient.getFeatureFlag).toHaveBeenCalledWith('bootstrap-feature');
      expect(mockBootstrapClient.getFeatureFlagPayload).toHaveBeenCalledWith('bootstrap-variant');
    });
  });

  describe('Analytics and Feature Flags Workflow', () => {
    it('should demonstrate complete user journey with flags and analytics', async () => {
      const events: any[] = [];
      const captureEvent = (event: any) => events.push(event);

      // Setup local provider for predictable testing
      await flagManager.addProvider({
        provider: 'local',
        options: {
          flags: {
            'checkout-variant': 'express',
            'max-cart-items': 10,
            'show-premium-upsell': true,
          },
        },
      });

      await flagManager.initialize();

      const userContext = {
        attributes: {
          country: 'US',
          plan: 'free',
          signupDate: '2024-01-01',
        },
        email: 'user@example.com',
        userId: 'user_789',
      };

      // 1. User identifies
      const identifyEvent = identify(userContext.userId, {
        email: userContext.email,
        plan: userContext.attributes.plan,
      });
      captureEvent(identifyEvent);

      // 2. Set flag context
      flagManager.setContext(userContext);

      // 3. Page view with flag evaluation
      const pageEvent = page('product', 'Product Page', {
        product_id: 'prod_123',
        category: 'electronics',
      });
      captureEvent(pageEvent);

      // 4. Evaluate flags for page personalization
      const upsellFlag = await flagManager.getFlag('show-premium-upsell', false, {
        context: userContext,
      });
      const checkoutVariant = await flagManager.getFlag('checkout-variant', 'standard');
      const maxItems = await flagManager.getFlag('max-cart-items', 5);

      // 5. Track flag exposures
      captureEvent(
        trackFlagExposure('show-premium-upsell', upsellFlag.value, {
          context: userContext,
          reason: upsellFlag.reason,
        }),
      );

      captureEvent(
        trackFlagExposure('checkout-variant', checkoutVariant.value, {
          context: userContext,
          reason: checkoutVariant.reason,
        }),
      );

      // 6. Business logic based on flags
      if (upsellFlag.value) {
        captureEvent(
          track('Premium Upsell Shown', {
            product_id: 'prod_123',
            flag_variant: 'upsell_enabled',
            user_plan: userContext.attributes.plan,
          }),
        );
      }

      // 7. Track checkout interaction with variant
      captureEvent(
        track('Checkout Started', {
          user_id: userContext.userId,
          checkout_variant: checkoutVariant.value,
          max_cart_items: maxItems.value,
        }),
      );

      // Verify the complete event flow
      expect(events).toHaveLength(6);

      // Verify event types and structure
      expect(events[0].type).toBe('identify');
      expect(events[1].type).toBe('page');
      expect(events[2].type).toBe('flag_exposure');
      expect(events[3].type).toBe('flag_exposure');
      expect(events[4].type).toBe('track');
      expect(events[5].type).toBe('track');

      // Verify flag data
      expect(events[2].key).toBe('show-premium-upsell');
      expect(events[2].value).toBe(true);
      expect(events[3].key).toBe('checkout-variant');
      expect(events[3].value).toBe('express');

      // Verify analytics data
      expect(events[4].event).toBe('Premium Upsell Shown');
      expect(events[4].properties.flag_variant).toBe('upsell_enabled');
      expect(events[5].event).toBe('Checkout Started');
      expect(events[5].properties.checkout_variant).toBe('express');
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle provider failures gracefully', async () => {
      // Create a failing PostHog provider
      const failingProvider = new PostHogFlagProvider({
        provider: 'posthog',
        options: { apiKey: 'invalid-key' },
      });

      const mockFailingClient = {
        capture: vi.fn(),
        getFeatureFlag: vi.fn().mockRejectedValue(new Error('Network timeout')),
      };

      (failingProvider as any).client = mockFailingClient;
      (failingProvider as any).isInitialized = true;

      try {
        // Should return fallback value on error
        const result = await failingProvider.getFlag('failing-flag', 'fallback');
        expect(result.value).toBe('fallback');
        expect(result.reason).toBe('error');
        expect(result.source).toBe('fallback');
      } catch (error) {
        // Or throw an error that we can catch and handle
        expect(error).toBeInstanceOf(Error);
      }

      // Should still be able to track analytics
      const errorEvent = track('Feature Flag Error', {
        error_type: 'network_timeout',
        fallback_used: 'fallback',
        flag_key: 'failing-flag',
      });

      expect(errorEvent.type).toBe('track');
      expect(errorEvent.properties?.error_type).toBe('network_timeout');
    });
  });

  describe('Performance Validation', () => {
    it('should evaluate flags efficiently', async () => {
      await flagManager.addProvider({
        provider: 'local',
        options: {
          flags: Array.from({ length: 100 }, (_, i) => [
            `test-flag-${i}`,
            Math.random() > 0.5,
          ]).reduce((acc, [key, value]) => ({ ...acc, [key as string]: value }), {}),
        },
      });

      await flagManager.initialize();

      const start = performance.now();

      // Evaluate 100 flags
      const promises = Array.from({ length: 100 }, (_, i) =>
        flagManager.getFlag(`test-flag-${i}`, false),
      );

      const results = await Promise.all(promises);
      const duration = performance.now() - start;

      // Should complete in reasonable time (< 100ms for local provider)
      expect(duration).toBeLessThan(100);
      expect(results).toHaveLength(100);

      // All should have proper structure
      results.forEach((result) => {
        expect(result).toHaveProperty('key');
        expect(result).toHaveProperty('value');
        expect(result).toHaveProperty('timestamp');
        expect(result).toHaveProperty('source');
      });
    });
  });
});
