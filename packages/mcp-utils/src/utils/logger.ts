/**
 * Logger utilities using @repo/observability
 * Provides a simplified logger interface that delegates to the observability system
 */

import { logDebug, logError, logInfo, logWarn } from '@repo/observability/server';
import { throwIfAborted } from './abort-support';

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
  streaming?: boolean;
  signal?: AbortSignal;
}

export interface LoggerStats {
  messagesLogged: number;
  bytesWritten: number;
  flushCount: number;
  rotationCount: number;
  errors: number;
}

export interface StreamingLogChunk {
  timestamp: string;
  sessionId: string;
  level: LogLevel;
  message: string;
  metadata?: Record<string, any>;
  bytesProcessed: number;
  isComplete: boolean;
}

/**
 * AsyncLogger that delegates to @repo/observability
 * Maintains API compatibility while using centralized logging
 * Enhanced with Node.js 22+ streaming capabilities
 */
export class AsyncLogger {
  private sessionId: string;
  private logLevel: LogLevel;
  private stats: LoggerStats;
  private levels: Record<LogLevel, number>;
  private currentLevel: number;
  private isInitialized: boolean = false;
  private isClosing: boolean = false;
  private streamingEnabled: boolean = false;
  private logBuffer: Array<{ message: string; level: LogLevel; timestamp: string }> = [];

  constructor(options: LoggerOptions = {}) {
    this.sessionId = options.sessionId || 'unknown';
    this.logLevel = options.logLevel || 'info';
    this.streamingEnabled = options.streaming || false;

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

    // Add to streaming buffer if streaming is enabled
    if (this.streamingEnabled) {
      this.logBuffer.push({
        message: contextMessage,
        level,
        timestamp: new Date().toISOString(),
      });
    }

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

    // Clear streaming buffer on flush
    if (this.streamingEnabled) {
      this.logBuffer = [];
    }
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
    // Clear streaming buffer on close
    this.logBuffer = [];
    // @repo/observability handles its own cleanup
  }

  // Node.js 22+ Streaming log aggregation using AsyncGenerator
  async *streamLogs(
    options: {
      chunkSize?: number;
      signal?: AbortSignal;
      includeBuffer?: boolean;
    } = {},
  ): AsyncGenerator<StreamingLogChunk, void, unknown> {
    const { chunkSize = 10, signal, includeBuffer = true } = options;

    if (!this.streamingEnabled) {
      throw new Error('Streaming not enabled for this logger. Enable with streaming: true option.');
    }

    let bytesProcessed = 0;
    let chunkIndex = 0;

    // First, yield existing buffered logs if requested
    if (includeBuffer && this.logBuffer.length > 0) {
      const totalLogs = this.logBuffer.length;

      for (let i = 0; i < totalLogs; i += chunkSize) {
        throwIfAborted(signal);

        const chunk = this.logBuffer.slice(i, i + chunkSize);

        for (const logEntry of chunk) {
          const logSize = Buffer.byteLength(logEntry.message, 'utf8');
          bytesProcessed += logSize;

          yield {
            timestamp: logEntry.timestamp,
            sessionId: this.sessionId,
            level: logEntry.level,
            message: logEntry.message,
            metadata: {
              chunkIndex: chunkIndex++,
              bufferIndex: i + chunk.indexOf(logEntry),
              isBuffered: true,
            },
            bytesProcessed,
            isComplete: i + chunk.length >= totalLogs,
          };

          // Yield to event loop periodically
          if (chunkIndex % 5 === 0) {
            await new Promise(resolve => setImmediate(resolve));
          }
        }
      }
    }

    // Mark buffer-only streaming as complete
    if (!includeBuffer || this.logBuffer.length === 0) {
      yield {
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        level: 'info',
        message: 'Log streaming completed',
        metadata: {
          chunkIndex: chunkIndex++,
          totalChunks: chunkIndex,
          streamingComplete: true,
        },
        bytesProcessed,
        isComplete: true,
      };
    }
  }

  // Get streaming-specific stats
  getStreamingStats(): LoggerStats & {
    streamingEnabled: boolean;
    bufferSize: number;
    sessionId: string;
  } {
    return {
      ...this.stats,
      streamingEnabled: this.streamingEnabled,
      bufferSize: this.logBuffer.length,
      sessionId: this.sessionId,
    };
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

  // Node.js 22+ Stream aggregated logs from all loggers
  async *streamAggregatedLogs(
    options: {
      chunkSize?: number;
      signal?: AbortSignal;
      levelFilter?: LogLevel[];
      sessionFilter?: string[];
    } = {},
  ): AsyncGenerator<StreamingLogChunk, void, unknown> {
    const { chunkSize = 10, signal, levelFilter, sessionFilter } = options;

    const eligibleLoggers = Array.from(this.loggers.entries()).filter(([sessionId, logger]) => {
      if (sessionFilter && !sessionFilter.includes(sessionId)) return false;
      return logger.getStreamingStats?.().streamingEnabled || false;
    });

    if (eligibleLoggers.length === 0) {
      yield {
        timestamp: new Date().toISOString(),
        sessionId: 'aggregated',
        level: 'info',
        message: 'No streaming-enabled loggers found',
        bytesProcessed: 0,
        isComplete: true,
      };
      return;
    }

    let totalBytesProcessed = 0;
    let aggregatedChunkIndex = 0;

    // Stream from each eligible logger
    for (const [sessionId, logger] of eligibleLoggers) {
      throwIfAborted(signal);

      try {
        for await (const chunk of logger.streamLogs?.({ chunkSize, signal }) || []) {
          // Apply level filter if specified
          if (levelFilter && !levelFilter.includes(chunk.level)) {
            continue;
          }

          totalBytesProcessed += chunk.bytesProcessed;

          yield {
            ...chunk,
            metadata: {
              ...chunk.metadata,
              aggregatedChunkIndex: aggregatedChunkIndex++,
              sourceSessionId: chunk.sessionId,
            },
            bytesProcessed: totalBytesProcessed,
            isComplete: false, // Never complete until all loggers processed
          };

          // Yield to event loop
          if (aggregatedChunkIndex % 10 === 0) {
            await new Promise(resolve => setImmediate(resolve));
          }
        }
      } catch (error) {
        // Log error but continue with other loggers
        yield {
          timestamp: new Date().toISOString(),
          sessionId: sessionId,
          level: 'error',
          message: `Streaming error for logger ${sessionId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          metadata: {
            aggregatedChunkIndex: aggregatedChunkIndex++,
            streamingError: true,
            sourceSessionId: sessionId,
          },
          bytesProcessed: totalBytesProcessed,
          isComplete: false,
        };
      }
    }

    // Final completion marker
    yield {
      timestamp: new Date().toISOString(),
      sessionId: 'aggregated',
      level: 'info',
      message: `Aggregated streaming completed for ${eligibleLoggers.length} loggers`,
      metadata: {
        aggregatedChunkIndex: aggregatedChunkIndex++,
        totalLoggers: eligibleLoggers.length,
        aggregationComplete: true,
      },
      bytesProcessed: totalBytesProcessed,
      isComplete: true,
    };
  }
}

// Default global registry instance
export const globalLoggerRegistry = new LoggerRegistry();

// Utility function for creating streaming-enabled loggers
export function createStreamingLogger(sessionId: string, options: LoggerOptions = {}): AsyncLogger {
  return globalLoggerRegistry.create(sessionId, {
    ...options,
    streaming: true,
  });
}

// Utility function for streaming logs from multiple sessions
export function streamLogsFromSessions(
  sessionIds: string[],
  options: {
    chunkSize?: number;
    signal?: AbortSignal;
    levelFilter?: LogLevel[];
  } = {},
): AsyncGenerator<StreamingLogChunk, void, unknown> {
  return globalLoggerRegistry.streamAggregatedLogs({
    ...options,
    sessionFilter: sessionIds,
  });
}
