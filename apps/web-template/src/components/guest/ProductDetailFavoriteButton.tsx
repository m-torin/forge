'use client';

import { FavoriteButton } from './FavoriteButton';

interface ProductDetailFavoriteButtonProps {
  className?: string;
  price?: number;
  productId: string;
  productName?: string;
}

export function ProductDetailFavoriteButton({
  className,
  price,
  productId,
  productName,
}: ProductDetailFavoriteButtonProps) {
  return (
    <FavoriteButton
      productId={productId}
      productName={productName}
      className={className}
      price={price}
    />
  );
}
