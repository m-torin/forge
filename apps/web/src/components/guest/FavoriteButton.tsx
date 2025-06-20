'use client';

import { logger } from '@/lib/logger';
import { useProductFavorite } from '@/react/GuestActionsContext';
import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';

import { ActionIcon } from '@mantine/core';
import { IconHeart, IconHeartFilled, IconAlertTriangle } from '@tabler/icons-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface FavoriteButtonProps {
  className?: string;
  price?: number;
  productId: string;
  productName?: string;
}

export function FavoriteButton({ className, price, productId, productName }: FavoriteButtonProps) {
  const metadata = productName || price ? { price, productName } : undefined;
  const { isFavorite, toggleFavorite } = useProductFavorite(productId, metadata);
  const [isLoading, { open: startLoading, close: stopLoading }] = useDisclosure(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggleFavorite = async () => {
    if (isLoading) return;

    try {
      startLoading();
      setError(null);
      await toggleFavorite();
    } catch (error) {
      logger.error('Failed to toggle favorite', error);
      setError('Failed to update favorites');
    } finally {
      stopLoading();
    }
  };

  if (error) {
    return (
      <ActionIcon className={className} variant="subtle" size="lg" color="red" title={error}>
        <IconAlertTriangle className="h-5 w-5" />
      </ActionIcon>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <ActionIcon className={className} variant="subtle" size="lg" color="gray" disabled>
          <IconHeart className="h-5 w-5" />
        </ActionIcon>
      }
    >
      <ActionIcon
        onClick={handleToggleFavorite}
        className={className}
        variant="subtle"
        size="lg"
        color={isFavorite ? 'red' : 'gray'}
        loading={isLoading}
        disabled={isLoading}
      >
        {isFavorite ? (
          <IconHeartFilled className="h-5 w-5 text-red-500" />
        ) : (
          <IconHeart className="h-5 w-5" />
        )}
      </ActionIcon>
    </ErrorBoundary>
  );
}
