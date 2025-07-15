/**
 * Universal environment-safe logger functions
 *
 * These functions provide a simple logging interface that works in any environment:
 * - Browser/client components → uses console
 * - Edge runtime → uses console (no Node.js APIs)
 * - Server/Node.js → uses async queue with full observability
 *
 * @example
 * ```typescript
 * import { logInfo, logError } from '@repo/observability/shared-env';
 *
 * // Simple usage - works everywhere!
 * logInfo('User logged in', { userId: '123' });
 *
 * // Error logging with context
 * try {
 *   await someOperation();
 * } catch (error) {
 *   logError('Operation failed', error, { operation: 'someOperation' });
 * }
 * ```
 */

// Environment detection functions
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.document !== 'undefined';
}

function isEdgeRuntime(): boolean {
  return typeof globalThis !== 'undefined' && (globalThis as any).EdgeRuntime !== undefined;
}

function isServer(): boolean {
  return !isBrowser() && !isEdgeRuntime() && typeof process !== 'undefined';
}

// Type definitions
export interface LogContext {
  [key: string]: any;
}

interface Logger {
  debug(message: string, context?: LogContext): Promise<void>;
  info(message: string, context?: LogContext): Promise<void>;
  warn(message: string, context?: LogContext): Promise<void>;
  error(message: string, error?: Error, context?: LogContext): Promise<void>;
}

type ObservabilityConfig = any; // Type-safe but flexible

// Server logger module has been removed - using console as fallback

// Singleton logger instance
let defaultLogger: Logger | null = null;
let initPromise: Promise<void> | null = null;
let _hasShownDeprecationWarning = false;

// Queue for handling async operations
interface QueueItem {
  fn: () => Promise<void>;
  timestamp: number;
}

const logQueue: QueueItem[] = [];
let isProcessing = false;
let processTimer: NodeJS.Timeout | null = null;

// Configuration
const MAX_QUEUE_SIZE = 1000;
const BATCH_INTERVAL = 100; // Process every 100ms
const BATCH_SIZE = 50; // Process up to 50 items at once

// Get default configuration based on environment
function _getDefaultConfig(): ObservabilityConfig {
  const isDevelopment =
    (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') ||
    (typeof window !== 'undefined' && (window as any).location?.hostname === 'localhost');

  return {
    providers: {
      console: {
        enabled: isDevelopment,
        level: isDevelopment ? 'debug' : 'info',
        prefix: '[DEV]',
      },
    },
  };
}

// Initialize the default logger
async function ensureLogger(): Promise<Logger> {
  if (defaultLogger) return defaultLogger;

  if (initPromise) {
    await initPromise;
    if (!defaultLogger) throw new Error('Logger failed to initialize');
    return defaultLogger;
  }

  initPromise = initializeLogger();
  await initPromise;
  if (!defaultLogger) throw new Error('Logger failed to initialize');
  return defaultLogger;
}

async function initializeLogger(): Promise<void> {
  try {
    // Server logger module has been removed, use console fallback
    defaultLogger = createConsoleOnlyLogger();
  } catch (error) {
    // Fallback to console logging if initialization fails
    console.warn('[Observability] Failed to initialize logger, using console fallback:', error);
    defaultLogger = createConsoleOnlyLogger();
  }
}

// Create a minimal console-only logger for fallback
function createConsoleOnlyLogger(): Logger {
  return {
    debug: async (message: string, context?: LogContext) => {
      console.debug(`[DEBUG] ${message}`, context);
    },
    info: async (message: string, context?: LogContext) => {
      console.log(`[INFO] ${message}`, context);
    },
    warn: async (message: string, context?: LogContext) => {
      console.warn(`[WARN] ${message}`, context);
    },
    error: async (message: string, error?: Error, context?: LogContext) => {
      console.error(`[ERROR] ${message}`, error, context);
    },
  };
}

// Queue processing
function enqueueLog(fn: () => Promise<void>): void {
  // Add to queue
  logQueue.push({
    fn,
    timestamp: Date.now(),
  });

  // Limit queue size
  if (logQueue.length > MAX_QUEUE_SIZE) {
    // Remove oldest items
    const removeCount = logQueue.length - MAX_QUEUE_SIZE;
    logQueue.splice(0, removeCount);
    console.warn(`[Observability] Log queue overflow, dropped ${removeCount} oldest items`);
  }

  // Start processing if not already running
  if (!isProcessing) {
    startProcessing();
  }
}

function startProcessing(): void {
  if (isProcessing || logQueue.length === 0) return;

  isProcessing = true;

  // Process immediately for the first batch
  processQueue();

  // Then set up interval for subsequent batches
  processTimer = setInterval(() => {
    if (logQueue.length === 0) {
      stopProcessing();
    } else {
      processQueue();
    }
  }, BATCH_INTERVAL);
}

function stopProcessing(): void {
  isProcessing = false;
  if (processTimer) {
    clearInterval(processTimer);
    processTimer = null;
  }
}

async function processQueue(): Promise<void> {
  if (logQueue.length === 0) return;

  // Get batch of items to process
  const batch = logQueue.splice(0, BATCH_SIZE);

  // Process all items in parallel
  await Promise.allSettled(
    batch.map(item =>
      item.fn().catch(error => {
        // Fallback to console on any error
        console.error('[Observability] Failed to process log:', error);
      }),
    ),
  );
}

// Flush remaining logs on process exit (server only)
if (isServer() && typeof process !== 'undefined' && process.on) {
  process.on('exit', () => {
    // Synchronously process remaining items
    while (logQueue.length > 0) {
      const item = logQueue.shift();
      if (item) {
        // Best effort - we can't await in exit handler
        item.fn().catch(() => {});
      }
    }
  });
}

/**
 * Log a debug message
 * @param message - The message to log
 * @param context - Optional context object
 */
export function logDebug(message: string, context?: LogContext): void {
  if (isBrowser() || isEdgeRuntime()) {
    console.debug(`[DEBUG] ${message}`, context || '');
  } else {
    enqueueLog(async () => {
      const logger = await ensureLogger();
      await logger.debug(message, context);
    });
  }
}

/**
 * Log an info message
 * @param message - The message to log
 * @param context - Optional context object
 */
export function logInfo(message: string, context?: LogContext): void {
  if (isBrowser() || isEdgeRuntime()) {
    console.log(`[INFO] ${message}`, context || '');
  } else {
    enqueueLog(async () => {
      const logger = await ensureLogger();
      await logger.info(message, context);
    });
  }
}

/**
 * Log a warning message
 * @param message - The message to log
 * @param context - Optional context object
 */
export function logWarn(message: string, context?: LogContext): void {
  if (isBrowser() || isEdgeRuntime()) {
    console.warn(`[WARN] ${message}`, context || '');
  } else {
    enqueueLog(async () => {
      const logger = await ensureLogger();
      await logger.warn(message, context);
    });
  }
}

/**
 * Log an error message
 * @param message - The message to log
 * @param error - Optional error object
 * @param context - Optional context object
 */
export function logError(message: string, error?: Error | unknown, context?: LogContext): void {
  if (isBrowser() || isEdgeRuntime()) {
    console.error(`[ERROR] ${message}`, error || '', context || '');
  } else {
    enqueueLog(async () => {
      const logger = await ensureLogger();
      const errorObj = error instanceof Error ? error : new Error(String(error));
      await logger.error(message, errorObj, context);
    });
  }
}

/**
 * Configure the logger with custom settings
 * This should be called once at application startup
 *
 * @param config - Observability configuration
 */
export function configureLogger(_config: ObservabilityConfig): void {
  if (isServer()) {
    // Reset the logger to use new config
    defaultLogger = null;
    initPromise = null;

    // Re-initialize with custom config
    // Server logger module has been removed, use console fallback
    defaultLogger = createConsoleOnlyLogger();
  }
  // Client/edge environments ignore custom config
}
