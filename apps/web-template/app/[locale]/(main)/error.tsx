'use client';

import { Button } from '@mantine/core';
import { useEffect } from 'react';

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Main section error:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-lg text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
          <svg
            className="h-8 w-8 text-red-600 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        
        <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
          Page failed to load
        </h2>
        
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          We&apos;re having trouble loading this content. Please try again.
        </p>
        
        <Button onClick={reset} size="sm" variant="filled">
          Retry
        </Button>
      </div>
    </div>
  );
}