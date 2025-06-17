'use client';

import { Button } from '@mantine/core';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

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
              <Button onClick={reset} size="lg" variant="filled">
                Try again
              </Button>

              <Button component="a" href="/" size="lg" variant="light">
                Go home
              </Button>
            </div>

            {error.digest && <p className="mt-8 text-xs text-gray-500">Error ID: {error.digest}</p>}
          </div>
        </div>
      </body>
    </html>
  );
}
