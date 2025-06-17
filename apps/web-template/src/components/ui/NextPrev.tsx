'use client';

import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import React, { type FC, useState } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export interface NextPrevProps {
  btnClassName?: string;
  className?: string;
  currentPage?: number;
  nextDisabled?: boolean;
  onClickNext?: () => void;
  onClickPrev?: () => void;
  onlyNext?: boolean;
  onlyPrev?: boolean;
  prevDisabled?: boolean;
  totalPage?: number;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for NextPrev
function NextPrevSkeleton({
  className,
  btnClassName,
  onlyNext,
  onlyPrev,
}: {
  className?: string;
  btnClassName?: string;
  onlyNext?: boolean;
  onlyPrev?: boolean;
}) {
  return (
    <div
      className={`nc-NextPrev relative flex items-center text-neutral-500 dark:text-neutral-400 ${className}`}
    >
      {!onlyNext && (
        <div
          className={`${btnClassName} ${!onlyPrev ? 'me-2' : ''} bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse`}
        />
      )}
      {!onlyPrev && (
        <div
          className={`${btnClassName} bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse`}
        />
      )}
    </div>
  );
}

// Error state for NextPrev
function NextPrevError({ error, className }: { error: string; className?: string }) {
  return (
    <div className={`nc-NextPrev relative flex items-center text-red-500 ${className}`}>
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
      <span className="text-xs ml-1">Navigation error</span>
    </div>
  );
}

const NextPrev: FC<NextPrevProps> = ({
  btnClassName = 'w-10 h-10',
  className = '',
  nextDisabled = false,
  onClickNext = () => {},
  onClickPrev = () => {},
  onlyNext = false,
  onlyPrev = false,
  prevDisabled = false,
  loading = false,
  error,
}) => {
  const [focus, setFocus] = useState<'left' | 'right'>('right');
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return (
      <NextPrevSkeleton
        className={className}
        btnClassName={btnClassName}
        onlyNext={onlyNext}
        onlyPrev={onlyPrev}
      />
    );
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <NextPrevError error={currentError} className={className} />;
  }

  const handleClick = (callback: () => void, action: string) => {
    try {
      callback();
    } catch (error) {
      console.error(`NextPrev ${action} error:`, error);
      setInternalError(`${action} navigation failed`);
    }
  };

  return (
    <ErrorBoundary
      fallback={<NextPrevError error="Navigation failed to render" className={className} />}
    >
      <div
        className={`nc-NextPrev relative flex items-center text-neutral-500 dark:text-neutral-400 ${className}`}
      >
        {!onlyNext && (
          <button
            aria-disabled={prevDisabled}
            aria-label="Prev"
            className={`${btnClassName} ${
              !onlyPrev ? 'me-2' : ''
            } flex items-center justify-center rounded-full border-neutral-200 dark:border-neutral-600 ${
              focus === 'left' ? 'border-2' : ''
            }`}
            disabled={prevDisabled}
            onClick={(e) => {
              e.preventDefault();
              handleClick(onClickPrev, 'Previous');
            }}
            onMouseEnter={() => setFocus('left')}
          >
            <ArrowLeftIcon className="h-5 w-5 rtl:rotate-180" />
          </button>
        )}
        {!onlyPrev && (
          <button
            aria-disabled={nextDisabled}
            aria-label="Next"
            className={`${btnClassName} flex items-center justify-center rounded-full border-neutral-200 dark:border-neutral-600 ${
              focus === 'right' ? 'border-2' : ''
            }`}
            disabled={nextDisabled}
            onClick={(e) => {
              e.preventDefault();
              handleClick(onClickNext, 'Next');
            }}
            onMouseEnter={() => setFocus('right')}
          >
            <ArrowRightIcon className="h-5 w-5 rtl:rotate-180" />
          </button>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default NextPrev;
