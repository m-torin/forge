"use client";

import { FavoriteButton } from "@/components/FavoriteButton";
import { useProductFavorite } from "@/hooks/useGuestFavorites";

import { ProductCard } from "@repo/design-system/mantine-ciseco";

import type { TProductItem } from "@repo/design-system/mantine-ciseco";

interface UniversalProductCardProps {
  className?: string;
  data: TProductItem;
  listId?: string;
  position?: number;
}

/**
 * Product Card using the Universal Component Registry
 * This demonstrates how to use the registry while maintaining
 * the existing GuestActionsContext for favorites
 */
export function UniversalProductCard({
  className,
  data,
  listId: _listId,
  position: _position,
}: UniversalProductCardProps) {
  if (!data) {
    return null;
  }

  const { isFavorite } = useProductFavorite(data.id || "");

  return (
    <div className="relative">
      {/* Using ProductCard directly */}
      <ProductCard className={className} data={data} isLiked={isFavorite} />

      {/* Using FavoriteButton */}
      <FavoriteButton
        productId={data.id || ""}
        productName={data.title || ""}
        className="absolute end-3 top-3 z-20"
        price={data.price || 0}
      />
    </div>
  );
}

/**
 * Alternative using typed components
 */
export function UniversalProductCardTyped({
  className,
  data,
  listId: _listId,
  position: _position,
}: UniversalProductCardProps) {
  if (!data) {
    return null;
  }

  const { isFavorite, toggleFavorite } = useProductFavorite(data.id || "", {
    price: data.price || 0,
    productName: data.title || "",
  });

  const handleLikeClick = async () => {
    await toggleFavorite();
  };

  return (
    <div className="relative">
      <ProductCard
        onLike={handleLikeClick}
        className={className}
        data={data}
        isLiked={isFavorite}
      />
    </div>
  );
}
