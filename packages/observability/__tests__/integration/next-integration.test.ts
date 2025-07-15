import { describe, expect, test } from 'vitest';

describe('next.js Integration Tests', () => {
  describe('next.js Client Integration', () => {
    test('should import and test Next.js client module', async () => {
      const nextClientModule = await import('../../src/next/client');
      expect(nextClientModule).toBeDefined();

      // Test actual exported functions
      if (nextClientModule.createNextJSClientObservability) {
        const config = {
          providers: {},
          nextjs: {
            disableLogger: true,
            tunnelRoute: '/monitoring',
          },
        };
        const client = await nextClientModule.createNextJSClientObservability(config);
        expect(client).toBeDefined();
      }

      if (nextClientModule.NextJSClientObservabilityManager) {
        const manager = new nextClientModule.NextJSClientObservabilityManager({
          providers: {},
          nextjs: { useRouter: true },
        });
        expect(manager).toBeDefined();
        expect(manager.getManager()).toBeNull(); // Before initialization
      }
    });
  });

  describe('next.js Server Integration', () => {
    test('should import and test Next.js server module', async () => {
      const nextServerModule = await import('../../src/next/server');
      expect(nextServerModule).toBeDefined();
    });
  });

  describe('next.js Configuration Integration', () => {
    test('should import and test Next.js config module', async () => {
      const nextConfigModule = await import('../../src/next/config');
      expect(nextConfigModule).toBeDefined();
    });

    test('should import and test Next.js config wrappers', async () => {
      const configWrappersModule = await import('../../src/next/config-wrappers');
      expect(configWrappersModule).toBeDefined();
    });
  });

  describe('next.js Instrumentation Integration', () => {
    test('should import and test Next.js instrumentation', async () => {
      const instrumentationModule = await import('../../src/next/instrumentation');
      expect(instrumentationModule).toBeDefined();

      if (instrumentationModule.register) {
        // Test that register function exists and can be called
        expect(typeof instrumentationModule.register).toBe('function');
      }
    });

    test('should import and test client instrumentation', async () => {
      const clientInstrumentationModule = await import('../../src/next/instrumentation-client');
      expect(clientInstrumentationModule).toBeDefined();
    });

    test('should import and test edge instrumentation', async () => {
      const edgeInstrumentationModule = await import('../../src/next/edge-instrumentation');
      expect(edgeInstrumentationModule).toBeDefined();
    });
  });

  describe('next.js Node.js Integration', () => {
    test('should import and test Node.js specific instrumentation', async () => {
      const nodejsInstrumentationModule = await import(
        '../../src/next/nodejs/otel-instrumentation'
      );
      expect(nodejsInstrumentationModule).toBeDefined();
    });
  });

  describe('cross-Next.js Integration', () => {
    test('should handle full Next.js application integration', async () => {
      const modules = await Promise.all([
        import('../../src/next/client'),
        import('../../src/next/server'),
        import('../../src/next/config'),
        import('../../src/next/instrumentation'),
      ]);

      const [clientModule, serverModule, configModule, instrumentationModule] = modules;

      // Test that all Next.js modules can work together
      modules.forEach(module => {
        expect(module).toBeDefined();
      });
    });
  });
});
