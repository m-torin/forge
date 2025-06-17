'use client';

import { IconShoppingCart, IconAlertTriangle } from '@tabler/icons-react';
import { Skeleton } from '@mantine/core';
import { useState } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';

interface CartBtnProps {
  'data-testid'?: string;
  numberItems?: number;
  onClick?: () => void;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for CartBtn
function CartBtnSkeleton({ testId }: { testId?: string }) {
  return (
    <div
      className="relative -m-2.5 flex cursor-pointer items-center justify-center rounded-full p-2.5"
      data-testid={testId}
    >
      <Skeleton height={24} width={24} circle />
    </div>
  );
}

// Error state for CartBtn
function CartBtnError({ error, testId }: { error: string; testId?: string }) {
  return (
    <button
      disabled
      className="relative -m-2.5 flex cursor-not-allowed items-center justify-center rounded-full p-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
      data-testid={testId}
      aria-label="Cart button error"
    >
      <IconAlertTriangle size={20} />
    </button>
  );
}

// Zero state for CartBtn
function CartBtnEmpty({ testId }: { testId?: string }) {
  return (
    <button
      disabled
      className="relative -m-2.5 flex cursor-not-allowed items-center justify-center rounded-full p-2.5 opacity-50"
      data-testid={testId}
      aria-label="Cart unavailable"
    >
      <IconShoppingCart color="currentColor" size={24} stroke={1.5} style={{ opacity: 0.3 }} />
    </button>
  );
}

export default function CartBtn({
  'data-testid': testId = 'cart-button',
  numberItems = 0,
  onClick,
  loading = false,
  error,
}: CartBtnProps) {
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <CartBtnSkeleton testId={testId} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <CartBtnError error={currentError} testId={testId} />;
  }
  return (
    <ErrorBoundary fallback={<CartBtnError error="Cart button failed to render" testId={testId} />}>
      <button
        className="relative -m-2.5 flex cursor-pointer items-center justify-center rounded-full p-2.5 hover:bg-neutral-100 focus-visible:outline-0 dark:hover:bg-neutral-800"
        data-testid={testId}
        onClick={() => {
          try {
            if (onClick) {
              onClick();
            }
          } catch (err) {
            setInternalError('Cart action failed');
          }
        }}
      >
        <ErrorBoundary fallback={<IconAlertTriangle size={20} />}>
          {numberItems > 0 && (
            <div className="absolute top-2 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-[10px] leading-none font-medium text-white dark:bg-primary-600">
              <span className="mt-px">{numberItems}</span>
            </div>
          )}
          <IconShoppingCart color="currentColor" size={24} stroke={1.5} />
        </ErrorBoundary>
      </button>
    </ErrorBoundary>
  );
}
