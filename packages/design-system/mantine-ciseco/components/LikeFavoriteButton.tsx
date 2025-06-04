'use client';

import React from 'react';

export interface LikeFavoriteButtonProps {
  className?: string;
  liked?: boolean;
  onClick?: () => void;
}

const LikeFavoriteButton: React.FC<LikeFavoriteButtonProps> = ({
  className = '',
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
      onClick={handleClick}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-700 nc-shadow-lg transition-all hover:scale-110 dark:bg-neutral-900 dark:text-neutral-200 ${className}`}
      aria-label={liked ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
        <path
          strokeWidth="1.5"
          stroke={liked ? '#ef4444' : 'currentColor'}
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12.62 20.81C12.28 20.93 11.72 20.93 11.38 20.81C8.48 19.82 2 15.69 2 8.68998C2 5.59998 4.49 3.09998 7.56 3.09998C9.38 3.09998 10.99 3.97998 12 5.33998C13.01 3.97998 14.63 3.09998 16.44 3.09998C19.51 3.09998 22 5.59998 22 8.68998C22 15.69 15.52 19.82 12.62 20.81Z"
          fill={liked ? '#ef4444' : 'none'}
        />
      </svg>
    </button>
  );
};

export default LikeFavoriteButton;
