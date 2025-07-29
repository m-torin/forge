/**
 * LogTape plugin implementation
 * LogTape is a modern, zero-dependency logging library for TypeScript
 */

import type { ObservabilityPlugin } from '../../core/plugin';
import type {
  Breadcrumb,
  LogLevel,
  ObservabilityContext,
  ObservabilityUser,
} from '../../core/types';
import { safeEnv } from './env';

/**
 * LogTape Logger interface (minimal subset)
 */
interface LogTapeLogger {
  trace(message: string, data?: any): void;
  debug(message: string, data?: any): void;
  info(message: string, data?: any): void;
  warning(message: string, data?: any): void;
  error(message: string, data?: any): void;
  fatal(message: string, data?: any): void;
  with(context: Record<string, any>): LogTapeLogger;
}

/**
 * LogTape client for direct access
 */
interface LogTapeClient {
  configure(options: any): Promise<void>;
  getLogger(category: string[]): LogTapeLogger;
  dispose(): Promise<void>;
  getConsoleSink(): any;
  jsonLinesFormatter?: any;
}

/**
 * LogTape plugin configuration
 */
export interface LogTapePluginConfig {
  enabled?: boolean;
  logLevel?: 'trace' | 'debug' | 'info' | 'warning' | 'error' | 'fatal';
  categoryPrefix?: string;

  // Sink configuration
  sinks?: {
    console?: boolean;
    file?: { path: string };
    cloudwatch?: { logGroup: string; region: string };
    sentry?: { dsn: string };
  };

  // Advanced features
  contextPropagation?: boolean;
  filters?: string[];
  nonBlocking?: boolean;
}

/**
 * LogTape plugin implementation
 */
export class LogTapePlugin<T extends LogTapeClient = LogTapeClient>
  implements ObservabilityPlugin<T>
{
  name = 'logtape';
  enabled: boolean;
  private client: T | undefined;
  private logger: LogTapeLogger | undefined;
  private configured = false;
  private currentUser: ObservabilityUser | null = null;
  private breadcrumbs: Breadcrumb[] = [];
  private isClientEnvironment: boolean;
  private messageBuffer: Array<{ message: string; level: LogLevel; data?: any }> = [];

  constructor(private config: LogTapePluginConfig = {}) {
    const env = safeEnv();
    this.enabled = config.enabled ?? env.LOGTAPE_ENABLED ?? true;
    this.isClientEnvironment = this.detectClientEnvironment();
  }

  private detectClientEnvironment(): boolean {
    return typeof window !== 'undefined';
  }

  getClient(): T | undefined {
    return this.client;
  }

  async initialize(config?: LogTapePluginConfig): Promise<void> {
    if (this.configured || !this.enabled) return;

    const env = safeEnv();
    const mergedConfig = { ...this.config, ...config };

    try {
      // Dynamic import of LogTape
      this.client = (await import(/* webpackIgnore: true */ '@logtape/logtape')) as unknown as T;

      // Build sinks configuration
      const sinks: Record<string, any> = {};

      // Console sink (enabled by default)
      const enableConsole = this.isClientEnvironment
        ? mergedConfig.sinks?.console !== false
        : mergedConfig.sinks?.console !== false && env.LOGTAPE_CONSOLE_ENABLED;

      if (enableConsole) {
        sinks.console = this.client.getConsoleSink();
      }

      // File sink (server-side only)
      if (!this.isClientEnvironment && (mergedConfig.sinks?.file?.path || env.LOGTAPE_FILE_PATH)) {
        const filePath = mergedConfig.sinks?.file?.path || env.LOGTAPE_FILE_PATH;
        if (filePath) {
          // Try to import file sink
          try {
            const { getFileSink } = await import(/* webpackIgnore: true */ '@logtape/file');
            sinks.file = getFileSink(filePath);
          } catch (error) {
            console.warn('LogTape file sink not available:', error);
          }
        }
      }

      // CloudWatch sink
      if (
        mergedConfig.sinks?.cloudwatch ||
        (env.LOGTAPE_CLOUDWATCH_LOG_GROUP && env.LOGTAPE_CLOUDWATCH_REGION)
      ) {
        const logGroup =
          mergedConfig.sinks?.cloudwatch?.logGroup || env.LOGTAPE_CLOUDWATCH_LOG_GROUP;
        const region = mergedConfig.sinks?.cloudwatch?.region || env.LOGTAPE_CLOUDWATCH_REGION;

        if (logGroup && region && !process.env.VITEST) {
          try {
            // Use variable to prevent Vite from analyzing this import at build time
            const moduleName = '@logtape/cloudwatch-logs';
            const { getCloudWatchLogsSink } = await import(
              /* webpackIgnore: true */ /* @vite-ignore */ moduleName
            );
            sinks.cloudwatch = getCloudWatchLogsSink({
              logGroupName: logGroup,
              region: region,
              formatter: this.client.jsonLinesFormatter,
            });
          } catch (error) {
            // Silently handle missing optional dependency
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (!errorMessage.includes('Failed to resolve import')) {
              console.warn('LogTape CloudWatch sink not available:', error);
            }
          }
        }
      }

      // Sentry sink
      if (mergedConfig.sinks?.sentry?.dsn || env.LOGTAPE_SENTRY_DSN) {
        const dsn = mergedConfig.sinks?.sentry?.dsn || env.LOGTAPE_SENTRY_DSN;

        if (dsn) {
          try {
            const { getSentrySink } = await import(/* webpackIgnore: true */ '@logtape/sentry');
            sinks.sentry = getSentrySink();
          } catch (error) {
            console.warn('LogTape Sentry sink not available:', error);
          }
        }
      }

      // Configure LogTape
      const categoryPrefix = mergedConfig.categoryPrefix || env.LOGTAPE_CATEGORY_PREFIX;
      const logLevel = this.isClientEnvironment
        ? mergedConfig.logLevel || env.NEXT_PUBLIC_LOGTAPE_LOG_LEVEL
        : mergedConfig.logLevel || env.LOGTAPE_LOG_LEVEL;
      const categoryArray = this.isClientEnvironment
        ? [categoryPrefix, 'client']
        : [categoryPrefix];

      await this.client.configure({
        sinks,
        loggers: [
          {
            category: categoryArray,
            sinks: Object.keys(sinks),
            lowestLevel: logLevel,
          },
        ],
        // Enable context propagation if requested (server-side only)
        ...(!this.isClientEnvironment &&
          mergedConfig.contextPropagation && {
            contextLocalStorage: new (
              await import(/* webpackIgnore: true */ 'node:async_hooks')
            ).AsyncLocalStorage(),
          }),
      });

      // Get logger instance
      this.logger = this.client.getLogger(categoryArray);
      this.configured = true;

      // Flush any buffered messages (client-side)
      if (this.isClientEnvironment) {
        this.flushBuffer();
      }
    } catch (error) {
      console.error(
        `Failed to initialize LogTape${this.isClientEnvironment ? ' client' : ''}:`,
        error,
      );
      this.enabled = false;
    }
  }

  async shutdown(): Promise<void> {
    if (this.configured && this.client) {
      try {
        await this.client.dispose();
      } catch (error) {
        console.error('LogTape shutdown error:', error);
      }
      this.configured = false;
    }
  }

  captureException(error: Error | unknown, context?: ObservabilityContext): void {
    if (!this.enabled || !this.logger) return;

    const errorObj = error instanceof Error ? error : new Error(String(error));

    // Build structured data
    const data = {
      error: {
        name: errorObj.name,
        message: errorObj.message,
        stack: errorObj.stack,
      },
      context: context?.extra,
      tags: context?.tags,
      user: context?.user || this.currentUser,
      breadcrumbs: this.breadcrumbs.slice(-10), // Last 10 breadcrumbs
      timestamp: new Date().toISOString(),
      ...(this.isClientEnvironment && {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
      }),
    };

    if (this.logger) {
      this.logger.error(errorObj.message, data);
    } else if (this.isClientEnvironment) {
      // Buffer the message if logger not ready (client-side)
      this.messageBuffer.push({ message: errorObj.message, level: 'error', data });
    }
  }

  captureMessage(message: string, level: LogLevel = 'info', context?: ObservabilityContext): void {
    if (!this.enabled || !this.logger) return;

    // Build structured data
    const data = {
      level,
      context: context?.extra,
      tags: context?.tags,
      user: context?.user || this.currentUser,
      breadcrumbs: this.breadcrumbs.slice(-10), // Last 10 breadcrumbs
      timestamp: new Date().toISOString(),
      ...(this.isClientEnvironment && {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
      }),
    };

    if (this.logger) {
      // Map log levels to LogTape methods
      switch (level) {
        case 'debug':
          this.logger.debug(message, data);
          break;
        case 'warning':
          this.logger.warning(message, data);
          break;
        case 'error':
          this.logger.error(message, data);
          break;
        case 'info':
        default:
          this.logger.info(message, data);
          break;
      }
    } else if (this.isClientEnvironment) {
      // Buffer the message if logger not ready (client-side)
      this.messageBuffer.push({ message, level, data });
    }
  }

  setUser(user: ObservabilityUser | null): void {
    if (!this.enabled) return;
    this.currentUser = user;
  }

  addBreadcrumb(breadcrumb: Breadcrumb): void {
    if (!this.enabled) return;

    this.breadcrumbs.push({
      ...breadcrumb,
      timestamp: breadcrumb.timestamp || Date.now() / 1000,
    });

    // Keep fewer breadcrumbs on client-side to save memory
    const maxBreadcrumbs = this.isClientEnvironment ? 50 : 100;
    if (this.breadcrumbs.length > maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-maxBreadcrumbs);
    }
  }

  withScope(callback: (scope: any) => void): void {
    if (!this.enabled || !this.logger) return;

    // LogTape scope implementation using logger.with()
    const scope = {
      setContext: (key: string, context: unknown) => {
        if (this.logger) {
          this.logger = this.logger.with({ [key]: context });
        }
      },
      setUser: (user: ObservabilityUser | null) => {
        this.setUser(user);
        if (this.logger && user) {
          this.logger = this.logger.with({ user });
        }
      },
    };
    callback(scope);
  }

  async flush(_timeout?: number): Promise<boolean> {
    if (!this.enabled || !this.configured || !this.client) return true;

    try {
      await this.client.dispose();
      return true;
    } catch (error) {
      console.error('LogTape flush error:', error);
      return false;
    }
  }

  private flushBuffer(): void {
    if (!this.logger || this.messageBuffer.length === 0) return;

    // Flush buffered messages
    for (const { message, level, data } of this.messageBuffer) {
      switch (level) {
        case 'debug':
          this.logger.debug(message, data);
          break;
        case 'warning':
          this.logger.warning(message, data);
          break;
        case 'error':
          this.logger.error(message, data);
          break;
        case 'info':
        default:
          this.logger.info(message, data);
          break;
      }
    }

    // Clear buffer
    this.messageBuffer = [];
  }
}

/**
 * Factory function to create a LogTape plugin
 */
export const createLogTapePlugin = (config?: LogTapePluginConfig): LogTapePlugin => {
  return new LogTapePlugin(config);
};
