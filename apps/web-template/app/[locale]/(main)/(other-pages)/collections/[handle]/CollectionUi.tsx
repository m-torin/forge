'use client';

import { ProductCardWithFavorite } from '@/components/guest/ProductCardWithFavorite';
import { Skeleton, Alert, Text, Stack, Center } from '@mantine/core';
import { IconAlertTriangle, IconShoppingBag } from '@tabler/icons-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useState } from 'react';

import { TProductItem } from '@/types';

interface CollectionUiProps {
  products: TProductItem[];
  loading?: boolean;
  error?: string;
  'data-testid'?: string;
}

// Loading skeleton for CollectionUi
function CollectionUiSkeleton({ testId }: { testId?: string }) {
  return (
    <div
      className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3 xl:grid-cols-4"
      data-testid={testId}
    >
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i}>
          <Skeleton height={280} radius="md" />
          <Skeleton height={20} mt="sm" width="70%" />
          <Skeleton height={16} mt="xs" width="40%" />
        </div>
      ))}
    </div>
  );
}

// Error state for CollectionUi
function CollectionUiError({ error, testId }: { error: string; testId?: string }) {
  return (
    <Alert
      icon={<IconAlertTriangle size={16} />}
      title="Unable to load products"
      color="red"
      variant="light"
      data-testid={testId}
      className="mt-8"
    >
      <Text size="sm">{error || 'Failed to load collection products'}</Text>
    </Alert>
  );
}

// Zero state for CollectionUi
function CollectionUiEmpty({ testId }: { testId?: string }) {
  return (
    <Center py="xl" className="mt-8" data-testid={testId}>
      <Stack align="center" gap="md">
        <IconShoppingBag size={48} className="text-gray-400" />
        <Text size="lg" fw={500} c="dimmed">
          No products in this collection
        </Text>
        <Text size="sm" c="dimmed">
          Check back later for new arrivals.
        </Text>
      </Stack>
    </Center>
  );
}

export function CollectionUi({
  products,
  loading = false,
  error,
  'data-testid': testId = 'collection-ui',
}: CollectionUiProps) {
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <CollectionUiSkeleton testId={testId} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <CollectionUiError error={currentError} testId={testId} />;
  }

  // Show zero state when no products
  if (!products || products.length === 0) {
    return <CollectionUiEmpty testId={testId} />;
  }

  try {
    return (
      <ErrorBoundary
        fallback={<CollectionUiError error="Failed to render products" testId={testId} />}
      >
        <div
          className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3 xl:grid-cols-4"
          data-testid={testId}
        >
          {products?.map((product, index) => {
            try {
              return (
                <ErrorBoundary key={product.id} fallback={<Skeleton height={300} radius="md" />}>
                  <ProductCardWithFavorite
                    position={index + 1}
                    data={product}
                    listId="collection"
                  />
                </ErrorBoundary>
              );
            } catch (err) {
              console.error('Error rendering product:', err);
              setInternalError(`Failed to render product ${product.id}`);
              return <Skeleton key={product.id} height={300} radius="md" />;
            }
          })}
        </div>
      </ErrorBoundary>
    );
  } catch (err) {
    console.error('CollectionUi error:', err);
    setInternalError('Failed to render collection products');
    return <CollectionUiError error="Failed to render collection products" testId={testId} />;
  }
}
