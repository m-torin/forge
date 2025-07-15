import { describe, expect, test } from 'vitest';

describe('client Providers Coverage', () => {
  describe('grafana Client Provider', () => {
    test('should import grafana client provider', async () => {
      const grafanaClientModule = await import('../../src/client/providers/grafana-client');
      expect(grafanaClientModule).toBeDefined();
    });
  });

  describe('logtail Client Provider', () => {
    test('should import logtail client provider', async () => {
      const logtailClientModule = await import('../../src/client/providers/logtail-client');
      expect(logtailClientModule).toBeDefined();
    });
  });

  describe('logtail Client Next Provider', () => {
    test('should import logtail client next provider', async () => {
      const logtailClientNextModule = await import(
        '../../src/client/providers/logtail-client-next'
      );
      expect(logtailClientNextModule).toBeDefined();
    });
  });

  describe('sentry Client Provider', () => {
    test('should import sentry client provider', async () => {
      const sentryClientModule = await import('../../src/client/providers/sentry-client');
      expect(sentryClientModule).toBeDefined();
    });
  });
});
