/**
 * Browser/Edge stub for server-only modules
 * Provides clear error messages when server modules are imported in non-Node environments
 */

export const notSupported = () => {
  throw new Error(
    '@repo/core-utils/server/* modules are not available in browser/edge environments. ' +
      'Use @repo/core-utils/shared/* for environment-neutral utilities.',
  );
};

// Export all expected server functions as stubs
export const BoundedCache = notSupported;
export const CacheRegistry = notSupported;
export const globalCacheRegistry = notSupported;
export const AsyncLogger = notSupported;
export const LoggerRegistry = notSupported;
export const globalLoggerRegistry = notSupported;
export const safeStringifyAdvanced = notSupported;
export const SafeStringifier = notSupported;

export default notSupported;
