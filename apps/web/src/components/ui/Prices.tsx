import clsx from 'clsx';
import type { FC } from 'react';

export interface PricesProps {
  className?: string;
  contentClass?: string;
  price: number;
  compareAtPrice?: number;
  'data-testid'?: string;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for Prices (Tailwind-only)
function PricesSkeleton({
  className,
  contentClass,
  testId,
}: {
  className?: string;
  contentClass?: string;
  testId?: string;
}) {
  return (
    <div className={clsx('flex items-center gap-2', className)} data-testid={testId}>
      <div
        className={`flex items-center rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-700 animate-pulse ${contentClass}`}
      >
        <div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded" />
      </div>
      <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
    </div>
  );
}

// Error state for Prices (Tailwind-only)
function PricesError({
  error: _error,
  className,
  contentClass,
  testId,
}: {
  error: string;
  className?: string;
  contentClass?: string;
  testId?: string;
}) {
  return (
    <div className={clsx('flex items-center gap-2', className)} data-testid={testId}>
      <div
        className={`flex items-center rounded-lg border-2 border-red-500 bg-red-50 dark:bg-red-900/20 ${contentClass}`}
      >
        <span className="!leading-none text-red-600 dark:text-red-400 flex items-center">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          Error
        </span>
      </div>
    </div>
  );
}

// Zero state for Prices (Tailwind-only)
function PricesEmpty({
  className,
  contentClass,
  testId,
}: {
  className?: string;
  contentClass?: string;
  testId?: string;
}) {
  return (
    <div className={clsx('flex items-center gap-2', className)} data-testid={testId}>
      <div
        className={`flex items-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 ${contentClass}`}
      >
        <span className="!leading-none text-gray-400 dark:text-gray-500">No price</span>
      </div>
    </div>
  );
}

const Prices: FC<PricesProps> = ({
  className,
  contentClass = 'py-1 px-2 md:py-1.5 md:px-2.5 text-sm font-medium',
  price,
  compareAtPrice,
  'data-testid': testId = 'prices',
  loading = false,
  error,
}) => {
  // Show loading state
  if (loading) {
    return <PricesSkeleton className={className} contentClass={contentClass} testId={testId} />;
  }

  // Show error state
  if (error) {
    return (
      <PricesError
        error={error}
        className={className}
        contentClass={contentClass}
        testId={testId}
      />
    );
  }

  // Show zero state when no price (price could be 0, so check for null/undefined)
  if (price === null || price === undefined || isNaN(price)) {
    return <PricesEmpty className={className} contentClass={contentClass} testId={testId} />;
  }
  const hasDiscount = compareAtPrice && compareAtPrice > price;

  return (
    <div className={clsx('flex items-center gap-2', className)} data-testid={testId}>
      <div className={`flex items-center rounded-lg border-2 border-green-500 ${contentClass}`}>
        <span className="!leading-none text-green-500">${price.toFixed(2)}</span>
      </div>
      {hasDiscount && (
        <span className="text-sm text-neutral-500 line-through dark:text-neutral-400">
          ${compareAtPrice.toFixed(2)}
        </span>
      )}
    </div>
  );
};

export default Prices;
