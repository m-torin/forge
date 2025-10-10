/**
 * Logger utilities using @repo/observability
 * Provides a simplified logger interface that delegates to the observability system
 */

import { logDebug, logError, logInfo, logWarn } from '@repo/observability/server';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LoggerOptions {
  sessionId?: string;
  logLevel?: LogLevel;
  logDir?: string;
  logFileName?: string;
  maxBufferSize?: number;
  flushInterval?: number;
  maxFileSize?: number;
  maxFiles?: number;
}

export interface LoggerStats {
  messagesLogged: number;
  bytesWritten: number;
  flushCount: number;
  rotationCount: number;
  errors: number;
}

/**
 * AsyncLogger that delegates to @repo/observability
 * Maintains API compatibility while using centralized logging
 */
export class AsyncLogger {
  private sessionId: string;
  private logLevel: LogLevel;
  private stats: LoggerStats;
  private levels: Record<LogLevel, number>;
  private currentLevel: number;
  private isInitialized: boolean = false;
  private isClosing: boolean = false;

  constructor(options: LoggerOptions = {}) {
    this.sessionId = options.sessionId || 'unknown';
    this.logLevel = options.logLevel || 'info';

    // Log levels
    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };

    this.currentLevel = this.levels[this.logLevel] || 1;

    // Statistics
    this.stats = {
      messagesLogged: 0,
      bytesWritten: 0,
      flushCount: 0,
      rotationCount: 0,
      errors: 0,
    };
  }

  async init(): Promise<void> {
    if (this.isInitialized) return;

    this.isInitialized = true;
    this.log('Logger initialized', 'debug');
  }

  log(message: string, level: LogLevel = 'info'): void {
    if (!this.shouldLog(level)) return;
    if (this.isClosing) return;

    const contextMessage = `[${this.sessionId}] ${message}`;
    const context = {
      extra: { sessionId: this.sessionId, component: 'mcp-utils' },
      tags: { logger: 'AsyncLogger', sessionId: this.sessionId },
    };

    this.stats.messagesLogged++;
    // Approximate bytes for stats
    this.stats.bytesWritten += Buffer.byteLength(contextMessage);

    switch (level) {
      case 'debug':
        logDebug(contextMessage, context);
        break;
      case 'info':
        logInfo(contextMessage, context);
        break;
      case 'warn':
        logWarn(contextMessage, context);
        break;
      case 'error':
        logError(contextMessage, context);
        break;
    }
  }

  debug(message: string): void {
    this.log(message, 'debug');
  }

  info(message: string): void {
    this.log(message, 'info');
  }

  warn(message: string): void {
    this.log(message, 'warn');
  }

  error(message: string): void {
    this.log(message, 'error');
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] >= this.currentLevel;
  }

  flush(): void {
    // @repo/observability handles its own flushing
    this.stats.flushCount++;
  }

  getStats(): LoggerStats & { sessionId: string; currentLevel: string } {
    return {
      ...this.stats,
      sessionId: this.sessionId,
      currentLevel: this.logLevel,
    };
  }

  async close(): Promise<void> {
    if (this.isClosing) return;

    this.isClosing = true;
    // @repo/observability handles its own cleanup
  }
}

/**
 * Global logger registry for managing multiple named loggers
 */
export class LoggerRegistry {
  private loggers: Map<string, AsyncLogger>;

  constructor() {
    this.loggers = new Map();
  }

  create(sessionId: string, options: LoggerOptions = {}): AsyncLogger {
    if (this.loggers.has(sessionId)) {
      return this.loggers.get(sessionId)!;
    }

    const logger = new AsyncLogger({ ...options, sessionId });
    this.loggers.set(sessionId, logger);
    return logger;
  }

  get(sessionId: string): AsyncLogger | undefined {
    return this.loggers.get(sessionId);
  }

  async close(sessionId: string): Promise<boolean> {
    const logger = this.loggers.get(sessionId);
    if (logger) {
      await logger.close();
      this.loggers.delete(sessionId);
      return true;
    }
    return false;
  }

  list(): string[] {
    return Array.from(this.loggers.keys());
  }

  async closeAll(): Promise<void> {
    const promises = Array.from(this.loggers.values()).map(logger => logger.close());
    await Promise.all(promises);
    this.loggers.clear();
  }

  getGlobalStats(): Record<string, ReturnType<AsyncLogger['getStats']>> {
    const stats: Record<string, ReturnType<AsyncLogger['getStats']>> = {};
    for (const [sessionId, logger] of this.loggers) {
      stats[sessionId] = logger.getStats();
    }
    return stats;
  }
}

// Default global registry instance
export const globalLoggerRegistry = new LoggerRegistry();
