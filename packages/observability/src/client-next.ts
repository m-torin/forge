/**
 * Next.js client-specific observability export
 */

import { env } from '../env';
import { ObservabilityBuilder } from './factory/builder';
import { createBetterStackPlugin } from './plugins/betterstack';
import { env as betterStackEnv } from './plugins/betterstack/env';
import { createConsolePlugin } from './plugins/console';
import { createSentryNextJSPlugin } from './plugins/sentry-nextjs';
import { env as sentryEnv } from './plugins/sentry-nextjs/env';
import { setObservabilityInstance } from './shared';

/**
 * Create auto-configured observability for Next.js client
 */
export async function createClientObservability() {
  const builder = ObservabilityBuilder.create();

  // Console logging control (client-side uses NEXT_PUBLIC vars only)
  const isDevelopment = env.NEXT_PUBLIC_NODE_ENV === 'development';
  const enableConsole =
    env.NEXT_PUBLIC_OBSERVABILITY_CONSOLE_ENABLED ?? // Explicit control
    isDevelopment ?? // Auto in dev
    env.NEXT_PUBLIC_OBSERVABILITY_DEBUG; // Debug mode

  // Always add console plugin, control via enabled flag
  builder.withPlugin(
    createConsolePlugin({
      prefix: '[Next.js Client]',
      enabled: enableConsole,
    }),
  );

  // Auto-activate Sentry if client DSN is provided
  if (sentryEnv.NEXT_PUBLIC_SENTRY_DSN) {
    builder.withPlugin(
      createSentryNextJSPlugin({
        dsn: sentryEnv.NEXT_PUBLIC_SENTRY_DSN,
        environment: sentryEnv.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
        release: sentryEnv.NEXT_PUBLIC_SENTRY_RELEASE,
        // Enable client-side features based on env vars
        enableTracing: sentryEnv.NEXT_PUBLIC_SENTRY_ENABLE_TRACING ?? true,
        enableReplay: sentryEnv.NEXT_PUBLIC_SENTRY_ENABLE_REPLAY ?? false,
        enableFeedback: sentryEnv.NEXT_PUBLIC_SENTRY_ENABLE_FEEDBACK ?? false,
        tracesSampleRate: sentryEnv.SENTRY_TRACES_SAMPLE_RATE,
        replaysSessionSampleRate: sentryEnv.SENTRY_REPLAYS_SESSION_SAMPLE_RATE,
        replaysOnErrorSampleRate: sentryEnv.SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE,
      }),
    );
  }

  // Auto-activate Better Stack if client token is provided
  const clientBetterStackToken =
    betterStackEnv.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN ||
    betterStackEnv.NEXT_PUBLIC_BETTERSTACK_TOKEN ||
    betterStackEnv.NEXT_PUBLIC_LOGTAIL_TOKEN;

  if (clientBetterStackToken) {
    builder.withPlugin(
      createBetterStackPlugin({
        sourceToken: clientBetterStackToken,
      }),
    );
  }

  // LogTape is not supported in client-side environments due to Node.js dependencies
  // Use Console, Sentry, or Better Stack for client-side logging

  return builder.build();
}

// Lazy initialization for the observability instance
let observabilityInstance: Awaited<ReturnType<typeof createClientObservability>> | null = null;

/**
 * Get or create the observability instance
 */
export async function getObservability() {
  if (!observabilityInstance) {
    observabilityInstance = await createClientObservability();
    // Set the instance in shared module for isomorphic logging
    setObservabilityInstance(observabilityInstance);
  }
  return observabilityInstance;
}

// Export types and utilities
export * from './core/types';
export { createObservability } from './factory';
export { ObservabilityBuilder } from './factory/builder';

// Re-export plugins for direct access (excluding conflicting exports)
export { BetterStackPlugin } from './plugins/betterstack';
export { ConsolePlugin } from './plugins/console';
// LogTapePlugin is not available in client-side environments
export { SentryPlugin } from './plugins/sentry';
export { SentryMicroFrontendPlugin } from './plugins/sentry-microfrontend';
export { SentryNextJSPlugin } from './plugins/sentry-nextjs';

// Re-export plugin-specific types with aliases to avoid conflicts
export type { Env as BetterStackEnv, BetterStackPluginConfig } from './plugins/betterstack';
export type { ConsolePluginConfig } from './plugins/console';
// LogTape types are still exported for compatibility
export type { Env as LogTapeEnv, LogTapePluginConfig } from './plugins/logtape';
export type { Env as SentryEnv, SentryPluginConfig } from './plugins/sentry';
export type {
  MicroFrontendMode,
  SentryMicroFrontendConfig,
  ZoneConfig,
} from './plugins/sentry-microfrontend';
export type { SentryNextJSPluginConfig } from './plugins/sentry-nextjs';

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
