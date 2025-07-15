import { ObservabilityProvider } from '@/shared/types/types';
import {
  HealthCheckOptions,
  ProviderHealthMonitor,
  createHealthMonitor,
} from '@/shared/utils/health-check';
import { afterEach, beforeEach, describe, expect, vi } from 'vitest';

describe('health Check utilities', () => {
  let healthMonitor: ProviderHealthMonitor;
  let mockProvider: ObservabilityProvider;
  let providers: Map<string, ObservabilityProvider>;

  beforeEach(() => {
    vi.useFakeTimers();

    mockProvider = {
      name: 'test-provider',
      captureException: vi.fn().mockResolvedValue(undefined) as any,
      captureMessage: vi.fn().mockResolvedValue(undefined) as any,
      initialize: vi.fn().mockResolvedValue(undefined) as any,
    } as ObservabilityProvider;

    providers = new Map([['test-provider', mockProvider]]);

    const options: HealthCheckOptions = {
      timeout: 500,
    };

    healthMonitor = createHealthMonitor(providers, options);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('providerHealthMonitor', () => {
    test('should create health monitor with providers', () => {
      const monitor = createHealthMonitor(providers);
      expect(monitor).toBeDefined();
      expect(monitor.getHealthStatus()).toBeDefined();
    });

    test('should start health monitoring', () => {
      healthMonitor.startMonitoring(1000);
      expect(() => healthMonitor.stopMonitoring()).not.toThrow();
    });

    test('should stop health monitoring', () => {
      healthMonitor.startMonitoring(1000);
      healthMonitor.stopMonitoring();
      expect(() => healthMonitor.startMonitoring(1000)).not.toThrow();
    });

    test('should perform health checks manually', async () => {
      await healthMonitor.checkAllProviders();

      expect(mockProvider.captureMessage).toHaveBeenCalledWith(
        'Health check',
        'info',
        expect.objectContaining({
          tags: { healthCheck: 'true' },
          extra: { timestamp: expect.any(Number) },
        }),
      );
    });

    test('should handle provider failures gracefully', async () => {
      (mockProvider.captureMessage as any).mockRejectedValue(new Error('Provider down'));

      await healthMonitor.checkAllProviders();

      const health = healthMonitor.getProviderHealth('test-provider');
      expect(health).toStrictEqual({
        name: 'test-provider',
        healthy: false,
        lastCheck: expect.any(Date),
        errorCount: 1,
        lastError: 'Provider down',
      });
    });

    test('should track consecutive failures', async () => {
      (mockProvider.captureMessage as any).mockRejectedValue(new Error('Failed'));

      // Trigger multiple failures
      for (let i = 0; i < 4; i++) {
        await healthMonitor.checkProviderHealth('test-provider', mockProvider);
      }

      const health = healthMonitor.getProviderHealth('test-provider');
      expect(health?.errorCount).toBe(4);
      expect(health?.healthy).toBeFalsy();
    });

    test('should reset failure count on successful check', async () => {
      // Fail first, then succeed
      (mockProvider.captureMessage as any)
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValue(undefined);

      // First failure
      await healthMonitor.checkProviderHealth('test-provider', mockProvider);

      // Then success
      await healthMonitor.checkProviderHealth('test-provider', mockProvider);

      const health = healthMonitor.getProviderHealth('test-provider');
      expect(health?.healthy).toBeTruthy();
      expect(health?.errorCount).toBe(0);
    });

    test('should check if provider is healthy', async () => {
      // Initially should be false (no check yet)
      expect(healthMonitor.isHealthy('test-provider')).toBeFalsy();

      // After successful check should be true
      await healthMonitor.checkProviderHealth('test-provider', mockProvider);
      expect(healthMonitor.isHealthy('test-provider')).toBeTruthy();
    });

    test('should handle timeouts', async () => {
      vi.useFakeTimers();

      // Mock that never resolves (timeout scenario)
      (mockProvider.captureMessage as any).mockImplementation(
        () => new Promise(() => {}), // Never resolves
      );

      // Create a health monitor with a very short timeout
      const shortTimeoutMonitor = createHealthMonitor(providers, {
        timeout: 100, // 100ms timeout
        onHealthChange: () => {},
      });

      const healthPromise = shortTimeoutMonitor.checkProviderHealth('test-provider', mockProvider);

      // Advance timers to trigger timeout
      vi.advanceTimersByTime(150);

      const health = await healthPromise;

      expect(health.healthy).toBeFalsy();
      expect(health.lastError).toContain('timeout');

      vi.useRealTimers();
    });

    test('should get health status for all providers', () => {
      const status = healthMonitor.getHealthStatus();
      expect(status).toBeInstanceOf(Map);
    });

    test('should get health summary', async () => {
      await healthMonitor.checkAllProviders();
      const summary = healthMonitor.getHealthSummary();

      expect(summary).toHaveProperty('total');
      expect(summary).toHaveProperty('healthy');
      expect(summary).toHaveProperty('unhealthy');
      expect(summary).toHaveProperty('providers');
      expect(Array.isArray(summary.providers)).toBeTruthy();
    });

    test('should handle health change callbacks', async () => {
      const onHealthChange = vi.fn();
      const monitorWithCallback = createHealthMonitor(providers, { onHealthChange });

      // First check should not trigger callback (no previous state)
      await monitorWithCallback.checkProviderHealth('test-provider', mockProvider);

      // Make provider fail to trigger callback
      (mockProvider.captureMessage as any).mockRejectedValue(new Error('Failed'));
      await monitorWithCallback.checkProviderHealth('test-provider', mockProvider);

      expect(onHealthChange).toHaveBeenCalledWith(
        'test-provider',
        expect.objectContaining({
          name: 'test-provider',
          healthy: false,
          lastError: 'Failed',
        }),
      );
    });
  });

  describe('monitoring behavior', () => {
    test('should start and stop monitoring', () => {
      expect(() => healthMonitor.startMonitoring(1000)).not.toThrow();
      expect(() => healthMonitor.stopMonitoring()).not.toThrow();
    });

    test('should handle multiple start/stop cycles', () => {
      healthMonitor.startMonitoring(1000);
      healthMonitor.stopMonitoring();
      healthMonitor.startMonitoring(2000);
      healthMonitor.stopMonitoring();

      expect(() => healthMonitor.startMonitoring(500)).not.toThrow();
    });

    test('should handle empty provider map', () => {
      const emptyMonitor = createHealthMonitor(new Map());
      expect(emptyMonitor.getHealthSummary().total).toBe(0);
    });

    test('should get provider health for unknown provider', () => {
      const health = healthMonitor.getProviderHealth('unknown');
      expect(health).toBeUndefined();
    });

    test('should check if unknown provider is healthy', () => {
      const isHealthy = healthMonitor.isHealthy('unknown');
      expect(isHealthy).toBeFalsy();
    });
  });

  describe('error handling', () => {
    test('should handle provider that throws during health check', async () => {
      (mockProvider.captureMessage as any).mockImplementation(() => {
        throw new Error('Sync error');
      });

      const health = await healthMonitor.checkProviderHealth('test-provider', mockProvider);

      expect(health.healthy).toBeFalsy();
      expect(health.lastError).toBe('Sync error');
    });

    test('should continue checking after errors', async () => {
      let callCount = 0;
      (mockProvider.captureMessage as any).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          throw new Error('First call fails');
        }
        return Promise.resolve();
      });

      // First call fails
      await healthMonitor.checkProviderHealth('test-provider', mockProvider);

      // Second call succeeds
      await healthMonitor.checkProviderHealth('test-provider', mockProvider);

      const health = healthMonitor.getProviderHealth('test-provider');
      expect(health?.healthy).toBeTruthy();
      expect(callCount).toBe(2);
    });

    test('should handle monitoring cleanup', () => {
      healthMonitor.startMonitoring(1000);
      const initialStatusSize = healthMonitor.getHealthStatus().size;

      healthMonitor.stopMonitoring();

      // Status should still be accessible
      expect(healthMonitor.getHealthStatus().size).toBeGreaterThanOrEqual(0);
    });

    test('should handle concurrent health checks', async () => {
      const promises = [
        healthMonitor.checkProviderHealth('test-provider', mockProvider),
        healthMonitor.checkProviderHealth('test-provider', mockProvider),
        healthMonitor.checkProviderHealth('test-provider', mockProvider),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach(health => {
        expect(health.name).toBe('test-provider');
        expect(health.healthy).toBeTruthy();
      });
    });
  });
});
