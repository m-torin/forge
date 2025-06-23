'use client';

import { ActionIcon, Indicator, Skeleton } from '@mantine/core';
import { IconShoppingBag, IconAlertTriangle } from '@tabler/icons-react';
import Link from 'next/link';
import { type FC, useState } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface CartButtonProps {
  'data-testid'?: string;
  locale?: string;
  numberItems?: number;
  onClick?: () => void;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for CartButton
function CartButtonSkeleton({ testId }: { testId: string }) {
  return <Skeleton height={40} width={40} radius="sm" data-testid={`${testId}-skeleton`} />;
}

// Error state for CartButton
function CartButtonError({ error, testId }: { error: string; testId: string }) {
  return (
    <ActionIcon
      aria-label="Cart error"
      className="text-red-500 border border-red-200"
      data-testid={`${testId}-error`}
      radius="sm"
      size="lg"
      variant="subtle"
      disabled
    >
      <IconAlertTriangle size={20} />
    </ActionIcon>
  );
}

const CartButton: FC<CartButtonProps> = ({
  'data-testid': testId = 'cart-button',
  locale = 'en',
  numberItems = 0,
  onClick,
  loading = false,
  error,
}) => {
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <CartButtonSkeleton testId={testId} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <CartButtonError error={currentError} testId={testId} />;
  }

  const handleClick = () => {
    try {
      if (onClick) {
        onClick();
      }
    } catch (_error) {
      console.error('Cart button click error:', _error);
      setInternalError('Failed to open cart');
    }
  };

  const button = (
    <ErrorBoundary
      fallback={<CartButtonError error="Cart button failed to render" testId={testId} />}
    >
      <Indicator
        disabled={numberItems === 0}
        inline
        label={numberItems > 99 ? '99+' : numberItems}
        size={16}
      >
        <ActionIcon
          aria-label={`Shopping cart with ${numberItems} items`}
          className="text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          data-testid={testId}
          radius="sm"
          size="lg"
          variant="subtle"
          onClick={handleClick}
        >
          <IconShoppingBag size={20} />
        </ActionIcon>
      </Indicator>
    </ErrorBoundary>
  );

  if (onClick) {
    return button;
  }

  return (
    <ErrorBoundary
      fallback={<CartButtonError error="Cart link failed to render" testId={testId} />}
    >
      <Link href={`/${locale}/cart`}>{button}</Link>
    </ErrorBoundary>
  );
};

export default CartButton;
