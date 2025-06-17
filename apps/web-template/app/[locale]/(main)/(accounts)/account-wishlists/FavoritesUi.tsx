'use client';

import { FavoriteButton } from '@/components/guest/FavoriteButton';
import { useGuestFavorites } from '@/react/GuestActionsContext';
import { useEffect, useState } from 'react';
import { Text, Alert, Skeleton } from '@mantine/core';
import { IconAlertTriangle, IconHeart, IconShoppingBag } from '@tabler/icons-react';

import { ProductCard } from '@/components/ui';
import { TProductItem } from '@/types';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Link from 'next/link';

interface FavoritesUiProps {
  allProducts: TProductItem[];
  loading?: boolean;
  error?: string;
  'data-testid'?: string;
}

// Loading skeleton for FavoritesUi
function FavoritesUiSkeleton({ testId }: { testId?: string }) {
  return (
    <div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3"
      data-testid={testId}
    >
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

// Error state for FavoritesUi
function FavoritesUiError({ error, testId }: { error: string; testId?: string }) {
  return (
    <Alert
      icon={<IconAlertTriangle size={16} />}
      title="Unable to load favorites"
      color="red"
      variant="light"
      data-testid={testId}
    >
      <Text size="sm">{error || 'Failed to load your favorite products'}</Text>
    </Alert>
  );
}

// Zero state for FavoritesUi
function FavoritesUiEmpty({ testId, locale = 'en' }: { testId?: string; locale?: string }) {
  return (
    <div className="text-center py-16" data-testid={testId}>
      <div className="mx-auto max-w-md">
        <div className="mx-auto h-24 w-24 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-6">
          <IconHeart size={48} className="text-neutral-400 dark:text-neutral-500" />
        </div>
        <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
          No favorites yet
        </h3>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Start adding products to your wishlist by clicking the heart icon on any product you like.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/${locale}/collections`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
          >
            <IconShoppingBag size={16} className="mr-2" />
            Browse Products
          </Link>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center px-4 py-2 border border-neutral-300 dark:border-neutral-600 text-sm font-medium rounded-md text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export function FavoritesUi({
  allProducts,
  loading = false,
  error,
  'data-testid': testId = 'favorites-ui',
}: FavoritesUiProps) {
  const [internalError, setInternalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Show loading state
  if (loading) {
    return <FavoritesUiSkeleton testId={testId} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <FavoritesUiError error={currentError} testId={testId} />;
  }

  try {
    const { favorites } = useGuestFavorites();
    const [favoriteProducts, setFavoriteProducts] = useState<TProductItem[]>([]);

    useEffect(() => {
      try {
        setIsLoading(true);
        setInternalError(null);

        // Filter products that are in favorites
        const favoriteIds = Array.from(favorites);
        const filtered = allProducts.filter(
          (product: any) => product.id && favoriteIds.includes(product.id),
        );
        setFavoriteProducts(filtered);
      } catch (err) {
        console.error('Error filtering favorites:', err);
        setInternalError('Failed to load favorites');
      } finally {
        setIsLoading(false);
      }
    }, [favorites, allProducts]);

    // Track page view
    useEffect(() => {
      try {
        console.log('Page Viewed', {
          category: 'wishlists',
          favoriteCount: favorites.size,
          page: 'account',
        });
      } catch (err) {
        console.error('Analytics error:', err);
      }
    }, [favorites.size]);

    // Show loading while processing
    if (isLoading) {
      return <FavoritesUiSkeleton testId={testId} />;
    }

    // Show zero state when no favorites
    if (favoriteProducts.length === 0) {
      // Extract locale from the URL or use default
      const locale = window.location.pathname.split('/')[1] || 'en';
      return <FavoritesUiEmpty testId={testId} locale={locale} />;
    }

    return (
      <ErrorBoundary
        fallback={<FavoritesUiError error="Failed to render favorites" testId={testId} />}
      >
        <div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3"
          data-testid={testId}
        >
          {favoriteProducts.map((product: any) => {
            try {
              return (
                <ErrorBoundary key={product.id} fallback={<Skeleton height={300} radius="md" />}>
                  <div className="relative">
                    <ProductCard data={product} isLiked={true} />
                    {/* Override the built-in like button with our functional one */}
                    <FavoriteButton
                      productId={product.id || ''}
                      productName={product.title}
                      className="absolute end-3 top-3 z-20"
                      price={product.price}
                    />
                  </div>
                </ErrorBoundary>
              );
            } catch (err) {
              console.error('Error rendering product:', err);
              return <Skeleton key={product.id} height={300} radius="md" />;
            }
          })}
        </div>
      </ErrorBoundary>
    );
  } catch (err) {
    console.error('FavoritesUi error:', err);
    setInternalError('Failed to load favorites');
    return <FavoritesUiError error="Failed to load favorites" testId={testId} />;
  }
}
