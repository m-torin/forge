'use client';

import * as Sentry from '@sentry/nextjs';
import React, { Component, ReactNode } from 'react';

/**
 * Error boundary component with Sentry integration
 * Can be used to wrap any part of your application
 */
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDialog?: boolean;
  dialogOptions?: Sentry.ReportDialogOptions;
  beforeCapture?: (scope: Sentry.Scope, error: Error) => void;
  level?: Sentry.SeverityLevel;
  errorTag?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  eventId: string | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { onError, beforeCapture, level = 'error', errorTag = 'ErrorBoundary' } = this.props;

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // Capture with Sentry
    const eventId = Sentry.withScope(scope => {
      // Set error level
      scope.setLevel(level);

      // Set error tag
      scope.setTag('component', errorTag);

      // Add error boundary context
      scope.setContext('errorBoundary', {
        componentStack: errorInfo.componentStack,
      });

      // Allow custom scope configuration
      if (beforeCapture) {
        beforeCapture(scope, error);
      }

      // Capture the exception
      return Sentry.captureException(error);
    });

    // Update state with event ID
    this.setState({ eventId });

    // Show Sentry user feedback dialog if enabled
    if (this.props.showDialog && eventId) {
      Sentry.showReportDialog({
        eventId,
        ...this.props.dialogOptions,
      });
    }
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null,
      eventId: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      // Default fallback UI
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            padding: '20px',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Something went wrong</h1>
          <p style={{ marginBottom: '24px', color: '#666' }}>
            An error occurred while rendering this component.
          </p>
          <button
            onClick={this.reset}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
          {this.state.eventId && (
            <p style={{ marginTop: '16px', fontSize: '12px', color: '#999' }}>
              Error ID: {this.state.eventId}
            </p>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
