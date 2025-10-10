/**
 * Branch coverage tests for config utilities
 */
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

const REAL_ENV = process.env;

describe('config branch coverage', () => {
  beforeEach(() => {
    process.env = { ...REAL_ENV };
    (process.env as any).NODE_ENV = undefined;
    (process.env as any).APP_ENV = undefined;
    (process.env as any).SEGMENT_WRITE_KEY = undefined;
    (process.env as any).POSTHOG_API_KEY = undefined;
  });

  afterEach(() => {
    process.env = REAL_ENV;
  });

  test('server getAnalyticsConfig: development path adds console', async () => {
    const { getAnalyticsConfig } = await import('#/shared/utils/config');
    (process.env as any).NODE_ENV = 'development';
    const cfg = getAnalyticsConfig();
    expect(cfg.providers.console).toBeDefined();
  });

  test('server getAnalyticsConfig: staging path adds console and optional posthog', async () => {
    const { getAnalyticsConfig } = await import('#/shared/utils/config');
    (process.env as any).APP_ENV = 'staging';
    (process.env as any).POSTHOG_API_KEY = undefined;
    const cfg1 = getAnalyticsConfig();
    expect(cfg1.providers.console).toBeDefined();
    expect(cfg1.providers.posthog).toBeUndefined();

    process.env.POSTHOG_API_KEY = 'ph_test';
    const cfg2 = getAnalyticsConfig();
    expect(cfg2.providers.console).toBeDefined();
    expect(cfg2.providers.posthog).toBeDefined();
  });

  test('server getAnalyticsConfig: production path adds vercel + segment/posthog when keys present', async () => {
    const { getAnalyticsConfig } = await import('#/shared/utils/config');
    process.env.SEGMENT_WRITE_KEY = 'seg_test';
    process.env.POSTHOG_API_KEY = 'ph_test';
    const cfg = getAnalyticsConfig();
    expect(cfg.providers.vercel).toBeDefined();
    expect(cfg.providers.segment).toBeDefined();
    expect(cfg.providers.posthog).toBeDefined();
  });

  test('client getAnalyticsConfig: development, staging, production options', async () => {
    const { getAnalyticsConfig } = await import('#/shared/utils/config-client');

    const dev = getAnalyticsConfig({ isDevelopment: true });
    expect(dev.providers.console).toBeDefined();

    const staging = getAnalyticsConfig({ isStaging: true, posthogApiKey: 'ph' });
    expect(staging.providers.console).toBeDefined();
    expect(staging.providers.posthog).toBeDefined();

    const prod = getAnalyticsConfig({ segmentWriteKey: 'seg', posthogApiKey: 'ph' });
    expect(prod.providers.vercel).toBeDefined();
    expect(prod.providers.segment).toBeDefined();
    expect(prod.providers.posthog).toBeDefined();
  });

  test('validateConfig throws for missing providers object', async () => {
    const { validateConfig } = await import('#/shared/utils/config');
    expect(() => validateConfig({} as any)).toThrow(/providers/);
  });

  test('validateConfig throws for missing required provider fields', async () => {
    const { validateConfig } = await import('#/shared/utils/config');
    // Missing apiKey for posthog
    expect(() => validateConfig({ providers: { posthog: {} as any } } as any)).toThrow(/apiKey/);
    // Missing writeKey for segment
    expect(() => validateConfig({ providers: { segment: {} as any } } as any)).toThrow(/writeKey/);
  });
});
