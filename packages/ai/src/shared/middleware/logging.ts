import { logError, logInfo } from '@repo/observability/shared-env';
import {
  isAILoggingEnabled,
  isAIPerformanceLoggingEnabled,
  isAIRequestLoggingEnabled,
  isAIResponseLoggingEnabled,
} from '../../../env';
import { CompletionOptions, CompletionResponse } from '../types';

export interface LoggingConfig {
  enabled: boolean;
  logErrors: boolean;
  logRequests: boolean;
  logResponses: boolean;
  logTokenUsage: boolean;
}

export class AILogger {
  private config: LoggingConfig;

  constructor(config: Partial<LoggingConfig> = {}) {
    this.config = {
      enabled: config.enabled ?? isAILoggingEnabled(),
      logErrors: config.logErrors ?? true,
      logRequests: config.logRequests ?? isAIRequestLoggingEnabled(),
      logResponses: config.logResponses ?? isAIResponseLoggingEnabled(),
      logTokenUsage: config.logTokenUsage ?? isAIPerformanceLoggingEnabled(),
    };
  }

  logError(provider: string, operation: string, error: Error): void {
    if (!this.config.enabled || !this.config.logErrors) return;

    logError(`[AI] ${provider} ${operation} error`, error, {
      operation,
      provider,
      timestamp: new Date().toISOString(),
    });
  }

  logNextRequest(provider: string, operation: string, options: CompletionOptions): void {
    if (!this.config.enabled || !this.config.logRequests) return;

    // Handle both prompt and messages patterns
    const promptInfo = options.prompt
      ? { promptLength: options.prompt.length }
      : { messagesCount: options.messages?.length || 0 };

    logInfo(`[AI] ${provider} ${operation} request`, {
      maxTokens: options.maxTokens,
      model: options.model,
      operation,
      ...promptInfo,
      provider,
      temperature: options.temperature,
      timestamp: new Date().toISOString(),
    });
  }

  logResponse(provider: string, operation: string, response: CompletionResponse): void {
    if (!this.config.enabled) return;

    if (this.config.logTokenUsage && response.usage) {
      logInfo(`[AI] ${provider} ${operation} usage`, {
        finishReason: response.finishReason,
        model: response.model,
        operation,
        provider,
        timestamp: new Date().toISOString(),
        usage: response.usage,
      });
    }

    if (this.config.logResponses) {
      logInfo(`[AI] ${provider} ${operation} response`, {
        finishReason: response.finishReason,
        operation,
        provider,
        textLength: response.text.length,
        timestamp: new Date().toISOString(),
        usage: response.usage,
      });
    }
  }

  logStream(provider: string, chunkCount: number, totalText: string): void {
    if (!this.config.enabled || !this.config.logTokenUsage) return;

    logInfo(`[AI] ${provider} stream completed`, {
      chunkCount,
      estimatedTokens: Math.ceil(totalText.length / 4),
      provider,
      timestamp: new Date().toISOString(),
      totalLength: totalText.length,
    });
  }
}

export const defaultLogger = new AILogger();
