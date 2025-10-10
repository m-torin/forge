'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

export class EditorErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('EditorErrorBoundary caught an error:', error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props;

      if (Fallback) {
        if (!this.state.error) {
          return null;
        }

        return <Fallback error={this.state.error} reset={this.reset} />;
      }

      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
          <div className="mx-auto max-w-md">
            <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-red-500" />
            <h2 className="mb-2 text-2xl font-bold text-foreground">Something went wrong</h2>
            <p className="mb-6 text-muted-foreground">
              An unexpected error occurred while rendering the editor. This could be due to a
              network issue, data corruption, or a temporary glitch.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-left dark:border-red-800 dark:bg-red-900/20">
                <summary className="mb-2 cursor-pointer font-medium text-red-700 dark:text-red-300">
                  Error Details (Development)
                </summary>
                <pre className="whitespace-pre-wrap text-sm text-red-600 dark:text-red-400">
                  {this.state.error.message}
                  {this.state.error.stack && (
                    <>
                      {'\n\n'}
                      {this.state.error.stack}
                    </>
                  )}
                </pre>
              </details>
            )}

            <div className="space-y-3">
              <Button onClick={this.reset} className="w-full" size="lg">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>

              <Button asChild variant="outline" className="w-full" size="lg">
                <Link href="/editor">
                  <Home className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional error fallback for Next.js error.tsx files
export function EditorErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  const shouldDisplayDetails = process.env.NODE_ENV === 'development';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <div className="mx-auto max-w-md">
        <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-red-500" />
        <h2 className="mb-2 text-2xl font-bold text-foreground">Editor Error</h2>
        <p className="mb-6 text-muted-foreground">
          The document editor encountered an error and needs to be reloaded.
        </p>

        {shouldDisplayDetails && (
          <div className="mb-4 w-full rounded-lg border border-red-200 bg-red-50 p-4 text-left text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            <p className="font-semibold">Details</p>
            <p>{error.message}</p>
          </div>
        )}

        <div className="space-y-3">
          <Button onClick={reset} className="w-full" size="lg">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reload Editor
          </Button>

          <Button asChild variant="outline" className="w-full" size="lg">
            <Link href="/editor">
              <Home className="mr-2 h-4 w-4" />
              Return to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// Hook for functional components to use error boundaries
export function useErrorHandler() {
  return (error: Error, errorInfo?: React.ErrorInfo) => {
    console.error('Application error:', error, errorInfo);

    // In a real app, you might send this to an error reporting service
    // For now, we'll just log it
  };
}
