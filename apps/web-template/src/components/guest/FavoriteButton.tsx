'use client';

import { useProductFavorite } from '@/react/GuestActionsContext';

import { ActionIcon } from '@mantine/core';
import { IconHeart, IconHeartFilled } from '@tabler/icons-react';

interface FavoriteButtonProps {
  className?: string;
  price?: number;
  productId: string;
  productName?: string;
}

export function FavoriteButton({ className, price, productId, productName }: FavoriteButtonProps) {
  const metadata = productName || price ? { price, productName } : undefined;
  const { isFavorite, toggleFavorite } = useProductFavorite(productId, metadata);

  const handleToggleFavorite = async () => {
    await toggleFavorite();
  };

  return (
    <ActionIcon
      onClick={handleToggleFavorite}
      className={className}
      variant="subtle"
      size="lg"
      color={isFavorite ? 'red' : 'gray'}
    >
      {isFavorite ? (
        <IconHeartFilled className="h-5 w-5 text-red-500" />
      ) : (
        <IconHeart className="h-5 w-5" />
      )}
    </ActionIcon>
  );
}
