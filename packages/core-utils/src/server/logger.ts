/**
 * Enhanced logger utilities with pluggable transport hooks
 * Server-only module for Node.js environments
 * Designed to integrate with @repo/observability without creating a dependency
 */

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
  transports?: LogTransport[];
}

export interface LoggerStats {
  messagesLogged: number;
  bytesWritten: number;
  flushCount: number;
  rotationCount: number;
  errors: number;
}

export interface LogContext {
  extra?: Record<string, any>;
  tags?: Record<string, string>;
}

export interface LogMessage {
  message: string;
  level: LogLevel;
  timestamp: Date;
  sessionId: string;
  context?: LogContext;
}

/**
 * Transport interface for pluggable logging backends
 * Allows integration with observability systems without direct dependencies
 */
export interface LogTransport {
  name: string;
  log(message: LogMessage): void | Promise<void>;
  flush?(): void | Promise<void>;
  close?(): void | Promise<void>;
}

/**
 * Simple console transport for fallback logging
 */
export class ConsoleTransport implements LogTransport {
  name = 'console';

  log(message: LogMessage): void {
    const timestamp = message.timestamp.toISOString();
    const prefix = `[${timestamp}] [${message.level.toUpperCase()}] [${message.sessionId}]`;

    switch (message.level) {
      case 'debug':
        console.debug(`${prefix} ${message.message}`);
        break;
      case 'info':
        console.info(`${prefix} ${message.message}`);
        break;
      case 'warn':
        console.warn(`${prefix} ${message.message}`);
        break;
      case 'error':
        console.error(`${prefix} ${message.message}`);
        break;
    }
  }
}

/**
 * AsyncLogger with pluggable transports for integration flexibility
 * Maintains API compatibility while supporting external logging systems
 */
export class AsyncLogger {
  private sessionId: string;
  private logLevel: LogLevel;
  private stats: LoggerStats;
  private levels: Record<LogLevel, number>;
  private currentLevel: number;
  private isInitialized: boolean = false;
  private isClosing: boolean = false;
  private transports: LogTransport[];

  constructor(options: LoggerOptions = {}) {
    this.sessionId = options.sessionId || 'unknown';
    this.logLevel = options.logLevel || 'info';
    this.transports = options.transports || [new ConsoleTransport()];

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

  log(message: string, level: LogLevel = 'info', context?: LogContext): void {
    if (!this.shouldLog(level)) return;
    if (this.isClosing) return;

    const logMessage: LogMessage = {
      message,
      level,
      timestamp: new Date(),
      sessionId: this.sessionId,
      context,
    };

    this.stats.messagesLogged++;
    // Approximate bytes for stats
    this.stats.bytesWritten += Buffer.byteLength(message);

    // Send to all transports
    this.transports.forEach(async transport => {
      try {
        await transport.log(logMessage);
      } catch (error) {
        this.stats.errors++;
        // Fallback to console if transport fails
        if (transport.name !== 'console') {
          console.error(`Transport ${transport.name} failed:`, error);
        }
      }
    });
  }

  debug(message: string, context?: LogContext): void {
    this.log(message, 'debug', context);
  }

  info(message: string, context?: LogContext): void {
    this.log(message, 'info', context);
  }

  warn(message: string, context?: LogContext): void {
    this.log(message, 'warn', context);
  }

  error(message: string, context?: LogContext): void {
    this.log(message, 'error', context);
  }

  /**
   * Add a transport to the logger
   */
  addTransport(transport: LogTransport): void {
    this.transports.push(transport);
  }

  /**
   * Remove a transport from the logger
   */
  removeTransport(name: string): boolean {
    const initialLength = this.transports.length;
    this.transports = this.transports.filter(t => t.name !== name);
    return this.transports.length < initialLength;
  }

  /**
   * Get list of transport names
   */
  getTransports(): string[] {
    return this.transports.map(t => t.name);
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] >= this.currentLevel;
  }

  flush(): void {
    this.transports.forEach(async transport => {
      try {
        if (transport.flush) {
          await transport.flush();
        }
      } catch (error) {
        this.stats.errors++;
        console.error(`Transport ${transport.name} flush failed:`, error);
      }
    });
    this.stats.flushCount++;
  }

  getStats(): LoggerStats & { sessionId: string; currentLevel: string; transports: string[] } {
    return {
      ...this.stats,
      sessionId: this.sessionId,
      currentLevel: this.logLevel,
      transports: this.getTransports(),
    };
  }

  async close(): Promise<void> {
    if (this.isClosing) return;

    this.isClosing = true;

    // Close all transports
    await Promise.all(
      this.transports.map(async transport => {
        try {
          if (transport.close) {
            await transport.close();
          }
        } catch (error) {
          console.error(`Transport ${transport.name} close failed:`, error);
        }
      }),
    );
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

  /**
   * Add a transport to all existing loggers
   */
  addGlobalTransport(transport: LogTransport): void {
    for (const logger of this.loggers.values()) {
      logger.addTransport(transport);
    }
  }

  /**
   * Remove a transport from all existing loggers
   */
  removeGlobalTransport(name: string): void {
    for (const logger of this.loggers.values()) {
      logger.removeTransport(name);
    }
  }
}

// Default global registry instance
export const globalLoggerRegistry = new LoggerRegistry();

/**
 * Factory function to create observability transport
 * This allows integration with @repo/observability without a direct dependency
 */
export function createObservabilityTransport(logFunctions: {
  logDebug: (message: string, context?: any) => void;
  logInfo: (message: string, context?: any) => void;
  logWarn: (message: string, context?: any) => void;
  logError: (message: string, context?: any) => void;
}): LogTransport {
  return {
    name: 'observability',
    log(message: LogMessage): void {
      const contextMessage = `[${message.sessionId}] ${message.message}`;
      const context = {
        extra: { sessionId: message.sessionId, component: 'core-utils', ...message.context?.extra },
        tags: { logger: 'AsyncLogger', sessionId: message.sessionId, ...message.context?.tags },
      };

      switch (message.level) {
        case 'debug':
          logFunctions.logDebug(contextMessage, context);
          break;
        case 'info':
          logFunctions.logInfo(contextMessage, context);
          break;
        case 'warn':
          logFunctions.logWarn(contextMessage, context);
          break;
        case 'error':
          logFunctions.logError(contextMessage, context);
          break;
      }
    },
  };
}

/**
 * Create an MCP-compatible logger instance
 * Simplified factory for session logging
 */
export function createMCPLogger(options: LoggerOptions): {
  debug: (message: string, context?: LogContext) => Promise<void>;
  info: (message: string, context?: LogContext) => Promise<void>;
  warn: (message: string, context?: LogContext) => Promise<void>;
  error: (message: string, context?: LogContext) => Promise<void>;
  close: () => Promise<void>;
} {
  const sessionId = options.sessionId || `session_${Date.now()}`;
  const logLevel = options.logLevel || 'info';

  const logLevels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  const currentLevel = logLevels[logLevel];

  const log = async (level: LogLevel, message: string, context?: LogContext) => {
    if (logLevels[level] >= currentLevel) {
      console.log(`[${level.toUpperCase()}] [${sessionId}] ${message}`);
    }
  };

  return {
    debug: (msg, ctx) => log('debug', msg, ctx),
    info: (msg, ctx) => log('info', msg, ctx),
    warn: (msg, ctx) => log('warn', msg, ctx),
    error: (msg, ctx) => log('error', msg, ctx),
    close: async () => {},
  };
}
