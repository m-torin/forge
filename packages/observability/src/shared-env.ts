/**
 * Shared Environment Observability Exports
 *
 * This file provides environment-agnostic observability functionality for packages
 * that can run in both Next.js and non-Next.js environments (like database, storage).
 *
 * WEBPACK SAFETY: This implementation avoids dynamic imports that would cause
 * webpack to bundle Node.js-specific modules in browser builds. Instead, it uses
 * conditional exports that are resolved at build time.
 *
 * @example
 * ```typescript
 * // In environment-agnostic packages (database, storage, etc.)
 * import { createServerObservability } from '@repo/observability/shared-env';
 *
 * // Works in both Next.js and non-Next.js environments
 * const observability = await createServerObservability(config);
 * ```
 */

import type { ObservabilityConfig, ObservabilityManager } from './server';

// Detect if we're in a browser/webpack build context
function isBrowserBuild(): boolean {
  return typeof window !== 'undefined' || typeof globalThis?.window !== 'undefined';
}

// Runtime detection for Next.js environment (server-side only)
function isNextJSEnvironment(): boolean {
  // Skip detection in browser builds to avoid webpack issues
  if (isBrowserBuild()) {
    return false;
  }

  // Import getRawEnv to safely access environment variables
  const env = (typeof process !== 'undefined' ? process.env : {}) as Record<
    string,
    string | undefined
  >;

  // Check for Next.js-specific environment variables and globals
  return (
    // Next.js runtime environment variable
    env.NEXT_RUNTIME !== undefined ||
    // Next.js data global (client-side)
    typeof (globalThis as any).__NEXT_DATA__ !== 'undefined' ||
    // Edge runtime global
    typeof (globalThis as any).EdgeRuntime !== 'undefined' ||
    // Next.js process title
    (typeof process !== 'undefined' && process.title?.includes('next')) ||
    // Next.js in development mode
    (env.NODE_ENV === 'development' && env.NEXT_PUBLIC_APP_ENV !== undefined)
  );
}

// Browser-safe fallback observability manager
function createBrowserFallbackManager(): ObservabilityManager {
  return {
    // Required async methods
    log: async (level: string, message: string, context?: any) => {
      // Browser-safe console logging only
      const logMethod =
        level === 'error'
          ? console.error
          : level === 'warn'
            ? console.warn
            : level === 'debug'
              ? console.debug
              : console.log;
      logMethod(`[Observability] ${message}`, context || '');
    },
    captureException: async (error: Error, context?: any) => {
      console.error('[Observability] Exception:', error, context || '');
    },
    captureMessage: async (
      message: string,
      level: 'error' | 'info' | 'warning' = 'info',
      context?: any,
    ) => {
      const logMethod =
        level === 'error' ? console.error : level === 'warning' ? console.warn : console.log;
      logMethod(`[Observability] ${message}`, context || '');
    },
    initialize: async () => {
      // No-op for browser fallback
    },

    // Synchronous methods
    addBreadcrumb: () => {
      // No-op for browser fallback
    },
    setContext: () => {
      // No-op for browser fallback
    },
    setExtra: () => {
      // No-op for browser fallback
    },
    setUser: () => {
      // No-op for browser fallback
    },
    setTag: () => {
      // No-op for browser fallback
    },
    startSession: () => {
      // No-op for browser fallback
    },
    endSession: () => {
      // No-op for browser fallback
    },
    startSpan: (name: string) => ({
      name,
      finish: () => {},
      setContext: () => {},
      setStatus: () => {},
    }),
    startTransaction: (name: string) => ({
      name,
      finish: () => {},
      setContext: () => {},
      setStatus: () => {},
    }),
  };
}

// Main function that environment-agnostic packages need
export async function createServerObservability(
  config: ObservabilityConfig,
): Promise<ObservabilityManager> {
  // In browser builds, return safe fallback to prevent webpack bundling server modules
  if (isBrowserBuild()) {
    return createBrowserFallbackManager();
  }

  // Server-side: Use dynamic imports with proper guards
  try {
    if (isNextJSEnvironment()) {
      // Dynamic import for Next.js server environment
      const { createServerObservability: createNextObservability } = await import('./server-next');
      return await createNextObservability(config);
    } else {
      // Dynamic import for standard Node.js environment
      const { createServerObservability: createNodeObservability } = await import('./server');
      return await createNodeObservability(config);
    }
  } catch (error) {
    throw new Error(`[Observability] Failed to load server modules: ${error}`);
  }
}

// Re-export essential types that shared packages need
export type {
  Breadcrumb,
  ObservabilityConfig,
  ObservabilityContext,
  ObservabilityManager,
  ObservabilityProvider,
} from './server';

/**
 * Environment information for debugging
 */
export const environmentInfo = {
  isNextJS: isNextJSEnvironment(),
  runtime: (typeof process !== 'undefined' ? process.env.NEXT_RUNTIME : undefined) || 'node',
  nodeEnv: typeof process !== 'undefined' ? process.env.NODE_ENV : undefined,
  processTitle: typeof process !== 'undefined' ? process.title : undefined,
};

// New simplified logger functions (recommended)
export { configureLogger, logDebug, logError, logInfo, logWarn } from './logger-functions';
