'use client';

import React from 'react';

export interface LikeButtonProps extends Record<string, any> {
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
}

const LikeButton: React.FC<LikeButtonProps> = ({
  'aria-label': ariaLabel,
  className = '',
  'data-testid': testId,
  liked = false,
  onClick,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick?.();
  };

  return (
    <button
      aria-label={ariaLabel ?? (liked ? 'Remove from favorites' : 'Add to favorites')}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-700 nc-shadow-lg transition-all hover:scale-110 dark:bg-neutral-900 dark:text-neutral-200 ${className}`}
      data-testid={testId}
      onClick={handleClick}
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24">
        <path
          d="M12.62 20.81C12.28 20.93 11.72 20.93 11.38 20.81C8.48 19.82 2 15.69 2 8.68998C2 5.59998 4.49 3.09998 7.56 3.09998C9.38 3.09998 10.99 3.97998 12 5.33998C13.01 3.97998 14.63 3.09998 16.44 3.09998C19.51 3.09998 22 5.59998 22 8.68998C22 15.69 15.52 19.82 12.62 20.81Z"
          fill={liked ? '#ef4444' : 'none'}
          stroke={liked ? '#ef4444' : 'currentColor'}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
    </button>
  );
};

export { LikeButton };
export default LikeButton;
