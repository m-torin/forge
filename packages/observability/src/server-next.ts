/**
 * Next.js server-specific observability export
 */

import { env } from '../env';
import { ObservabilityBuilder } from './factory/builder';
import { createBetterStackPlugin } from './plugins/betterstack';
import { env as betterStackEnv } from './plugins/betterstack/env';
import { createConsoleServerPlugin } from './plugins/console';
import { createSentryPlugin } from './plugins/sentry';
import { env as sentryEnv } from './plugins/sentry/env';

/**
 * Create auto-configured observability for Next.js server
 */
export async function createServerObservability() {
  const builder = ObservabilityBuilder.create();

  // Console logging control
  const isDevelopment =
    env.NEXT_PUBLIC_NODE_ENV === 'development' || process.env.NODE_ENV === 'development';
  const enableConsole =
    env.NEXT_PUBLIC_OBSERVABILITY_CONSOLE_ENABLED ?? // Explicit control
    isDevelopment ?? // Auto in dev
    env.NEXT_PUBLIC_OBSERVABILITY_DEBUG; // Debug mode

  // Always add console plugin, control via enabled flag
  builder.withPlugin(
    createConsoleServerPlugin({
      prefix: '[Next.js Server]',
      enabled: enableConsole,
    }),
  );

  // Auto-activate Sentry if DSN is provided
  // Only use client-accessible DSN for auto-detection to avoid server/client boundary issues
  const sentryDSN = sentryEnv.NEXT_PUBLIC_SENTRY_DSN;
  if (sentryDSN) {
    const sentry = createSentryPlugin({
      dsn: sentryDSN,
    });
    await sentry.initialize();
    builder.withPlugin(sentry);
  }

  // Auto-activate Better Stack if source token is provided
  const betterStackToken =
    betterStackEnv.BETTER_STACK_SOURCE_TOKEN ||
    betterStackEnv.BETTERSTACK_SOURCE_TOKEN ||
    betterStackEnv.LOGTAIL_SOURCE_TOKEN;

  if (betterStackToken) {
    const betterstack = createBetterStackPlugin({
      sourceToken: betterStackToken,
    });
    await betterstack.initialize();
    builder.withPlugin(betterstack);
  }

  return builder.build();
}

// Lazy initialization for the observability instance
let observabilityInstance: any = null;

/**
 * Get or create the observability instance
 */
export async function getObservability(): Promise<any> {
  if (!observabilityInstance) {
    observabilityInstance = await createServerObservability();
  }
  return observabilityInstance;
}

// Export types and utilities
export * from './core/types';
export { createObservability } from './factory';
export { ObservabilityBuilder } from './factory/builder';
export { ObservabilityManager } from './factory/index';

// Re-export plugins for direct access (excluding conflicting exports)
export { BetterStackPlugin } from './plugins/betterstack';
export { ConsolePlugin } from './plugins/console';
export { SentryPlugin } from './plugins/sentry';
export { SentryMicroFrontendPlugin } from './plugins/sentry-microfrontend';

// Re-export plugin-specific types with aliases to avoid conflicts
// Removed for Rollup compatibility
// Removed for Rollup compatibility

// Async logger functions that handle initialization
export const logDebug = async (message: string, context?: any): Promise<void> => {
  const obs = await getObservability();
  return obs.logDebug(message, context);
};

export const logInfo = async (message: string | Error, context?: any): Promise<void> => {
  const obs = await getObservability();
  return obs.logInfo(message, context);
};

export const logWarn = async (message: string | Error, context?: any): Promise<void> => {
  const obs = await getObservability();
  return obs.logWarn(message, context);
};

export const logError = async (message: string | Error, context?: any): Promise<void> => {
  const obs = await getObservability();
  return obs.logError(message, context);
};

// Legacy function for backward compatibility (no-op)
/**
 * @deprecated Configuration now happens through the observability system
 */
export const configureLogger = (_config: any): void => {
  // No-op: Configuration now happens through the observability system
};

// Re-export type - removed for Rollup compatibility
