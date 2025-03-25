import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { init } from '@sentry/nextjs';

// Mock @sentry/nextjs for all tests
vi.mock('@sentry/nextjs', () => ({
  init: vi.fn().mockReturnValue({}),
}));

describe('Instrumentation', () => {
  // Store the original environment variables
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Store original environment variables
    originalEnv = { ...process.env };
    vi.resetModules();
    vi.resetAllMocks();
  });

  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  it.skip('initializes Sentry for Node.js runtime', () => {
    // Set the runtime environment
    process.env.NEXT_RUNTIME = 'nodejs';
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/1234';

    // Import the module to test (must be done after setting NEXT_RUNTIME)
    const { initializeSentry } = require('../instrumentation');

    // Call the function
    initializeSentry();

    // Verify that init was called with the correct configuration
    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: 'https://test@sentry.io/1234',
      }),
    );
  });

  it.skip('initializes Sentry for Edge runtime', () => {
    // Set the runtime environment
    process.env.NEXT_RUNTIME = 'edge';
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/1234';

    // Import the module to test (must be done after setting NEXT_RUNTIME)
    const { initializeSentry } = require('../instrumentation');

    // Call the function
    initializeSentry();

    // Verify that init was called with the correct configuration
    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: 'https://test@sentry.io/1234',
      }),
    );
  });

  it.skip('does not initialize Sentry for unknown runtime', () => {
    // Set the runtime environment to an unknown value
    process.env.NEXT_RUNTIME = 'unknown';
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/1234';

    // Import the module to test (must be done after setting NEXT_RUNTIME)
    const { initializeSentry } = require('../instrumentation');

    // Call the function
    initializeSentry();

    // Verify that init was not called
    expect(init).not.toHaveBeenCalled();
  });

  it.skip('uses the DSN from environment variables', () => {
    // Set the runtime environment
    process.env.NEXT_RUNTIME = 'nodejs';
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://custom@sentry.io/5678';

    // Import the module to test (must be done after setting NEXT_RUNTIME)
    const { initializeSentry } = require('../instrumentation');

    // Call the function
    initializeSentry();

    // Verify that init was called with the correct DSN
    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: 'https://custom@sentry.io/5678',
      }),
    );
  });

  it.skip('handles missing DSN gracefully', () => {
    // Set the runtime environment but no DSN
    process.env.NEXT_RUNTIME = 'nodejs';
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;

    // Import the module to test (must be done after setting NEXT_RUNTIME)
    const { initializeSentry } = require('../instrumentation');

    // Call the function
    const result = initializeSentry();

    // Verify that init was not called
    expect(init).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });
});
