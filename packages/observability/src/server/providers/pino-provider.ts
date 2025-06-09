/**
 * Pino logging provider for server-side logging
 */

import type { LogEntry } from '../../shared/types/logger-types';
import type {
  ObservabilityContext,
  ObservabilityProvider,
  ObservabilityProviderConfig,
} from '../../shared/types/types';

// Dynamic import type for pino
type PinoLogger = any;
type PinoOptions = any;

export interface ServerLoggingProvider extends ObservabilityProvider {
  flush(timeout?: number): Promise<void>;
  identify(userId: string, traits?: any): Promise<void>;
  isEnabled(): boolean;
  logEntry(entry: LogEntry): Promise<void>;
}

export class PinoProvider implements ServerLoggingProvider {
  readonly name = 'pino';
  private logger: PinoLogger;
  private options: PinoOptions;
  private childLogger: PinoLogger | null = null;

  constructor(options: PinoOptions = {}) {
    this.options = {
      level: 'info',
      ...options,
    };

    // Initialize pino synchronously
    try {
      // In test environment, require will be mocked by vitest
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pino = require('pino');
      // Use default export if available (for ES modules)
      const pinoConstructor = pino.default || pino;
      this.logger = pinoConstructor(this.options);
    } catch {
      // Fallback to console if pino not available
      this.logger = console;
    }
  }

  isEnabled(): boolean {
    return true;
  }

  async initialize(_config: ObservabilityProviderConfig): Promise<void> {
    // Pino is initialized in constructor, this is for compatibility
  }

  async log(level: string, message: string, metadata?: any): Promise<void> {
    await this.logEntry({ level, message, metadata });
  }

  async logEntry(entry: LogEntry): Promise<void> {
    const currentLogger = this.childLogger || this.logger;
    const metadata = entry.metadata || {};

    switch (entry.level) {
      case 'debug':
        currentLogger.debug(metadata, entry.message);
        break;
      case 'info':
        currentLogger.info(metadata, entry.message);
        break;
      case 'warn':
        currentLogger.warn(metadata, entry.message);
        break;
      case 'error':
        currentLogger.error(metadata, entry.message);
        break;
      default:
        currentLogger.info(metadata, entry.message);
    }
  }

  async captureException(error: Error | any, context?: ObservabilityContext): Promise<void> {
    const currentLogger = this.childLogger || this.logger;
    const metadata = {
      err: error,
      ...context,
    };

    const message = typeof error === 'string' ? error : error?.message || 'Unknown error';

    currentLogger.error(metadata, message);
  }

  async captureMessage(
    message: string,
    level: 'info' | 'warning' | 'error',
    context?: ObservabilityContext,
  ): Promise<void> {
    await this.logEntry({
      level: level === 'warning' ? 'warn' : level,
      message,
      metadata: context,
      timestamp: new Date().toISOString(),
    });
  }

  async identify(userId: string, traits?: any): Promise<void> {
    const userContext: any = {
      userId,
    };

    if (traits) {
      userContext.user = traits;
    }

    this.childLogger = this.logger.child(userContext);
  }

  setContext(key: string, context: Record<string, any>): void {
    this.childLogger = (this.childLogger || this.logger).child({ [key]: context });
  }

  async flush(timeout = 5000): Promise<void> {
    if (this.logger.flush) {
      return new Promise<void>((resolve) => {
        const timer = setTimeout(() => {
          resolve();
        }, timeout);

        this.logger.flush((_error?: Error) => {
          clearTimeout(timer);
          resolve();
        });
      });
    }
  }
}
