'use client';

/**
 * React 19 Error Boundary for Observability
 * Captures and tracks React errors with enhanced context
 */

import React, { Component, type ErrorInfo, type ReactNode } from 'react';

import { ObservabilityManager } from '../shared/types/types';

import { ErrorContext } from './use-observability';

interface ObservabilityErrorBoundaryProps extends Record<string, any> {
  children: ReactNode;
  /** Component name for error tracking */
  componentName?: string;
  fallback?: ((error: Error, errorInfo: ErrorInfo) => ReactNode) | ReactNode;
  manager?: null | ObservabilityManager;
  /** Additional metadata for error context */
  metadata?: Record<string, unknown>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ObservabilityErrorBoundaryState {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  hasError: boolean;
}

/**
 * React 19 optimized error boundary with observability integration
 */
export class ObservabilityErrorBoundary extends Component<
  ObservabilityErrorBoundaryProps,
  ObservabilityErrorBoundaryState
> {
  constructor(props: ObservabilityErrorBoundaryProps) {
    super(props);
    this.state = {
      error: null,
      errorInfo: null,
      hasError: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ObservabilityErrorBoundaryState> {
    // React 19: Update state to trigger fallback UI
    return {
      error,
      hasError: true,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // React 19: Enhanced error info capture
    this.setState({
      error,
      errorInfo,
    });

    // React 19: Use queueMicrotask for non-blocking error tracking
    queueMicrotask(() => {
      // Track error with observability manager
      this.trackError(error, errorInfo);

      // Call external error handler
      this.props.onError?.(error, errorInfo);
    });
  }

  render() {
    const { error, errorInfo, hasError } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error && errorInfo) {
      // React 19: Enhanced fallback rendering
      if (typeof fallback === 'function') {
        return fallback(error, errorInfo);
      }

      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div
          style={{
            backgroundColor: '#fff5f5',
            border: '1px solid #ff6b6b',
            borderRadius: '4px',
            color: '#c92a2a',
            padding: '20px',
          }}
        >
          <h2>Something went wrong</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            <summary>Error details</summary>
            <p>{(error as Error)?.message || 'Unknown error'}</p>
            <p>{error.stack}</p>
            <p>{errorInfo.componentStack}</p>
          </details>
        </div>
      );
    }

    return children;
  }

  private trackError = (error: Error, errorInfo: ErrorInfo) => {
    const { componentName, manager, metadata } = this.props;

    if (!manager) {
      console.warn('ObservabilityErrorBoundary: No manager provided for error tracking');
      return;
    }

    try {
      // Create enhanced error context
      const errorContext: ErrorContext = {
        component: componentName || 'ErrorBoundary',
        componentStack: errorInfo.componentStack || undefined,
        errorBoundary: componentName || 'ObservabilityErrorBoundary',
        errorInfo,
        metadata: {
          ...metadata,
          errorBoundary: true,
          reactVersion: React.version,
          timestamp: new Date().toISOString(),
        },
      };

      // React 19: Use concurrent-safe error tracking with proper async handling
      Promise.resolve().then(async () => {
        try {
          await manager.captureException(error, {
            extra: errorContext.metadata,
            tags: {
              component: errorContext.component || 'unknown',
              errorBoundary: errorContext.errorBoundary || 'unknown',
              react19: 'true',
            },
          });

          await manager.log('error', 'React Error Boundary Triggered', {
            componentStack: errorInfo.componentStack || undefined,
            error: (error as Error)?.message || 'Unknown error',
            stack: error.stack,
            ...errorContext.metadata,
          });
        } catch (error: any) {
          // Prevent infinite error loops in error tracking
          console.error('Error tracking failed in ObservabilityErrorBoundary: ', error);
        }
      });
    } catch (error: any) {
      console.error('Failed to track error in ObservabilityErrorBoundary: ', error);
    }
  };
}

/**
 * Higher-order component for wrapping components with error boundary
 * React 19 optimized
 */
export function withObservabilityErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ObservabilityErrorBoundaryProps, 'children'>,
): React.ComponentType<P> {
  return function ObservabilityErrorBoundaryWrapper(props: P) {
    return (
      <ObservabilityErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ObservabilityErrorBoundary>
    );
  };
}
