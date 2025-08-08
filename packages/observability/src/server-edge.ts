/**
 * Next.js edge runtime observability export
 * Supports edge-compatible implementations including Sentry
 */

import { env } from '../env';
import { ObservabilityBuilder } from './factory/builder';
import { createBetterStackPlugin } from './plugins/betterstack';
import { env as betterStackEnv } from './plugins/betterstack/env';
import { createConsolePlugin } from './plugins/console';
import { createSentryNextJSPlugin } from './plugins/sentry-nextjs';
import { safeEnv as safeSentryEnvironment } from './plugins/sentry-nextjs/env';

/**
 * Create auto-configured observability for Next.js edge runtime
 * Modern @sentry/nextjs supports edge runtime environments
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
  const safeBetterStackEnv = (() => {
    try {
      return betterStackEnv;
    } catch {
      return {} as typeof betterStackEnv;
    }
  })();
  const betterStackToken =
    safeBetterStackEnv.BETTER_STACK_SOURCE_TOKEN ||
    safeBetterStackEnv.BETTERSTACK_SOURCE_TOKEN ||
    safeBetterStackEnv.LOGTAIL_SOURCE_TOKEN;

  if (betterStackToken) {
    builder.withPlugin(
      createBetterStackPlugin({
        sourceToken: betterStackToken,
      }),
    );
  }

  // Auto-activate Sentry if DSN is provided
  // Modern @sentry/nextjs supports edge runtime
  // Use safeEnv function to avoid environment access errors in edge runtime
  const safeSentryEnv = safeSentryEnvironment();
  const sentryDSN = safeSentryEnv.SENTRY_DSN || safeSentryEnv.NEXT_PUBLIC_SENTRY_DSN;
  if (sentryDSN) {
    builder.withPlugin(
      createSentryNextJSPlugin({
        dsn: sentryDSN,
        // Edge-specific configuration
        environment:
          safeSentryEnv.SENTRY_ENVIRONMENT ||
          safeSentryEnv.NEXT_PUBLIC_SENTRY_ENVIRONMENT ||
          'production',
        release: safeSentryEnv.SENTRY_RELEASE || safeSentryEnv.NEXT_PUBLIC_SENTRY_RELEASE,
        // Limited features in edge runtime
        enableTracing: safeSentryEnv.SENTRY_ENABLE_TRACING ?? true,
        tracesSampleRate: safeSentryEnv.SENTRY_TRACES_SAMPLE_RATE,
        // Note: Some features like replay and feedback may not work in edge runtime
      }),
    );
  }

  // Note: LogTape requires Node.js APIs and isn't available in edge runtime
  // Sentry and Better Stack are the recommended solutions for edge runtime observability

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

// Re-export edge-compatible plugins
export { createBetterStackPlugin } from './plugins/betterstack';
export { createConsolePlugin } from './plugins/console';
export { createSentryPlugin, SentryPlugin } from './plugins/sentry';
export { createSentryNextJSPlugin, SentryNextJSPlugin } from './plugins/sentry-nextjs';

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
