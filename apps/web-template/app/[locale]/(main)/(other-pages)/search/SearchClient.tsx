'use client';

import { ProductCardWithFavorite } from '@/components/guest/ProductCardWithFavorite';

import { TProductItem } from '@/types';

interface SearchClientProps {
  products: TProductItem[];
}

export function SearchClient({ products }: SearchClientProps) {
  // Zero state when no search results
  if (products.length === 0) {
    return (
      <div className="mt-8 text-center py-16">
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
            No products found
          </h3>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Try adjusting your search terms or browse our collections to discover products.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/en/collections"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
            >
              Browse Collections
            </a>
            <a
              href="/en"
              className="inline-flex items-center px-4 py-2 border border-neutral-300 dark:border-neutral-600 text-sm font-medium rounded-md text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((item, index) => (
        <ProductCardWithFavorite key={item.id} position={index + 1} data={item} listId="search" />
      ))}
    </div>
  );
}
