/**
 * Centralized error handling utilities for guest management
 */

import { notifications } from '@mantine/notifications';

export interface ErrorHandlerOptions {
  title?: string;
  fallbackMessage?: string;
  logError?: boolean;
}

/**
 * Handle API errors consistently across the guest management section
 */
export function handleApiError(error: unknown, options: ErrorHandlerOptions = {}): void {
  const {
    title = 'Error',
    fallbackMessage = 'An unexpected error occurred',
    logError = true,
  } = options;

  if (logError) {
    console.error(`${title}:`, error);
  }

  let message = fallbackMessage;

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'object' && error !== null && 'error' in error) {
    message = (error as { error: string }).error;
  } else if (typeof error === 'string') {
    message = error;
  }

  notifications.show({
    title,
    message,
    color: 'red',
  });
}

/**
 * Show a success notification
 */
export function showSuccess(message: string, title = 'Success'): void {
  notifications.show({
    title,
    message,
    color: 'green',
  });
}

/**
 * Show an info notification
 */
export function showInfo(message: string, title = 'Info'): void {
  notifications.show({
    title,
    message,
    color: 'blue',
  });
}

/**
 * Show a warning notification
 */
export function showWarning(message: string, title = 'Warning'): void {
  notifications.show({
    title,
    message,
    color: 'orange',
  });
}

/**
 * Handle bulk operation results
 */
export function handleBulkOperationResult(
  successCount: number,
  totalCount: number,
  operation: string,
): void {
  if (successCount === totalCount) {
    showSuccess(`All ${totalCount} ${operation} completed successfully`);
  } else if (successCount > 0) {
    showWarning(
      `${successCount}/${totalCount} ${operation} completed successfully`,
      'Partial Success',
    );
  } else {
    handleApiError(null, {
      title: 'Operation Failed',
      fallbackMessage: `Failed to complete ${operation}`,
    });
  }
}
