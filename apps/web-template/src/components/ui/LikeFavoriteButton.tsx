'use client';

import { Skeleton, ActionIcon } from '@mantine/core';
import { IconAlertTriangle, IconHeart } from '@tabler/icons-react';
import { useState } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import LikeButton from './LikeButton';

interface LikeFavoriteButtonProps {
  className?: string;
  productId: string;
  size?: 'sm' | 'md' | 'lg';
  'data-testid'?: string;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for LikeFavoriteButton
function LikeFavoriteButtonSkeleton({
  size,
  className,
  testId,
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  testId?: string;
}) {
  const getSize = () => {
    switch (size) {
      case 'sm':
        return 28;
      case 'md':
        return 32;
      case 'lg':
        return 36;
      default:
        return 32;
    }
  };

  return (
    <Skeleton
      height={getSize()}
      width={getSize()}
      circle
      className={className}
      data-testid={testId}
    />
  );
}

// Error state for LikeFavoriteButton
function LikeFavoriteButtonError({
  error,
  size,
  className,
  testId,
}: {
  error: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  testId?: string;
}) {
  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 14;
      case 'md':
        return 16;
      case 'lg':
        return 18;
      default:
        return 16;
    }
  };

  return (
    <ActionIcon
      variant="filled"
      color="red"
      size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
      className={className}
      data-testid={testId}
      disabled
      aria-label="Favorite button error"
    >
      <IconAlertTriangle size={getIconSize()} />
    </ActionIcon>
  );
}

// Zero state for LikeFavoriteButton
function LikeFavoriteButtonEmpty({
  size,
  className,
  testId,
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  testId?: string;
}) {
  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 14;
      case 'md':
        return 16;
      case 'lg':
        return 18;
      default:
        return 16;
    }
  };

  return (
    <ActionIcon
      variant="subtle"
      color="gray"
      size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
      className={className}
      data-testid={testId}
      disabled
      aria-label="No product to favorite"
    >
      <IconHeart size={getIconSize()} style={{ opacity: 0.3 }} />
    </ActionIcon>
  );
}

const LikeFavoriteButton: React.FC<LikeFavoriteButtonProps> = ({
  className,
  productId,
  size = 'md',
  'data-testid': testId,
  loading = false,
  error,
}) => {
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <LikeFavoriteButtonSkeleton size={size} className={className} testId={testId} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return (
      <LikeFavoriteButtonError
        error={currentError}
        size={size}
        className={className}
        testId={testId}
      />
    );
  }

  // Show zero state when no productId
  if (!productId) {
    return <LikeFavoriteButtonEmpty size={size} className={className} testId={testId} />;
  }
  return (
    <ErrorBoundary
      fallback={
        <LikeFavoriteButtonError
          error="Favorite button failed to render"
          size={size}
          className={className}
          testId={testId}
        />
      }
    >
      <LikeButton
        className={className}
        productId={productId}
        data-testid={testId || `favorite-button-${productId}`}
      />
    </ErrorBoundary>
  );
};

export default LikeFavoriteButton;
