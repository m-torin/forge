import { type FC, Suspense } from 'react';

import type { TProductItem as Product } from '@/types';
import ProductCard from '@/components/ui/ProductCard';

export interface SectionGridFeatureItemsProps {
  data: Product[];
  heading?: string;
  showMoreHref?: string;
  showMoreText?: string;
  className?: string;
}

// Loading skeleton for product grid (Tailwind-only)
function ProductGridSkeleton() {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-4/5" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/5" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/5" />
        </div>
      ))}
    </div>
  );
}

// Zero state for no products (Tailwind-only)
function NoProductsState({ showMoreHref }: { showMoreHref: string }) {
  return (
    <div className="py-16 flex justify-center">
      <div className="text-center max-w-md space-y-4">
        <div className="w-12 h-12 mx-auto mb-4 text-gray-400 flex items-center justify-center">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">
          No products available
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          We don't have any products to show right now. Check back later!
        </p>
        <a
          href={showMoreHref}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Browse All Products
        </a>
      </div>
    </div>
  );
}

const SectionGridFeatureItems: FC<SectionGridFeatureItemsProps> = ({
  data,
  heading = 'Find your favorite products',
  showMoreHref = '/products',
  showMoreText = 'Show me more',
  className = '',
}) => {
  // Zero state
  if (!data || data.length === 0) {
    return (
      <div className={`nc-SectionGridFeatureItems relative ${className}`}>
        <div className="container mx-auto px-4 mb-12 lg:mb-14">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-neutral-900 lg:text-4xl dark:text-neutral-50">
              {heading}
            </h2>
          </div>
        </div>
        <div className="container mx-auto px-4">
          <NoProductsState showMoreHref={showMoreHref} />
        </div>
      </div>
    );
  }

  return (
    <div className={`nc-SectionGridFeatureItems relative ${className}`}>
      {/* Header */}
      <div className="container mx-auto px-4 mb-12 lg:mb-14">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-neutral-900 lg:text-4xl dark:text-neutral-50">
            {heading}
          </h2>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4">
        <Suspense fallback={<ProductGridSkeleton />}>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </Suspense>

        {/* Show More Button */}
        <div className="mt-16 flex items-center justify-center">
          <a
            href={showMoreHref}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors gap-2"
          >
            {showMoreText}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default SectionGridFeatureItems;
