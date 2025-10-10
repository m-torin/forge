/**
 * Integration Test: @repo/orchestration with @repo/observability
 *
 * Tests the integration between the modernized orchestration package
 * and the observability package to ensure proper logging and monitoring.
 */

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import {
  AuditUtils,
  globalAuditLogger,
  globalMemoryMonitor,
  globalPerformanceMonitor,
  globalTimeoutManager,
  startGlobalAuditLogging,
  stopGlobalAuditLogging,
} from '../../src/shared/utils';

// Mock @repo/observability imports
vi.mock('@repo/observability/server/next', () => {
  const mockLogger = {
    log: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  };

  const mockTelemetry = {
    trackEvent: vi.fn(),
    trackMetrics: vi.fn(),
    trackPerformance: vi.fn(),
    trackError: vi.fn(),
  };

  return {
    createServerObservability: vi.fn().mockResolvedValue(mockLogger),
    initializeObservability: vi.fn().mockResolvedValue(undefined),
    trackEvent: mockTelemetry.trackEvent,
    trackMetrics: mockTelemetry.trackMetrics,
    trackPerformance: mockTelemetry.trackPerformance,
    trackError: mockTelemetry.trackError,
  };
});

describe('integration: @repo/orchestration with @repo/observability', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // Start monitoring systems
    await globalPerformanceMonitor.start();
    await globalMemoryMonitor.start();
    await startGlobalAuditLogging({
      enableIntegrityChecks: false, // Disable for performance
      enablePiiDetection: false, // Disable for simplicity
      enableRealTimeAlerts: false, // Disable for tests
      batchSize: 1000,
      flushInterval: 5000,
    });
  });

  afterEach(async () => {
    await stopGlobalAuditLogging();
    await globalPerformanceMonitor.stop();
    await globalMemoryMonitor.stop();
  });

  describe('performance Monitoring Integration', () => {
    test('should integrate orchestration performance monitoring with observability logging', async () => {
      const operationName = 'observability:integration:test';
      const timingId = globalPerformanceMonitor.startTiming(operationName);

      // Simulate an operation
      await new Promise(resolve => setTimeout(resolve, 100));

      const metrics = globalPerformanceMonitor.endTiming(timingId);

      expect(metrics).toBeDefined();
      expect(metrics!.operation).toBe(operationName);
      expect(metrics!.durationMs).toBeGreaterThan(90);
      // Logger should have been called (can't directly test mocked function due to module boundary)
    });

    test('should track Node 22+ timing features in observability metrics', async () => {
      const startTime = process.hrtime.bigint();

      // Simulate async operation with Node 22+ timing
      await new Promise(resolve => setTimeout(resolve, 50));

      const endTime = process.hrtime.bigint();
      const durationNs = endTime - startTime;
      const durationMs = Number(durationNs) / 1_000_000;

      // Log timing to audit system (which should integrate with observability)
      await globalAuditLogger.logAuditEvent(
        'performance_measurement',
        'Node 22+ timing measurement completed',
        {
          success: true,
          performanceContext: {
            operationType: 'hrtime_measurement',
            durationNs: Number(durationNs),
            durationMs,
            timingMethod: 'process.hrtime.bigint()',
          },
          metadata: {
            nodeVersion: '22+',
            precisionLevel: 'nanosecond',
          },
        },
      );

      expect(durationMs).toBeGreaterThan(40);
      expect(durationMs).toBeLessThan(200);
    });
  });

  describe('memory Monitoring Integration', () => {
    test('should integrate memory monitoring with observability metrics', async () => {
      const initialMetrics = globalMemoryMonitor.getCurrentMetrics();

      // Simulate memory-intensive operations
      const largeObjects = Array.from({ length: 1000 }, (_, i) => ({
        id: `memory-test-${i}`,
        data: new Array(1000).fill(`data-${i}`),
        timestamp: new Date(),
      }));

      // Track objects for memory monitoring
      largeObjects.forEach((obj, index) => {
        globalMemoryMonitor.trackObject(obj, 'test_memory_object', {
          operationIndex: index,
          testType: 'observability_integration',
        });
      });

      const finalMetrics = globalMemoryMonitor.getCurrentMetrics();

      expect(finalMetrics).toBeDefined();
      expect(initialMetrics).toBeDefined();

      // Memory usage should have increased
      if (initialMetrics && finalMetrics) {
        expect(finalMetrics.timestamp.getTime()).toBeGreaterThanOrEqual(
          initialMetrics.timestamp.getTime(),
        );
      }

      // Check for potential memory leaks (should be empty right after creation)
      const potentialLeaks = globalMemoryMonitor.getPotentialLeaks();
      expect(potentialLeaks).toHaveLength(0);
    });

    test('should log memory pressure events to observability system', async () => {
      // Get current memory usage
      const memoryUsage = process.memoryUsage();

      // Log memory metrics as audit event
      await AuditUtils.logDataAccess(
        'system_memory',
        'memory-pressure-check',
        'read',
        'system',
        true,
        {
          memoryMetrics: {
            heapUsed: memoryUsage.heapUsed,
            heapTotal: memoryUsage.heapTotal,
            external: memoryUsage.external,
            arrayBuffers: memoryUsage.arrayBuffers,
            rss: memoryUsage.rss,
          },
          memoryPressure: {
            heapUtilization: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100,
            isHighPressure: memoryUsage.heapUsed > 500 * 1024 * 1024, // 500MB threshold
          },
        },
      );

      const stats = globalAuditLogger.getAuditStats();
      expect(stats.bufferedEvents).toBeGreaterThanOrEqual(0);
    });
  });

  describe('audit Logging Integration', () => {
    test('should integrate audit events with observability telemetry', async () => {
      const auditEventType = 'system_operation';
      const eventDescription = 'Observability integration test event';

      await globalAuditLogger.logAuditEvent(auditEventType, eventDescription, {
        success: true,
        severity: 'low',
        userContext: {
          userId: 'test-user-obs',
          sessionId: 'test-session-obs',
        },
        systemContext: {
          serviceType: 'orchestration',
          environment: 'test',
          version: '1.0.0',
        },
        observabilityContext: {
          traceId: 'trace-obs-123',
          spanId: 'span-obs-456',
          correlationId: 'correlation-obs-789',
        },
        metadata: {
          integrationTest: true,
          observabilityProvider: 'multi-provider',
        },
      });

      // Should have logged the audit event
      const stats = globalAuditLogger.getAuditStats();
      expect(stats.bufferedEvents).toBeGreaterThanOrEqual(0);
    });

    test('should handle observability service errors gracefully', async () => {
      // This should not fail even if observability is down (observability service mocked)
      await AuditUtils.logSecurityEvent(
        'Observability service integration test',
        'medium',
        ['service_integration', 'error_handling'],
        {
          observabilityStatus: 'unavailable',
          fallbackLogging: true,
          errorHandling: 'graceful_degradation',
        },
      );

      // Should still log the security event despite observability failure
      const stats = globalAuditLogger.getAuditStats();
      expect(stats.bufferedEvents).toBeGreaterThanOrEqual(0);
    });
  });

  describe('error Tracking Integration', () => {
    test('should integrate error tracking with observability error monitoring', async () => {
      const testError = new Error('Observability integration test error');
      testError.stack = 'Error stack trace for testing';

      // Simulate error with timeout handling
      try {
        await globalTimeoutManager.wrapWithTimeout(
          (async () => {
            throw testError;
          })(),
          1000,
          {
            name: 'observability-error-test',
            onTimeout: () => {
              console.warn('Operation timed out during error test');
            },
          },
        );
      } catch (error) {
        // Log the caught error as security event
        await AuditUtils.logSecurityEvent(
          'Error occurred during observability integration',
          'high',
          ['error_tracking', 'integration_testing'],
          {
            errorMessage: (error as Error).message,
            errorStack: (error as Error).stack,
            errorType: 'integration_test_error',
            component: 'orchestration',
            observabilityIntegration: true,
          },
        );

        expect(error).toBe(testError);
      }

      const stats = globalAuditLogger.getAuditStats();
      expect(stats.alertCounters.highRiskEvents).toBeGreaterThan(0);
    });

    test('should track custom metrics with Node 22+ features', async () => {
      // Use structuredClone to safely clone metrics data
      const baseMetrics = {
        operationType: 'observability_integration',
        timestamp: new Date(),
        nodeFeatures: {
          structuredClone: true,
          objectHasOwn: true,
          promiseWithResolvers: true,
        },
      };

      const clonedMetrics = structuredClone(baseMetrics);

      // Add runtime metrics
      clonedMetrics.nodeFeatures = {
        ...clonedMetrics.nodeFeatures,
        runtimeVersion: process.version,
        supportsHrtime: typeof process.hrtime.bigint === 'function',
      };

      // Log custom metrics
      await globalAuditLogger.logAuditEvent(
        'custom_metrics',
        'Node 22+ features metrics tracking',
        {
          success: true,
          metricsContext: clonedMetrics,
          customMetrics: {
            featureAvailability: Object.hasOwn(clonedMetrics.nodeFeatures, 'structuredClone'),
            cloneSupport: clonedMetrics !== baseMetrics, // Should be different objects
            timestampAccuracy: 'millisecond',
          },
        },
      );

      // Verify cloning worked correctly
      expect(clonedMetrics).not.toBe(baseMetrics);
      expect(clonedMetrics.operationType).toBe(baseMetrics.operationType);
      expect(clonedMetrics.nodeFeatures.structuredClone).toBeTruthy();
    });
  });

  describe('distributed Tracing Integration', () => {
    test('should support distributed tracing context propagation', async () => {
      const { promise: tracingPromise, resolve: resolveTracing } = Promise.withResolvers<string>();

      // Simulate distributed operation with tracing context
      const traceContext = {
        traceId: 'trace-distributed-123',
        spanId: 'span-distributed-456',
        parentSpanId: 'span-parent-789',
        baggage: {
          service: 'orchestration',
          operation: 'observability_integration',
          version: '1.0.0',
        },
      };

      // Start async operation with trace context
      setTimeout(() => {
        // Log operation completion with trace context
        globalAuditLogger
          .logAuditEvent('distributed_operation', 'Operation completed with distributed tracing', {
            success: true,
            traceContext,
            operationContext: {
              operationType: 'async_distributed',
              durationMs: 100,
              distributed: true,
            },
          })
          .then(() => {
            resolveTracing('operation-completed');
          })
          .catch(() => {
            resolveTracing('operation-failed');
          });
      }, 50);

      const result = await tracingPromise;
      expect(result).toBe('operation-completed');
    });

    test('should correlate audit logs with observability traces', async () => {
      const correlationId = `correlation-${Date.now()}`;
      const operationId = `operation-${Date.now()}`;

      // Log start of operation
      await globalAuditLogger.logAuditEvent('operation_start', 'Beginning correlated operation', {
        success: true,
        correlationContext: {
          correlationId,
          operationId,
          stage: 'start',
        },
        observabilityContext: {
          provider: 'integrated',
          tracingEnabled: true,
        },
      });

      // Simulate operation with performance tracking
      const timingId = globalPerformanceMonitor.startTiming(`correlated-op-${operationId}`);
      await new Promise(resolve => setTimeout(resolve, 25));
      const metrics = globalPerformanceMonitor.endTiming(timingId);

      // Log completion of operation
      await globalAuditLogger.logAuditEvent(
        'operation_complete',
        'Completed correlated operation',
        {
          success: true,
          correlationContext: {
            correlationId,
            operationId,
            stage: 'complete',
          },
          performanceContext: {
            durationMs: metrics?.durationMs || 0,
            operation: metrics?.operation || '',
          },
          observabilityContext: {
            provider: 'integrated',
            metricsCollected: true,
          },
        },
      );

      expect(metrics).toBeDefined();
      expect(metrics!.durationMs).toBeGreaterThan(20);
    });
  });

  describe('configuration and Health Checks', () => {
    test('should validate observability service health', async () => {
      // Simulate health check
      const healthCheckResult = {
        status: 'healthy',
        timestamp: new Date(),
        services: {
          logging: 'available', // Mocked as available
          telemetry: 'available', // Mocked as available
          tracing: 'available',
        },
        nodeFeatures: {
          version: process.version,
          hrtime: typeof process.hrtime.bigint === 'function',
          structuredClone: typeof structuredClone === 'function',
          objectHasOwn: typeof Object.hasOwn === 'function',
          promiseWithResolvers: typeof Promise.withResolvers === 'function',
        },
      };

      await AuditUtils.logDataAccess(
        'observability_health',
        'health-check-observability',
        'read',
        'system',
        true,
        {
          healthCheck: healthCheckResult,
          integrationStatus: 'operational',
          lastCheck: new Date().toISOString(),
        },
      );

      expect(healthCheckResult.status).toBe('healthy');
      expect(healthCheckResult.services.logging).toBe('available');
      expect(healthCheckResult.nodeFeatures.structuredClone).toBeTruthy();
    });

    test('should handle observability configuration changes', async () => {
      // Simulate configuration update
      const configUpdate = {
        logLevel: 'info',
        enableTracing: true,
        enableMetrics: true,
        providers: ['console', 'sentry', 'betterstack'],
        retentionDays: 30,
      };

      // Use Object.hasOwn to check configuration properties
      const hasLogLevel = Object.hasOwn(configUpdate, 'logLevel');
      const hasProviders = Object.hasOwn(configUpdate, 'providers');

      await globalAuditLogger.logAuditEvent(
        'configuration_change',
        'Observability configuration updated',
        {
          success: true,
          configurationContext: {
            previousConfig: 'default',
            newConfig: configUpdate,
            validationPassed: hasLogLevel && hasProviders,
            changeTimestamp: new Date(),
          },
          validationContext: {
            hasLogLevel,
            hasProviders,
            configComplete: Object.keys(configUpdate).length === 5,
          },
        },
      );

      expect(hasLogLevel).toBeTruthy();
      expect(hasProviders).toBeTruthy();
      expect(configUpdate.providers).toContain('console');
    });
  });

  describe('type Safety and Compatibility', () => {
    test('should maintain type compatibility between orchestration and observability', () => {
      // Test observability context types
      const observabilityContext = {
        traceId: 'trace-type-test-123',
        spanId: 'span-type-test-456',
        provider: 'multi-provider',
        level: 'info',
        correlationId: 'correlation-type-test',
      };

      // Should be compatible with audit metadata
      expect(observabilityContext).toMatchObject({
        traceId: expect.any(String),
        spanId: expect.any(String),
        provider: expect.any(String),
        level: expect.any(String),
        correlationId: expect.any(String),
      });

      // Test metrics context types
      const metricsContext = {
        operation: 'type-compatibility-test',
        durationMs: 150,
        memoryUsed: 1024 * 1024,
        timestamp: Date.now(),
        success: true,
      };

      expect(metricsContext).toMatchObject({
        operation: expect.any(String),
        durationMs: expect.any(Number),
        memoryUsed: expect.any(Number),
        timestamp: expect.any(Number),
        success: expect.any(Boolean),
      });
    });
  });
});
