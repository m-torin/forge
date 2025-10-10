import { describe, expect, it } from 'vitest';

describe('browser-stub', () => {
  it('throws clear error when trying to import server modules in browser environment', async () => {
    // Mock environment to simulate browser/edge by removing Node.js globals
    const originalProcess = globalThis.process;
    const originalBuffer = globalThis.Buffer;

    // Remove Node.js globals to simulate browser environment
    delete (globalThis as any).process;
    delete (globalThis as any).Buffer;

    try {
      // Import should hit the browser stub due to conditional exports
      // In a real browser environment, this would be resolved by the bundler
      const { notSupported } = await import('../src/server/browser-stub');

      expect(() => notSupported()).toThrow(
        '@repo/core-utils/server/* modules are not available in browser/edge environments',
      );
    } finally {
      // Restore globals for other tests
      if (originalProcess) {
        (globalThis as any).process = originalProcess;
      }
      if (originalBuffer) {
        (globalThis as any).Buffer = originalBuffer;
      }
    }
  });

  it('exports all expected server functions as stubs', async () => {
    const stub = await import('../src/server/browser-stub');

    // All these should be the notSupported function
    expect(() => stub.BoundedCache()).toThrow();
    expect(() => stub.CacheRegistry()).toThrow();
    expect(() => stub.globalCacheRegistry()).toThrow();
    expect(() => stub.AsyncLogger()).toThrow();
    expect(() => stub.LoggerRegistry()).toThrow();
    expect(() => stub.globalLoggerRegistry()).toThrow();
    expect(() => stub.safeStringifyAdvanced()).toThrow();
    expect(() => stub.SafeStringifier()).toThrow();
  });

  it('provides helpful error messages', async () => {
    const { notSupported } = await import('../src/server/browser-stub');

    expect(() => notSupported()).toThrow(
      /Use @repo\/core-utils\/shared\/\* for environment-neutral utilities/,
    );
  });
});
