/**
 * Auto-configuring server export for Node.js environments (non-Next.js)
 */

import { safeEnv } from "../env";
import { ObservabilityBuilder } from "./factory/builder";
import { createConsoleServerPlugin } from "./plugins/console";

/**
 * Auto-configured observability for Node.js server environments
 * Automatically sets up console logging based on environment variables
 */
const builder = ObservabilityBuilder.create();

// Console logging control
const env = safeEnv();
const isDevelopment =
  env.NEXT_PUBLIC_NODE_ENV === "development" ||
  process.env.NODE_ENV === "development";
const enableConsole =
  env.NEXT_PUBLIC_OBSERVABILITY_CONSOLE_ENABLED ?? // Explicit control
  isDevelopment ?? // Auto in dev
  env.NEXT_PUBLIC_OBSERVABILITY_DEBUG; // Debug mode

// Always add console plugin, control via enabled flag
builder.withPlugin(
  createConsoleServerPlugin({
    prefix: "[Server]",
    enabled: enableConsole,
  }),
);

// Note: Production providers would typically be configured by the app
// This is just a fallback for non-Next.js server usage

/**
 * Pre-configured observability instance for Node.js server environments
 * Includes console logging with automatic environment-based configuration
 */
export const observability = builder.build();

// Export types and utilities
export * from "./core/types";
export { createObservability } from "./factory";
export { ObservabilityBuilder } from "./factory/builder";

/**
 * Logger functions exported from the observability instance
 * Use these instead of deprecated standalone functions
 * @example
 * ```typescript
 * import { logInfo, logError } from '@repo/observability/server';
 * logInfo('Server started', { port: 3000 });
 * logError('Database connection failed', { error: err });
 * ```
 */
export const { logDebug, logInfo, logWarn, logError } = observability;

// Legacy function for backward compatibility (no-op)
/**
 * @deprecated Configuration now happens through the observability system
 */
export const configureLogger = (_config?: any) => {
  // No-op: Configuration now happens through the observability system
};

// Re-export type
export type LogContext = Record<string, any>;
