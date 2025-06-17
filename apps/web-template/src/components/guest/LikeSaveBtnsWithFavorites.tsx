'use client';

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
function LikeSaveBtnsWithFavoritesError({ error, testId }: { error: string; testId?: string }) {
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
  const [internalError, setInternalError] = useState<string | null>(null);

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
    const { isFavorite, toggleFavorite } = useProductFavorite(productId);

    const handleToggleFavorite = async () => {
      try {
        await toggleFavorite();
      } catch (err) {
        console.error('Toggle favorite error:', err);
        setInternalError('Failed to toggle favorite');
      }
    };

    const handleShare = () => {
      try {
        if (onShare) {
          onShare();
        }
      } catch (err) {
        console.error('Share error:', err);
        setInternalError('Failed to share');
      }
    };

    return (
      <ErrorBoundary
        fallback={
          <LikeSaveBtnsWithFavoritesError error="Buttons failed to render" testId={testId} />
        }
      >
        <div className="flow-root" data-testid={testId}>
          <div className="flex text-neutral-700 dark:text-neutral-300 text-sm -mx-3 -my-1.5">
            <button
              onClick={handleShare}
              className="py-1.5 px-3 flex rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            >
              <svg
                stroke="currentColor"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              <span className="hidden sm:block ml-2">Share</span>
            </button>
            <button
              onClick={handleToggleFavorite}
              className={`py-1.5 px-3 flex rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer `}
            >
              <svg
                stroke="currentColor"
                viewBox="0 0 24 24"
                className={`h-5 w-5 ${isFavorite ? 'text-red-500' : ''}`}
                fill={isFavorite ? 'currentColor' : 'none'}
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span className="hidden sm:block ml-2">{isFavorite ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </ErrorBoundary>
    );
  } catch (err) {
    console.error('LikeSaveBtnsWithFavorites error:', err);
    setInternalError('Failed to render buttons');
    return <LikeSaveBtnsWithFavoritesError error="Failed to render buttons" testId={testId} />;
  }
}
