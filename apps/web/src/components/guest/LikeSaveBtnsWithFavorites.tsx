'use client';

import { logger } from '@/lib/logger';
import { useProductFavorite } from '@/react/GuestActionsContext';
import { Skeleton, Alert, Text, Group } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import React, { useState } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';

interface LikeSaveBtnsWithFavoritesProps {
  onShare?: () => void;
  productId: string;
  productName?: string;
  loading?: boolean;
  error?: string;
  'data-testid'?: string;
}

// Loading skeleton for LikeSaveBtnsWithFavorites
function LikeSaveBtnsWithFavoritesSkeleton({ testId }: { testId?: string }) {
  return (
    <div className="flow-root" data-testid={testId}>
      <Group gap="xs">
        <Skeleton height={36} width={80} radius="md" />
        <Skeleton height={36} width={80} radius="md" />
      </Group>
    </div>
  );
}

// Error state for LikeSaveBtnsWithFavorites
function LikeSaveBtnsWithFavoritesError({
  error: _error,
  testId,
}: {
  error: string;
  testId?: string;
}) {
  return (
    <div className="flow-root" data-testid={testId}>
      <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
        <Text size="sm">Action buttons failed to load</Text>
      </Alert>
    </div>
  );
}

export function LikeSaveBtnsWithFavorites({
  onShare,
  productId,
  productName: _productName,
  loading = false,
  error,
  'data-testid': testId = 'like-save-btns-with-favorites',
}: LikeSaveBtnsWithFavoritesProps) {
  const [internalError, _setInternalError] = useState<string | null>(null);
  const { isFavorite, toggleFavorite } = useProductFavorite(productId);

  // Show loading state
  if (loading) {
    return <LikeSaveBtnsWithFavoritesSkeleton testId={testId} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <LikeSaveBtnsWithFavoritesError error={currentError} testId={testId} />;
  }

  try {
    const handleToggleFavorite = async () => {
      try {
        await toggleFavorite();
      } catch (err) {
        logger.error('Toggle favorite error', err);
        _setInternalError('Failed to toggle favorite');
      }
    };

    const handleShare = () => {
      if (onShare) {
        onShare();
      } else {
        // Default share functionality
        if (navigator.share) {
          navigator
            .share({
              title: document.title,
              url: window.location.href,
            })
            .catch((err) => logger.error('Share failed', err));
        }
      }
    };

    return (
      <ErrorBoundary
        fallback={
          <LikeSaveBtnsWithFavoritesError error="Failed to render action buttons" testId={testId} />
        }
      >
        <div className="flow-root" data-testid={testId}>
          <div className="flex text-neutral-700 dark:text-neutral-300">
            <button
              className={`relative min-w-[68px] flex items-center justify-center px-4 py-2 text-sm border rounded-s-full focus:outline-none transition-colors ${
                isFavorite
                  ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                  : 'bg-white border-neutral-200 hover:bg-neutral-50 dark:bg-neutral-800 dark:border-neutral-700 dark:hover:bg-neutral-700'
              }`}
              onClick={handleToggleFavorite}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <svg
                width="18"
                height="18"
                fill={isFavorite ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.5c0-2.485-2.016-4.5-4.516-4.5-1.604 0-3.01.831-3.816 2.084a4.516 4.516 0 00-7.637 2.878c-.056.243-.084.495-.084.754 0 .794.266 1.526.711 2.11L12 21l7.342-9.174A4.475 4.475 0 0021 8.5z"
                />
              </svg>
              <span className="ml-2.5 text-neutral-700 dark:text-neutral-300">
                {isFavorite ? 'Saved' : 'Save'}
              </span>
            </button>

            <button
              className="relative z-10 min-w-[68px] flex items-center justify-center px-4 py-2 text-sm bg-white dark:bg-neutral-800 border border-s-0 border-neutral-200 dark:border-neutral-700 rounded-e-full focus:outline-none hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
              onClick={handleShare}
              title="Share"
            >
              <svg
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 19.5l15-15m0 0l-15 0m15 0v15"
                />
              </svg>
              <span className="ml-2.5">Share</span>
            </button>
          </div>
        </div>
      </ErrorBoundary>
    );
  } catch (err) {
    logger.error('LikeSaveBtnsWithFavorites error', err);
    _setInternalError('Failed to render action buttons');
    return (
      <LikeSaveBtnsWithFavoritesError error="Failed to render action buttons" testId={testId} />
    );
  }
}
