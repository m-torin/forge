/**
 * Base adapter interface and utilities for all database providers
 */

export interface BaseAdapterOptions {
  connectionString?: string;
  url?: string;
  maxConnections?: number;
  connectionTimeout?: number;
  poolTimeout?: number;
  retries?: number;
}

export interface AdapterInstance {
  provider: string;
  adapter: any;
  config: BaseAdapterOptions;
}

/**
 * Base adapter creation utilities
 */
export abstract class BaseAdapter {
  protected provider: string;
  protected options: BaseAdapterOptions;

  constructor(provider: string, options: BaseAdapterOptions) {
    this.provider = provider;
    this.options = options;
  }

  abstract create(): Promise<any>;

  protected validateOptions(): void {
    if (!this.options.connectionString && !this.options.url) {
      throw new Error(`${this.provider} adapter requires either connectionString or url`);
    }
  }

  protected getConnectionConfig() {
    return {
      connectionString: this.options.connectionString || this.options.url,
      maxConnections: this.options.maxConnections || 10,
      connectionTimeout: this.options.connectionTimeout || 30000,
      poolTimeout: this.options.poolTimeout || 60000,
      retries: this.options.retries || 3,
    };
  }
}

/**
 * Validate common adapter options
 */
export function validateBaseOptions(options: BaseAdapterOptions): boolean {
  if (!options.connectionString && !options.url) {
    return false;
  }

  if (options.maxConnections !== undefined) {
    if (options.maxConnections < 1 || options.maxConnections > 100) {
      return false;
    }
  }

  if (options.connectionTimeout !== undefined) {
    if (options.connectionTimeout < 1000 || options.connectionTimeout > 300000) {
      return false;
    }
  }

  return true;
}

/**
 * Create standardized error messages for adapter failures
 */
export function createAdapterError(provider: string, originalError: any, context?: string): Error {
  const contextMsg = context ? ` while ${context}` : '';
  const message = `${provider} adapter failed${contextMsg}: ${originalError.message || originalError}`;

  const error = new Error(message);
  error.cause = originalError;
  return error;
}

/**
 * Retry logic for adapter operations
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }

  throw lastError;
}
