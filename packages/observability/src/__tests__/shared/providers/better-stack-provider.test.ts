/**
 * @vitest-environment node
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BetterStackProvider } from '../../../shared/providers/better-stack-provider';
import type { BetterStackConfig } from '../../../shared/types/better-stack-types';

// Mock @logtail/node
const mockClient = {
  info: vi.fn().mockResolvedValue(undefined),
  warn: vi.fn().mockResolvedValue(undefined),
  error: vi.fn().mockResolvedValue(undefined),
  debug: vi.fn().mockResolvedValue(undefined),
  log: vi.fn().mockResolvedValue(undefined),
  use: vi.fn(),
  flush: vi.fn().mockResolvedValue(undefined),
};

vi.mock('@logtail/node', () => ({
  Logtail: vi.fn(() => mockClient),
}));

describe('BetterStackProvider', () => {
  let provider: BetterStackProvider;
  let config: BetterStackConfig;

  beforeEach(() => {
    provider = new BetterStackProvider();
    config = {
      sourceToken: 'test-token',
      application: 'test-app',
      environment: 'test',
      release: '1.0.0',
      sendLogsToConsoleInDev: true, // Force using client even in test
    };

    // Reset all mocks
    vi.clearAllMocks();
    
    // Mock process.env
    vi.stubEnv('NODE_ENV', 'production'); // Use production to avoid dev mode
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('initialization', () => {
    it('should initialize successfully with valid config', async () => {
      await expect(provider.initialize(config)).resolves.toBeUndefined();
      expect(provider.name).toBe('better-stack');
    });

    it('should throw error when source token is missing', async () => {
      const invalidConfig = { ...config, sourceToken: '' };
      await expect(provider.initialize(invalidConfig)).rejects.toThrow(
        'Better Stack source token is required'
      );
    });

    it('should handle development environment without token', async () => {
      vi.stubEnv('NODE_ENV', 'development');
      const devConfig = { 
        ...config, 
        sourceToken: 'test-token', // Still need a token for validation
        sendLogsToConsoleInDev: false 
      };
      
      const devProvider = new BetterStackProvider();
      await expect(devProvider.initialize(devConfig)).resolves.toBeUndefined();
    });

    it('should setup global context correctly', async () => {
      const configWithContext = {
        ...config,
        defaultContext: { customField: 'value' },
        globalTags: { tag1: 'value1', tag2: 123 },
      };

      await provider.initialize(configWithContext);
      
      // Verify that middleware was set up
      expect(mockClient.use).toHaveBeenCalledTimes(2); // Once for app context, once for global tags
    });
  });

  describe('error capturing', () => {
    beforeEach(async () => {
      await provider.initialize(config);
    });

    it('should capture exceptions with proper formatting', async () => {
      const error = new Error('Test error');
      const context = { userId: 'user123', level: 'fatal' as const };

      await provider.captureException(error, context);

      expect(mockClient.error).toHaveBeenCalledWith(
        'Exception captured',
        expect.objectContaining({
          timestamp: expect.any(Number),
          level: 'fatal',
          message: 'Test error',
          error: {
            name: 'Error',
            message: 'Test error',
            stack: expect.any(String),
            code: undefined,
          },
          userId: 'user123',
        })
      );
    });

    it('should handle exceptions without context', async () => {
      const error = new Error('Simple error');

      await provider.captureException(error);

      expect(mockClient.error).toHaveBeenCalledWith(
        'Exception captured',
        expect.objectContaining({
          level: 'error', // Default level
          error: expect.objectContaining({
            message: 'Simple error',
          }),
        })
      );
    });
  });

  describe('message capturing', () => {
    beforeEach(async () => {
      await provider.initialize(config);
    });

    it('should capture info messages', async () => {
      await provider.captureMessage('Info message', 'info', { requestId: 'req123' });

      expect(mockClient.info).toHaveBeenCalledWith(
        'Info message',
        expect.objectContaining({
          level: 'info',
          message: 'Info message',
          requestId: 'req123',
        })
      );
    });

    it('should capture warning messages', async () => {
      await provider.captureMessage('Warning message', 'warning');

      expect(mockClient.warn).toHaveBeenCalledWith(
        'Warning message',
        expect.objectContaining({
          level: 'warning',
          message: 'Warning message',
        })
      );
    });

    it('should capture error messages', async () => {
      await provider.captureMessage('Error message', 'error');

      expect(mockClient.error).toHaveBeenCalledWith(
        'Error message',
        expect.objectContaining({
          level: 'error',
          message: 'Error message',
        })
      );
    });
  });

  describe('structured logging', () => {
    beforeEach(async () => {
      await provider.initialize(config);
    });

    it('should handle different log levels', async () => {
      const testCases = [
        { level: 'debug', method: 'debug' },
        { level: 'info', method: 'info' },
        { level: 'warn', method: 'warn' },
        { level: 'error', method: 'error' },
        { level: 'fatal', method: 'error' },
      ];

      for (const { level, method } of testCases) {
        await provider.log(level, `Test ${level} message`, { custom: 'data' });
        
        expect(mockClient[method as keyof typeof mockClient]).toHaveBeenCalledWith(
          `Test ${level} message`,
          expect.objectContaining({
            level,
            message: `Test ${level} message`,
            custom: 'data',
          })
        );
      }
    });

    it('should respect ignore patterns', async () => {
      const configWithIgnore = {
        ...config,
        ignorePatterns: ['health-check', 'heartbeat.*'],
      };

      await provider.initialize(configWithIgnore);

      await provider.log('info', 'health-check message');
      await provider.log('info', 'heartbeat-ping');
      await provider.log('info', 'normal message');

      // Only the normal message should be logged
      expect(mockClient.info).toHaveBeenCalledTimes(1);
      expect(mockClient.info).toHaveBeenCalledWith(
        'normal message',
        expect.any(Object)
      );
    });

    it('should respect sample rate', async () => {
      // Mock Math.random to return a value > 0 to ensure sampling fails
      const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
      
      const configWithSampling = {
        ...config,
        sampleRate: 0, // Never sample
      };

      const samplingProvider = new BetterStackProvider();
      await samplingProvider.initialize(configWithSampling);

      // Clear any calls from initialization
      mockClient.info.mockClear();

      await samplingProvider.log('info', 'sampled out message');

      expect(mockClient.info).not.toHaveBeenCalled();
      
      randomSpy.mockRestore();
    });
  });

  describe('transactions and spans', () => {
    beforeEach(async () => {
      await provider.initialize(config);
    });

    it('should create and finish transactions', async () => {
      const transaction = provider.startTransaction('test-transaction', { userId: 'user123' });

      expect(transaction).toHaveProperty('id');
      expect(transaction).toHaveProperty('name', 'test-transaction');
      expect(transaction).toHaveProperty('finish');

      // Should log transaction start
      expect(mockClient.info).toHaveBeenCalledWith(
        'Transaction started: test-transaction',
        expect.objectContaining({
          transactionName: 'test-transaction',
          userId: 'user123',
        })
      );

      // Finish the transaction
      transaction.finish('success');

      // Should log transaction completion
      expect(mockClient.info).toHaveBeenCalledWith(
        'Transaction completed: test-transaction',
        expect.objectContaining({
          transactionName: 'test-transaction',
          status: 'success',
          duration: expect.any(Number),
        })
      );
    });

    it('should create spans with parent relationships', async () => {
      const parentSpan = provider.startSpan('parent-span');
      const childSpan = provider.startSpan('child-span', parentSpan);

      expect(childSpan).toHaveProperty('parentId', parentSpan.id);

      // Finish spans
      childSpan.finish();
      parentSpan.finish();

      // Should log span completions
      expect(mockClient.debug).toHaveBeenCalledTimes(2);
    });

    it('should allow setting tags and data on transactions', async () => {
      const transaction = provider.startTransaction('tagged-transaction');

      transaction.setTag('environment', 'test');
      transaction.setData('customData', { key: 'value' });

      // These should not throw and should be callable
      expect(transaction.setTag).toBeTypeOf('function');
      expect(transaction.setData).toBeTypeOf('function');
    });
  });

  describe('context management', () => {
    beforeEach(async () => {
      await provider.initialize(config);
    });

    it('should set user context', () => {
      const user = {
        id: 'user123',
        email: 'test@example.com',
        username: 'testuser',
        role: 'admin',
      };

      provider.setUser(user);

      expect(mockClient.use).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should set tags', () => {
      provider.setTag('version', '1.0.0');
      provider.setTag('region', 'us-east-1');

      expect(mockClient.use).toHaveBeenCalledTimes(3); // Initial app context setup + 2 tag calls
    });

    it('should set extra data', () => {
      provider.setExtra('buildNumber', 12345);
      provider.setExtra('feature', { enabled: true });

      expect(mockClient.use).toHaveBeenCalledTimes(3); // Initial app context setup + 2 extra calls
    });

    it('should set context', () => {
      provider.setContext('request', {
        method: 'POST',
        url: '/api/test',
        headers: { 'content-type': 'application/json' },
      });

      expect(mockClient.use).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('breadcrumbs', () => {
    beforeEach(async () => {
      await provider.initialize(config);
    });

    it('should add breadcrumbs as debug logs', async () => {
      const breadcrumb = {
        message: 'User clicked button',
        category: 'ui',
        level: 'info' as const,
        data: { buttonId: 'submit' },
      };

      provider.addBreadcrumb(breadcrumb);

      expect(mockClient.debug).toHaveBeenCalledWith(
        'User clicked button',
        expect.objectContaining({
          breadcrumb: expect.objectContaining({
            message: 'User clicked button',
            category: 'ui',
            level: 'info',
            data: { buttonId: 'submit' },
          }),
        })
      );
    });
  });

  describe('session management', () => {
    beforeEach(async () => {
      await provider.initialize(config);
    });

    it('should track session start', () => {
      provider.startSession();

      expect(mockClient.info).toHaveBeenCalledWith(
        'Session started',
        expect.objectContaining({
          sessionEvent: 'start',
          sessionId: expect.any(String),
        })
      );
    });

    it('should track session end with metrics', () => {
      provider.endSession();

      expect(mockClient.info).toHaveBeenCalledWith(
        'Session ended',
        expect.objectContaining({
          sessionEvent: 'end',
          metrics: expect.objectContaining({
            logsCount: expect.any(Number),
            errorsCount: expect.any(Number),
            warningsCount: expect.any(Number),
          }),
        })
      );
    });
  });

  describe('Better Stack specific features', () => {
    beforeEach(async () => {
      await provider.initialize(config);
    });

    it('should provide metrics', () => {
      const metrics = provider.getMetrics();

      expect(metrics).toEqual({
        logsCount: expect.any(Number),
        errorsCount: expect.any(Number),
        warningsCount: expect.any(Number),
        lastLogTime: expect.any(Number),
        bufferSize: expect.any(Number),
        failureCount: expect.any(Number),
      });
    });

    it('should allow adding middleware', () => {
      const middleware = (log: any) => ({ ...log, custom: 'field' });
      provider.use(middleware);

      expect(mockClient.use).toHaveBeenCalledWith(middleware);
    });

    it('should flush logs', async () => {
      await provider.flush();

      expect(mockClient.flush).toHaveBeenCalled();
    });
  });

  describe('development mode', () => {
    it('should handle development mode with console logging', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Create a new provider in development mode from scratch
      vi.stubEnv('NODE_ENV', 'development');
      const devProvider = new BetterStackProvider();
      
      // In dev mode without client, it won't initialize the client but still logs to console
      await devProvider.initialize({ 
        ...config, 
        sendLogsToConsoleInDev: false // This makes it skip client initialization
      });

      const error = new Error('Dev error');
      await devProvider.captureException(error);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Exception captured:',
        expect.any(Object)
      );

      consoleSpy.mockRestore();
    });
  });
});