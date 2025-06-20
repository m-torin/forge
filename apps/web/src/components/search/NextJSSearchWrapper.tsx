'use client';

import { InstantSearchNext } from 'react-instantsearch-nextjs';
import { getSearchClient, getIndexName } from '@/lib/algolia';
import { Skeleton, Alert, Text } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { logger } from '@/lib/logger';

interface NextJSSearchWrapperProps {
  children: React.ReactNode;
  loading?: boolean;
  error?: string;
  'data-testid'?: string;
}

// Loading skeleton for NextJSSearchWrapper
function NextJSSearchWrapperSkeleton({ testId }: { testId?: string }) {
  return (
    <div data-testid={testId}>
      <Skeleton height={48} mb="md" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} height={200} radius="md" />
        ))}
      </div>
    </div>
  );
}

// Error state for NextJSSearchWrapper
function NextJSSearchWrapperError({ error, testId }: { error: string; testId?: string }) {
  return (
    <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light" data-testid={testId}>
      <Text size="sm">Search functionality is currently unavailable</Text>
    </Alert>
  );
}

export function NextJSSearchWrapper({
  children,
  loading = false,
  error,
  'data-testid': testId = 'nextjs-search-wrapper',
}: NextJSSearchWrapperProps) {
  const [internalError, setInternalError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [searchClient, setSearchClient] = useState<any>(null);
  const [indexName, setIndexName] = useState<string | null>(null);

  useEffect(() => {
    try {
      const client = getSearchClient();
      const index = getIndexName();
      setSearchClient(client);
      setIndexName(index);
      setIsInitialized(true);
    } catch (err) {
      logger.error('Search initialization error', err);
      setInternalError('Failed to initialize search');
    }
  }, []);

  // Show loading state
  if (loading) {
    return <NextJSSearchWrapperSkeleton testId={testId} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <NextJSSearchWrapperError error={currentError} testId={testId} />;
  }

  try {
    if (!isInitialized || !searchClient || !indexName) {
      return <NextJSSearchWrapperSkeleton testId={testId} />;
    }

    return (
      <ErrorBoundary
        fallback={<NextJSSearchWrapperError error="Search failed to render" testId={testId} />}
      >
        <div data-testid={testId}>
          <InstantSearchNext
            searchClient={searchClient}
            indexName={indexName}
            future={{
              preserveSharedStateOnUnmount: true,
            }}
          >
            {children}
          </InstantSearchNext>
        </div>
      </ErrorBoundary>
    );
  } catch (err) {
    logger.error('NextJSSearchWrapper error', err);
    setInternalError('Failed to initialize search client');
    return <NextJSSearchWrapperError error="Failed to initialize search" testId={testId} />;
  }
}
