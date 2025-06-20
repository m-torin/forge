/**
 * Shared Environment Observability Exports
 *
 * This file provides environment-agnostic observability functionality for packages
 * that can run in both Next.js and non-Next.js environments (like database, storage).
 *
 * The environment detection is centralized here to avoid scattered runtime checks
 * across multiple packages, maintaining the architectural integrity of the four-file
 * export pattern while solving the cross-environment challenge.
 *
 * @example
 * ```typescript
 * // In environment-agnostic packages (database, storage, etc.)
 * import { createServerObservability } from '@repo/observability/server';
 *
 * // Works in both Next.js and non-Next.js environments
 * const observability = await createServerObservability(config);
 * ```
 */

// Import types for proper typing
import type { ObservabilityConfig, ObservabilityManager } from './server';

// Runtime detection for Next.js environment
function isNextJSEnvironment(): boolean {
  // Check for Next.js-specific environment variables and globals
  return (
    // Next.js runtime environment variable
    process.env.NEXT_RUNTIME !== undefined ||
    // Next.js data global (client-side)
    typeof (globalThis as any).__NEXT_DATA__ !== 'undefined' ||
    // Edge runtime global
    typeof (globalThis as any).EdgeRuntime !== 'undefined' ||
    // Next.js process title
    process.title?.includes('next') ||
    // Next.js in development mode
    (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_APP_ENV !== undefined)
  );
}

// Main function that environment-agnostic packages need
export async function createServerObservability(
  config: ObservabilityConfig,
): Promise<ObservabilityManager> {
  if (isNextJSEnvironment()) {
    const { createServerObservability } = await import('./server-next');
    return createServerObservability(config);
  } else {
    const { createServerObservability } = await import('./server');
    return createServerObservability(config);
  }
}

// Re-export essential types that shared packages need
export type {
  ObservabilityConfig,
  ObservabilityManager,
  ObservabilityProvider,
  ObservabilityContext,
  Breadcrumb,
} from './server';

/**
 * Environment information for debugging
 */
export const environmentInfo = {
  isNextJS: isNextJSEnvironment(),
  runtime: process.env.NEXT_RUNTIME || 'node',
  nodeEnv: process.env.NODE_ENV,
  processTitle: process.title,
};
