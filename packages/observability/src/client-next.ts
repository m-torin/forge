/**
 * Next.js client-specific observability export
 */

import { env } from '../env';
import { ObservabilityBuilder } from './factory/builder';
import { createBetterStackPlugin } from './plugins/betterstack';
import { env as betterStackEnv } from './plugins/betterstack/env';
import { createConsolePlugin } from './plugins/console';
import { createSentryPlugin } from './plugins/sentry';
import { env as sentryEnv } from './plugins/sentry/env';
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
      createSentryPlugin({
        dsn: sentryEnv.NEXT_PUBLIC_SENTRY_DSN,
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
export { SentryPlugin } from './plugins/sentry';
export { SentryMicroFrontendPlugin } from './plugins/sentry-microfrontend';

// Re-export plugin-specific types with aliases to avoid conflicts
export type { Env as BetterStackEnv, BetterStackPluginConfig } from './plugins/betterstack';
export type { ConsolePluginConfig } from './plugins/console';
export type { Env as SentryEnv, SentryPluginConfig } from './plugins/sentry';
export type {
  BackstageAppConfig,
  MicroFrontendMode,
  SentryMicroFrontendConfig,
} from './plugins/sentry-microfrontend';

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
