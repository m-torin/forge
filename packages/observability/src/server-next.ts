/**
 * Next.js server-specific observability export
 */

import { env } from '../env';
import { ObservabilityBuilder } from './factory/builder';
import { createBetterStackPlugin } from './plugins/betterstack';
import { env as betterStackEnv } from './plugins/betterstack/env';
import { createConsoleServerPlugin } from './plugins/console';
import { createLogTapePlugin } from './plugins/logtape';
import { env as logtapeEnv } from './plugins/logtape/env';
import { createSentryNextJSPlugin } from './plugins/sentry-nextjs';
import { env as sentryEnv } from './plugins/sentry-nextjs/env';

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
  // Use server DSN if available, fallback to public DSN
  const sentryDSN = sentryEnv.SENTRY_DSN || sentryEnv.NEXT_PUBLIC_SENTRY_DSN;
  if (sentryDSN) {
    const sentry = createSentryNextJSPlugin({
      dsn: sentryDSN,
      environment: sentryEnv.SENTRY_ENVIRONMENT || sentryEnv.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
      release: sentryEnv.SENTRY_RELEASE || sentryEnv.NEXT_PUBLIC_SENTRY_RELEASE,
      // Enable server-side features
      enableTracing: sentryEnv.SENTRY_ENABLE_TRACING ?? true,
      enableLogs: sentryEnv.SENTRY_ENABLE_LOGS ?? false,
      tracesSampleRate: sentryEnv.SENTRY_TRACES_SAMPLE_RATE,
      profilesSampleRate: sentryEnv.SENTRY_PROFILES_SAMPLE_RATE,
      // Server-specific options
      sendDefaultPii: true,
      instrumentServerActions: true,
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

  // LogTape requires explicit enablement due to complex sink configuration
  if (logtapeEnv.LOGTAPE_ENABLED) {
    const logtape = createLogTapePlugin({
      sinks: {
        console: logtapeEnv.LOGTAPE_CONSOLE_ENABLED,
        file: logtapeEnv.LOGTAPE_FILE_PATH ? { path: logtapeEnv.LOGTAPE_FILE_PATH } : undefined,
        cloudwatch: logtapeEnv.LOGTAPE_CLOUDWATCH_LOG_GROUP
          ? {
              logGroup: logtapeEnv.LOGTAPE_CLOUDWATCH_LOG_GROUP,
              region: logtapeEnv.LOGTAPE_CLOUDWATCH_REGION || 'us-east-1',
            }
          : undefined,
        sentry: logtapeEnv.LOGTAPE_SENTRY_DSN ? { dsn: logtapeEnv.LOGTAPE_SENTRY_DSN } : undefined,
      },
    });
    await logtape.initialize();
    builder.withPlugin(logtape);
  }

  return builder.build();
}

// Lazy initialization for the observability instance
let observabilityInstance: Awaited<ReturnType<typeof createServerObservability>> | null = null;

/**
 * Get or create the observability instance
 */
export async function getObservability() {
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
export { LogTapePlugin } from './plugins/logtape';
export { SentryPlugin } from './plugins/sentry';
export { SentryMicroFrontendPlugin } from './plugins/sentry-microfrontend';
export { SentryNextJSPlugin } from './plugins/sentry-nextjs';

// Re-export plugin-specific types with aliases to avoid conflicts
export type { Env as BetterStackEnv, BetterStackPluginConfig } from './plugins/betterstack';
export type { ConsolePluginConfig } from './plugins/console';
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
