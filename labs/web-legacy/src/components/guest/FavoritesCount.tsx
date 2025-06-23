'use client';

import { logger } from '@/lib/logger';
import { useGuestFavorites } from '@/react/GuestActionsContext';
import { IconHeart, IconHeartFilled, IconAlertTriangle } from '@tabler/icons-react';
import { Skeleton } from '@mantine/core';
import Link from 'next/link';
import { useState } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';

interface FavoritesCountProps {
  locale: string;
  loading?: boolean;
  error?: string;
  'data-testid'?: string;
}

// Loading skeleton for FavoritesCount
function FavoritesCountSkeleton({ testId }: { testId?: string }) {
  return (
    <div className="relative p-2" data-testid={testId}>
      <Skeleton height={24} width={24} radius="sm" />
    </div>
  );
}

// Error state for FavoritesCount
function FavoritesCountError({ error: _error, testId }: { error: string; testId?: string }) {
  return (
    <div className="relative p-2" data-testid={testId}>
      <IconAlertTriangle className="w-6 h-6 text-red-500" />
    </div>
  );
}

export function FavoritesCount({
  locale,
  loading = false,
  error,
  'data-testid': testId = 'favorites-count',
}: FavoritesCountProps) {
  const [internalError, _setInternalError] = useState<string | null>(null);
  const { favoriteCount } = useGuestFavorites();

  // Show loading state
  if (loading) {
    return <FavoritesCountSkeleton testId={testId} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <FavoritesCountError error={currentError} testId={testId} />;
  }

  try {
    return (
      <ErrorBoundary
        fallback={<FavoritesCountError error="Favorites count failed to render" testId={testId} />}
      >
        <Link
          href={`/${locale}/account-wishlists`}
          className="relative p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
          aria-label={`Favorites (${favoriteCount})`}
          data-testid={testId}
        >
          {favoriteCount > 0 ? (
            <IconHeartFilled className="w-6 h-6 text-red-500" />
          ) : (
            <IconHeart className="w-6 h-6" />
          )}
          {favoriteCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-primary-500 text-white text-xs font-medium">
              {favoriteCount > 9 ? '9+' : favoriteCount}
            </span>
          )}
        </Link>
      </ErrorBoundary>
    );
  } catch (err) {
    logger.error('FavoritesCount error', err);
    _setInternalError('Failed to load favorites count');
    return <FavoritesCountError error="Failed to load favorites count" testId={testId} />;
  }
}
