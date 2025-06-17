'use client';

import { Button } from '@mantine/core';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Route error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center px-4 py-16">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-8">
          <svg
            className="mx-auto h-20 w-20 text-orange-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Oops! Something went wrong
        </h2>

        <p className="mb-8 text-gray-600 dark:text-gray-400">
          We encountered an error while loading this page. Don&apos;t worry, you can try again or go
          back to the homepage.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button onClick={reset} size="md" variant="filled">
            Try again
          </Button>

          <Button component="a" href="/" size="md" variant="light">
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}
