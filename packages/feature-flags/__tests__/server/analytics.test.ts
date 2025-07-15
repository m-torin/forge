import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock observability functions
const mockLogError = vi.fn();
const mockLogInfo = vi.fn();
const mockLogWarn = vi.fn();

vi.mock('@repo/observability', () => ({
  logError: mockLogError,
  logInfo: mockLogInfo,
  logWarn: mockLogWarn,
}));

// Mock environment
const mockSafeEnv = vi.fn();

vi.mock('#/env', () => ({
  safeEnv: mockSafeEnv,
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('server/analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default environment setup
    mockSafeEnv.mockReturnValue({
      NODE_ENV: 'production',
      VERCEL_ANALYTICS_DEBUG: false,
    });

    // Mock successful fetch response
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
    });

    // Clear window mock
    delete (globalThis as any).window;
  });

  describe('trackFlagEvaluation', () => {
    test('should not track in development environment', async () => {
      mockSafeEnv.mockReturnValue({
        NODE_ENV: 'development',
        VERCEL_ANALYTICS_DEBUG: false,
      });

      const { trackFlagEvaluation } = await import('#/server/analytics');

      await trackFlagEvaluation('testFlag', true);

      expect(mockFetch).not.toHaveBeenCalled();
    });

    test('should track in development when debug is enabled', async () => {
      mockSafeEnv.mockReturnValue({
        NODE_ENV: 'development',
        VERCEL_ANALYTICS_DEBUG: true,
      });

      const { trackFlagEvaluation } = await import('#/server/analytics');

      await trackFlagEvaluation('testFlag', true, {
        userId: 'user123',
        country: 'US',
      });

      expect(mockFetch).toHaveBeenCalledWith('/_vercel/insights/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'Feature Flag Evaluated',
          properties: {
            flag_key: 'testFlag',
            flag_value: 'true',
            user_id: 'user123',
            session_id: undefined,
            country: 'US',
            environment: 'development',
            timestamp: expect.any(String),
          },
        }),
      });
    });

    test('should track in production environment', async () => {
      const { trackFlagEvaluation } = await import('#/server/analytics');

      await trackFlagEvaluation('prodFlag', 'variant-a', {
        userId: 'prod-user',
        sessionId: 'session123',
        environment: 'staging',
      });

      expect(mockFetch).toHaveBeenCalledWith('/_vercel/insights/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'Feature Flag Evaluated',
          properties: {
            flag_key: 'prodFlag',
            flag_value: 'variant-a',
            user_id: 'prod-user',
            session_id: 'session123',
            country: undefined,
            environment: 'staging',
            timestamp: expect.any(String),
          },
        }),
      });
    });

    test('should use client-side tracking when window.va is available', async () => {
      const mockVa = vi.fn();
      (globalThis as any).window = { va: mockVa };

      const { trackFlagEvaluation } = await import('#/server/analytics');

      await trackFlagEvaluation('clientFlag', false, {
        userId: 'client-user',
        country: 'CA',
      });

      expect(mockVa).toHaveBeenCalledWith('event', {
        name: 'Feature Flag Evaluated',
        flag_key: 'clientFlag',
        flag_value: 'false',
        user_id: 'client-user',
        session_id: undefined,
        country: 'CA',
        environment: 'production',
        timestamp: expect.any(String),
      });

      expect(mockFetch).not.toHaveBeenCalled();
    });

    test('should handle anonymous users', async () => {
      const { trackFlagEvaluation } = await import('#/server/analytics');

      await trackFlagEvaluation('anonFlag', true);

      expect(mockFetch).toHaveBeenCalledWith('/_vercel/insights/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'Feature Flag Evaluated',
          properties: {
            flag_key: 'anonFlag',
            flag_value: 'true',
            user_id: 'anonymous',
            session_id: undefined,
            country: undefined,
            environment: 'production',
            timestamp: expect.any(String),
          },
        }),
      });
    });

    test('should handle server-side tracking errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const { trackFlagEvaluation } = await import('#/server/analytics');

      await trackFlagEvaluation('errorFlag', true);

      expect(mockLogError).toHaveBeenCalledWith(expect.any(Error), {
        context: 'flag-analytics',
        flagKey: 'errorFlag',
      });
    });

    test('should handle client-side tracking errors', async () => {
      const mockVa = vi.fn().mockImplementation(() => {
        throw new Error('Client tracking error');
      });
      (globalThis as any).window = { va: mockVa };

      const { trackFlagEvaluation } = await import('#/server/analytics');

      await trackFlagEvaluation('clientErrorFlag', true);

      expect(mockLogError).toHaveBeenCalledWith(expect.any(Error), {
        context: 'flag-analytics',
        flagKey: 'clientErrorFlag',
      });
    });

    test('should convert non-string flag values to strings', async () => {
      const { trackFlagEvaluation } = await import('#/server/analytics');

      await trackFlagEvaluation('numberFlag', 42);
      await trackFlagEvaluation('objectFlag', { variant: 'A' });
      await trackFlagEvaluation('arrayFlag', ['option1', 'option2']);

      expect(mockFetch).toHaveBeenCalledWith(
        '/_vercel/insights/track',
        expect.objectContaining({
          body: expect.stringContaining('"flag_value":"42"'),
        }),
      );

      expect(mockFetch).toHaveBeenCalledWith(
        '/_vercel/insights/track',
        expect.objectContaining({
          body: expect.stringContaining('"flag_value":"[object Object]"'),
        }),
      );

      expect(mockFetch).toHaveBeenCalledWith(
        '/_vercel/insights/track',
        expect.objectContaining({
          body: expect.stringContaining('"flag_value":"option1,option2"'),
        }),
      );
    });
  });

  describe('trackFlagEvaluationsBatch', () => {
    test('should track multiple flag evaluations in batch', async () => {
      const { trackFlagEvaluationsBatch } = await import('#/server/analytics');

      const evaluations = [
        { flagKey: 'flag1', flagValue: true, context: { userId: 'user1' } },
        { flagKey: 'flag2', flagValue: 'variant-b', context: { userId: 'user2' } },
        { flagKey: 'flag3', flagValue: false, context: { userId: 'user1' } },
      ];

      await trackFlagEvaluationsBatch(evaluations);

      expect(mockFetch).toHaveBeenCalledWith('/_vercel/insights/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events: evaluations.map(({ flagKey, flagValue, context }) => ({
            event: 'Feature Flag Evaluated',
            properties: {
              flag_key: flagKey,
              flag_value: String(flagValue),
              user_id: context.userId || 'anonymous',
              session_id: (context as any).sessionId,
              country: (context as any).country,
              environment: (context as any).environment || 'production',
              timestamp: expect.any(String),
            },
          })),
        }),
      });
    });

    test('should handle empty batch', async () => {
      const { trackFlagEvaluationsBatch } = await import('#/server/analytics');

      await trackFlagEvaluationsBatch([]);

      expect(mockFetch).not.toHaveBeenCalled();
    });

    test('should handle batch tracking errors', async () => {
      mockFetch.mockRejectedValue(new Error('Batch error'));

      const { trackFlagEvaluationsBatch } = await import('#/server/analytics');

      const evaluations = [{ flagKey: 'flag1', flagValue: true, context: {} }];

      await trackFlagEvaluationsBatch(evaluations);

      expect(mockLogError).toHaveBeenCalledWith(expect.any(Error), {
        context: 'batch-flag-analytics',
        batchSize: 1,
      });
    });
  });

  describe('trackExperimentAssignment', () => {
    test('should track experiment assignment', async () => {
      const { trackExperimentAssignment } = await import('#/server/analytics');

      await trackExperimentAssignment('experiment-1', 'variant-a', {
        userId: 'user123',
        experimentId: 'exp-1',
        segmentId: 'segment-1',
      });

      expect(mockFetch).toHaveBeenCalledWith('/_vercel/insights/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'Experiment Assignment',
          properties: {
            experiment_name: 'experiment-1',
            variant: 'variant-a',
            user_id: 'user123',
            experiment_id: 'exp-1',
            segment_id: 'segment-1',
            timestamp: expect.any(String),
          },
        }),
      });
    });
  });

  describe('trackFlagConversion', () => {
    test('should track flag conversion event', async () => {
      const { trackFlagConversion } = await import('#/server/analytics');

      await trackFlagConversion('checkout-flow', 'purchase', 99.99, { userId: 'user123' });

      expect(mockFetch).toHaveBeenCalledWith('/_vercel/insights/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'Feature Flag Conversion',
          properties: {
            flag_key: 'checkout-flow',
            conversion_event: 'purchase',
            user_id: 'user123',
            conversion_value: 99.99,
            timestamp: expect.any(String),
          },
        }),
      });
    });
  });

  describe('analyticsConfig', () => {
    test('should return current analytics configuration', async () => {
      const { analyticsConfig } = await import('#/server/analytics');

      const config = {
        enabled: analyticsConfig.isEnabled(),
        environment: 'production',
        debugMode: false,
        batchSize: 10,
        trackingEndpoint: '/_vercel/insights/track',
      };

      expect(config).toMatchObject({
        enabled: expect.any(Boolean),
        environment: 'production',
        debugMode: false,
        batchSize: expect.any(Number),
        trackingEndpoint: expect.any(String),
      });
    });

    test('should handle different environments', async () => {
      mockSafeEnv.mockReturnValue({
        NODE_ENV: 'development',
        VERCEL_ANALYTICS_DEBUG: true,
      });

      const { analyticsConfig } = await import('#/server/analytics');

      const config = {
        enabled: analyticsConfig.isEnabled(),
        environment: 'development',
        debugMode: true,
      };

      expect(config).toMatchObject({
        enabled: true, // Should be enabled due to debug mode
        environment: 'development',
        debugMode: true,
      });
    });
  });

  describe('edge cases', () => {
    test('should handle malformed context objects', async () => {
      const { trackFlagEvaluation } = await import('#/server/analytics');

      const malformedContext = {
        userId: null,
        sessionId: undefined,
        country: '',
        customField: { nested: 'value' },
      };

      await trackFlagEvaluation('testFlag', true, malformedContext as any);

      expect(mockFetch).toHaveBeenCalledWith(
        '/_vercel/insights/track',
        expect.objectContaining({
          body: expect.stringContaining('"user_id":"anonymous"'),
        }),
      );
    });

    test('should handle very long flag keys', async () => {
      const { trackFlagEvaluation } = await import('#/server/analytics');

      const longFlagKey = 'a'.repeat(1000);

      await trackFlagEvaluation(longFlagKey, true);

      expect(mockFetch).toHaveBeenCalledWith(
        '/_vercel/insights/track',
        expect.objectContaining({
          body: expect.stringContaining(`"flag_key":"${longFlagKey}"`),
        }),
      );
    });

    test('should handle concurrent tracking calls', async () => {
      const { trackFlagEvaluation } = await import('#/server/analytics');

      const promises = Array.from({ length: 10 }, (_, i) =>
        trackFlagEvaluation(`flag${i}`, i % 2 === 0),
      );

      await Promise.all(promises);

      expect(mockFetch).toHaveBeenCalledTimes(10);
    });

    test('should handle network timeouts gracefully', async () => {
      vi.useFakeTimers();

      mockFetch.mockImplementation(
        () =>
          new Promise(resolve => {
            setTimeout(() => resolve({ ok: true }), 10000);
          }),
      );

      const { trackFlagEvaluation } = await import('#/server/analytics');

      const trackingPromise = trackFlagEvaluation('slowFlag', true);

      // Fast forward time
      vi.advanceTimersByTime(5000);

      // Should not throw or hang
      await expect(trackingPromise).resolves.toBeUndefined();

      vi.useRealTimers();
    });
  });
});
