import { describe, expect, test, vi, beforeEach } from 'vitest';

describe('client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('module exports object', async () => {
    const client = await import('../src/client');

    expect(client).toBeDefined();
    expect(typeof client).toBe('object');
  });

  test('exports core functions', async () => {
    const client = await import('../src/client');

    expect(client.createClientObservability).toBeDefined();
    expect(typeof client.createClientObservability).toBe('function');
    
    expect(client.createClientObservabilityUninitialized).toBeDefined();
    expect(typeof client.createClientObservabilityUninitialized).toBe('function');
    
    expect(client.createClientObservabilityManager).toBeDefined();
    expect(typeof client.createClientObservabilityManager).toBe('function');
  });

  test('exports error handling utilities', async () => {
    const client = await import('../src/client');

    expect(client.createErrorBoundaryHandler).toBeDefined();
    expect(client.createSafeFunction).toBeDefined();
    expect(client.parseAndCaptureError).toBeDefined();
    expect(client.parseError).toBeDefined();
    expect(client.withErrorHandling).toBeDefined();
  });

  test('exports validation utilities', async () => {
    const client = await import('../src/client');

    expect(client.debugConfig).toBeDefined();
    expect(client.validateConfig).toBeDefined();
  });

  test('exports lazy loading utilities', async () => {
    const client = await import('../src/client');

    expect(client.analyzeBundleSize).toBeDefined();
    expect(client.clearProviderCache).toBeDefined();
    expect(client.createLazyProviderLoader).toBeDefined();
    expect(client.preloadProviders).toBeDefined();
  });

  test('exports logger functions', async () => {
    const client = await import('../src/client');

    expect(client.configureLogger).toBeDefined();
    expect(client.logDebug).toBeDefined();
    expect(client.logError).toBeDefined();
    expect(client.logInfo).toBeDefined();
    expect(client.logWarn).toBeDefined();
  });

  test('exports ObservabilityManagerClass', async () => {
    const client = await import('../src/client');

    expect(client.ObservabilityManagerClass).toBeDefined();
    expect(typeof client.ObservabilityManagerClass).toBe('function');
  });

  test('createClientObservabilityUninitialized creates manager without initialization', async () => {
    const client = await import('../src/client');
    
    const config = {
      providers: {
        console: { enabled: true }
      }
    };

    const manager = client.createClientObservabilityUninitialized(config);
    
    expect(manager).toBeDefined();
    expect(typeof manager).toBe('object');
    expect(manager.initialize).toBeDefined();
    expect(manager.captureException).toBeDefined();
    expect(manager.log).toBeDefined();
  });

  test('createClientObservability creates and initializes manager', async () => {
    const client = await import('../src/client');
    
    const config = {
      providers: {
        console: { enabled: true }
      }
    };

    const manager = await client.createClientObservability(config);
    
    expect(manager).toBeDefined();
    expect(typeof manager).toBe('object');
    expect(manager.captureException).toBeDefined();
    expect(manager.log).toBeDefined();
  });

  test('createClientObservability handles empty config', async () => {
    const client = await import('../src/client');
    
    const config = {
      providers: {}
    };

    const manager = await client.createClientObservability(config);
    
    expect(manager).toBeDefined();
    expect(typeof manager).toBe('object');
  });

  test('createClientObservability handles complex config', async () => {
    const client = await import('../src/client');
    
    const config = {
      providers: {
        console: { enabled: true },
        sentry: { dsn: 'test-dsn' }
      },
      globalOptions: {
        timeout: 5000
      }
    };

    const manager = await client.createClientObservability(config);
    
    expect(manager).toBeDefined();
    expect(typeof manager).toBe('object');
  });

  test('createClientObservabilityManager creates manager with providers', async () => {
    const client = await import('../src/client');
    
    const config = {
      providers: {
        console: { enabled: true }
      }
    };

    const manager = client.createClientObservabilityManager(config, {});
    
    expect(manager).toBeDefined();
    expect(typeof manager).toBe('object');
    expect(manager.initialize).toBeDefined();
    expect(manager.captureException).toBeDefined();
    expect(manager.log).toBeDefined();
  });

  test('handles undefined config gracefully', async () => {
    const client = await import('../src/client');
    
    const manager = client.createClientObservabilityUninitialized({} as any);
    
    expect(manager).toBeDefined();
    expect(typeof manager).toBe('object');
  });

  test('creates manager with multiple providers', async () => {
    const client = await import('../src/client');
    
    const config = {
      providers: {
        console: { enabled: true },
        sentry: { dsn: 'test-dsn' },
        grafanaMonitoring: { enabled: true }
      }
    };

    const manager = client.createClientObservabilityUninitialized(config);
    
    expect(manager).toBeDefined();
    expect(typeof manager).toBe('object');
  });
});
