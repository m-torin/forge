import { afterEach, beforeEach, describe, expect, test } from 'vitest';

describe('3p-posthog config utilities', () => {
  const REAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...REAL_ENV };
    delete process.env.POSTHOG_KEY;
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY;
    delete process.env.POSTHOG_HOST;
    delete process.env.NEXT_PUBLIC_POSTHOG_HOST;
    delete process.env.POSTHOG_PERSONAL_API_KEY;
    delete process.env.POSTHOG_PROJECT_ID;
  });
  afterEach(() => {
    process.env = REAL_ENV;
  });

  test('createPostHogConfig merges overrides and sets defaults', async () => {
    const { createPostHogConfig } = await import('../src/config');
    const cfg = createPostHogConfig('phc_1234567890123456789012345678901234567', {
      debug: true,
      persistence: 'memory',
    } as any);
    expect(cfg.provider).toBe('posthog');
    expect(cfg.debug).toBe(true);
    expect(cfg.persistence).toBe('memory');
  });

  test('getPostHogEnvironmentConfig maps env and region', async () => {
    const { getPostHogEnvironmentConfig } = await import('../src/config');
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'phc_abc';
    process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://app.eu.posthog.com';
    const env = getPostHogEnvironmentConfig();
    expect(env.apiKey).toBe('phc_abc');
    expect(env.region).toBe('eu');
    expect(env.isPostHogCloud).toBe(true);
  });

  test('validatePostHogConfig reports errors and warnings appropriately', async () => {
    const { validatePostHogConfig } = await import('../src/config');
    const bad = validatePostHogConfig({ provider: 'x' } as any);
    expect(bad.valid).toBe(false);
    expect(bad.errors.length).toBeGreaterThan(0);

    const warn = validatePostHogConfig({
      provider: 'posthog',
      apiKey: 'short',
      host: 'https://app.posthog.com',
    } as any);
    expect(warn.valid).toBe(true);
    expect(warn.warnings.length).toBeGreaterThan(0);

    const ok = validatePostHogConfig({
      provider: 'posthog',
      apiKey: 'phc_1234567890123456789012345678901234567',
      host: 'https://app.posthog.com',
      batchSize: 10,
      flushInterval: 2000,
      persistence: 'cookie',
    } as any);
    expect(ok.valid).toBe(true);
    expect(ok.errors).toHaveLength(0);

    // Additional negative branches
    const badHost = validatePostHogConfig({
      provider: 'posthog',
      apiKey: 'phc_abc',
      host: 'ftp://x',
    } as any);
    expect(badHost.valid).toBe(false);

    const badBatch = validatePostHogConfig({
      provider: 'posthog',
      apiKey: 'phc_a',
      batchSize: -1,
    } as any);
    expect(badBatch.valid).toBe(false);

    const badFlush = validatePostHogConfig({
      provider: 'posthog',
      apiKey: 'phc_a',
      flushInterval: 999,
    } as any);
    expect(badFlush.valid).toBe(false);

    const badPersistence = validatePostHogConfig({
      provider: 'posthog',
      apiKey: 'phc_a',
      persistence: 'bad' as any,
    } as any);
    expect(badPersistence.valid).toBe(false);

    const warnRecording = validatePostHogConfig({
      provider: 'posthog',
      apiKey: 'phc_a',
      session_recording: { recordBody: true, maskAllInputs: false },
    } as any);
    expect(warnRecording.warnings.length).toBeGreaterThan(0);

    const warnPersonal = validatePostHogConfig({
      provider: 'posthog',
      apiKey: 'phc_a',
      personalApiKey: 'phx_123',
    } as any);
    expect(warnPersonal.warnings.length).toBeGreaterThan(0);
  });

  test('createServerConfig and createClientConfig set optimized defaults', async () => {
    const { createServerConfig, createClientConfig } = await import('../src/config');
    const server = createServerConfig('phc_server', 'ph_personal');
    expect(server.autocapture).toBe(false);
    expect(server.session_recording).toBeUndefined();
    const client = createClientConfig('phc_client');
    expect(client.autocapture).toBe(true);
    expect(client.session_recording).toBeDefined();
  });
});
