/**
 * Error types and utilities for the scraping system
 */

export enum ScrapingErrorCode {
  // Security and access errors
  AI_EXTRACTION_FAILED = 'AI_EXTRACTION_FAILED',
  // Browser and provider errors
  CAPTCHA_DETECTED = 'CAPTCHA_DETECTED',
  // Element and selector errors
  ELEMENT_NOT_FOUND = 'ELEMENT_NOT_FOUND',
  EXTRACTION_FAILED = 'EXTRACTION_FAILED',
  INTERACTION_FAILED = 'INTERACTION_FAILED',

  // Configuration errors
  INVALID_CONFIG = 'INVALID_CONFIG',
  // Resource errors
  // Navigation and interaction errors
  NAVIGATION_FAILED = 'NAVIGATION_FAILED',
  // Network and HTTP errors
  NETWORK_ERROR = 'NETWORK_ERROR',

  PROVIDER_ERROR = 'PROVIDER_ERROR',

  PROVIDER_NOT_INITIALIZED = 'PROVIDER_NOT_INITIALIZED',

  RATE_LIMITED = 'RATE_LIMITED',

  RESOURCE_EXHAUSTED = 'RESOURCE_EXHAUSTED',
  // Content and extraction errors
  SCRAPING_FAILED = 'SCRAPING_FAILED',
  // Session and proxy errors
  SESSION_EXPIRED = 'SESSION_EXPIRED',

  TIMEOUT = 'TIMEOUT',
  // General errors
}

/**
 * Error context interface
 */
export interface ErrorContext {
  [key: string]: any;
  attempt?: number;
  duration?: number;
  maxAttempts?: number;
  method?: string;
  provider?: string;
  startTime?: number;
  url?: string;
}

/**
 * Scraping error type (for compatibility)
 */
export type ScrapingErrorType = ScrapingErrorCode;

export class ScrapingError extends Error {
  constructor(
    message: string,
    public code: ScrapingErrorCode,
    public details?: Record<string, any>,
    public cause?: Error,
  ) {
    super(message);
    this.name = 'ScrapingError';

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ScrapingError);
    }
  }

  toJSON() {
    return {
      cause: this.cause?.message,
      code: this.code,
      details: this.details,
      message: this.message,
      name: this.name,
      stack: this.stack,
    };
  }
}

export class CaptchaError extends ScrapingError {
  constructor(message: string, captchaType?: string, details?: Record<string, any>) {
    super(message, ScrapingErrorCode.CAPTCHA_DETECTED, {
      captchaType,
      ...details,
    });
    this.name = 'CaptchaError';
  }
}

export class ConfigurationError extends ScrapingError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, ScrapingErrorCode.INVALID_CONFIG, details);
    this.name = 'ConfigurationError';
  }
}

export class ElementNotFoundError extends ScrapingError {
  constructor(selector: string, details?: Record<string, any>) {
    super(`Element not found: ${selector}`, ScrapingErrorCode.ELEMENT_NOT_FOUND, {
      selector,
      ...details,
    });
    this.name = 'ElementNotFoundError';
  }
}

export class NavigationError extends ScrapingError {
  constructor(message: string, details?: Record<string, any>, cause?: Error) {
    super(message, ScrapingErrorCode.NAVIGATION_FAILED, details, cause);
    this.name = 'NavigationError';
  }
}

export class ProviderError extends ScrapingError {
  constructor(
    message: string,
    public provider: string,
    details?: Record<string, any>,
    cause?: Error,
  ) {
    super(
      message,
      ScrapingErrorCode.PROVIDER_ERROR,
      {
        provider,
        ...details,
      },
      cause,
    );
    this.name = 'ProviderError';
  }
}

export class TimeoutError extends ScrapingError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, ScrapingErrorCode.TIMEOUT, details);
    this.name = 'TimeoutError';
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return (error as Error)?.message || 'Unknown error';
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Unknown error occurred';
}

export function isRetryableError(error: unknown): boolean {
  if (!isScrapingError(error)) {
    return false;
  }

  const retryableCodes = [
    ScrapingErrorCode.TIMEOUT,
    ScrapingErrorCode.NETWORK_ERROR,
    ScrapingErrorCode.RATE_LIMITED,
    ScrapingErrorCode.RESOURCE_EXHAUSTED,
  ];

  return retryableCodes.includes(error.code);
}

// Error utilities
export function isScrapingError(error: unknown): error is ScrapingError {
  return error instanceof ScrapingError;
}

export function wrapError(
  error: unknown,
  code: ScrapingErrorCode,
  message?: string,
): ScrapingError {
  if (isScrapingError(error)) {
    return error;
  }

  const errorMessage = message ?? getErrorMessage(error);
  const cause = error instanceof Error ? error : undefined;

  return new ScrapingError(errorMessage, code, undefined, cause);
}
