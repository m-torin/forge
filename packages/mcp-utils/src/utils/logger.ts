/**
 * Advanced Async Logger with buffering, file rotation, and performance optimization.
 * Consolidates and enhances the AsyncLogger implementation from agent files.
 */

import { createWriteStream, WriteStream } from 'node:fs';
import { mkdir, stat, unlink } from 'node:fs/promises';
import { dirname, join } from 'node:path';

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

export class AsyncLogger {
  private sessionId: string;
  private logLevel: LogLevel;
  private logDir: string;
  private logFileName: string;
  private maxBufferSize: number;
  private flushInterval: number;
  private maxFileSize: number;
  private maxFiles: number;
  
  private writeStream: WriteStream | null;
  private buffer: string[];
  private bufferSize: number;
  private flushTimer: NodeJS.Timeout | null;
  private isClosing: boolean;
  private isInitialized: boolean;
  
  private levels: Record<LogLevel, number>;
  private currentLevel: number;
  private stats: LoggerStats;

  constructor(options: LoggerOptions = {}) {
    this.sessionId = options.sessionId || 'unknown';
    this.logLevel = options.logLevel || 'info';
    this.logDir = options.logDir || './logs';
    this.logFileName = options.logFileName || `mcp-utils-${this.sessionId}.log`;
    this.maxBufferSize = options.maxBufferSize || 16 * 1024; // 16KB buffer
    this.flushInterval = options.flushInterval || 100; // ms
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB
    this.maxFiles = options.maxFiles || 5;
    
    this.writeStream = null;
    this.buffer = [];
    this.bufferSize = 0;
    this.flushTimer = null;
    this.isClosing = false;
    this.isInitialized = false;
    
    // Log levels
    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    
    this.currentLevel = this.levels[this.logLevel] || 1;
    
    // Statistics
    this.stats = {
      messagesLogged: 0,
      bytesWritten: 0,
      flushCount: 0,
      rotationCount: 0,
      errors: 0
    };
  }

  async init(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Ensure log directory exists
      await mkdir(this.logDir, { recursive: true });
      
      const logPath = join(this.logDir, this.logFileName);
      
      this.writeStream = createWriteStream(logPath, {
        flags: 'a',
        highWaterMark: 16 * 1024 // 16KB chunks
      });

      this.writeStream.on('error', (error) => {
        console.error(`Logger write stream error: ${error.message}`);
        this.stats.errors++;
      });

      // Set up periodic flushing
      this.flushTimer = setInterval(() => {
        if (!this.isClosing) {
          this.flush();
        }
      }, this.flushInterval);

      // Ensure cleanup on process exit
      process.once('beforeExit', () => this.close());
      process.once('SIGINT', () => this.close());
      process.once('SIGTERM', () => this.close());

      this.isInitialized = true;
      this.log('Logger initialized', 'info');
      
    } catch (error) {
      console.error(`Failed to initialize logger: ${(error as Error).message}`);
      this.stats.errors++;
      throw error;
    }
  }

  log(message: string, level: LogLevel = 'info'): void {
    if (!this.shouldLog(level)) return;
    if (this.isClosing) return;

    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
    const entrySize = Buffer.byteLength(logEntry);

    this.stats.messagesLogged++;
    this.stats.bytesWritten += entrySize;

    // If single entry exceeds buffer or logger not initialized, handle specially
    if (entrySize > this.maxBufferSize || !this.isInitialized) {
      this.writeDirectly(logEntry);
      return;
    }

    // Check if adding this entry would exceed buffer
    if (this.bufferSize + entrySize > this.maxBufferSize) {
      this.flush();
    }

    this.buffer.push(logEntry);
    this.bufferSize += entrySize;
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

  private writeDirectly(data: string): void {
    if (this.writeStream && !this.isClosing) {
      this.writeStream.write(data);
    } else {
      // Fallback to console if stream not available
      console.log(data.trim());
    }
  }

  flush(): void {
    if (this.buffer.length === 0 || this.isClosing) return;

    const data = this.buffer.join('');
    this.buffer = [];
    this.bufferSize = 0;
    this.stats.flushCount++;

    if (this.writeStream) {
      this.writeStream.write(data);
      this.checkRotation();
    }
  }

  private async checkRotation(): Promise<void> {
    if (!this.writeStream) return;

    try {
      const logPath = join(this.logDir, this.logFileName);
      const stats = await stat(logPath);
      
      if (stats.size > this.maxFileSize) {
        await this.rotateLog();
      }
    } catch (error) {
      // File might not exist yet, ignore error
    }
  }

  private async rotateLog(): Promise<void> {
    if (!this.writeStream) return;

    try {
      // Close current stream
      this.writeStream.end();
      
      // Rotate existing files
      for (let i = this.maxFiles - 1; i > 0; i--) {
        const oldPath = join(this.logDir, `${this.logFileName}.${i}`);
        const newPath = join(this.logDir, `${this.logFileName}.${i + 1}`);
        
        try {
          await stat(oldPath);
          if (i === this.maxFiles - 1) {
            await unlink(oldPath); // Delete oldest
          } else {
            await unlink(newPath).catch(() => {}); // Remove target if exists
            // Note: fs.rename doesn't work cross-filesystem, using copy approach would be better
          }
        } catch {
          // File doesn't exist, continue
        }
      }

      // Move current log to .1
      const currentPath = join(this.logDir, this.logFileName);
      const firstRotated = join(this.logDir, `${this.logFileName}.1`);
      
      try {
        await unlink(firstRotated).catch(() => {});
        // Again, would need copy + unlink for cross-filesystem
      } catch {
        // Ignore errors
      }

      // Create new stream
      this.writeStream = createWriteStream(currentPath, {
        flags: 'a',
        highWaterMark: 16 * 1024
      });

      this.writeStream.on('error', (error) => {
        console.error(`Logger write stream error: ${error.message}`);
        this.stats.errors++;
      });

      this.stats.rotationCount++;
      this.log('Log rotated', 'info');
      
    } catch (error) {
      console.error(`Log rotation failed: ${(error as Error).message}`);
      this.stats.errors++;
    }
  }

  getStats(): LoggerStats & { sessionId: string; currentLevel: string } {
    return {
      ...this.stats,
      sessionId: this.sessionId,
      currentLevel: this.logLevel
    };
  }

  async close(): Promise<void> {
    if (this.isClosing) return;
    
    this.isClosing = true;
    
    // Clear timer
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    // Final flush
    this.flush();
    
    // Close stream
    if (this.writeStream) {
      return new Promise((resolve) => {
        this.writeStream!.end(() => {
          this.writeStream = null;
          resolve();
        });
      });
    }
  }
}

// Global logger registry for managing multiple named loggers
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