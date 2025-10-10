import { afterEach, beforeEach, describe, expect, test } from 'vitest';

describe('3p-vercel config utilities', () => {
  const REAL_ENV = process.env;
  const REAL_WINDOW: any = globalThis.window;
  const REAL_LOCALSTORAGE: any = (globalThis as any).localStorage;

  beforeEach(() => {
    process.env = { ...REAL_ENV };
    delete process.env.VERCEL;
    delete process.env.VERCEL_ENV;
    delete process.env.VERCEL_ANALYTICS_ID;
    delete process.env.VERCEL_REGION;
    // reset window/localStorage mocks
    (globalThis as any).window = undefined;
    (globalThis as any).localStorage = undefined;
  });

  afterEach(() => {
    process.env = REAL_ENV;
    (globalThis as any).window = REAL_WINDOW;
    (globalThis as any).localStorage = REAL_LOCALSTORAGE;
  });

  test('getVercelEnvironmentConfig reads from env', async () => {
    const { getVercelEnvironmentConfig } = await import('../src/config');
    process.env.VERCEL = '1';
    process.env.VERCEL_ENV = 'production';
    process.env.VERCEL_ANALYTICS_ID = 'va_123';
    process.env.VERCEL_REGION = 'iad1';
    const info = getVercelEnvironmentConfig();
    expect(info.isVercelEnvironment).toBe(true);
    expect(info.isProduction).toBe(true);
    expect(info.analyticsId).toBe('va_123');
    expect(info.region).toBe('iad1');
  });

  test('validateVercelConfig validates provider, mode, endpoint', async () => {
    const { validateVercelConfig } = await import('../src/config');
    const ok = validateVercelConfig({ provider: 'vercel', endpoint: 'https://example.com' } as any);
    expect(ok.valid).toBe(true);
    expect(ok.errors).toHaveLength(0);

    const badProvider = validateVercelConfig({ provider: 'x' } as any);
    expect(badProvider.valid).toBe(false);

    const badMode = validateVercelConfig({ provider: 'vercel', mode: 'weird' as any } as any);
    expect(badMode.valid).toBe(false);

    const badEndpoint = validateVercelConfig({ provider: 'vercel', endpoint: 'http:/bad' } as any);
    expect(badEndpoint.valid).toBe(false);
    // Exercise default builders
    const { createVercelConfig, createAnalyticsConfig, createQueryParamHandler } = await import(
      '../src/config'
    );
    const cfg = createVercelConfig({ debug: true });
    expect(cfg.provider).toBe('vercel');
    expect(cfg.debug).toBe(true);
    const acfg = createAnalyticsConfig({ mode: 'production' });
    expect(acfg.mode).toBe('production');
    const qp = createQueryParamHandler(['utm_source']);
    const out = qp({ url: 'https://ex.com/?utm_source=x&x=1' } as any);
    expect(out.url).toContain('x=1');
    expect(out.url).not.toContain('utm_source');
  });

  test('createPrivacyHandler drops events when localStorage flag present', async () => {
    const { createPrivacyHandler } = await import('../src/config');
    (globalThis as any).window = {};
    (globalThis as any).localStorage = {
      getItem: (k: string) => (k === 'va-disable' ? '1' : null),
    };
    const handler = createPrivacyHandler();
    const result = handler({ url: 'https://example.com' });
    expect(result).toBeNull();
  });

  test('createRouteExclusionHandler returns null on match and event otherwise', async () => {
    const { createRouteExclusionHandler } = await import('../src/config');
    const handler = createRouteExclusionHandler(['/admin', /secret/]);
    expect(handler({ url: '/admin/panel' } as any)).toBeNull();
    expect(handler({ url: '/user/secret' } as any)).toBeNull();
    const evt = { url: '/home' } as any;
    expect(handler(evt)).toBe(evt);
  });
});
