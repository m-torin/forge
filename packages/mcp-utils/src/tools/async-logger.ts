/**
 * MCP Tool: Async Logger Management
 * Provides logger creation, message logging, and analytics
 */

import { globalLoggerRegistry, LoggerOptions, LogLevel } from '../utils/logger';

export interface MCPToolResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
  isError?: boolean;
}

export interface CreateAsyncLoggerArgs {
  sessionId: string;
  logDir?: string;
  logLevel?: LogLevel;
  maxBufferSize?: number;
  maxFileSize?: number;
  maxFiles?: number;
}

export interface LogMessageArgs {
  sessionId: string;
  message: string;
  level?: LogLevel;
}

export interface LoggerStatsArgs {
  sessionId?: string;
}

export interface LoggerManagementArgs {
  operation: 'list' | 'close' | 'closeAll' | 'flush';
  sessionId?: string;
}

export const createAsyncLoggerTool = {
  name: 'create_async_logger',
  description: 'Create an async logger with buffering, file rotation, and performance optimization',
  inputSchema: {
    type: 'object',
    properties: {
      sessionId: {
        type: 'string',
        description: 'Unique session ID for the logger'
      },
      logDir: {
        type: 'string',
        description: 'Directory to store log files',
        default: './logs'
      },
      logLevel: {
        type: 'string',
        description: 'Minimum log level to write',
        enum: ['debug', 'info', 'warn', 'error'],
        default: 'info'
      },
      maxBufferSize: {
        type: 'number',
        description: 'Maximum buffer size in bytes before flushing',
        default: 16384
      },
      maxFileSize: {
        type: 'number',
        description: 'Maximum file size before rotation in bytes',
        default: 10485760
      },
      maxFiles: {
        type: 'number',
        description: 'Maximum number of rotated files to keep',
        default: 5
      }
    },
    required: ['sessionId']
  },

  async execute(args: CreateAsyncLoggerArgs): Promise<MCPToolResponse> {
    try {
      const { sessionId, logDir = './logs', logLevel = 'info', maxBufferSize = 16384, maxFileSize = 10485760, maxFiles = 5 } = args;
      
      const logger = globalLoggerRegistry.create(sessionId, {
        sessionId,
        logDir,
        logLevel,
        maxBufferSize,
        maxFileSize,
        maxFiles
      });
      
      await logger.init();
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              sessionId,
              config: {
                logDir,
                logLevel,
                maxBufferSize,
                maxFileSize,
                maxFiles
              }
            })
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: (error as Error).message
            })
          }
        ],
        isError: true
      };
    }
  }
};

export const logMessageTool = {
  name: 'log_message',
  description: 'Log a message using a specific logger',
  inputSchema: {
    type: 'object',
    properties: {
      sessionId: {
        type: 'string',
        description: 'Session ID of the logger to use'
      },
      message: {
        type: 'string',
        description: 'Message to log'
      },
      level: {
        type: 'string',
        description: 'Log level',
        enum: ['debug', 'info', 'warn', 'error'],
        default: 'info'
      }
    },
    required: ['sessionId', 'message']
  },

  async execute(args: LogMessageArgs): Promise<MCPToolResponse> {
    try {
      const { sessionId, message, level = 'info' } = args;
      
      const logger = globalLoggerRegistry.get(sessionId);
      if (!logger) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: `Logger for session '${sessionId}' not found`
              })
            }
          ],
          isError: true
        };
      }

      logger.log(message, level);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              sessionId,
              level,
              message
            })
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: (error as Error).message
            })
          }
        ],
        isError: true
      };
    }
  }
};

export const loggerStatsTool = {
  name: 'logger_stats',
  description: 'Get statistics and performance metrics for loggers',
  inputSchema: {
    type: 'object',
    properties: {
      sessionId: {
        type: 'string',
        description: 'Session ID of specific logger (omit for global stats)'
      }
    }
  },

  async execute(args: LoggerStatsArgs): Promise<MCPToolResponse> {
    try {
      const { sessionId } = args;
      
      let stats: any;
      
      if (sessionId) {
        const logger = globalLoggerRegistry.get(sessionId);
        if (!logger) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: `Logger for session '${sessionId}' not found`
                })
              }
            ],
            isError: true
          };
        }
        stats = logger.getStats();
      } else {
        stats = globalLoggerRegistry.getGlobalStats();
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              stats
            })
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: (error as Error).message
            })
          }
        ],
        isError: true
      };
    }
  }
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
        enum: ['list', 'close', 'closeAll', 'flush']
      },
      sessionId: {
        type: 'string',
        description: 'Session ID for close/flush operations'
      }
    },
    required: ['operation']
  },

  async execute(args: LoggerManagementArgs): Promise<MCPToolResponse> {
    try {
      const { operation, sessionId } = args;
      
      let result: any;
      
      switch (operation) {
        case 'list':
          result = globalLoggerRegistry.list();
          break;
        case 'close':
          if (!sessionId) throw new Error('Session ID required for close operation');
          result = await globalLoggerRegistry.close(sessionId);
          break;
        case 'closeAll':
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
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              operation,
              result
            })
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: (error as Error).message
            })
          }
        ],
        isError: true
      };
    }
  }
};