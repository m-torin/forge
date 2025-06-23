'use client';

import { FavoriteButton } from './FavoriteButton';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Skeleton } from '@mantine/core';

interface ProductDetailFavoriteButtonProps {
  className?: string;
  price?: number;
  productId: string;
  productName?: string;
  loading?: boolean;
  error?: string;
}

export function ProductDetailFavoriteButton({
  className,
  price,
  productId,
  productName,
  loading = false,
  error,
}: ProductDetailFavoriteButtonProps) {
  if (loading) {
    return <Skeleton height={40} width={40} radius="xl" className={className} />;
  }

  if (error) {
    return (
      <div className={className}>
        <span className="text-red-500 text-sm">{error}</span>
      </div>
    );
  }

  return (
    <ErrorBoundary fallback={<Skeleton height={40} width={40} radius="xl" className={className} />}>
      <FavoriteButton
        productId={productId}
        productName={productName}
        className={className}
        price={price}
      />
    </ErrorBoundary>
  );
}
