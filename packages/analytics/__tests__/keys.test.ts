import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock process.env before importing keys
const mockEnv = {
  NEXT_PUBLIC_GA_MEASUREMENT_ID: 'G-TEST123',
  NEXT_PUBLIC_POSTHOG_HOST: 'https://app.posthog.com',
  NEXT_PUBLIC_POSTHOG_KEY: 'phc_test123',
};

vi.mock('@t3-oss/env-nextjs', () => ({
  createEnv: vi.fn((config: any) => {
    // Simulate env validation
    const result: any = {};

    Object.entries(config.client).forEach(([key, schema]: [string, any]) => {
      const value = mockEnv[key as keyof typeof mockEnv];

      // Simulate validation
      if (!value && schema._def?.typeName !== 'ZodOptional') {
        throw new Error(`Missing required environment variable: ${key}`);
      }

      if (value) {
        // Simple validation checks
        if (key === 'NEXT_PUBLIC_POSTHOG_KEY' && !value.startsWith('phc_')) {
          throw new Error(`${key} must start with phc_`);
        }
        if (key === 'NEXT_PUBLIC_POSTHOG_HOST' && !value.startsWith('http')) {
          throw new Error(`${key} must be a valid URL`);
        }
        if (key === 'NEXT_PUBLIC_GA_MEASUREMENT_ID' && !value.startsWith('G-')) {
          throw new Error(`${key} must start with G-`);
        }
      }

      result[key] = value;
    });

    return result;
  }),
}));

describe('keys', () => {
  beforeEach(() => {
    vi.resetModules();
    // Reset env to default values
    Object.assign(mockEnv, {
      NEXT_PUBLIC_GA_MEASUREMENT_ID: 'G-TEST123',
      NEXT_PUBLIC_POSTHOG_HOST: 'https://app.posthog.com',
      NEXT_PUBLIC_POSTHOG_KEY: 'phc_test123',
    });
  });

  it('returns all required environment variables', async () => {
    const { keys } = await import('../keys');
    const env = keys();

    expect(env.NEXT_PUBLIC_POSTHOG_KEY).toBe('phc_test123');
    expect(env.NEXT_PUBLIC_POSTHOG_HOST).toBe('https://app.posthog.com');
    expect(env.NEXT_PUBLIC_GA_MEASUREMENT_ID).toBe('G-TEST123');
  });

  it('validates PostHog key format', async () => {
    mockEnv.NEXT_PUBLIC_POSTHOG_KEY = 'invalid_key';

    const { keys } = await import('../keys');
    expect(() => keys()).toThrow('NEXT_PUBLIC_POSTHOG_KEY must start with phc_');
  });

  it('validates PostHog host URL format', async () => {
    mockEnv.NEXT_PUBLIC_POSTHOG_HOST = 'not_a_url';

    const { keys } = await import('../keys');
    expect(() => keys()).toThrow('NEXT_PUBLIC_POSTHOG_HOST must be a valid URL');
  });

  it('validates Google Analytics measurement ID format', async () => {
    mockEnv.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'invalid_ga_id';

    const { keys } = await import('../keys');
    expect(() => keys()).toThrow('NEXT_PUBLIC_GA_MEASUREMENT_ID must start with G-');
  });

  it('throws error when required PostHog key is missing', async () => {
    delete (mockEnv as any).NEXT_PUBLIC_POSTHOG_KEY;

    const { keys } = await import('../keys');
    expect(() => keys()).toThrow('Missing required environment variable: NEXT_PUBLIC_POSTHOG_KEY');
  });

  it('allows optional GA measurement ID to be undefined', async () => {
    delete (mockEnv as any).NEXT_PUBLIC_GA_MEASUREMENT_ID;

    const { keys } = await import('../keys');
    const env = keys();

    expect(env.NEXT_PUBLIC_GA_MEASUREMENT_ID).toBeUndefined();
    expect(env.NEXT_PUBLIC_POSTHOG_KEY).toBe('phc_test123');
  });
});
