/**
 * Tests for Next.js-specific Sentry plugin
 */

import { beforeEach, describe, expect, vi } from 'vitest';
import { SentryNextJSPlugin, createSentryNextJSPlugin } from '../../src/plugins/sentry-nextjs';
import type { SentryNextJSPluginConfig } from '../../src/plugins/sentry-nextjs/plugin';

// Mock the environment
const mockEnv = {
  SENTRY_DSN: 'https://mock-dsn@sentry.io/123456',
  NEXT_PUBLIC_SENTRY_DSN: 'https://mock-public-dsn@sentry.io/123456',
  SENTRY_ENVIRONMENT: 'test',
  NODE_ENV: 'test',
};

vi.mock('../../src/plugins/sentry-nextjs/env', () => ({
  safeEnv: () => mockEnv,
}));

// Mock Sentry client
const mockSentryClient = {
  init: vi.fn(),
  captureException: vi.fn().mockReturnValue('event-id'),
  captureMessage: vi.fn().mockReturnValue('event-id'),
  setUser: vi.fn(),
  addBreadcrumb: vi.fn(),
  withScope: vi.fn(),
  flush: vi.fn().mockResolvedValue(true),
  close: vi.fn().mockResolvedValue(undefined),
  browserTracingIntegration: vi.fn().mockReturnValue({ name: 'BrowserTracing' }),
  replayIntegration: vi.fn().mockReturnValue({ name: 'Replay' }),
  feedbackIntegration: vi.fn().mockReturnValue({ name: 'Feedback' }),
  captureRouterTransitionStart: vi.fn(),
  withServerActionInstrumentation: vi.fn().mockImplementation((name, options, fn) => fn()),
};

describe.todo('sentryNextJSPlugin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variables using vi.stubEnv
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('NEXT_RUNTIME', '');
  });

  describe.todo('plugin Creation', () => {
    test('should create plugin with default configuration', () => {
      const plugin = createSentryNextJSPlugin();

      expect(plugin).toBeInstanceOf(SentryNextJSPlugin);
      expect(plugin.name).toBe('sentry-nextjs');
      expect(plugin.enabled).toBeTruthy(); // Should be enabled due to mock DSN
    });

    test('should create plugin with custom configuration', () => {
      const config: SentryNextJSPluginConfig = {
        enableTracing: true,
        enableReplay: true,
        enableFeedback: true,
        tracesSampleRate: 0.5,
      };

      const plugin = createSentryNextJSPlugin(config);

      expect(plugin).toBeInstanceOf(SentryNextJSPlugin);
      expect(plugin.enabled).toBeTruthy();
    });

    test('should be disabled when no DSN is provided', () => {
      vi.mocked(require('../../src/plugins/sentry-nextjs/env').safeEnv).mockReturnValue({
        ...mockEnv,
        SENTRY_DSN: undefined,
        NEXT_PUBLIC_SENTRY_DSN: undefined,
      });

      const plugin = createSentryNextJSPlugin();
      expect(plugin.enabled).toBeFalsy();
    });
  });

  describe.todo('configuration Defaults', () => {
    test('should set production defaults correctly', () => {
      vi.stubEnv('NODE_ENV', 'production');

      const plugin = createSentryNextJSPlugin();
      const debugInfo = plugin.getDebugInfo();

      expect(debugInfo.enableTracing).toBeTruthy(); // Default true in production
    });

    test('should set development defaults correctly', () => {
      vi.stubEnv('NODE_ENV', 'development');

      const plugin = createSentryNextJSPlugin();
      const debugInfo = plugin.getDebugInfo();

      expect(debugInfo.enableTracing).toBeFalsy(); // Default false in development
    });
  });

  describe.todo('integration Building', () => {
    let plugin: SentryNextJSPlugin;

    beforeEach(async () => {
      plugin = createSentryNextJSPlugin({
        enableTracing: true,
        enableReplay: true,
        enableFeedback: true,
      });

      // Mock the client
      (plugin as any).client = mockSentryClient;
    });

    test('should build client-side integrations', async () => {
      // Mock client-side environment
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true,
      });

      const integrations = await (plugin as any).buildIntegrations({
        enableTracing: true,
        enableReplay: true,
        enableFeedback: true,
      });

      expect(integrations).toHaveLength(3);
      expect(mockSentryClient.browserTracingIntegration).toHaveBeenCalledWith();
      expect(mockSentryClient.replayIntegration).toHaveBeenCalledWith();
      expect(mockSentryClient.feedbackIntegration).toHaveBeenCalledWith();

      // Clean up
      delete (global as any).window;
    });

    test('should handle browserTracingIntegration fallback', async () => {
      // Mock client-side environment
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true,
      });

      // Mock integration to throw error first time
      mockSentryClient.browserTracingIntegration
        .mockImplementationOnce(() => {
          throw new Error('Options not supported');
        })
        .mockReturnValueOnce({ name: 'BrowserTracing' });

      const integrations = await (plugin as any).buildIntegrations({
        enableTracing: true,
        tracePropagationTargets: ['https://api.example.com'],
      });

      expect(integrations).toHaveLength(1);
      expect(mockSentryClient.browserTracingIntegration).toHaveBeenCalledTimes(2);

      // Clean up
      delete (global as any).window;
    });

    test('should not add client integrations on server-side', async () => {
      const integrations = await (plugin as any).buildIntegrations({
        enableTracing: true,
        enableReplay: true,
        enableFeedback: true,
      });

      expect(integrations).toHaveLength(0);
      expect(mockSentryClient.browserTracingIntegration).not.toHaveBeenCalled();
      expect(mockSentryClient.replayIntegration).not.toHaveBeenCalled();
      expect(mockSentryClient.feedbackIntegration).not.toHaveBeenCalled();
    });
  });

  describe.todo('next.js Context Enhancement', () => {
    let plugin: SentryNextJSPlugin;

    beforeEach(() => {
      plugin = createSentryNextJSPlugin();
      (plugin as any).client = mockSentryClient;
    });

    test('should enhance exception context with Next.js information', () => {
      Object.defineProperty(process.env, 'NEXT_RUNTIME', {
        value: 'edge',
        writable: true,
      });

      const error = new Error('Test error');
      const context = { userId: '123' };

      plugin.captureException(error, context);

      expect(mockSentryClient.captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          userId: '123',
          runtime: 'edge',
          isEdge: true,
          isClient: false,
        }),
      );
    });

    test('should handle unknown runtime', () => {
      const error = new Error('Test error');

      plugin.captureException(error);

      expect(mockSentryClient.captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          runtime: 'unknown',
          isEdge: false,
          isClient: false,
        }),
      );
    });
  });

  describe.todo('server Action Instrumentation', () => {
    let plugin: SentryNextJSPlugin;

    beforeEach(() => {
      plugin = createSentryNextJSPlugin();
      (plugin as any).client = mockSentryClient;
    });

    test('should wrap server actions with instrumentation', async () => {
      const mockFn = vi.fn().mockResolvedValue({ success: true });
      const options = {
        formData: new FormData(),
        headers: { 'x-test': 'header' },
        recordResponse: true,
      };

      const result = await plugin.withServerActionInstrumentation('testAction', options, mockFn);

      expect(result).toStrictEqual({ success: true });
      expect(mockSentryClient.withServerActionInstrumentation).toHaveBeenCalledWith(
        'testAction',
        options,
        mockFn,
      );
    });

    test('should fallback when instrumentation not available', async () => {
      (plugin as any).client = {
        ...mockSentryClient,
        withServerActionInstrumentation: undefined,
      };

      const mockFn = vi.fn().mockResolvedValue({ success: true });

      const result = await plugin.withServerActionInstrumentation('testAction', {}, mockFn);

      expect(result).toStrictEqual({ success: true });
      expect(mockFn).toHaveBeenCalledWith();
    });
  });

  describe.todo('router Transition Capture', () => {
    let plugin: SentryNextJSPlugin;

    beforeEach(() => {
      plugin = createSentryNextJSPlugin();
      (plugin as any).client = mockSentryClient;
    });

    test('should return capture function on client-side', () => {
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true,
      });

      const captureFunction = plugin.getCaptureRouterTransitionStart();

      expect(captureFunction).toBe(mockSentryClient.captureRouterTransitionStart);

      // Clean up
      delete (global as any).window;
    });

    test('should return undefined on server-side', () => {
      const captureFunction = plugin.getCaptureRouterTransitionStart();

      expect(captureFunction).toBeUndefined();
    });
  });

  describe.todo('debug Information', () => {
    test('should return comprehensive debug information', () => {
      Object.defineProperty(process.env, 'NEXT_RUNTIME', {
        value: 'nodejs',
        writable: true,
      });

      const plugin = createSentryNextJSPlugin({
        enableTracing: true,
        enableReplay: false,
        enableFeedback: true,
        enableLogs: true,
      });

      const debugInfo = plugin.getDebugInfo();

      expect(debugInfo).toStrictEqual(
        expect.objectContaining({
          name: 'sentry-nextjs',
          enabled: true,
          runtime: 'nodejs',
          isEdge: false,
          isClient: false,
          enableTracing: true,
          enableReplay: false,
          enableFeedback: true,
          enableLogs: true,
        }),
      );
    });

    test('should detect edge runtime correctly', () => {
      Object.defineProperty(process.env, 'NEXT_RUNTIME', {
        value: 'edge',
        writable: true,
      });

      const plugin = createSentryNextJSPlugin();
      const debugInfo = plugin.getDebugInfo();

      expect(debugInfo.runtime).toBe('edge');
      expect(debugInfo.isEdge).toBeTruthy();
    });
  });
});
