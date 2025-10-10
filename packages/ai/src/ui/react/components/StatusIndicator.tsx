/**
 * StatusIndicator Component
 * Eliminates the repeated status handling patterns from documentation examples
 */

'use client';

import type { UIMessage, UseChatHelpers } from '@ai-sdk/react';
import React from 'react';
import { cn } from '../../utils';

export interface StatusIndicatorProps {
  /** The useChat hook result */
  chat: UseChatHelpers<UIMessage>;
  /** Show loading spinner */
  showSpinner?: boolean;
  /** Custom loading component */
  LoadingComponent?: React.ComponentType<{ className?: string }>;
  /** Show stop button when streaming */
  showStopButton?: boolean;
  /** Custom stop button text */
  stopButtonText?: string;
  /** Show error state */
  showError?: boolean;
  /** Show retry button on error */
  showRetryButton?: boolean;
  /** Custom retry button text */
  retryButtonText?: string;
  /** Additional CSS classes */
  className?: {
    container?: string;
    loading?: string;
    loadingContent?: string;
    spinner?: string;
    message?: string;
    error?: string;
    errorMessage?: string;
    buttons?: string;
    stopButton?: string;
    retryButton?: string;
  };
  /** Custom status messages */
  statusMessages?: {
    submitted?: string;
    streaming?: string;
    error?: string;
  };
}

/**
 * Default loading spinner component
 */
const DefaultSpinner: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      'inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-blue-500',
      className,
    )}
  />
);

/**
 * Handles the repetitive status display patterns from docs:
 * ```
 * {(status === 'submitted' || status === 'streaming') && (
 *   <div>
 *     {status === 'submitted' && <Spinner />}
 *     <button onClick={() => stop()}>Stop</button>
 *   </div>
 * )}
 * ```
 */
export function StatusIndicator({
  chat,
  showSpinner = true,
  LoadingComponent = DefaultSpinner,
  showStopButton = true,
  stopButtonText = 'Stop',
  showError = true,
  showRetryButton = true,
  retryButtonText = 'Retry',
  className = {},
  statusMessages = {},
}: StatusIndicatorProps) {
  const { status, error, stop } = chat;

  const defaultMessages = {
    submitted: 'Sending message...',
    streaming: 'Receiving response...',
    error: 'Something went wrong.',
    ...statusMessages,
  };

  // Don't render anything if status is ready and no error
  if (status === 'ready' && !error) {
    return null;
  }

  return (
    <div className={cn(className.container)} data-testid="status-indicator">
      {/* Loading states */}
      {(status === 'submitted' || status === 'streaming') && (
        <div className={cn(className.loading)} data-testid="loading-state">
          <div className={cn('flex items-center gap-2', className.loadingContent)}>
            {/* Spinner for submitted state */}
            {status === 'submitted' && showSpinner && (
              <LoadingComponent className={className.spinner} />
            )}

            {/* Status message */}
            <span className={cn(className.message)}>
              {status === 'submitted' ? defaultMessages.submitted : defaultMessages.streaming}
            </span>
          </div>

          {/* Stop button */}
          {showStopButton && (
            <div className={cn('mt-2', className.buttons)}>
              <button
                type="button"
                onClick={() => stop()}
                className={cn(className.stopButton)}
                data-testid="stop-button"
              >
                {stopButtonText}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error state */}
      {error && showError && (
        <div className={cn(className.error)} data-testid="error-state">
          <div className={cn('mb-2 text-red-500', className.errorMessage)}>
            {defaultMessages.error}
          </div>

          {showRetryButton && (
            <div className={cn(className.buttons)}>
              <button
                type="button"
                onClick={() => chat.regenerate?.()}
                className={cn(className.retryButton)}
                data-testid="retry-button"
              >
                {retryButtonText}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Pre-configured StatusIndicator variants for common use cases
 */
export const StatusIndicatorVariants = {
  /**
   * Basic variant - matches the documentation examples exactly
   */
  Basic: (props: Omit<StatusIndicatorProps, 'showSpinner' | 'showStopButton'>) => (
    <StatusIndicator {...props} showSpinner={true} showStopButton={true} />
  ),

  /**
   * Minimal variant - no spinner, just text
   */
  Minimal: (props: StatusIndicatorProps) => (
    <StatusIndicator
      {...props}
      showSpinner={false}
      statusMessages={{
        submitted: 'Thinking...',
        streaming: 'Typing...',
        error: 'Error',
      }}
    />
  ),

  /**
   * Silent variant - only shows stop button, no status text
   */
  Silent: (props: StatusIndicatorProps) => (
    <StatusIndicator
      {...props}
      showSpinner={false}
      statusMessages={{
        submitted: '',
        streaming: '',
        error: 'Error occurred',
      }}
    />
  ),

  /**
   * Detailed variant - verbose status messages
   */
  Detailed: (props: StatusIndicatorProps) => (
    <StatusIndicator
      {...props}
      statusMessages={{
        submitted: 'Processing your message...',
        streaming: 'AI is responding...',
        error: 'An error occurred. Please try again.',
      }}
    />
  ),
};

/**
 * Hook for using status information in custom components
 */
export function useStatusInfo(chat: UseChatHelpers<UIMessage>) {
  const { status, error } = chat;

  return {
    isLoading: status === 'submitted' || status === 'streaming',
    isReady: status === 'ready',
    hasError: !!error,
    canStop: status === 'submitted' || status === 'streaming',
    canRetry: status === 'ready' && !!error,
    status,
    error,
  };
}

// Note: Tailwind's animate-spin class provides the spinner animation

// Default export for convenience
