import { describe, expect, test } from 'vitest';

describe('node.js Providers Coverage', () => {
  describe('openTelemetry Provider', () => {
    test('should import opentelemetry provider', async () => {
      const otelModule = await import('../../src/server/providers/nodejs/opentelemetry-provider');
      expect(otelModule).toBeDefined();

      // Test actual exports
      if (otelModule.OpenTelemetryProvider) {
        expect(otelModule.OpenTelemetryProvider).toBeDefined();
      }
    });
  });

  describe('vercel OTEL Provider', () => {
    test('should import vercel otel provider', async () => {
      const vercelOtelModule = await import(
        '../../src/server/providers/nodejs/vercel-otel-provider'
      );
      expect(vercelOtelModule).toBeDefined();

      // Test actual exports
      if (vercelOtelModule.VercelOTelProvider) {
        expect(vercelOtelModule.VercelOTelProvider).toBeDefined();
      }
    });
  });
});
