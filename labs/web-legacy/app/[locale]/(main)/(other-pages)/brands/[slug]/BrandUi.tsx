'use client';

import { logger } from '@/lib/logger';
import { ProductCardWithFavorite } from '@/components/guest/ProductCardWithFavorite';
import { Skeleton, Alert, Text, Stack, Center } from '@mantine/core';
import { IconAlertTriangle, IconShoppingBag } from '@tabler/icons-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useState } from 'react';

import { TProductItem } from '@/types';

interface BrandUiProps {
  products: TProductItem[];
  loading?: boolean;
  error?: string;
  'data-testid'?: string;
}

// Loading skeleton for BrandUi
function BrandUiSkeleton({ testId }: { testId?: string }) {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3" data-testid={testId}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i}>
          <Skeleton height={280} radius="md" />
          <Skeleton height={20} mt="sm" width="70%" />
          <Skeleton height={16} mt="xs" width="40%" />
        </div>
      ))}
    </div>
  );
}

// Error state for BrandUi
function BrandUiError({ error, testId }: { error: string; testId?: string }) {
  return (
    <Alert
      icon={<IconAlertTriangle size={16} />}
      title="Unable to load products"
      color="red"
      variant="light"
      data-testid={testId}
    >
      <Text size="sm">{error || 'Failed to load brand products'}</Text>
    </Alert>
  );
}

// Zero state for BrandUi
function BrandUiEmpty({ testId }: { testId?: string }) {
  return (
    <Center py="xl" data-testid={testId}>
      <Stack align="center" gap="md">
        <IconShoppingBag size={48} className="text-gray-400" />
        <Text size="lg" fw={500} c="dimmed">
          No products found
        </Text>
        <Text size="sm" c="dimmed">
          This brand doesn't have any products yet.
        </Text>
      </Stack>
    </Center>
  );
}

export function BrandUi({
  products,
  loading = false,
  error,
  'data-testid': testId = 'brand-ui',
}: BrandUiProps) {
  const [internalError, _setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <BrandUiSkeleton testId={testId} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <BrandUiError error={currentError} testId={testId} />;
  }

  // Show zero state when no products
  if (!products || products.length === 0) {
    return <BrandUiEmpty testId={testId} />;
  }

  try {
    return (
      <ErrorBoundary fallback={<BrandUiError error="Failed to render products" testId={testId} />}>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3" data-testid={testId}>
          {products.map((product: TProductItem, index) => {
            try {
              return (
                <ErrorBoundary key={product.id} fallback={<Skeleton height={300} radius="md" />}>
                  <ProductCardWithFavorite position={index + 1} data={product} listId="brand" />
                </ErrorBoundary>
              );
            } catch (err) {
              logger.error('Error rendering product', err);
              _setInternalError(`Failed to render product ${product.id}`);
              return <Skeleton key={product.id} height={300} radius="md" />;
            }
          })}
        </div>
      </ErrorBoundary>
    );
  } catch (err) {
    logger.error('BrandUi error', err);
    _setInternalError('Failed to render brand products');
    return <BrandUiError error="Failed to render brand products" testId={testId} />;
  }
}
