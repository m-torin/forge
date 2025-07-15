/**
 * Edge-compatible synchronous logger functions
 *
 * This module provides lightweight logging functions that work in edge runtime
 * environments where Node.js APIs are not available.
 *
 * @example
 * ```typescript
 * // In middleware.ts or edge functions
 * import { logInfo, logError } from '@repo/observability/server/edge';
 *
 * export function middleware(request: Request) {
 *   logInfo('Request received', { path: request.url });
 *   // ... handle request
 * }
 * ```
 */

// Minimal types for edge runtime (no imports from Node.js modules)
export interface LogContext {
  requestId?: string;
  userId?: string;
  operation?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

// Edge runtime detection
const isEdgeRuntime =
  (typeof globalThis !== 'undefined' && 'EdgeRuntime' in globalThis) ||
  (typeof process !== 'undefined' && process.env?.NEXT_RUNTIME === 'edge');

// Configuration for edge logging
const EDGE_LOG_PREFIX = '[Edge]';
const MAX_CONTEXT_DEPTH = 3;

// Helper to safely stringify objects in edge runtime
function safeStringify(obj: unknown, depth = 0): string {
  if (depth > MAX_CONTEXT_DEPTH) return '[Max depth exceeded]';

  try {
    if (obj === null) return 'null';
    if (obj === undefined) return 'undefined';
    if (typeof obj === 'string') return obj;
    if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
    if (obj instanceof Error) {
      return `${obj.name}: ${obj.message}${obj.stack ? '\n' + obj.stack : ''}`;
    }
    if (typeof obj === 'object') {
      if (Array.isArray(obj)) {
        return '[' + obj.map(item => safeStringify(item, depth + 1)).join(', ') + ']';
      }
      const entries = Object.entries(obj as Record<string, unknown>).map(
        ([key, value]) => `${key}: ${safeStringify(value, depth + 1)}`,
      );
      return '{ ' + entries.join(', ') + ' }';
    }
    return String(obj);
  } catch {
    return '[Stringify error]';
  }
}

// Format log message with context
function formatMessage(level: string, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const prefix = isEdgeRuntime ? EDGE_LOG_PREFIX : '[Server]';

  let formatted = `${prefix} [${timestamp}] [${level}] ${message}`;

  if (context && Object.keys(context).length > 0) {
    formatted += ' ' + safeStringify(context);
  }

  return formatted;
}

/**
 * Log a debug message (edge-compatible)
 * @param message - The message to log
 * @param context - Optional context object
 */
export function logDebug(message: string, context?: LogContext): void {
  try {
    console.debug(formatMessage('DEBUG', message, context));
  } catch (_error) {
    // Fallback to basic console.log if debug is not available
    console.log(`[DEBUG] ${message}`, context);
  }
}

/**
 * Log an info message (edge-compatible)
 * @param message - The message to log
 * @param context - Optional context object
 */
export function logInfo(message: string, context?: LogContext): void {
  try {
    console.log(formatMessage('INFO', message, context));
  } catch (_error) {
    console.log(`[INFO] ${message}`, context);
  }
}

/**
 * Log a warning message (edge-compatible)
 * @param message - The message to log
 * @param context - Optional context object
 */
export function logWarn(message: string, context?: LogContext): void {
  try {
    console.warn(formatMessage('WARN', message, context));
  } catch (_error) {
    console.log(`[WARN] ${message}`, context);
  }
}

/**
 * Log an error message (edge-compatible)
 * @param message - The message to log
 * @param error - Optional error object
 * @param context - Optional context object
 */
export function logError(message: string, error?: Error | unknown, context?: LogContext): void {
  try {
    const errorContext = error
      ? {
          ...context,
          error:
            error instanceof Error
              ? {
                  name: error.name,
                  message: error.message,
                  stack: error.stack,
                }
              : String(error),
        }
      : context;

    console.error(formatMessage('ERROR', message, errorContext));
  } catch (_err) {
    console.error(`[ERROR] ${message}`, error, context);
  }
}

/**
 * Configure logger (no-op in edge runtime)
 * Edge runtime always uses console logging
 */
export function configureLogger(_config?: unknown): void {
  // No-op in edge runtime - always uses console
  console.log('[Edge] Logger configuration ignored in edge runtime (console only)');
}

// Export types for convenience (minimal subset for edge)
export type Logger = {
  debug: (message: string, context?: LogContext) => void;
  info: (message: string, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  error: (message: string, error?: Error, context?: LogContext) => void;
};

// Provide a deprecated createLogger for backwards compatibility
/**
 * @deprecated Since v2.0.0. Use logDebug, logInfo, logWarn, or logError functions instead.
 * Will be removed in v3.0.0.
 */
export function createLogger(): Logger {
  console.warn(
    '[Edge] Deprecation Warning: createLogger() is deprecated. ' +
      'Use logInfo(), logError(), etc. instead for simpler synchronous logging.',
  );

  return {
    debug: (message: string, context?: LogContext) => logDebug(message, context),
    info: (message: string, context?: LogContext) => logInfo(message, context),
    warn: (message: string, context?: LogContext) => logWarn(message, context),
    error: (message: string, error?: Error, context?: LogContext) =>
      logError(message, error, context),
  };
}
