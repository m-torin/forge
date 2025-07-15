/**
 * Next.js edge runtime observability export
 * Limited to fetch-based implementations only
 */

import { env } from '../env';
import { ObservabilityBuilder } from './factory/builder';
import { createBetterStackPlugin } from './plugins/betterstack';
import { env as betterStackEnv } from './plugins/betterstack/env';
import { createConsolePlugin } from './plugins/console';

/**
 * Create auto-configured observability for Next.js edge runtime
 * Note: Sentry is not included here as it requires Node.js APIs
 */
export async function createEdgeObservability() {
  const builder = ObservabilityBuilder.create().withAutoInitialize(false); // Manual init in edge runtime

  // Console logging control
  const isDevelopment =
    env.NEXT_PUBLIC_NODE_ENV === 'development' || process.env.NODE_ENV === 'development';
  const enableConsole =
    env.NEXT_PUBLIC_OBSERVABILITY_CONSOLE_ENABLED ?? // Explicit control
    isDevelopment ?? // Auto in dev
    env.NEXT_PUBLIC_OBSERVABILITY_DEBUG; // Debug mode

  // Always add console plugin, control via enabled flag
  builder.withPlugin(
    createConsolePlugin({
      prefix: '[Next.js Edge]',
      enabled: enableConsole,
    }),
  );

  // Auto-activate Better Stack if source token is provided (uses fetch API)
  const betterStackToken =
    betterStackEnv.BETTER_STACK_SOURCE_TOKEN ||
    betterStackEnv.BETTERSTACK_SOURCE_TOKEN ||
    betterStackEnv.LOGTAIL_SOURCE_TOKEN;

  if (betterStackToken) {
    builder.withPlugin(
      createBetterStackPlugin({
        sourceToken: betterStackToken,
      }),
    );
  }

  // Note: Sentry and LogTape require Node.js APIs and aren't available in edge runtime
  // Better Stack is the recommended solution for edge runtime logging

  return builder.build();
}

// Lazy initialization for the observability instance
let observabilityInstance: Awaited<ReturnType<typeof createEdgeObservability>> | null = null;

/**
 * Get or create the observability instance
 */
export async function getObservability() {
  if (!observabilityInstance) {
    observabilityInstance = await createEdgeObservability();
  }
  return observabilityInstance;
}

// Export types and utilities
export * from './core/types';
export { createObservability } from './factory';
export { ObservabilityBuilder } from './factory/builder';

// Re-export edge-compatible plugins only
export * from './plugins/betterstack';
export * from './plugins/console';

// Async logger functions that handle initialization
export const logDebug = async (message: string, context?: any) => {
  const obs = await getObservability();
  return obs.logDebug(message, context);
};

export const logInfo = async (message: string, context?: any) => {
  const obs = await getObservability();
  return obs.logInfo(message, context);
};

export const logWarn = async (message: string, context?: any) => {
  const obs = await getObservability();
  return obs.logWarn(message, context);
};

export const logError = async (message: string | Error, context?: any) => {
  const obs = await getObservability();
  return obs.logError(message, context);
};

// Legacy function for backward compatibility (no-op)
/**
 * @deprecated Configuration now happens through the observability system
 */
export const configureLogger = (_config?: any) => {
  // No-op: Configuration now happens through the observability system
};

// Re-export type
export type LogContext = Record<string, any>;
