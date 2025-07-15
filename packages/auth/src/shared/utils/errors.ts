/**
 * Shared error handling utilities
 */

/**
 * Standard error handler that extracts error message
 */
export function getErrorMessage(error: unknown, defaultMessage = 'An error occurred'): string {
  return error instanceof Error ? error.message : defaultMessage;
}

/**
 * Creates a standardized error response object
 */
export function createErrorResponse<T = null>(error: unknown, defaultMessage = 'Operation failed') {
  return {
    success: false as const,
    data: null as T,
    error: getErrorMessage(error, defaultMessage),
  };
}

/**
 * Creates a standardized success response object
 */
export function createSuccessResponse<T>(data: T) {
  return {
    success: true as const,
    data,
    error: undefined,
  };
}
