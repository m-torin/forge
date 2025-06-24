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
      enabled: config.enabled ?? true,
      logErrors: config.logErrors ?? true,
      logRequests: config.logRequests ?? true,
      logResponses: config.logResponses ?? false, // Potentially large
      logTokenUsage: config.logTokenUsage ?? true,
    };
  }

  logError(provider: string, operation: string, error: Error): void {
    if (!this.config.enabled || !this.config.logErrors) return;

    // eslint-disable-next-line no-console
    console.error(`[AI] ${provider} ${operation} error:`, {
      error: (error as Error)?.message || 'Unknown error',
      operation,
      provider,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  }

  logNextRequest(provider: string, operation: string, options: CompletionOptions): void {
    if (!this.config.enabled || !this.config.logRequests) return;

    // Handle both prompt and messages patterns
    const promptInfo = options.prompt
      ? { promptLength: options.prompt.length }
      : { messagesCount: options.messages?.length || 0 };

    // eslint-disable-next-line no-console
    console.log(`[AI] ${provider} ${operation} request:`, {
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
      // eslint-disable-next-line no-console
      console.log(`[AI] ${provider} ${operation} usage:`, {
        finishReason: response.finishReason,
        model: response.model,
        operation,
        provider,
        timestamp: new Date().toISOString(),
        usage: response.usage,
      });
    }

    if (this.config.logResponses) {
      // eslint-disable-next-line no-console
      console.log(`[AI] ${provider} ${operation} response:`, {
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

    // eslint-disable-next-line no-console
    console.log(`[AI] ${provider} stream completed:`, {
      chunkCount,
      estimatedTokens: Math.ceil(totalText.length / 4),
      provider,
      timestamp: new Date().toISOString(),
      totalLength: totalText.length,
    });
  }
}

export const defaultLogger = new AILogger();
