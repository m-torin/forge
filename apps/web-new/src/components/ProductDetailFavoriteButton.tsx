'use client';

import { FavoriteButton } from './FavoriteButton';

interface ProductDetailFavoriteButtonProps {
  productId: string;
  productName?: string;
  price?: number;
  className?: string;
}

export function ProductDetailFavoriteButton({ 
  productId, 
  productName, 
  price, 
  className 
}: ProductDetailFavoriteButtonProps) {
  return (
    <FavoriteButton
      productId={productId}
      productName={productName}
      price={price}
      className={className}
    />
  );
}