import { describe, expect, test } from 'vitest';

describe('server Providers Coverage', () => {
  describe('grafana Server Provider', () => {
    test('should import grafana server provider', async () => {
      const grafanaModule = await import('../../src/server/providers/grafana-server');
      expect(grafanaModule).toBeDefined();
    });
  });

  describe('logtail Server Provider', () => {
    test('should import logtail server provider', async () => {
      const logtailModule = await import('../../src/server/providers/logtail-server');
      expect(logtailModule).toBeDefined();
    });
  });

  describe('logtail Server Next Provider', () => {
    test('should import logtail server next provider', async () => {
      const logtailNextModule = await import('../../src/server/providers/logtail-server-next');
      expect(logtailNextModule).toBeDefined();
    });
  });

  describe('sentry Server Provider', () => {
    test('should import sentry server provider', async () => {
      const sentryModule = await import('../../src/server/providers/sentry-server');
      expect(sentryModule).toBeDefined();
    });
  });

  describe('sentry Edge Provider', () => {
    test('should import sentry edge provider', async () => {
      const sentryEdgeModule = await import('../../src/server/providers/sentry-edge');
      expect(sentryEdgeModule).toBeDefined();
    });
  });

  describe('pino Provider', () => {
    test('should import pino provider', async () => {
      const pinoModule = await import('../../src/server/providers/pino-provider');
      expect(pinoModule).toBeDefined();
    });
  });

  describe('winston Provider', () => {
    test('should import winston provider', async () => {
      const winstonModule = await import('../../src/server/providers/winston-provider');
      expect(winstonModule).toBeDefined();
    });
  });

  describe('openTelemetry Provider', () => {
    test('should import opentelemetry provider', async () => {
      const otelModule = await import('../../src/server/providers/nodejs/opentelemetry-provider');
      expect(otelModule).toBeDefined();
    });
  });

  describe('vercel OTEL Provider', () => {
    test('should import vercel otel provider', async () => {
      const vercelOtelModule = await import(
        '../../src/server/providers/nodejs/vercel-otel-provider'
      );
      expect(vercelOtelModule).toBeDefined();
    });
  });
});
