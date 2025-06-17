'use client';

import { Skeleton } from '@mantine/core';
import { IconSearch, IconAlertTriangle } from '@tabler/icons-react';
import { useState } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';

interface SearchBtnPopoverProps {
  'data-testid'?: string;
  onSearch?: (query: string) => void;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for SearchBtnPopover
function SearchBtnPopoverSkeleton({ testId }: { testId?: string }) {
  return (
    <div
      className="-m-2.5 flex cursor-pointer items-center justify-center rounded-full p-2.5"
      data-testid={testId}
    >
      <Skeleton height={24} width={24} circle />
    </div>
  );
}

// Error state for SearchBtnPopover
function SearchBtnPopoverError({ error, testId }: { error: string; testId?: string }) {
  return (
    <button
      disabled
      className="-m-2.5 flex cursor-not-allowed items-center justify-center rounded-full p-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
      data-testid={testId}
      aria-label="Search button error"
    >
      <IconAlertTriangle size={20} />
    </button>
  );
}

// Zero state for SearchBtnPopover
function SearchBtnPopoverEmpty({ testId }: { testId?: string }) {
  return (
    <button
      disabled
      className="-m-2.5 flex cursor-not-allowed items-center justify-center rounded-full p-2.5 opacity-50"
      data-testid={testId}
      aria-label="Search unavailable"
    >
      <IconSearch color="currentColor" size={24} stroke={1.5} style={{ opacity: 0.3 }} />
    </button>
  );
}

export default function SearchBtnPopover({
  'data-testid': testId = 'search-button',
  onSearch,
  loading = false,
  error,
}: SearchBtnPopoverProps) {
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <SearchBtnPopoverSkeleton testId={testId} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <SearchBtnPopoverError error={currentError} testId={testId} />;
  }
  return (
    <ErrorBoundary
      fallback={<SearchBtnPopoverError error="Search button failed to render" testId={testId} />}
    >
      <button
        className="-m-2.5 flex cursor-pointer items-center justify-center rounded-full p-2.5 hover:bg-neutral-100 focus-visible:outline-0 dark:hover:bg-neutral-800"
        data-testid={testId}
        onClick={() => {
          try {
            // For now, just a simple implementation
            if (onSearch) {
              onSearch('');
            }
          } catch (err) {
            setInternalError('Search action failed');
          }
        }}
      >
        <span className="sr-only">Search</span>
        <IconSearch color="currentColor" size={24} stroke={1.5} />
      </button>
    </ErrorBoundary>
  );
}
