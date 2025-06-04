'use client';

import { LikeButton } from '@repo/design-system/mantine-ciseco';
import { useProductFavorite } from '@/hooks/useGuestFavorites';

interface FavoriteButtonProps {
  productId: string;
  productName?: string;
  price?: number;
  className?: string;
}

export function FavoriteButton({ productId, productName, price, className }: FavoriteButtonProps) {
  const metadata = productName || price ? { productName, price } : undefined;
  const { isFavorite, toggleFavorite } = useProductFavorite(productId, metadata);

  const handleToggleFavorite = async () => {
    await toggleFavorite();
  };

  return (
    <LikeButton 
      liked={isFavorite} 
      onClick={handleToggleFavorite}
      className={className}
    />
  );
}