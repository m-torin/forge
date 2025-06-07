import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock createEnv from @t3-oss/env-nextjs
const mockCreateEnv = vi.fn();
vi.mock('@t3-oss/env-nextjs', () => ({
  createEnv: mockCreateEnv,
}));

describe('Observability Keys Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    // Set up default mock return
    mockCreateEnv.mockReturnValue({
      LOGTAIL_SOURCE_TOKEN: 'test-logtail-token',
      NEXT_PUBLIC_SENTRY_DSN: 'https://test@sentry.io/12345',
      NODE_ENV: 'test',
      SENTRY_AUTH_TOKEN: 'test-auth-token',
      SENTRY_DSN: 'https://test@sentry.io/12345',
    });
  });

  it('should create environment configuration with required schema', async () => {
    await import('../../keys');

    // Check that createEnv was called with the expected structure
    expect(mockCreateEnv).toHaveBeenCalledTimes(1);
    const call = mockCreateEnv.mock.calls[0][0];

    // Verify the configuration has the expected top-level properties
    expect(call).toHaveProperty('runtimeEnv');
    expect(call).toHaveProperty('server');
    expect(call).toHaveProperty('client');

    // Verify runtimeEnv has expected keys
    expect(call.runtimeEnv).toHaveProperty('NODE_ENV');
    expect(call.runtimeEnv).toHaveProperty('SENTRY_DSN');
    expect(call.runtimeEnv).toHaveProperty('LOGTAIL_SOURCE_TOKEN');

    // Verify server schema has expected keys
    expect(call.server).toHaveProperty('NODE_ENV');
    expect(call.server).toHaveProperty('SENTRY_DSN');
    expect(call.server).toHaveProperty('LOGTAIL_SOURCE_TOKEN');

    // Verify client schema has expected keys
    expect(call.client).toHaveProperty('NEXT_PUBLIC_SENTRY_DSN');
  });

  it('should handle missing optional Sentry configuration', async () => {
    mockCreateEnv.mockReturnValue({
      LOGTAIL_SOURCE_TOKEN: undefined,
      NEXT_PUBLIC_SENTRY_DSN: undefined,
      NODE_ENV: 'test',
      SENTRY_AUTH_TOKEN: undefined,
      SENTRY_DSN: undefined,
    });

    const { observabilityKeys } = await import('../../keys');

    expect(observabilityKeys).toBeDefined();
    expect(observabilityKeys.SENTRY_DSN).toBeUndefined();
    expect(observabilityKeys.SENTRY_AUTH_TOKEN).toBeUndefined();
  });

  it('should provide Sentry configuration when available', async () => {
    const { observabilityKeys } = await import('../../keys');

    expect(observabilityKeys.SENTRY_DSN).toBe('https://test@sentry.io/12345');
    expect(observabilityKeys.SENTRY_AUTH_TOKEN).toBe('test-auth-token');
    expect(observabilityKeys.NEXT_PUBLIC_SENTRY_DSN).toBe('https://test@sentry.io/12345');
  });

  it('should provide Logtail configuration when available', async () => {
    const { observabilityKeys } = await import('../../keys');

    expect(observabilityKeys.LOGTAIL_SOURCE_TOKEN).toBe('test-logtail-token');
  });

  it('should include NODE_ENV in configuration', async () => {
    const { observabilityKeys } = await import('../../keys');

    expect(observabilityKeys.NODE_ENV).toBe('test');
  });

  it('should allow empty strings for optional fields', async () => {
    mockCreateEnv.mockReturnValue({
      LOGTAIL_SOURCE_TOKEN: '',
      NEXT_PUBLIC_SENTRY_DSN: '',
      NODE_ENV: 'development',
      SENTRY_AUTH_TOKEN: '',
      SENTRY_DSN: '',
    });

    const { observabilityKeys } = await import('../../keys');

    expect(observabilityKeys.SENTRY_DSN).toBe('');
    expect(observabilityKeys.LOGTAIL_SOURCE_TOKEN).toBe('');
  });
});
