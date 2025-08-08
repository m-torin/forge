/**
 * MCP Tool: Async Logger Management
 * Provides logger creation, message logging, and analytics
 * Enhanced with Node.js 22+ error handling, context tracking, and abort support
 */

import { debounce } from 'perfect-debounce';
import type { MCPToolResponse } from '../types/mcp';
import { AbortableToolArgs, throwIfAborted } from '../utils/abort-support';
import { runWithContext } from '../utils/context';
import { ErrorPatterns } from '../utils/error-handling';
import { globalLoggerRegistry, LogLevel, StreamingLogChunk } from '../utils/logger';
import { yieldToEventLoop } from '../utils/scheduler';
import { ok, runTool } from '../utils/tool-helpers';
import { validateSessionId } from '../utils/validation';

export interface CreateAsyncLoggerArgs extends AbortableToolArgs {
  sessionId: string;
  logDir?: string;
  logLevel?: LogLevel;
  maxBufferSize?: number;
  maxFileSize?: number;
  maxFiles?: number;
  streaming?: boolean;
}

export interface LogMessageArgs extends AbortableToolArgs {
  sessionId: string;
  message: string;
  level?: LogLevel;
}

export interface LoggerStatsArgs extends AbortableToolArgs {
  sessionId?: string;
}

export interface LoggerManagementArgs extends AbortableToolArgs {
  operation: 'list' | 'close' | 'closeAll' | 'flush' | 'streamLogs' | 'streamAggregated';
  sessionId?: string;
  chunkSize?: number;
  levelFilter?: LogLevel[];
  sessionFilter?: string[];
}

export const createAsyncLoggerTool = {
  name: 'create_async_logger',
  description: 'Create an async logger with buffering, file rotation, and performance optimization',
  inputSchema: {
    type: 'object',
    properties: {
      sessionId: {
        type: 'string',
        description: 'Unique session ID for the logger',
      },
      logDir: {
        type: 'string',
        description: 'Directory to store log files',
        default: './logs',
      },
      logLevel: {
        type: 'string',
        description: 'Minimum log level to write',
        enum: ['debug', 'info', 'warn', 'error'],
        default: 'info',
      },
      maxBufferSize: {
        type: 'number',
        description: 'Maximum buffer size in bytes before flushing',
        default: 16384,
      },
      maxFileSize: {
        type: 'number',
        description: 'Maximum file size before rotation in bytes',
        default: 10485760,
      },
      maxFiles: {
        type: 'number',
        description: 'Maximum number of rotated files to keep',
        default: 5,
      },
      streaming: {
        type: 'boolean',
        description: 'Enable streaming mode for log aggregation',
        default: false,
      },
      signal: {
        description: 'AbortSignal for cancelling the operation',
      },
    },
    required: ['sessionId'],
  },

  async execute(args: CreateAsyncLoggerArgs): Promise<MCPToolResponse> {
    return runTool('create_async_logger', 'create', async () => {
      const {
        sessionId,
        logDir = './logs',
        logLevel = 'info',
        maxBufferSize = 16384,
        maxFileSize = 10485760,
        maxFiles = 5,
        streaming = false,
        signal,
      } = args;

      // Check for abort signal at start
      throwIfAborted(signal);

      // Validate session ID
      const sessionValidation = validateSessionId(sessionId);
      if (!sessionValidation.isValid) {
        throw new Error(`Invalid session ID: ${sessionValidation.error}`);
      }

      return runWithContext(
        {
          toolName: 'create_async_logger',
          metadata: { sessionId, logDir, logLevel, streaming },
        },
        async () => {
          // Resource management for logger lifecycle
          class LoggerResource implements AsyncDisposable {
            constructor(
              public readonly logger: any,
              public readonly sessionId: string,
            ) {}

            async [Symbol.asyncDispose]() {
              try {
                await this.logger.flush();
                await this.logger.close();
              } catch (error) {
                console.warn(`Logger cleanup warning for ${this.sessionId}: ${error}`);
              }
            }
          }

          const logger = globalLoggerRegistry.create(sessionId, {
            sessionId,
            logDir,
            logLevel,
            maxBufferSize,
            maxFileSize,
            maxFiles,
            streaming,
          });

          // Check abort signal before potentially blocking operation
          throwIfAborted(signal);

          await using loggerResource = new LoggerResource(logger, sessionId);
          await logger.init();

          // Final abort check
          throwIfAborted(signal);

          return ok({
            success: true,
            sessionId,
            config: {
              logDir,
              logLevel,
              maxBufferSize,
              maxFileSize,
              maxFiles,
              streaming,
            },
          });
        },
      );
    });
  },
};

export const logMessageTool = {
  name: 'log_message',
  description: 'Log a message using a specific logger',
  inputSchema: {
    type: 'object',
    properties: {
      sessionId: {
        type: 'string',
        description: 'Session ID of the logger to use',
      },
      message: {
        type: 'string',
        description: 'Message to log',
      },
      level: {
        type: 'string',
        description: 'Log level',
        enum: ['debug', 'info', 'warn', 'error'],
        default: 'info',
      },
      signal: {
        description: 'AbortSignal for cancelling the operation',
      },
    },
    required: ['sessionId', 'message'],
  },

  async execute(args: LogMessageArgs): Promise<MCPToolResponse> {
    return runTool('log_message', 'log', async () => {
      const { sessionId, message, level = 'info', signal } = args;

      // Check for abort signal
      throwIfAborted(signal);

      // Validate session ID
      const sessionValidation = validateSessionId(sessionId);
      if (!sessionValidation.isValid) {
        throw new Error(`Invalid session ID: ${sessionValidation.error}`);
      }

      const logger = globalLoggerRegistry.get(sessionId);
      if (!logger) {
        throw new Error(`Logger for session '${sessionId}' not found`);
      }

      logger.log(message, level);

      return ok({
        success: true,
        sessionId,
        level,
        message,
      });
    });
  },
};

// Create debounced stats function factory to prevent memory leaks
function createDebouncedGetStats() {
  return debounce(
    async (sessionId?: string) => {
      if (sessionId) {
        const logger = globalLoggerRegistry.get(sessionId);
        if (!logger) {
          throw new Error(`Logger for session '${sessionId}' not found`);
        }
        return logger.getStats();
      } else {
        return globalLoggerRegistry.getGlobalStats();
      }
    },
    100, // 100ms debounce
    { leading: true },
  );
}

// Global debounced function with cleanup capability
let debouncedGetStats = createDebouncedGetStats();

// Cleanup function for memory management
export function cleanupAsyncLoggerDebounce() {
  debouncedGetStats = createDebouncedGetStats();
}

export const loggerStatsTool = {
  name: 'logger_stats',
  description: 'Get statistics and performance metrics for loggers',
  inputSchema: {
    type: 'object',
    properties: {
      sessionId: {
        type: 'string',
        description: 'Session ID of specific logger (omit for global stats)',
      },
      signal: {
        description: 'AbortSignal for cancelling the operation',
      },
    },
  },

  async execute(args: LoggerStatsArgs): Promise<MCPToolResponse> {
    return runTool('logger_stats', 'stats', async () => {
      const { sessionId, signal } = args;

      // Check for abort signal
      throwIfAborted(signal);

      // Validate session ID if provided
      if (sessionId) {
        const sessionValidation = validateSessionId(sessionId);
        if (!sessionValidation.isValid) {
          throw new Error(`Invalid session ID: ${sessionValidation.error}`);
        }
      }

      // Use debounced stats function
      const stats = await debouncedGetStats(sessionId);

      return ok({
        success: true,
        stats,
      });
    });
  },
};

export const loggerManagementTool = {
  name: 'logger_management',
  description: 'Manage loggers (list, close, cleanup)',
  inputSchema: {
    type: 'object',
    properties: {
      operation: {
        type: 'string',
        description: 'Management operation to perform',
        enum: ['list', 'close', 'closeAll', 'flush', 'streamLogs', 'streamAggregated'],
      },
      chunkSize: {
        type: 'number',
        description: 'Chunk size for streaming operations',
        default: 10,
      },
      levelFilter: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['debug', 'info', 'warn', 'error'],
        },
        description: 'Filter logs by level for streaming',
      },
      sessionFilter: {
        type: 'array',
        items: {
          type: 'string',
        },
        description: 'Filter logs by session IDs for aggregated streaming',
      },
      sessionId: {
        type: 'string',
        description: 'Session ID for close/flush operations',
      },
      signal: {
        description: 'AbortSignal for cancelling the operation',
      },
    },
    required: ['operation'],
  },

  async execute(args: LoggerManagementArgs): Promise<MCPToolResponse> {
    return runTool('logger_management', args.operation, async () => {
      const { operation, sessionId, chunkSize = 10, levelFilter, sessionFilter, signal } = args;

      // Check for abort signal
      throwIfAborted(signal);

      // Validate session ID if provided
      if (sessionId) {
        const sessionValidation = validateSessionId(sessionId);
        if (!sessionValidation.isValid) {
          throw new Error(`Invalid session ID: ${sessionValidation.error}`);
        }
      }

      let result: any;

      switch (operation) {
        case 'list':
          result = globalLoggerRegistry.list();
          break;
        case 'close':
          if (!sessionId) throw new Error('Session ID required for close operation');
          throwIfAborted(signal); // Check before async operation
          result = await globalLoggerRegistry.close(sessionId);
          break;
        case 'closeAll':
          throwIfAborted(signal); // Check before async operation
          await globalLoggerRegistry.closeAll();
          result = true;
          break;
        case 'flush':
          if (!sessionId) throw new Error('Session ID required for flush operation');
          const logger = globalLoggerRegistry.get(sessionId);
          if (!logger) throw new Error(`Logger for session '${sessionId}' not found`);
          logger.flush();
          result = true;
          break;
        case 'streamLogs': {
          if (!sessionId) throw new Error('Session ID required for stream logs operation');
          const streamLogger = globalLoggerRegistry.get(sessionId);
          if (!streamLogger) throw new Error(`Logger for session '${sessionId}' not found`);

          throwIfAborted(signal);

          // Collect streaming chunks
          const chunks: StreamingLogChunk[] = [];
          try {
            for await (const chunk of streamLogger.streamLogs?.({
              chunkSize,
              signal,
              includeBuffer: true,
            }) || []) {
              chunks.push(chunk);

              // Yield control every few chunks
              if (chunks.length % 5 === 0) {
                await yieldToEventLoop();
              }
            }

            result = {
              streaming: true,
              sessionId,
              chunks: chunks.length,
              logs: chunks,
              completed: true,
            };
          } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
              result = {
                streaming: true,
                sessionId,
                chunks: chunks.length,
                logs: chunks,
                aborted: true,
              };
            } else {
              throw error;
            }
          }
          break;
        }
        case 'streamAggregated': {
          throwIfAborted(signal);

          // Collect aggregated streaming chunks
          const chunks: StreamingLogChunk[] = [];
          try {
            for await (const chunk of globalLoggerRegistry.streamAggregatedLogs({
              chunkSize,
              signal,
              levelFilter,
              sessionFilter,
            })) {
              chunks.push(chunk);

              // Yield control every few chunks
              if (chunks.length % 5 === 0) {
                await yieldToEventLoop();
              }
            }

            result = {
              streaming: true,
              aggregated: true,
              chunks: chunks.length,
              logs: chunks,
              filters: { levelFilter, sessionFilter },
              completed: true,
            };
          } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
              result = {
                streaming: true,
                aggregated: true,
                chunks: chunks.length,
                logs: chunks,
                filters: { levelFilter, sessionFilter },
                aborted: true,
              };
            } else {
              throw error;
            }
          }
          break;
        }
        default:
          ErrorPatterns.unknownAction(operation, [
            'list',
            'close',
            'closeAll',
            'flush',
            'streamLogs',
            'streamAggregated',
          ]);
      }

      return ok({
        success: true,
        operation,
        result,
      });
    });
  },
};
