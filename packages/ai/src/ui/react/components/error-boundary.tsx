/**
 * Error Boundary Components - React 19 Compatible
 * Provides error handling and fallback UI for AI Elements components
 * Enhanced with React 19's improved error recovery features
 */

'use client';

import { logError } from '@repo/observability';
import React, { Component, ErrorInfo, PropsWithChildren, ReactNode } from 'react';
import { cn } from '../../utils';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
}

export interface ErrorBoundaryProps extends PropsWithChildren {
  /** Fallback UI to render when an error occurs */
  fallback?: ReactNode;
  /** Custom error fallback component */
  FallbackComponent?: React.ComponentType<ErrorFallbackProps>;
  /** Additional props to forward to the fallback component */
  fallbackProps?: Record<string, any>;
  /** Callback when error occurs */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Reset the error boundary when these props change */
  resetKeys?: Array<string | number>;
  /** Custom error logging */
  enableLogging?: boolean;
  /** Component name for better error tracking */
  componentName?: string;
}

export interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  resetError: () => void;
  retryCount: number;
  maxRetries: number;
  componentName?: string;
}

/**
 * React 19 compatible Error Boundary with enhanced recovery
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;
  private prevResetKeys: Array<string | number> = [];

  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
    };

    this.prevResetKeys = props.resetKeys || [];
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, enableLogging = true, componentName } = this.props;

    this.setState({
      error,
      errorInfo,
    });

    // Log error if enabled
    if (enableLogging) {
      const errorDetails = {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        componentName,
        errorId: this.state.errorId,
        timestamp: new Date().toISOString(),
      };

      logError('[ErrorBoundary] Error caught', errorDetails);
    }

    // Call custom error handler
    onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys } = this.props;
    const { hasError } = this.state;

    // Reset error boundary when resetKeys change
    if (
      hasError &&
      prevProps.resetKeys !== resetKeys &&
      resetKeys &&
      resetKeys.length > 0 &&
      !this.arraysEqual(this.prevResetKeys, resetKeys)
    ) {
      this.prevResetKeys = resetKeys;
      this.resetError();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private arraysEqual = (a: Array<string | number>, b: Array<string | number>): boolean => {
    if (a.length !== b.length) return false;
    return a.every((val, index) => val === b[index]);
  };

  private resetError = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
    });
  };

  private handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount < maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }));
    }
  };

  render() {
    const { hasError, error, errorInfo, retryCount } = this.state;
    const {
      children,
      fallback,
      FallbackComponent,
      fallbackProps,
      maxRetries = 3,
      componentName,
    } = this.props;

    if (hasError && error) {
      // Use custom fallback component if provided
      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={error}
            errorInfo={errorInfo}
            resetError={this.resetError}
            retryCount={retryCount}
            maxRetries={maxRetries}
            componentName={componentName}
            {...(fallbackProps || {})}
          />
        );
      }

      // Use fallback prop if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <DefaultErrorFallback
          error={error}
          errorInfo={errorInfo}
          resetError={this.resetError}
          retryCount={retryCount}
          maxRetries={maxRetries}
          componentName={componentName}
          {...(fallbackProps || {})}
        />
      );
    }

    return children;
  }
}

/**
 * Default error fallback component with retry functionality
 */
export function DefaultErrorFallback({
  error,
  resetError,
  retryCount,
  maxRetries,
  componentName,
}: ErrorFallbackProps) {
  const canRetry = retryCount < maxRetries;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-6',
        'border-destructive/20 bg-destructive/5 rounded-lg border',
        'mx-auto max-w-md space-y-4 text-center',
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="text-destructive">
        <svg
          className="mx-auto mb-4 h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>

      <div>
        <h3 className="text-foreground mb-2 text-lg font-semibold">
          Something went wrong{componentName && ` in ${componentName}`}
        </h3>
        <p className="text-muted-foreground mb-4 text-sm">
          {error?.message || 'An unexpected error occurred'}
        </p>

        {retryCount > 0 && (
          <p className="text-muted-foreground mb-4 text-xs">
            Retry attempt: {retryCount}/{maxRetries}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        {canRetry && (
          <button
            onClick={resetError}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-medium',
              'bg-primary text-primary-foreground',
              'hover:bg-primary/90 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2',
              'transition-colors',
            )}
          >
            Try Again
          </button>
        )}

        <button
          onClick={() => window.location.reload()}
          className={cn(
            'rounded-md px-4 py-2 text-sm font-medium',
            'bg-secondary text-secondary-foreground',
            'hover:bg-secondary/80 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2',
            'transition-colors',
          )}
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}

/**
 * HOC for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>,
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps} componentName={Component.displayName || Component.name}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

/**
 * Hook for error boundary functionality in functional components
 * Note: This is a conceptual hook - actual error boundaries must be class components
 */
export function useErrorHandler() {
  return {
    captureError: (error: Error, errorInfo?: any) => {
      logError('[useErrorHandler] Error captured', { error, errorInfo });

      // In a real implementation, you might want to send to error reporting service
      if (typeof window !== 'undefined' && 'gtag' in window) {
        // Example: Send to Google Analytics
        (window as any).gtag('event', 'exception', {
          description: error.message,
          fatal: false,
        });
      }
    },

    withAsyncErrorHandling: <T extends (...args: any[]) => Promise<any>>(fn: T): T => {
      return (async (...args: any[]) => {
        try {
          return await fn(...args);
        } catch (error) {
          logError('[useErrorHandler] Async error', error as Error);
          throw error; // Re-throw to let error boundary catch it
        }
      }) as T;
    },
  };
}

/**
 * ConversationErrorBoundary - Specialized error boundary for conversation components
 */
export interface ConversationErrorBoundaryProps extends Omit<ErrorBoundaryProps, 'componentName'> {
  /** Conversation ID for error tracking */
  conversationId?: string;
  /** Custom message for conversation errors */
  errorMessage?: string;
}

function ConversationErrorFallback({
  error,
  resetError,
  retryCount,
  maxRetries,
}: ErrorFallbackProps & { conversationId?: string; errorMessage?: string }) {
  const canRetry = retryCount < maxRetries;

  return (
    <div className="bg-background border-border flex min-h-[400px] flex-col items-center justify-center rounded-lg border p-8 text-center">
      <div className="mb-4">
        <svg
          className="text-destructive mx-auto mb-4 h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>

      <h3 className="text-foreground mb-2 text-lg font-semibold">Conversation Unavailable</h3>

      <p className="text-muted-foreground mb-4 max-w-md">
        We're having trouble loading the conversation. This might be due to a network issue or a
        temporary problem with the chat system.
      </p>

      <div className="text-muted-foreground bg-muted mb-4 max-w-md overflow-auto rounded p-2 font-mono text-xs">
        {error?.message || 'Unknown conversation error'}
      </div>

      <div className="flex gap-2">
        {canRetry && (
          <button
            onClick={resetError}
            className={cn(
              'inline-flex items-center justify-center rounded-md text-sm font-medium',
              'ring-offset-background transition-colors focus-visible:outline-none',
              'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2',
              'disabled:pointer-events-none disabled:opacity-50',
              'bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2',
            )}
          >
            Retry Conversation {retryCount > 0 && `(${retryCount}/${maxRetries})`}
          </button>
        )}

        <button
          onClick={() => window.location.reload()}
          className={cn(
            'inline-flex items-center justify-center rounded-md text-sm font-medium',
            'ring-offset-background transition-colors focus-visible:outline-none',
            'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2',
            'disabled:pointer-events-none disabled:opacity-50',
            'border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 border px-4 py-2',
          )}
        >
          Reload Chat
        </button>
      </div>

      {!canRetry && (
        <p className="text-muted-foreground mt-2 text-xs">
          Maximum retry attempts reached. Please refresh to restart the conversation.
        </p>
      )}
    </div>
  );
}

/**
 * Specialized error boundary for conversation components with conversation-specific error handling
 */
export function ConversationErrorBoundary({
  children,
  conversationId,
  errorMessage,
  maxRetries = 3,
  ...props
}: ConversationErrorBoundaryProps) {
  const {
    fallbackProps: providedFallbackProps,
    FallbackComponent: providedFallbackComponent,
    ...restProps
  } = props;

  const resolvedFallbackComponent = providedFallbackComponent ?? ConversationErrorFallback;
  const resolvedFallbackProps = providedFallbackComponent
    ? providedFallbackProps
    : {
        conversationId,
        errorMessage,
        ...(providedFallbackProps || {}),
      };
  return (
    <ErrorBoundary
      {...restProps}
      componentName={`Conversation${conversationId ? `:${conversationId}` : ''}`}
      maxRetries={maxRetries}
      FallbackComponent={resolvedFallbackComponent}
      fallbackProps={resolvedFallbackProps}
      onError={(error, errorInfo) => {
        // Enhanced conversation-specific error logging
        logError('[ConversationErrorBoundary] Conversation error', {
          conversationId,
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          userAgent: typeof window !== 'undefined' ? window.navigator?.userAgent : 'unknown',
        });

        // Call parent error handler
        props.onError?.(error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

// Types are already exported inline above
