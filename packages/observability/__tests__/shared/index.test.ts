import { observability as clientObservability } from '#/client';
import { observability as serverObservability } from '#/server';
import { getRuntimeEnvironment, logDebug, logError, logInfo, logWarn } from '#/shared';
import { describe, expect, test } from 'vitest';

// Use centralized test utilities
import { createTestData } from '../test-data-generators';

describe('observability Package', () => {
  describe('client Implementation', () => {
    test('should export observability client', () => {
      expect(clientObservability).toBeDefined();
      expect(clientObservability.captureException).toBeDefined();
      expect(clientObservability.captureMessage).toBeDefined();
      expect(clientObservability.setUser).toBeDefined();
      expect(clientObservability.addBreadcrumb).toBeDefined();
    });

    test('should handle exceptions', () => {
      const error = createTestData.error();
      expect(() => clientObservability.captureException(error)).not.toThrow();
    });

    test('should handle messages', () => {
      expect(() => clientObservability.captureMessage('Test message')).not.toThrow();
    });
  });

  describe('server Implementation', () => {
    test('should export observability server', () => {
      expect(serverObservability).toBeDefined();
      expect(serverObservability.captureException).toBeDefined();
      expect(serverObservability.captureMessage).toBeDefined();
      expect(serverObservability.setUser).toBeDefined();
      expect(serverObservability.addBreadcrumb).toBeDefined();
      expect(serverObservability.flush).toBeDefined();
    });

    test('should handle flush', async () => {
      const result = await serverObservability.flush();
      expect(result).toBeTruthy();
    });
  });

  describe('edge Implementation', () => {
    test('should export getObservability function for edge', async () => {
      const { getObservability: getEdgeObservability } = await import('../../src/server-edge');
      expect(getEdgeObservability).toBeDefined();
      const edgeObservability = await getEdgeObservability();
      expect(edgeObservability).toBeDefined();
      expect(edgeObservability.captureException).toBeDefined();
      expect(edgeObservability.captureMessage).toBeDefined();
      expect(edgeObservability.setUser).toBeDefined();
      expect(edgeObservability.addBreadcrumb).toBeDefined();
      expect(edgeObservability.flush).toBeDefined();
    });

    test('should handle exceptions in edge runtime', async () => {
      const { getObservability: getEdgeObservability } = await import('../../src/server-edge');
      const error = createTestData.error();
      const edgeObservability = await getEdgeObservability();
      expect(() => edgeObservability.captureException(error)).not.toThrow();
    });

    test('should handle breadcrumbs', async () => {
      const { getObservability: getEdgeObservability } = await import('../../src/server-edge');
      const breadcrumb = createTestData.breadcrumb();
      const edgeObservability = await getEdgeObservability();
      expect(() => {
        edgeObservability.addBreadcrumb(breadcrumb);
      }).not.toThrow();
    });
  });

  describe('shared Environment', () => {
    test('should export runtime environment detection', () => {
      expect(getRuntimeEnvironment).toBeDefined();
      expect(typeof getRuntimeEnvironment).toBe('function');
    });
  });

  describe('root-level imports (primary pattern)', () => {
    test('should export all log functions', () => {
      expect(logInfo).toBeDefined();
      expect(logWarn).toBeDefined();
      expect(logError).toBeDefined();
      expect(logDebug).toBeDefined();

      expect(typeof logInfo).toBe('function');
      expect(typeof logWarn).toBe('function');
      expect(typeof logError).toBe('function');
      expect(typeof logDebug).toBe('function');
    });

    test('should export runtime detection function', () => {
      expect(getRuntimeEnvironment).toBeDefined();
      expect(typeof getRuntimeEnvironment).toBe('function');
    });

    test('should return runtime information', () => {
      const runtime = getRuntimeEnvironment();

      expect(runtime).toBeDefined();
      expect(runtime.type).toBeDefined();
      expect(['node', 'bun', 'edge', 'browser', 'unknown']).toContain(runtime.type);
    });

    test('log functions should not throw', () => {
      expect(() => logInfo('Test message')).not.toThrow();
      expect(() => logWarn('Test warning')).not.toThrow();
      expect(() => logError('Test error')).not.toThrow();
      expect(() => logDebug('Test debug')).not.toThrow();

      // With context
      expect(() => logInfo('Test message', { context: 'test' })).not.toThrow();
      expect(() => logWarn('Test warning', { context: 'test' })).not.toThrow();
      expect(() => logError('Test error', { context: 'test' })).not.toThrow();
      expect(() => logDebug('Test debug', { context: 'test' })).not.toThrow();
    });

    test('logError should handle Error objects', () => {
      const error = createTestData.error();
      expect(() => logError(error)).not.toThrow();
      expect(() => logError(error, { context: 'test' })).not.toThrow();
    });
  });
});
