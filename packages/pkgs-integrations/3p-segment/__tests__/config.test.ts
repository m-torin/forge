import { afterEach, beforeEach, describe, expect, test } from 'vitest';

describe('3p-segment config utilities', () => {
  const REAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...REAL_ENV };
    delete process.env.SEGMENT_WRITE_KEY;
    delete process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY;
    delete process.env.SEGMENT_DATAPLANE;
    delete process.env.NEXT_PUBLIC_SEGMENT_DATAPLANE;
  });
  afterEach(() => {
    process.env = REAL_ENV;
  });

  test('createSegmentConfig merges overrides and sets defaults', async () => {
    const { createSegmentConfig } = await import('../src/config');
    const cfg = createSegmentConfig('A'.repeat(32), { debug: true, anonymizeIP: true } as any);
    expect(cfg.provider).toBe('segment');
    expect(cfg.debug).toBe(true);
    expect(cfg.anonymizeIP).toBe(true);
  });

  test('getSegmentEnvironmentConfig maps env and region', async () => {
    const { getSegmentEnvironmentConfig } = await import('../src/config');
    process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY = 'B'.repeat(32);
    process.env.NEXT_PUBLIC_SEGMENT_DATAPLANE = 'https://api.eu.segment.io';
    const env = getSegmentEnvironmentConfig();
    expect(env.writeKey).toBe('B'.repeat(32));
    expect(env.region).toBe('eu');
    expect(env.isSegmentWorkspace).toBe(true);
  });

  test('validateSegmentConfig reports errors and warnings appropriately', async () => {
    const { validateSegmentConfig } = await import('../src/config');
    const bad = validateSegmentConfig({ provider: 'x' } as any);
    expect(bad.valid).toBe(false);
    expect(bad.errors.length).toBeGreaterThan(0);

    const warn = validateSegmentConfig({ provider: 'segment', writeKey: 'short' } as any);
    expect(warn.valid).toBe(true);
    expect(warn.warnings.length).toBeGreaterThan(0);

    const ok = validateSegmentConfig({
      provider: 'segment',
      writeKey: 'C'.repeat(32),
      dataplane: 'https://api.segment.io',
      batchSize: 10,
      flushInterval: 2000,
      maxEventsInBatch: 100,
      timeout: 2000,
      gdpr: { enabled: true, defaultConsent: true, consentTypes: ['necessary'] },
      integrations: {
        amplitude: { enabled: true },
      },
    } as any);
    expect(ok.valid).toBe(true);
    expect(ok.errors).toHaveLength(0);
  });

  test('integration helpers build configs', async () => {
    const {
      createIntegrationConfig,
      createDestinationFilter,
      buildIntegrationsConfig,
      createClientConfig,
      createServerConfig,
      createWarehouseConfig,
      commonIntegrations,
    } = await import('../src/config');

    const intCfg = createIntegrationConfig(true, { foo: 'bar' });
    expect(intCfg.enabled).toBe(true);
    expect(intCfg.options.foo).toBe('bar');

    const filter = createDestinationFilter({ event: 'Signup' }, 'drop');
    expect(filter.drop).toBe(true);

    const integrations = buildIntegrationsConfig([
      { name: 'amplitude', enabled: true, options: { apiKey: 'k' } },
    ]);
    expect(integrations.amplitude.enabled).toBe(true);

    const client = createClientConfig('D'.repeat(32));
    expect(client.anonymizeIP).toBe(true);
    const server = createServerConfig('E'.repeat(32));
    expect(server.maxEventsInBatch).toBe(500);
    const warehouse = createWarehouseConfig('F'.repeat(32), ['s3']);
    expect(warehouse.warehouse?.enabled).toBe(true);

    // common integrations
    const ga = commonIntegrations.googleAnalytics('G-123');
    expect(ga.enabled).toBe(true);
    const fb = commonIntegrations.facebookPixel('PX-123', false);
    expect(fb.enabled).toBe(false);
  });
});
