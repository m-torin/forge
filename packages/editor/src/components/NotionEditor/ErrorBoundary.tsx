'use client';

import { logError } from '@repo/observability';
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class NotionEditorErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError('NotionEditor Error:', { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="notion-editor-error rounded-lg border border-red-200 bg-red-50 p-4"
          data-testid="notion-editor-error"
          role="alert"
          aria-label="Editor error"
        >
          <div className="mb-2 flex items-center gap-2 text-red-800">
            <span className="text-lg">⚠️</span>
            <h3 className="font-semibold">Editor Error</h3>
          </div>
          <p className="mb-3 text-sm text-red-700">
            Something went wrong with the editor. Please try refreshing the page.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="rounded border border-red-300 bg-red-100 px-3 py-1 text-sm text-red-800 transition-colors hover:bg-red-200"
            data-testid="retry-editor-button"
          >
            Try Again
          </button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-3">
              <summary className="cursor-pointer text-xs text-red-600">
                Error Details (Development)
              </summary>
              <pre className="mt-2 overflow-auto text-xs text-red-600">
                {this.state.error.message}
                {'\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
