'use client';

import { logger } from '@/lib/logger';
import { useProductFavorite } from '@/react/GuestActionsContext';
import { ProductCard } from '@/components/ui';
import { Alert, Skeleton, Text } from '@mantine/core';
import { IconAlertTriangle, IconShoppingBag } from '@tabler/icons-react';
import { useState } from 'react';

import { FavoriteButton } from './FavoriteButton';
import { ErrorBoundary } from '@/components/ErrorBoundary';

import type { TProductItem } from '@/types';

interface ProductCardWithFavoriteProps {
  className?: string;
  data?: TProductItem | null;
  listId?: string;
  position?: number;
  loading?: boolean;
  error?: string;
  'data-testid'?: string;
}

// Loading skeleton for ProductCardWithFavorite
function ProductCardWithFavoriteSkeleton({
  className,
  testId,
}: {
  className?: string;
  testId?: string;
}) {
  return (
    <div className={`relative ${className || ''}`} data-testid={testId}>
      <Skeleton height={280} radius="md" />
      <Skeleton height={20} mt="sm" width="70%" />
      <Skeleton height={16} mt="xs" width="40%" />
    </div>
  );
}

// Error state for ProductCardWithFavorite
function ProductCardWithFavoriteError({
  error: _error,
  className,
  testId,
}: {
  error: string;
  className?: string;
  testId?: string;
}) {
  return (
    <div className={`relative ${className || ''}`} data-testid={testId}>
      <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
        <Text size="sm">Product card failed to load</Text>
      </Alert>
    </div>
  );
}

// Empty state for ProductCardWithFavorite
function ProductCardWithFavoriteEmpty({
  className,
  testId,
}: {
  className?: string;
  testId?: string;
}) {
  return (
    <div className={`relative ${className || ''}`} data-testid={testId}>
      <div className="flex flex-col items-center justify-center h-64 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
        <IconShoppingBag size={48} className="text-neutral-400 dark:text-neutral-500 mb-2" />
        <Text size="sm" c="dimmed">
          No product data
        </Text>
      </div>
    </div>
  );
}

export function ProductCardWithFavorite({
  className,
  data,
  listId: _listId,
  position: _position,
  loading = false,
  error,
  'data-testid': testId = 'product-card-with-favorite',
}: ProductCardWithFavoriteProps) {
  const [internalError, _setInternalError] = useState<string | null>(null);
  const { isFavorite } = useProductFavorite(data?.id || '');

  // Show loading state
  if (loading) {
    return <ProductCardWithFavoriteSkeleton className={className} testId={testId} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return (
      <ProductCardWithFavoriteError error={currentError} className={className} testId={testId} />
    );
  }

  // Show zero state when no data
  if (!data) {
    return <ProductCardWithFavoriteEmpty className={className} testId={testId} />;
  }

  try {
    return (
      <ErrorBoundary
        fallback={
          <ProductCardWithFavoriteError
            error="Product card failed to render"
            className={className}
            testId={testId}
          />
        }
      >
        <div className="relative" data-testid={testId}>
          <ProductCard className={className} data={data} isLiked={isFavorite} />
          {/* Override the built-in like button with our functional one */}
          <FavoriteButton
            productId={data.id || ''}
            productName={data.title || ''}
            className="absolute end-3 top-3 z-20"
            price={data.price || 0}
          />
        </div>
      </ErrorBoundary>
    );
  } catch (err) {
    logger.error('ProductCardWithFavorite error', err);
    _setInternalError('Failed to render product card');
    return (
      <ProductCardWithFavoriteError
        error="Failed to render product card"
        className={className}
        testId={testId}
      />
    );
  }
}
