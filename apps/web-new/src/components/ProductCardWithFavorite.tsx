'use client';

import { ProductCard, type TProductItem } from '@repo/design-system/mantine-ciseco';
import { FavoriteButton } from './FavoriteButton';

interface ProductCardWithFavoriteProps {
  data: TProductItem;
  className?: string;
  listId?: string;
  position?: number;
}

export function ProductCardWithFavorite({ 
  data, 
  className,
  listId,
  position 
}: ProductCardWithFavoriteProps) {
  return (
    <div className="relative">
      <ProductCard
        data={data}
        className={className}
        isLiked={false} // We'll control this with our own button
        listId={listId}
        position={position}
      />
      {/* Override the built-in like button with our functional one */}
      <FavoriteButton
        productId={data.id}
        productName={data.title}
        price={data.price}
        className="absolute end-3 top-3 z-20"
      />
    </div>
  );
}