'use client';

import { LikeButton } from '@repo/design-system/mantine-ciseco';
import { useProductFavorite } from '@/hooks/useFavorites';
import { analytics } from '@/lib/analytics-setup';

interface FavoriteButtonProps {
  productId: string;
  productName?: string;
  price?: number;
  className?: string;
}

export function FavoriteButton({ productId, productName, price, className }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useProductFavorite(productId);

  const handleToggleFavorite = () => {
    // Toggle the favorite state
    toggleFavorite();
    
    // Track with analytics using the track emitter
    if (!isFavorite) {
      // Adding to favorites
      analytics.track('Product Added to Wishlist', {
        productId,
        productName,
        price,
      }).catch(() => {});
    } else {
      // Removing from favorites
      analytics.track('Product Removed from Wishlist', {
        productId,
        productName,
      }).catch(() => {});
    }
  };

  return (
    <LikeButton 
      liked={isFavorite} 
      onClick={handleToggleFavorite}
      className={className}
    />
  );
}