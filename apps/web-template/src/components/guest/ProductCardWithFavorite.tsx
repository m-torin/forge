'use client';

import { useProductFavorite } from '@/react/GuestActionsContext';

import { ProductCard } from '@/components/ui';
import { TProductItem } from '@/types';

import { FavoriteButton } from './FavoriteButton';

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
  if (!data) {
    return null;
  }

  const { isFavorite } = useProductFavorite(data.id || '');

  return (
    <div className="relative">
      <ProductCard className={className} data={data} isLiked={isFavorite} />
      {/* Override the built-in like button with our functional one */}
      <FavoriteButton
        productId={data.id || ''}
        productName={data.title || ''}
        className="absolute end-3 top-3 z-20"
        price={data.price || 0}
      />
    </div>
  );
}
