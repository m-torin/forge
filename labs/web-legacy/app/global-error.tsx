'use client';

import { Button } from '@mantine/core';
import { useObservability } from '@repo/observability/client/next';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const observability = useObservability();

  useEffect(() => {
    // Capture the error in Sentry with full context
    if (observability?.manager) {
      observability.captureException(error, {
        level: 'error',
        tags: {
          errorBoundary: 'global',
          component: 'GlobalError',
          source: 'client',
        },
        extra: {
          digest: error.digest,
          errorMessage: error.message,
          errorStack: error.stack,
          timestamp: new Date().toISOString(),
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
          url: typeof window !== 'undefined' ? window.location.href : undefined,
        },
        fingerprint: ['global-error', error.name, error.digest].filter((item): item is string =>
          Boolean(item),
        ),
      });

      // Also add a breadcrumb for context
      observability.manager.addBreadcrumb({
        category: 'error-boundary',
        data: {
          errorName: error.name,
          errorMessage: error.message,
          digest: error.digest,
        },
        level: 'error',
        message: 'Global error boundary triggered',
      });
    } else {
      // Fallback logging if observability is not available
      console.error('Global error (observability not available):', error);
    }
  }, [error, observability]);

  const handleTryAgain = () => {
    // Add breadcrumb for user action
    if (observability?.manager) {
      observability.manager.addBreadcrumb({
        category: 'ui',
        data: {
          action: 'retry',
          component: 'GlobalError',
        },
        level: 'info',
        message: 'User clicked "Try again" button',
      });
    }
    reset();
  };

  const handleGoHome = () => {
    // Add breadcrumb for user action
    if (observability?.manager) {
      observability.manager.addBreadcrumb({
        category: 'ui',
        data: {
          action: 'navigate-home',
          component: 'GlobalError',
        },
        level: 'info',
        message: 'User clicked "Go home" button',
      });
    }
  };

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center px-4">
          <div className="mx-auto max-w-md text-center">
            <div className="mb-8">
              <svg
                className="mx-auto h-24 w-24 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-gray-100">
              Something went wrong!
            </h1>

            <p className="mb-8 text-gray-600 dark:text-gray-400">
              An unexpected error occurred. We apologize for the inconvenience. Please try
              refreshing the page or contact support if the problem persists.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button onClick={handleTryAgain} size="lg" variant="filled">
                Try again
              </Button>

              <Button component="a" href="/" size="lg" variant="light" onClick={handleGoHome}>
                Go home
              </Button>
            </div>

            {error.digest && <p className="mt-8 text-xs text-gray-500">Error ID: {error.digest}</p>}

            {process.env.NODE_ENV === 'development' && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">
                  Development Error Details
                </summary>
                <pre className="mt-4 overflow-auto rounded bg-gray-100 p-4 text-xs text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                  {error.stack || error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
