/**
 * Feature Flag and Emitter Integration Tests
 * Tests the complete integration between feature flags and analytics emitters
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { track } from '../shared/emitters';
import {
  evaluateFlag,
  MemoryFlagCache,
  StandardFeatureFlagManager,
  trackFlagExposure,
} from '../shared/feature-flags';

import type { FlagContext } from '../shared/feature-flags/types';

describe('Feature Flag and Emitter Integration', () => {
  let manager: StandardFeatureFlagManager;
  let mockAnalyticsClient: any;

  beforeEach(async () => {
    // Create a mock analytics client
    mockAnalyticsClient = {
      capture: vi.fn(),
      emit: vi.fn(),
      track: vi.fn(),
    };

    // Create flag manager manually to ensure proper setup
    manager = new StandardFeatureFlagManager({ debug: true });

    // Add local provider with test flags
    await manager.addProvider({
      provider: 'local',
      options: {
        flags: {
          'beta-feature': false,
          'experiment-variant': 'control',
          'json-config': { enabled: true, threshold: 10 },
          'numeric-config': 42,
          'test-feature': true,
        },
      },
    });

    await manager.initialize();
  });

  describe('Flag Evaluation with Emitters', () => {
    it('should evaluate flags and emit proper payloads', async () => {
      // Test basic flag evaluation
      const testFlag = await manager.getFlag('test-feature', false);
      expect(testFlag.value).toBe(true);
      expect(testFlag.reason).toBe('fallthrough');
      expect(testFlag.source).toBe('network');

      // Test emitter payload generation
      const flagPayload = evaluateFlag('test-feature', false, {
        context: { userId: 'test-user-123' },
      });

      expect(flagPayload).toEqual({
        type: 'flag_evaluation',
        context: { userId: 'test-user-123' },
        defaultValue: false,
        key: 'test-feature',
        options: {},
        timestamp: expect.any(Number),
      });
    });

    it('should track flag exposure with analytics integration', async () => {
      const context: FlagContext = {
        attributes: { segment: 'premium' },
        userId: 'test-user-123',
      };

      // Evaluate flag
      const result = await manager.getFlag('beta-feature', false, { context });

      // Track exposure using emitter
      const exposurePayload = trackFlagExposure('beta-feature', result.value, {
        context,
        reason: result.reason,
      });

      expect(exposurePayload).toEqual({
        type: 'flag_exposure',
        context,
        key: 'beta-feature',
        reason: result.reason,
        timestamp: expect.any(Number),
        value: false,
      });

      // Verify analytics event structure
      const analyticsPayload = track('Feature Flag Evaluated', {
        user_id: context.userId,
        flag_key: 'beta-feature',
        flag_reason: result.reason,
        flag_value: result.value,
        ...context.attributes,
      });

      expect(analyticsPayload.type).toBe('track');
      expect(analyticsPayload.event).toBe('Feature Flag Evaluated');
      expect(analyticsPayload.properties?.flag_key).toBe('beta-feature');
    });

    it('should handle different flag value types correctly', async () => {
      const stringFlag = await manager.getFlag('experiment-variant', 'default');
      const numberFlag = await manager.getFlag('numeric-config', 0);
      const objectFlag = await manager.getFlag('json-config', null);

      expect(stringFlag.value).toBe('control');
      expect(numberFlag.value).toBe(42);
      expect(objectFlag.value).toEqual({ enabled: true, threshold: 10 });

      // Test emitters handle different types
      const stringPayload = evaluateFlag('experiment-variant', 'default');
      const numberPayload = evaluateFlag('numeric-config', 0);
      const objectPayload = evaluateFlag('json-config', null);

      expect(stringPayload.defaultValue).toBe('default');
      expect(numberPayload.defaultValue).toBe(0);
      expect(objectPayload.defaultValue).toBe(null);
    });
  });

  describe('PostHog Integration Simulation', () => {
    it('should integrate with PostHog analytics emitters', async () => {
      const mockPostHogProvider = {
        name: 'posthog',
        getFlag: vi.fn().mockResolvedValue({
          key: 'posthog-feature',
          payload: { experiment_id: 'exp_123' },
          reason: 'targeting_match',
          source: 'network',
          timestamp: Date.now(),
          value: true,
          variant: 'test-variant',
        }),
        trackExposure: vi.fn(),
      };

      // Simulate PostHog flag evaluation
      const result = await mockPostHogProvider.getFlag('posthog-feature', false);

      // Verify PostHog-style exposure tracking
      mockPostHogProvider.trackExposure('posthog-feature', result, {
        attributes: { premium: true },
        userId: 'test-user',
      });

      expect(mockPostHogProvider.trackExposure).toHaveBeenCalledWith('posthog-feature', result, {
        attributes: { premium: true },
        userId: 'test-user',
      });

      // Test emitter integration with PostHog data
      const exposurePayload = trackFlagExposure('posthog-feature', result.value, {
        reason: result.reason,
        variant: result.variant,
      });

      expect(exposurePayload.variant).toBe('test-variant');
      expect(exposurePayload.reason).toBe('targeting_match');
    });
  });

  describe('Real-time Analytics Integration', () => {
    it('should emit flag events that can be processed by analytics', async () => {
      const events: any[] = [];

      // Mock analytics event processor
      const processEvent = (payload: any) => {
        events.push(payload);
      };

      // Simulate user journey with flags
      const userContext = {
        attributes: {
          country: 'US',
          plan: 'pro',
          signupDate: '2024-01-01',
        },
        userId: 'journey-user-456',
      };

      // 1. Evaluate multiple flags
      const featureA = await manager.getFlag('test-feature', false, { context: userContext });
      const featureB = await manager.getFlag('beta-feature', false, { context: userContext });

      // 2. Generate analytics events
      processEvent(
        track('Feature Flags Loaded', {
          features_evaluated: ['test-feature', 'beta-feature'],
          timestamp: new Date().toISOString(),
          user_context: userContext,
        }),
      );

      // 3. Track individual exposures
      processEvent(
        trackFlagExposure('test-feature', featureA.value, {
          context: userContext,
          reason: featureA.reason,
        }),
      );

      processEvent(
        trackFlagExposure('beta-feature', featureB.value, {
          context: userContext,
          reason: featureB.reason,
        }),
      );

      // Verify event structure
      expect(events).toHaveLength(3);
      expect(events[0].type).toBe('track');
      expect(events[1].type).toBe('flag_exposure');
      expect(events[2].type).toBe('flag_exposure');

      // Verify analytics compatibility
      const trackEvent = events[0];
      expect(trackEvent.properties?.features_evaluated).toContain('test-feature');
      expect(trackEvent.properties?.user_context.userId).toBe('journey-user-456');
    });
  });

  describe('Error Handling and Fallbacks', () => {
    it('should handle provider errors gracefully with analytics', async () => {
      // Create a failing provider scenario
      const failingManager = new StandardFeatureFlagManager();

      try {
        await failingManager.getFlag('non-existent-flag', 'fallback');
      } catch (error) {
        // Should emit error tracking event
        const errorPayload = track('Feature Flag Error', {
          error_type: 'PROVIDER_NOT_FOUND',
          fallback_used: 'fallback',
          flag_key: 'non-existent-flag',
          timestamp: new Date().toISOString(),
        });

        expect(errorPayload.type).toBe('track');
        expect(errorPayload.event).toBe('Feature Flag Error');
        expect(errorPayload.properties?.error_type).toBe('PROVIDER_NOT_FOUND');
      }
    });

    it('should handle network timeouts with proper analytics', async () => {
      // Simulate network timeout scenario
      const timeoutPayload = trackFlagExposure('slow-flag', false, {
        context: { userId: 'timeout-user' },
        reason: 'timeout',
      });

      expect(timeoutPayload.reason).toBe('timeout');
      expect(timeoutPayload.value).toBe(false);

      // Should track timeout analytics
      const timeoutAnalytics = track('Feature Flag Timeout', {
        user_id: 'timeout-user',
        fallback_used: false,
        flag_key: 'slow-flag',
        timeout_duration: 5000,
      });

      expect(timeoutAnalytics.properties?.flag_key).toBe('slow-flag');
      expect(timeoutAnalytics.properties?.timeout_duration).toBe(5000);
    });
  });

  describe('Performance and Caching Integration', () => {
    it('should track cache performance with analytics', async () => {
      // Create manager with cache enabled
      const cache = new MemoryFlagCache({
        enabled: true,
        strategy: 'ttl',
        ttl: 60000,
      });
      const cachedManager = new StandardFeatureFlagManager({
        cache,
        debug: true,
      });

      await cachedManager.addProvider({
        provider: 'local',
        options: { flags: { 'cached-flag': true } },
      });

      await cachedManager.initialize();

      // First evaluation (cache miss)
      const start1 = performance.now();
      const result1 = await cachedManager.getFlag('cached-flag', false);
      const duration1 = performance.now() - start1;

      // Second evaluation (cache hit)
      const start2 = performance.now();
      const result2 = await cachedManager.getFlag('cached-flag', false);
      const duration2 = performance.now() - start2;

      // Cache hit should be faster
      expect(duration2).toBeLessThan(duration1);
      expect(result1.value).toBe(result2.value);

      // Track cache performance
      const cacheAnalytics = track('Feature Flag Cache Performance', {
        cache_hit: duration2 < duration1,
        cache_hit_duration: duration2,
        cache_miss_duration: duration1,
        flag_key: 'cached-flag',
        performance_improvement: ((duration1 - duration2) / duration1) * 100,
      });

      expect(cacheAnalytics.properties?.cache_hit).toBe(true);
      expect(cacheAnalytics.properties?.performance_improvement).toBeGreaterThan(0);
    });
  });
});

describe('Emitter Validation', () => {
  it('should validate emitter payload structures', () => {
    // Test all flag emitter types
    const evaluation = evaluateFlag('test', false);
    const exposure = trackFlagExposure('test', true);

    // Validate required fields
    expect(evaluation).toHaveProperty('type', 'flag_evaluation');
    expect(evaluation).toHaveProperty('key', 'test');
    expect(evaluation).toHaveProperty('defaultValue', false);
    expect(evaluation).toHaveProperty('timestamp');

    expect(exposure).toHaveProperty('type', 'flag_exposure');
    expect(exposure).toHaveProperty('key', 'test');
    expect(exposure).toHaveProperty('value', true);
    expect(exposure).toHaveProperty('timestamp');
  });

  it('should integrate with analytics emitter system', () => {
    // Test that flag emitters follow same pattern as analytics emitters
    const currentTime = Date.now();
    const flagEvent = evaluateFlag('integration-test', 'default');
    const analyticsEvent = track(
      'Integration Test',
      { source: 'flag-system' },
      {
        timestamp: new Date(currentTime),
      },
    );

    // Both should have consistent structure
    expect(flagEvent).toHaveProperty('type');
    expect(flagEvent).toHaveProperty('timestamp');
    expect(analyticsEvent).toHaveProperty('type');

    // Analytics events should have timestamp when provided
    expect(analyticsEvent).toHaveProperty('timestamp', new Date(currentTime));

    // Both should be emitter payloads with timestamps
    expect(typeof flagEvent.timestamp).toBe('number');
    expect(analyticsEvent.timestamp).toBeInstanceOf(Date);

    // Flag events always have timestamps, analytics events have them when provided
    expect(flagEvent.timestamp).toBeGreaterThan(0);
    expect((analyticsEvent.timestamp as Date).getTime()).toBe(currentTime);
  });
});
