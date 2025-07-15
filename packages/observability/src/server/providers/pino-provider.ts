/**
 * Pino logging provider for server-side logging
 */

import { LogEntry } from '../../shared/types/logger-types';
import {
  ObservabilityContext,
  ObservabilityProvider,
  ObservabilityProviderConfig,
} from '../../shared/types/types';
import { Environment } from '../../shared/utils/environment';

export interface ServerLoggingProvider extends ObservabilityProvider {
  flush(timeout?: number): Promise<void>;
  identify(userId: string, traits?: any): Promise<void>;
  isEnabled(): boolean;
  logEntry(entry: LogEntry): Promise<void>;
}
// Dynamic import type for pino
type PinoLogger = any;

type PinoOptions = any;

export class PinoProvider implements ServerLoggingProvider {
  readonly name = 'pino';
  private childLogger: null | PinoLogger = null;
  private logger: PinoLogger;
  private options: PinoOptions;

  constructor(options: PinoOptions = {}) {
    this.options = {
      level: 'info',
      ...options,
    };

    // Initialize with console fallback, async load pino
    this.logger = console;
    this.initializePino();
  }

  private async initializePino(): Promise<void> {
    try {
      // Use dynamic import for ESM compliance
      const pinoModule = await import('pino');
      // Use default export if available (for ES modules)
      const pinoConstructor = pinoModule.default || pinoModule;
      this.logger = pinoConstructor(this.options);
    } catch {
      // Keep console fallback if pino not available
      if (Environment.isDevelopment()) {
        console.warn('[PinoProvider] Pino not available, using console fallback');
      }
    }
  }

  async captureException(error: any | Error, context?: ObservabilityContext): Promise<void> {
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
    level: 'error' | 'info' | 'warning',
    context?: ObservabilityContext,
  ): Promise<void> {
    await this.logEntry({
      level: level === 'warning' ? 'warn' : level,
      message,
      metadata: context,
      timestamp: new Date().toISOString(),
    });
  }

  async flush(timeout = 5000): Promise<void> {
    if (this.logger.flush) {
      return new Promise<void>((resolve: any) => {
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

  async identify(userId: string, traits?: any): Promise<void> {
    const userContext: any = {
      userId,
    };

    if (traits) {
      userContext.user = traits;
    }

    this.childLogger = this.logger.child(userContext);
  }

  async initialize(_config: ObservabilityProviderConfig): Promise<void> {
    // Pino is initialized in constructor, this is for compatibility
  }

  isEnabled(): boolean {
    return true;
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
      case 'error':
        currentLogger.error(metadata, entry.message);
        break;
      case 'info':
        currentLogger.info(metadata, entry.message);
        break;
      case 'warn':
        currentLogger.warn(metadata, entry.message);
        break;
      default:
        currentLogger.info(metadata, entry.message);
    }
  }

  setContext(key: string, context: Record<string, any>): void {
    this.childLogger = (this.childLogger || this.logger).child({ [key]: context });
  }
}
