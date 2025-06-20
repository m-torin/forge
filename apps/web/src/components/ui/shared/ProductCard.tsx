import React, { type FC, useState } from 'react';
import Image from 'next/image';
import { Skeleton, Alert, Text } from '@mantine/core';
import { IconAlertTriangle, IconShoppingBag } from '@tabler/icons-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export interface TProductItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  [key: string]: any;
}

interface ProductCardProps {
  data: TProductItem;
  className?: string;
  loading?: boolean;
  error?: string;
  'data-testid'?: string;
}

// Loading skeleton for ProductCard
function ProductCardSkeleton({ className, testId }: { className?: string; testId?: string }) {
  return (
    <div className={`group relative ${className}`} data-testid={testId}>
      <div className="aspect-square w-full overflow-hidden rounded-lg">
        <Skeleton height="100%" />
      </div>
      <div className="mt-4 flex justify-between">
        <div className="flex-1">
          <Skeleton height={20} width="80%" />
        </div>
        <Skeleton height={20} width="30%" />
      </div>
    </div>
  );
}

// Error state for ProductCard
function ProductCardError({
  error: _error,
  className,
  testId,
}: {
  error: string;
  className?: string;
  testId?: string;
}) {
  return (
    <div className={`group relative ${className}`} data-testid={testId}>
      <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light" radius="lg">
        <Text size="sm">Failed to load product</Text>
      </Alert>
    </div>
  );
}

// Zero state for ProductCard
function ProductCardEmpty({ className, testId }: { className?: string; testId?: string }) {
  return (
    <div className={`group relative ${className}`} data-testid={testId}>
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        <div className="text-center">
          <IconShoppingBag size={48} stroke={1} color="var(--mantine-color-gray-5)" />
          <Text size="sm" c="dimmed" mt="xs">
            No product data
          </Text>
        </div>
      </div>
    </div>
  );
}

const ProductCard: FC<ProductCardProps> = ({
  data,
  className = '',
  loading = false,
  error: _error,
  'data-testid': testId = 'product-card',
}) => {
  const [internalError, _setInternalError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // Show loading state
  if (loading) {
    return <ProductCardSkeleton className={className} testId={testId} />;
  }

  // Show error state
  const currentError = _error || internalError;
  if (currentError) {
    return <ProductCardError error={currentError} className={className} testId={testId} />;
  }

  // Show empty state if no data
  if (!data) {
    return <ProductCardEmpty className={className} testId={testId} />;
  }

  return (
    <ErrorBoundary
      fallback={
        <ProductCardError
          error="Product card failed to render"
          className={className}
          testId={testId}
        />
      }
    >
      <div className={`group relative ${className}`} data-testid={testId}>
        <ErrorBoundary fallback={<Skeleton height="100%" />}>
          <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
            {data.image && !imageError ? (
              <Image
                alt={data.name}
                className="h-full w-full object-cover object-center group-hover:opacity-75"
                src={data.image}
                width={300}
                height={300}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-gray-500">No Image</span>
              </div>
            )}
          </div>
        </ErrorBoundary>
        <ErrorBoundary fallback={<Skeleton height={20} mt="sm" />}>
          <div className="mt-4 flex justify-between">
            <div>
              <h3 className="text-sm text-gray-700 dark:text-gray-300">
                <span aria-hidden="true" className="absolute inset-0" />
                {data.name}
              </h3>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">${data.price}</p>
          </div>
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
};

export default ProductCard;
