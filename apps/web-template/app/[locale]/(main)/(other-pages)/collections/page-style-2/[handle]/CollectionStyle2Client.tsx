'use client';

import { ProductCardWithFavorite } from '@/components/guest/ProductCardWithFavorite';
import { useEffect, useState } from 'react';

import { TProductItem } from '@/types';

interface CollectionStyle2ClientProps {
  isLoading?: boolean;
  products: TProductItem[];
}

export function CollectionStyle2Client({
  isLoading = false,
  products,
}: CollectionStyle2ClientProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Custom skeleton that matches the collection page layout
  const CollectionSkeleton = () => (
    <div className="grid flex-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
      {[...Array(7)].map((_, i) => (
        <div key={`collection-skeleton-${i}`} className="group relative">
          {/* Product Image */}
          <div className="aspect-[11/12] w-full rounded-3xl bg-neutral-200 dark:bg-neutral-700 animate-pulse" />

          {/* Product Info */}
          <div className="mt-4 space-y-3">
            {/* Category/Brand */}
            <div className="h-3 w-16 rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse" />

            {/* Product Title */}
            <div className="h-5 w-3/4 rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse" />

            {/* Price */}
            <div className="h-6 w-20 rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse" />

            {/* Rating Stars */}
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, j) => (
                <div
                  key={j}
                  className="h-4 w-4 rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse"
                />
              ))}
              <div className="ml-2 h-3 w-8 rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="absolute top-3 right-3">
            <div className="h-8 w-8 rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );

  // Show skeleton during SSR hydration and when loading
  if (!mounted || isLoading) {
    return <CollectionSkeleton />;
  }

  // Show empty state when no products
  if (products.length === 0) {
    return (
      <div className="flex-1 text-center py-16">
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
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
            No products found
          </h3>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            This collection is currently empty. Check back later for new products.
          </p>
          <div className="mt-6">
            <a
              href="/en/collections"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
            >
              Browse all collections
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Show products grid
  return (
    <div className="grid flex-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((item, index) => (
        <ProductCardWithFavorite
          key={item.id}
          position={index + 1}
          data={item}
          listId="collection-style-2"
        />
      ))}
    </div>
  );
}
