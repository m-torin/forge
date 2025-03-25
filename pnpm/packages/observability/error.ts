/**
 * Error handling utilities for the observability package
 */
import { captureException } from '@sentry/nextjs';
import { log } from './log';

/**
 * Parse an error into a user-friendly message
 * @param error - The error to parse
 * @returns A user-friendly error message
 */
export const parseError = (error: unknown): string => {
  let message: string;

  try {
    // Log the error to Sentry
    captureException(error);

    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    } else if (error === null) {
      message = 'null';
    } else if (error === undefined) {
      message = 'undefined';
    } else if (typeof error === 'number') {
      message = String(error);
    } else if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error
    ) {
      message = String(error.message);
    } else {
      message = 'Unknown error';
    }

    // Log the error
    log.error(`Parsing error: ${message}`);

    return message;
  } catch (e) {
    // Handle errors during error reporting
    console.error('Error parsing error:', e);

    if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown error';
  }
};

/**
 * Log an error to the console and any configured error tracking services
 * @param error - The error to log
 * @param context - Additional context for the error
 */
export const logError = (
  error: unknown,
  context?: Record<string, unknown>,
): void => {
  const message = parseError(error);
  console.error('[Error]', message, error, context);
  // In a real implementation, this would send the error to an error tracking service
};
