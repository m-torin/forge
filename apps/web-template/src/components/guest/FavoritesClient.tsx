'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { FavoriteButton } from '@/components/guest/FavoriteButton';
import { ProductCard } from '@/components/ui';
import { useGuestFavorites } from '@/react/GuestActionsContext';
import { TProductItem } from '@/types';

interface FavoritesClientProps {
  allProducts: TProductItem[];
}

export function FavoritesClient({ allProducts }: FavoritesClientProps) {
  const { favorites } = useGuestFavorites();
  const [favoriteProducts, setFavoriteProducts] = useState<TProductItem[]>([]);

  useEffect(() => {
    // Filter products that are in favorites
    const favoriteIds = Array.from(favorites);
    const filtered = allProducts.filter(
      (product: any) => product.id && favoriteIds.includes(product.id),
    );
    setFavoriteProducts(filtered);
  }, [favorites, allProducts]);

  // Track page view
  useEffect(() => {
    console.log('Page Viewed', {
      category: 'wishlists',
      favoriteCount: favorites.size,
      page: 'account',
    });
  }, [favorites.size]);

  if (favoriteProducts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto max-w-md">
          <div className="mx-auto h-24 w-24 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-6">
            <svg
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="h-12 w-12 text-neutral-400 dark:text-neutral-500"
              fill="none"
            >
              <path
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
            No favorites yet
          </h3>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Start adding products to your wishlist by clicking the heart icon on any product you
            like.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/en/collections"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
            >
              Browse Products
            </Link>
            <Link
              href="/en"
              className="inline-flex items-center px-4 py-2 border border-neutral-300 dark:border-neutral-600 text-sm font-medium rounded-md text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
      {favoriteProducts.map((product: any) => (
        <div key={product.id} className="relative">
          <ProductCard data={product} isLiked={true} />
          {/* Override the built-in like button with our functional one */}
          <FavoriteButton
            productId={product.id || ''}
            productName={product.title}
            className="absolute end-3 top-3 z-20"
            price={product.price}
          />
        </div>
      ))}
    </div>
  );
}
