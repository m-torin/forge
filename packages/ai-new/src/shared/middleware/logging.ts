import type { CompletionOptions, CompletionResponse } from '../types';

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

  logRequest(provider: string, operation: string, options: CompletionOptions): void {
    if (!this.config.enabled || !this.config.logRequests) return;

    console.log(`[AI] ${provider} ${operation} request:`, {
      provider,
      maxTokens: options.maxTokens,
      model: options.model,
      operation,
      promptLength: options.prompt.length,
      temperature: options.temperature,
      timestamp: new Date().toISOString(),
    });
  }

  logResponse(provider: string, operation: string, response: CompletionResponse): void {
    if (!this.config.enabled) return;

    if (this.config.logTokenUsage && response.usage) {
      console.log(`[AI] ${provider} ${operation} usage:`, {
        provider,
        finishReason: response.finishReason,
        model: response.model,
        operation,
        timestamp: new Date().toISOString(),
        usage: response.usage,
      });
    }

    if (this.config.logResponses) {
      console.log(`[AI] ${provider} ${operation} response:`, {
        provider,
        finishReason: response.finishReason,
        operation,
        textLength: response.text.length,
        timestamp: new Date().toISOString(),
        usage: response.usage,
      });
    }
  }

  logError(provider: string, operation: string, error: Error): void {
    if (!this.config.enabled || !this.config.logErrors) return;

    console.error(`[AI] ${provider} ${operation} error:`, {
      provider,
      error: error.message,
      operation,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  }

  logStream(provider: string, chunkCount: number, totalText: string): void {
    if (!this.config.enabled || !this.config.logTokenUsage) return;

    console.log(`[AI] ${provider} stream completed:`, {
      provider,
      chunkCount,
      estimatedTokens: Math.ceil(totalText.length / 4),
      timestamp: new Date().toISOString(),
      totalLength: totalText.length,
    });
  }
}

export const defaultLogger = new AILogger();
