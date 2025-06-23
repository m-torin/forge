'use client';

import { IconAlertTriangle, IconHeart } from '@tabler/icons-react';
import React, { useState } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useGuestFavorites } from '@/react/GuestActionsContext';

export interface LikeButtonProps {
  'aria-label'?: string;
  ariaLabel?: string;
  className?: string;
  color?: string;
  count?: number;
  'data-testid'?: string;
  debounce?: boolean;
  disabled?: boolean;
  doubleClickToLike?: boolean;
  icon?: React.ReactNode;
  liked?: boolean;
  likedIcon?: React.ReactNode;
  likedTooltip?: string;
  loading?: boolean;
  onClick?: () => void;
  productId?: string;
  showConfirmation?: boolean;
  showCount?: boolean;
  showRipple?: boolean;
  size?: 'lg' | 'md' | 'sm';
  tooltip?: string;
  trackAnalytics?: boolean;
  variant?: 'filled' | 'ghost' | 'outline';
  error?: string;
}

// Loading skeleton for LikeButton
function LikeButtonSkeleton({ className, testId }: { className?: string; testId?: string }) {
  return (
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`}
      data-testid={testId}
    />
  );
}

// Error state for LikeButton
function LikeButtonError({
  error,
  className,
  testId,
}: {
  error: string;
  className?: string;
  testId?: string;
}) {
  return (
    <button
      disabled
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 ${className}`}
      data-testid={testId}
      aria-label="Like button error"
    >
      <IconAlertTriangle size={16} />
    </button>
  );
}

// Zero state for LikeButton
function LikeButtonEmpty({ className, testId }: { className?: string; testId?: string }) {
  return (
    <button
      disabled
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-400 ${className}`}
      data-testid={testId}
      aria-label="No content to like"
    >
      <IconHeart size={16} style={{ opacity: 0.3 }} />
    </button>
  );
}

const LikeButton: React.FC<LikeButtonProps> = ({
  'aria-label': ariaLabel,
  className = '',
  'data-testid': testId = 'like-button',
  liked: likedProp,
  loading = false,
  error,
  onClick,
  productId,
}) => {
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <LikeButtonSkeleton className={className} testId={testId} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <LikeButtonError error={currentError} className={className} testId={testId} />;
  }
  const { isFavorite, toggleFavorite } = useGuestFavorites();

  // Use favorites system if productId is provided, otherwise fall back to prop
  const isLiked = productId ? isFavorite(productId) : (likedProp ?? false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (productId) {
      await toggleFavorite(productId);
    }
    onClick?.();
  };

  return (
    <ErrorBoundary
      fallback={
        <LikeButtonError
          error="Like button failed to render"
          className={className}
          testId={testId}
        />
      }
    >
      <button
        aria-label={ariaLabel ?? (isLiked ? 'Remove from favorites' : 'Add to favorites')}
        className={`flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-700 shadow-lg transition-all hover:scale-110 dark:bg-neutral-900 dark:text-neutral-200 ${className}`}
        data-testid={testId}
        onClick={handleClick}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24">
          <path
            d="M12.62 20.81C12.28 20.93 11.72 20.93 11.38 20.81C8.48 19.82 2 15.69 2 8.68998C2 5.59998 4.49 3.09998 7.56 3.09998C9.38 3.09998 10.99 3.97998 12 5.33998C13.01 3.97998 14.63 3.09998 16.44 3.09998C19.51 3.09998 22 5.59998 22 8.68998C22 15.69 15.52 19.82 12.62 20.81Z"
            fill={isLiked ? '#ef4444' : 'none'}
            stroke={isLiked ? '#ef4444' : 'currentColor'}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
      </button>
    </ErrorBoundary>
  );
};

export { LikeButton };
export default LikeButton;
