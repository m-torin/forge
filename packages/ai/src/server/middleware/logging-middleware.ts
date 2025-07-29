/**
 * Advanced Logging Middleware for AI SDK v5
 * Comprehensive logging of model interactions with privacy controls
 */

import { logInfo } from '@repo/observability';

// Define middleware types locally since they may not be exported in current AI SDK v5 build
interface LanguageModelV2Middleware {
  wrapGenerate?: (args: { doGenerate: any; params: any }) => Promise<any>;
  wrapStream?: (args: { doStream: any; params: any }) => Promise<any>;
}

export interface LoggingOptions {
  enabled?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  logPrompts?: boolean;
  logResponses?: boolean;
  logMetrics?: boolean;
  logErrors?: boolean;
  maxPromptLength?: number;
  maxResponseLength?: number;
  sanitizeData?: boolean;
  customLogger?: (level: string, message: string, data?: any) => void;
  includeTimestamps?: boolean;
  includeModelInfo?: boolean;
}

const defaultOptions: Required<LoggingOptions> = {
  enabled: true,
  logLevel: 'info',
  logPrompts: true,
  logResponses: true,
  logMetrics: true,
  logErrors: true,
  maxPromptLength: 1000,
  maxResponseLength: 1000,
  sanitizeData: true,
  customLogger: (level, message, data) => {
    const timestamp = new Date().toISOString();
    const logEntry = data
      ? `[${timestamp}] ${level.toUpperCase()}: ${message} ${JSON.stringify(data)}`
      : `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    logInfo(logEntry);
  },
  includeTimestamps: true,
  includeModelInfo: true,
};

/**
 * Create logging middleware for AI model interactions
 */
export function createLoggingMiddleware(options: LoggingOptions = {}): LanguageModelV2Middleware {
  const opts = { ...defaultOptions, ...options };

  if (!opts.enabled) {
    // Return pass-through middleware when disabled
    return {};
  }

  const logger = opts.customLogger;

  const sanitizeText = (text: string, maxLength: number): string => {
    if (!opts.sanitizeData) return text.slice(0, maxLength);

    // Remove potential sensitive information
    let sanitized = text
      .replace(/\b[\w\.-]+@[\w\.-]+\.\w+\b/g, '[EMAIL]') // Email addresses
      .replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[CARD]') // Credit card numbers
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]') // SSN patterns
      .replace(/\b\+?1?[-.\s]?[0-9]{3}[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g, '[PHONE]'); // Phone numbers

    return sanitized.slice(0, maxLength);
  };

  return {
    wrapGenerate: async ({ doGenerate, params }) => {
      // Log request parameters first
      if (opts.logPrompts && opts.logLevel !== 'error') {
        const logData: any = {};

        if (opts.includeModelInfo && params.model) {
          logData.modelId = params.model.modelId;
          logData.provider = params.model.provider;
        }

        if (params.prompt) {
          logData.prompt = sanitizeText(params.prompt, opts.maxPromptLength);
        }

        if (params.messages && Array.isArray(params.messages)) {
          logData.messageCount = params.messages.length;
          logData.messages = params.messages.map((msg: any) => ({
            role: msg.role,
            content:
              typeof msg.content === 'string'
                ? sanitizeText(msg.content, opts.maxPromptLength / 2)
                : '[COMPLEX_CONTENT]',
          }));
        }

        if (params.tools) {
          logData.toolCount = Object.keys(params.tools).length;
          logData.tools = Object.keys(params.tools);
        }

        if (opts.logMetrics) {
          logData.settings = {
            temperature: params.temperature,
            maxOutputTokens: params.maxOutputTokens,
            topP: params.topP,
            topK: params.topK,
          };
        }

        logger('info', 'AI Model Request', logData);
      }
      const startTime = Date.now();

      try {
        const result = await doGenerate();
        const endTime = Date.now();
        const duration = endTime - startTime;

        if (opts.logResponses && opts.logLevel !== 'error') {
          const logData: any = {
            duration: `${duration}ms`,
            finishReason: result.finishReason,
          };

          if (opts.includeTimestamps) {
            logData.timestamp = new Date(endTime).toISOString();
          }

          if (result.text && opts.logResponses) {
            logData.response = sanitizeText(result.text, opts.maxResponseLength);
          }

          if (opts.logMetrics && result.usage) {
            logData.usage = {
              promptTokens: result.usage.promptTokens,
              completionTokens: result.usage.completionTokens,
              totalTokens: result.usage.totalTokens,
            };
          }

          if (result.toolCalls && result.toolCalls.length > 0) {
            logData.toolCalls = result.toolCalls.map((call: any) => ({
              toolName: call.toolName,
              argsLength: JSON.stringify(call.args).length,
            }));
          }

          if (result.warnings && result.warnings.length > 0) {
            logData.warnings = result.warnings;
          }

          logger('info', 'AI Model Response', logData);
        }

        if (opts.logMetrics && opts.logLevel === 'debug') {
          logger('debug', 'AI Model Performance', {
            duration: `${duration}ms`,
            tokensPerSecond: result.usage?.totalTokens
              ? Math.round((result.usage.totalTokens / duration) * 1000)
              : null,
          });
        }

        return result;
      } catch (error) {
        const endTime = Date.now();
        const duration = endTime - startTime;

        if (opts.logErrors) {
          const logData: any = {
            duration: `${duration}ms`,
            error: error instanceof Error ? error.message : String(error),
          };

          if (opts.includeTimestamps) {
            logData.timestamp = new Date(endTime).toISOString();
          }

          if (error instanceof Error && error.stack && opts.logLevel === 'debug') {
            logData.stack = error.stack;
          }

          logger('error', 'AI Model Error', logData);
        }

        throw error;
      }
    },

    wrapStream: async ({ doStream, params }) => {
      const startTime = Date.now();
      let tokenCount = 0;
      let hasError = false;

      if (opts.logPrompts && opts.logLevel !== 'error') {
        logger('info', 'AI Model Stream Started', {
          modelId: params.model?.modelId,
          prompt: params.prompt ? sanitizeText(params.prompt, opts.maxPromptLength) : undefined,
        });
      }

      const stream = await doStream();

      return {
        stream: stream.stream.pipeThrough(
          new TransformStream({
            transform(chunk, controller) {
              try {
                // Track tokens for metrics
                if (chunk.type === 'text-delta' && chunk.textDelta) {
                  tokenCount += chunk.textDelta.split(' ').length;
                }

                // Log tool calls
                if (chunk.type === 'tool-call' && opts.logLevel === 'debug') {
                  logger('debug', 'Tool Call', {
                    toolName: chunk.toolName,
                    toolCallId: chunk.toolCallId,
                  });
                }

                controller.enqueue(chunk);
              } catch (error) {
                hasError = true;
                if (opts.logErrors) {
                  logger('error', 'Stream Processing Error', {
                    error: error instanceof Error ? error.message : String(error),
                  });
                }
                controller.error(error);
              }
            },

            flush() {
              const endTime = Date.now();
              const duration = endTime - startTime;

              if (opts.logMetrics && !hasError) {
                logger('info', 'AI Model Stream Completed', {
                  duration: `${duration}ms`,
                  estimatedTokens: tokenCount,
                  tokensPerSecond: Math.round((tokenCount / duration) * 1000),
                });
              }
            },
          }),
        ),
        warnings: stream.warnings,
      };
    },
  };
}

/**
 * Pre-configured logging middleware for different environments
 */
export const loggingMiddleware = {
  /**
   * Development middleware with verbose logging
   */
  development: () =>
    createLoggingMiddleware({
      logLevel: 'debug',
      logPrompts: true,
      logResponses: true,
      logMetrics: true,
      maxPromptLength: 2000,
      maxResponseLength: 2000,
      sanitizeData: false,
    }),

  /**
   * Production middleware with security-focused logging
   */
  production: () =>
    createLoggingMiddleware({
      logLevel: 'info',
      logPrompts: false, // Don't log prompts in production
      logResponses: false, // Don't log responses in production
      logMetrics: true,
      logErrors: true,
      sanitizeData: true,
      maxPromptLength: 500,
      maxResponseLength: 500,
    }),

  /**
   * Debug middleware for troubleshooting
   */
  debug: () =>
    createLoggingMiddleware({
      logLevel: 'debug',
      logPrompts: true,
      logResponses: true,
      logMetrics: true,
      logErrors: true,
      sanitizeData: true,
      includeTimestamps: true,
      includeModelInfo: true,
    }),

  /**
   * Minimal middleware for basic error tracking
   */
  minimal: () =>
    createLoggingMiddleware({
      logLevel: 'error',
      logPrompts: false,
      logResponses: false,
      logMetrics: false,
      logErrors: true,
      sanitizeData: true,
    }),
} as const;
