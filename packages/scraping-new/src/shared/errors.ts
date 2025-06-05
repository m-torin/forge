/**
 * Error types and utilities for the scraping system
 */

export enum ScrapingErrorCode {
  // Network and HTTP errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  PAGE_LOAD_FAILED = 'PAGE_LOAD_FAILED',
  INVALID_URL = 'INVALID_URL',

  // Security and access errors
  ACCESS_DENIED = 'ACCESS_DENIED',
  CAPTCHA_DETECTED = 'CAPTCHA_DETECTED',
  BLOCKED_BY_ROBOTS = 'BLOCKED_BY_ROBOTS',
  RATE_LIMITED = 'RATE_LIMITED',

  // Browser and provider errors
  BROWSER_LAUNCH_FAILED = 'BROWSER_LAUNCH_FAILED',
  PROVIDER_ERROR = 'PROVIDER_ERROR',
  PROVIDER_NOT_FOUND = 'PROVIDER_NOT_FOUND',
  PROVIDER_NOT_INITIALIZED = 'PROVIDER_NOT_INITIALIZED',

  // Element and selector errors
  ELEMENT_NOT_FOUND = 'ELEMENT_NOT_FOUND',
  SELECTOR_NOT_FOUND = 'SELECTOR_NOT_FOUND',
  SELECTOR_INVALID = 'SELECTOR_INVALID',

  // Navigation and interaction errors
  NAVIGATION_FAILED = 'NAVIGATION_FAILED',
  INTERACTION_FAILED = 'INTERACTION_FAILED',

  // Configuration errors
  INVALID_CONFIG = 'INVALID_CONFIG',
  MISSING_CREDENTIALS = 'MISSING_CREDENTIALS',

  // Resource errors
  MEMORY_LIMIT_EXCEEDED = 'MEMORY_LIMIT_EXCEEDED',
  RESOURCE_EXHAUSTED = 'RESOURCE_EXHAUSTED',

  // Content and extraction errors
  SCRAPING_FAILED = 'SCRAPING_FAILED',
  EXTRACTION_FAILED = 'EXTRACTION_FAILED',
  AI_EXTRACTION_FAILED = 'AI_EXTRACTION_FAILED',

  // Session and proxy errors
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  PROXY_ERROR = 'PROXY_ERROR',

  // General errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

/**
 * Error context interface
 */
export interface ErrorContext {
  url?: string;
  provider?: string;
  method?: string;
  attempt?: number;
  maxAttempts?: number;
  startTime?: number;
  duration?: number;
  [key: string]: any;
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
      name: this.name,
      cause: this.cause?.message,
      code: this.code,
      details: this.details,
      message: this.message,
      stack: this.stack,
    };
  }
}

export class NavigationError extends ScrapingError {
  constructor(message: string, details?: Record<string, any>, cause?: Error) {
    super(message, ScrapingErrorCode.NAVIGATION_FAILED, details, cause);
    this.name = 'NavigationError';
  }
}

export class TimeoutError extends ScrapingError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, ScrapingErrorCode.TIMEOUT, details);
    this.name = 'TimeoutError';
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

export class CaptchaError extends ScrapingError {
  constructor(message: string, captchaType?: string, details?: Record<string, any>) {
    super(message, ScrapingErrorCode.CAPTCHA_DETECTED, {
      captchaType,
      ...details,
    });
    this.name = 'CaptchaError';
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

export class ConfigurationError extends ScrapingError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, ScrapingErrorCode.INVALID_CONFIG, details);
    this.name = 'ConfigurationError';
  }
}

// Error utilities
export function isScrapingError(error: unknown): error is ScrapingError {
  return error instanceof ScrapingError;
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

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Unknown error occurred';
}

export function wrapError(
  error: unknown,
  code: ScrapingErrorCode,
  message?: string,
): ScrapingError {
  if (isScrapingError(error)) {
    return error;
  }

  const errorMessage = message || getErrorMessage(error);
  const cause = error instanceof Error ? error : undefined;

  return new ScrapingError(errorMessage, code, undefined, cause);
}
