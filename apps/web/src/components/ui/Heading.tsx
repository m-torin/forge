'use client';

import clsx from 'clsx';
import React, { type HTMLAttributes, type ReactNode, useState } from 'react';

import NextPrev from './NextPrev';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  'data-testid'?: string;
  description?: ReactNode | string;
  fontClass?: string;
  hasNextPrev?: boolean;
  headingDim?: ReactNode | string;
  isCenter?: boolean;
  level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  nextBtnDisabled?: boolean;
  onClickNext?: () => void;
  onClickPrev?: () => void;
  prevBtnDisabled?: boolean;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for Heading
function HeadingSkeleton({ className, isCenter }: { className?: string; isCenter?: boolean }) {
  return (
    <div
      className={clsx('relative flex flex-col justify-between sm:flex-row sm:items-end', className)}
    >
      <div className={clsx(isCenter && 'mx-auto flex w-full flex-col items-center text-center')}>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-64 mb-3" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-96 max-w-full" />
      </div>
    </div>
  );
}

// Error state for Heading
function HeadingError({ error, className }: { error: string; className?: string }) {
  return (
    <div
      className={clsx('relative flex flex-col justify-between sm:flex-row sm:items-end', className)}
    >
      <div className="flex items-center gap-2 text-red-500">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <span className="text-sm">Failed to load heading</span>
      </div>
    </div>
  );
}

// Zero state for Heading
function HeadingEmpty({ className, isCenter }: { className?: string; isCenter?: boolean }) {
  return (
    <div
      className={clsx('relative flex flex-col justify-between sm:flex-row sm:items-end', className)}
    >
      <div className={clsx(isCenter && 'mx-auto flex w-full flex-col items-center text-center')}>
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-400 dark:text-gray-600">
          No heading available
        </h2>
      </div>
    </div>
  );
}

const Heading: React.FC<HeadingProps> = ({
  children,
  className = 'mb-12 lg:mb-14 text-neutral-900 dark:text-neutral-50',
  'data-testid': testId = 'heading',
  description,
  fontClass = 'text-3xl md:text-4xl font-semibold',
  hasNextPrev = false,
  headingDim,
  isCenter = false,
  level: Level = 'h2',
  nextBtnDisabled,
  onClickNext,
  onClickPrev,
  prevBtnDisabled,
  loading = false,
  error,
  ...args
}) => {
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <HeadingSkeleton className={className} isCenter={isCenter} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <HeadingError error={currentError} className={className} />;
  }

  // Show zero state when no children
  if (!children) {
    return <HeadingEmpty className={className} isCenter={isCenter} />;
  }

  const handleNavClick = (callback?: () => void, action?: string) => {
    try {
      if (callback) {
        callback();
      }
    } catch (_error) {
      console.error(`Heading navigation error (${action}):`, _error);
      setInternalError(`Navigation failed: ${action}`);
    }
  };
  return (
    <ErrorBoundary
      fallback={<HeadingError error="Heading failed to render" className={className} />}
    >
      <div
        className={clsx(
          'relative flex flex-col justify-between sm:flex-row sm:items-end',
          className,
        )}
        data-testid={testId}
      >
        <div className={clsx(isCenter && 'mx-auto flex w-full flex-col items-center text-center')}>
          <Level className={clsx(isCenter && 'justify-center', fontClass)} {...args}>
            {children}
            {headingDim ? (
              <>
                <span>{'. '}</span>
                <span className="text-neutral-400">{headingDim}</span>
              </>
            ) : null}
          </Level>
          {description ? (
            <p className="mt-3 block max-w-xl text-base/normal text-neutral-500 dark:text-neutral-400">
              {description}
            </p>
          ) : null}
        </div>
        {hasNextPrev && !isCenter && (
          <div className="mt-4 flex shrink-0 justify-end sm:ms-2 sm:mt-0">
            <NextPrev
              nextDisabled={nextBtnDisabled}
              prevDisabled={prevBtnDisabled}
              onClickNext={() => handleNavClick(onClickNext, 'next')}
              onClickPrev={() => handleNavClick(onClickPrev, 'prev')}
            />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Heading;
