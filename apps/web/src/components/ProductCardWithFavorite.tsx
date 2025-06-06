"use client";

import { useProductFavorite } from "@/hooks/useGuestFavorites";

import {
  ProductCard,
  type TProductItem,
} from "@repo/design-system/mantine-ciseco";

import { FavoriteButton } from "./FavoriteButton";

interface ProductCardWithFavoriteProps {
  className?: string;
  data: TProductItem;
  listId?: string;
  position?: number;
}

export function ProductCardWithFavorite({
  className,
  data,
  listId: _listId,
  position: _position,
}: ProductCardWithFavoriteProps) {
  const { isFavorite } = useProductFavorite(data.id || "");

  return (
    <div className="relative">
      <ProductCard className={className} data={data} isLiked={isFavorite} />
      {/* Override the built-in like button with our functional one */}
      <FavoriteButton
        productId={data.id || ""}
        productName={data.title}
        className="absolute end-3 top-3 z-20"
        price={data.price}
      />
    </div>
  );
}
