'use client';

import { useProductFavorite } from '@/react/GuestActionsContext';
import { Skeleton, Alert, Text } from '@mantine/core';
import { IconAlertTriangle, IconShoppingBag } from '@tabler/icons-react';
import { useState } from 'react';

import { ProductCard } from '@/components/ui';
import { TProductItem } from '@/types';
import { ErrorBoundary } from '@/components/ErrorBoundary';

import { FavoriteButton } from './FavoriteButton';

interface ProductCardWithFavoriteProps {
  className?: string;
  data: TProductItem;
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
    <div className={`relative ${className}`} data-testid={testId}>
      <div className="rounded-2xl overflow-hidden">
        <Skeleton height={280} radius="md" />
        <div className="p-4">
          <Skeleton height={20} width="70%" mb="sm" />
          <Skeleton height={16} width="40%" mb="md" />
          <Skeleton height={24} width="30%" />
        </div>
      </div>
      <Skeleton height={32} width={32} radius="xl" className="absolute end-3 top-3" />
    </div>
  );
}

// Error state for ProductCardWithFavorite
function ProductCardWithFavoriteError({
  error,
  className,
  testId,
}: {
  error: string;
  className?: string;
  testId?: string;
}) {
  return (
    <div className={`relative ${className}`} data-testid={testId}>
      <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
        <Text size="sm">Failed to load product</Text>
      </Alert>
    </div>
  );
}

// Zero state for ProductCardWithFavorite
function ProductCardWithFavoriteEmpty({
  className,
  testId,
}: {
  className?: string;
  testId?: string;
}) {
  return (
    <div className={`relative ${className}`} data-testid={testId}>
      <div className="rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-8 text-center">
        <IconShoppingBag size={48} className="mx-auto mb-4 text-gray-400" />
        <Text size="sm" c="dimmed">
          No product data available
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
  const [internalError, setInternalError] = useState<string | null>(null);

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
    const { isFavorite } = useProductFavorite(data.id || '');

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
    console.error('ProductCardWithFavorite error:', err);
    setInternalError('Failed to render product card');
    return (
      <ProductCardWithFavoriteError
        error="Failed to render product card"
        className={className}
        testId={testId}
      />
    );
  }
}
