import { ClockIcon, NoSymbolIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { type FC } from 'react';

import IconDiscount from './IconDiscount';

interface Props {
  animate?: boolean;
  availableDate?: string;
  className?: string;
  clickable?: boolean;
  colorScheme?: {
    background: string;
    text: string;
  };
  'data-testid'?: string;
  icon?: React.ReactNode;
  maxStock?: number;
  notification?: boolean;
  onClick?: () => void;
  restockDate?: string;
  shape?: 'pill' | 'rounded' | 'square';
  showCount?: boolean;
  showDate?: boolean;
  showIcon?: boolean;
  showProgress?: boolean;
  showRestockDate?: boolean;
  size?: 'lg' | 'md' | 'sm' | 'xs' | { base: string; lg: string; md: string; sm: string };
  status?: string;
  stockCount?: number;
  text?: string;
  tooltip?: string;
  urgent?: boolean;
  variant?: 'dot' | 'filled' | 'light' | 'outline';
  loading?: boolean;
  error?: string;
}

// Loading skeleton for ProductStatus (Tailwind-only)
function ProductStatusSkeleton({ className, testId }: { className?: string; testId?: string }) {
  return (
    <div
      className={`nc-shadow-lg rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`}
      data-testid={testId}
    >
      <div className="h-3.5 w-3.5 bg-gray-300 dark:bg-gray-600 rounded" />
      <div className="ml-1 h-3 w-12 bg-gray-300 dark:bg-gray-600 rounded" />
    </div>
  );
}

// Error state for ProductStatus (Tailwind-only)
function ProductStatusError({
  error: _error,
  className,
  testId,
}: {
  error: string;
  className?: string;
  testId?: string;
}) {
  return (
    <div
      className={`nc-shadow-lg rounded-full flex items-center justify-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 ${className}`}
      data-testid={testId}
    >
      <svg
        className="h-3.5 w-3.5 text-red-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
      <span className="ml-1 leading-none text-red-600 dark:text-red-400 text-xs">Error</span>
    </div>
  );
}

// Zero state for ProductStatus (Tailwind-only)
function ProductStatusEmpty({ className, testId }: { className?: string; testId?: string }) {
  return (
    <div
      className={`nc-shadow-lg rounded-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 ${className}`}
      data-testid={testId}
    >
      <svg
        className="h-3.5 w-3.5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
      <span className="ml-1 leading-none text-gray-400 text-xs">No status</span>
    </div>
  );
}

const ProductStatus: FC<Props> = ({
  className = 'absolute top-3 start-3 px-2.5 py-1.5 text-xs bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300',
  'data-testid': testId = 'product-status',
  status = 'New in',
  loading = false,
  error,
}) => {
  // Show loading state
  if (loading) {
    return <ProductStatusSkeleton className={className} testId={testId} />;
  }

  // Show error state
  if (error) {
    return <ProductStatusError error={error} className={className} testId={testId} />;
  }

  // Show zero state when no status
  if (!status) {
    return <ProductStatusEmpty className={className} testId={testId} />;
  }
  const renderStatus = () => {
    // This function should only be called when status exists, as we handle empty status above

    const classes = `nc-shadow-lg rounded-full flex items-center justify-center ${className}`;
    if (status === 'New in') {
      return (
        <div className={classes} data-testid={testId}>
          <SparklesIcon className="h-3.5 w-3.5" />
          <span className="ml-1 leading-none">{status}</span>
        </div>
      );
    }

    if (status === '50% Discount') {
      return (
        <div className={classes} data-testid={testId}>
          <IconDiscount className="h-3.5 w-3.5" />
          <span className="ml-1 leading-none">{status}</span>
        </div>
      );
    }

    if (status === 'Sold Out' || status === 'out-of-stock') {
      return (
        <div className={classes} data-testid={testId}>
          <NoSymbolIcon className="h-3.5 w-3.5" />
          <span className="ms-1 leading-none">Sold Out</span>
        </div>
      );
    }

    if (status === 'limited edition') {
      return (
        <div className={classes} data-testid={testId}>
          <ClockIcon className="h-3.5 w-3.5" />
          <span className="ml-1 leading-none">{status}</span>
        </div>
      );
    }

    return null;
  };

  return renderStatus();
};

export default ProductStatus;
