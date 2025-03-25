import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { log as logtail } from '@logtail/next';

// Store the original NODE_ENV
let originalNodeEnv: string | undefined;

describe.skip('Logging', () => {
  beforeEach(() => {
    // Store the original NODE_ENV
    originalNodeEnv = process.env.NODE_ENV;

    // Reset mocks
    vi.resetAllMocks();

    // Re-mock @logtail/next for each test
    vi.mock('@logtail/next', () => ({
      log: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
      },
    }));

    // Mock console methods
    console.info = vi.fn();
    console.error = vi.fn();
    console.warn = vi.fn();
    console.debug = vi.fn();
  });

  afterEach(() => {
    // Restore the original NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;

    // Clear module cache to ensure log.ts is re-evaluated with the new NODE_ENV
    vi.resetModules();
  });

  it('uses Logtail in production environment', async () => {
    // Set NODE_ENV to production
    process.env.NODE_ENV = 'production';

    // Import the module to test (must be done after setting NODE_ENV)
    const { log } = await import('../log');

    // Verify that log is defined
    expect(log).toBeDefined();

    // Test logging methods
    log.info('Test info message');
    log.error('Test error message');
    log.warn('Test warning message');

    // Since we're testing the production mode where log should be logtail
    // we can check if logtail methods were called
    expect(vi.mocked(logtail.info)).toHaveBeenCalledWith('Test info message');
    expect(vi.mocked(logtail.error)).toHaveBeenCalledWith('Test error message');
    expect(vi.mocked(logtail.warn)).toHaveBeenCalledWith(
      'Test warning message',
    );
  });

  it('uses console in development environment', async () => {
    // Set NODE_ENV to development
    process.env.NODE_ENV = 'development';

    // Import the module to test (must be done after setting NODE_ENV)
    const { log } = await import('../log');

    // Verify that log is defined
    expect(log).toBeDefined();

    // Test logging methods
    log.info('Test info message');
    log.error('Test error message');
    log.warn('Test warning message');

    // Verify that console methods were called
    expect(console.info).toHaveBeenCalledWith('Test info message');
    expect(console.error).toHaveBeenCalledWith('Test error message');
    expect(console.warn).toHaveBeenCalledWith('Test warning message');
  });

  it('uses console in test environment', async () => {
    // Set NODE_ENV to test
    process.env.NODE_ENV = 'test';

    // Import the module to test (must be done after setting NODE_ENV)
    const { log } = await import('../log');

    // Verify that log is defined
    expect(log).toBeDefined();

    // Test logging methods
    log.info('Test info message');
    log.error('Test error message');
    log.warn('Test warning message');

    // Verify that console methods were called
    expect(console.info).toHaveBeenCalledWith('Test info message');
    expect(console.error).toHaveBeenCalledWith('Test error message');
    expect(console.warn).toHaveBeenCalledWith('Test warning message');
  });
});
