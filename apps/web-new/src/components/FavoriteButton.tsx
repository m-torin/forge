"use client";

import { useProductFavorite } from "@/hooks/useGuestFavorites";

import { LikeButton } from "@repo/design-system/mantine-ciseco";

interface FavoriteButtonProps {
  className?: string;
  price?: number;
  productId: string;
  productName?: string;
}

export function FavoriteButton({
  className,
  price,
  productId,
  productName,
}: FavoriteButtonProps) {
  const metadata = productName || price ? { price, productName } : undefined;
  const { isFavorite, toggleFavorite } = useProductFavorite(
    productId,
    metadata,
  );

  const handleToggleFavorite = async () => {
    await toggleFavorite();
  };

  return (
    <LikeButton
      onClick={handleToggleFavorite}
      className={className}
      liked={isFavorite}
    />
  );
}
