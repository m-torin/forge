import { describe, expect, test, vi, beforeEach } from 'vitest';

// Mock server-only
vi.mock('server-only', () => ({}));

describe('server', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('module exports object', async () => {
    const server = await import('../src/server');

    expect(server).toBeDefined();
    expect(typeof server).toBe('object');
  });

  test('exports core functions', async () => {
    const server = await import('../src/server');

    expect(server.createServerObservability).toBeDefined();
    expect(typeof server.createServerObservability).toBe('function');
    
    expect(server.createServerObservabilityUninitialized).toBeDefined();
    expect(typeof server.createServerObservabilityUninitialized).toBe('function');
    
    expect(server.createServerObservabilityManager).toBeDefined();
    expect(typeof server.createServerObservabilityManager).toBe('function');
  });

  test('exports error handling utilities', async () => {
    const server = await import('../src/server');

    expect(server.createErrorBoundaryHandler).toBeDefined();
    expect(server.createSafeFunction).toBeDefined();
    expect(server.parseAndCaptureError).toBeDefined();
    expect(server.parseError).toBeDefined();
    expect(server.withErrorHandling).toBeDefined();
  });

  test('exports validation utilities', async () => {
    const server = await import('../src/server');

    expect(server.debugConfig).toBeDefined();
    expect(server.validateConfig).toBeDefined();
  });

  test('exports logger functions', async () => {
    const server = await import('../src/server');

    expect(server.configureLogger).toBeDefined();
    expect(server.logDebug).toBeDefined();
    expect(server.logError).toBeDefined();
    expect(server.logInfo).toBeDefined();
    expect(server.logWarn).toBeDefined();
  });

  test('exports ObservabilityManagerClass', async () => {
    const server = await import('../src/server');

    expect(server.ObservabilityManagerClass).toBeDefined();
    expect(typeof server.ObservabilityManagerClass).toBe('function');
  });

  test('createServerObservabilityUninitialized creates manager without initialization', async () => {
    const server = await import('../src/server');
    
    const config = {
      providers: {
        console: { enabled: true }
      }
    };

    const manager = server.createServerObservabilityUninitialized(config);
    
    expect(manager).toBeDefined();
    expect(typeof manager).toBe('object');
    expect(manager.initialize).toBeDefined();
    expect(manager.captureException).toBeDefined();
    expect(manager.log).toBeDefined();
  });

  test('createServerObservability creates and initializes manager', async () => {
    const server = await import('../src/server');
    
    const config = {
      providers: {
        console: { enabled: true }
      }
    };

    const manager = await server.createServerObservability(config);
    
    expect(manager).toBeDefined();
    expect(typeof manager).toBe('object');
    expect(manager.captureException).toBeDefined();
    expect(manager.log).toBeDefined();
  });

  test('createServerObservability handles empty config', async () => {
    const server = await import('../src/server');
    
    const config = {
      providers: {}
    };

    const manager = await server.createServerObservability(config);
    
    expect(manager).toBeDefined();
    expect(typeof manager).toBe('object');
  });

  test('createServerObservability handles complex config', async () => {
    const server = await import('../src/server');
    
    const config = {
      providers: {
        console: { enabled: true },
        sentry: { dsn: 'test-dsn' }
      },
      globalOptions: {
        timeout: 5000
      }
    };

    const manager = await server.createServerObservability(config);
    
    expect(manager).toBeDefined();
    expect(typeof manager).toBe('object');
  });

  test('createServerObservabilityManager creates manager with providers', async () => {
    const server = await import('../src/server');
    
    const config = {
      providers: {
        console: { enabled: true }
      }
    };

    const manager = server.createServerObservabilityManager(config, {});
    
    expect(manager).toBeDefined();
    expect(typeof manager).toBe('object');
    expect(manager.initialize).toBeDefined();
    expect(manager.captureException).toBeDefined();
    expect(manager.log).toBeDefined();
  });

  test('handles undefined config gracefully', async () => {
    const server = await import('../src/server');
    
    const manager = server.createServerObservabilityUninitialized({} as any);
    
    expect(manager).toBeDefined();
    expect(typeof manager).toBe('object');
  });

  test('creates manager with multiple providers', async () => {
    const server = await import('../src/server');
    
    const config = {
      providers: {
        console: { enabled: true },
        sentry: { dsn: 'test-dsn' },
        opentelemetry: { enabled: true }
      }
    };

    const manager = server.createServerObservabilityUninitialized(config);
    
    expect(manager).toBeDefined();
    expect(typeof manager).toBe('object');
  });

  test('creates manager with server-specific providers', async () => {
    const server = await import('../src/server');
    
    const config = {
      providers: {
        console: { enabled: true },
        'vercel-otel': { serviceName: 'test-service' },
        grafanaMonitoring: { enabled: true },
        logtail: { token: 'test-token' }
      }
    };

    const manager = server.createServerObservabilityUninitialized(config);
    
    expect(manager).toBeDefined();
    expect(typeof manager).toBe('object');
  });
});
