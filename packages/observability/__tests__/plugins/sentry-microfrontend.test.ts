/**
 * Basic tests for Sentry Micro Frontend Plugin
 */

import { beforeEach, describe, expect, vi } from 'vitest';
import { SentryMicroFrontendPlugin } from '../../src/plugins/sentry-microfrontend/plugin';
import type { SentryMicroFrontendConfig } from '../../src/plugins/sentry-microfrontend/types';
import { resetInitFlag } from '../../src/plugins/sentry-microfrontend/utils';

// Mock globalThis for tests
const mockGlobalThis = globalThis as any;

describe('sentryMicroFrontendPlugin', () => {
  beforeEach(() => {
    // Clean up global state before each test
    delete mockGlobalThis.Sentry;
    delete mockGlobalThis.__SENTRY_MICRO_FRONTEND_HOST__;
    delete mockGlobalThis.__SENTRY_MICRO_FRONTEND_APP__;
    delete mockGlobalThis.__SENTRY_INITIALIZED__;
    delete mockGlobalThis.__SENTRY_INIT_STATE__;
    resetInitFlag();
    vi.clearAllMocks();
  });

  describe('mode Detection', () => {
    test('should default to standalone mode when no parent Sentry exists', () => {
      const plugin = new SentryMicroFrontendPlugin();
      expect(plugin.getMode()).toBe('standalone');
    });

    test('should detect host mode when isHost is true', () => {
      const config: SentryMicroFrontendConfig = {
        isHost: true,
        backstageApps: [{ name: 'cms', dsn: 'https://test-cms@sentry.io/123' }],
      };
      const plugin = new SentryMicroFrontendPlugin(config);
      expect(plugin.getMode()).toBe('host');
    });

    test('should detect child mode when parent Sentry exists', () => {
      // Mock parent Sentry
      mockGlobalThis.Sentry = {
        captureException: vi.fn(),
        captureMessage: vi.fn(),
        withScope: vi.fn(),
        addEventProcessor: vi.fn(),
        Scope: vi.fn(),
      };

      const plugin = new SentryMicroFrontendPlugin();
      expect(plugin.getMode()).toBe('child');
    });
  });

  describe('backstage app detection', () => {
    test('should detect Backstage app from config', () => {
      const config: SentryMicroFrontendConfig = {
        backstageApp: 'test-app',
      };
      const plugin = new SentryMicroFrontendPlugin(config);
      expect(plugin.getBackstageApp()).toBe('test-app');
    });

    test('should detect Backstage app from global flag', () => {
      // Mock location for browser environment
      mockGlobalThis.location = { pathname: '/test' };
      mockGlobalThis.__SENTRY_MICRO_FRONTEND_APP__ = 'global-app';

      const plugin = new SentryMicroFrontendPlugin();
      expect(plugin.getBackstageApp()).toBe('global-app');

      // Clean up
      delete mockGlobalThis.location;
    });
  });

  describe('child Mode Operations', () => {
    beforeEach(() => {
      // Mock parent Sentry
      mockGlobalThis.Sentry = {
        captureException: vi.fn(),
        captureMessage: vi.fn(),
        withScope: vi.fn(callback => callback(mockScope)),
        addEventProcessor: vi.fn(),
        Scope: vi.fn(() => mockScope),
      };
    });

    const mockScope = {
      setTag: vi.fn(),
      setContext: vi.fn(),
    };

    test('should capture exceptions using parent Sentry in child mode', async () => {
      const config: SentryMicroFrontendConfig = {
        backstageApp: 'test-app',
        addBackstageContext: true,
      };
      const plugin = new SentryMicroFrontendPlugin(config);
      await plugin.initialize();

      const testError = new Error('Test error');
      plugin.captureException(testError);

      expect(mockGlobalThis.Sentry.withScope).toHaveBeenCalledWith(expect.any(Function));
    });

    test('should capture messages using parent Sentry in child mode', async () => {
      const config: SentryMicroFrontendConfig = {
        backstageApp: 'test-app',
        addBackstageContext: true,
      };
      const plugin = new SentryMicroFrontendPlugin(config);
      await plugin.initialize();

      plugin.captureMessage('Test message', 'info');

      expect(mockGlobalThis.Sentry.withScope).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('debug Information', () => {
    test('should provide debug information about plugin state', () => {
      const config: SentryMicroFrontendConfig = {
        backstageApp: 'test-app',
        isHost: true,
      };
      const plugin = new SentryMicroFrontendPlugin(config);
      const debugInfo = plugin.getDebugInfo();

      expect(debugInfo).toStrictEqual({
        mode: 'host',
        backstageApp: 'test-app',
        enabled: false, // No DSN provided
        initialized: false,
        hasParentSentry: false,
        clientType: 'none',
      });
    });
  });

  describe('cleanup', () => {
    test('should clean up resources properly', async () => {
      const plugin = new SentryMicroFrontendPlugin();
      await plugin.cleanup();

      expect(plugin.getDebugInfo().initialized).toBeFalsy();
      expect(plugin.getDebugInfo().enabled).toBeFalsy();
    });
  });

  describe('error Handling', () => {
    test('should handle missing parent Sentry gracefully', () => {
      const plugin = new SentryMicroFrontendPlugin();

      // Should not throw when parent Sentry is missing
      expect(() => {
        plugin.captureException(new Error('Test'));
        plugin.captureMessage('Test message');
      }).not.toThrow();
    });

    test('should handle malformed configuration gracefully', () => {
      const config: SentryMicroFrontendConfig = {
        backstageApps: [], // Empty backstageApps
        isHost: true,
      };

      expect(() => {
        new SentryMicroFrontendPlugin(config);
      }).not.toThrow();
    });
  });
});
