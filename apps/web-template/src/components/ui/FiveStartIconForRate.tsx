'use client';
import { StarIcon } from '@heroicons/react/24/solid';
import { Skeleton, Alert, Text } from '@mantine/core';
import { IconAlertTriangle, IconStar } from '@tabler/icons-react';
import React, { type FC, useEffect, useState } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';

export interface FiveStartIconForRateProps {
  className?: string;
  defaultPoint?: number;
  iconClass?: string;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for FiveStartIconForRate
function FiveStartIconForRateSkeleton({
  className,
  iconClass: _iconClass,
}: {
  className?: string;
  iconClass?: string;
}) {
  return (
    <div
      className={`nc-FiveStartIconForRate flex items-center text-neutral-300 ${className}`}
      data-nc-id="FiveStartIconForRate"
    >
      {[1, 2, 3, 4, 5].map((item) => (
        <Skeleton key={item} height={16} width={16} radius="sm" mr="xs" />
      ))}
    </div>
  );
}

// Error state for FiveStartIconForRate
function FiveStartIconForRateError({
  error: _error,
  className,
  iconClass: _iconClass,
}: {
  error: string;
  className?: string;
  iconClass?: string;
}) {
  return (
    <div
      className={`nc-FiveStartIconForRate flex items-center text-neutral-300 ${className}`}
      data-nc-id="FiveStartIconForRate"
    >
      <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
        <Text size="xs">Rating failed to load</Text>
      </Alert>
    </div>
  );
}

// Zero state for FiveStartIconForRate
function _FiveStartIconForRateEmpty({
  className,
  iconClass,
}: {
  className?: string;
  iconClass?: string;
}) {
  return (
    <div
      className={`nc-FiveStartIconForRate flex items-center text-neutral-300 ${className}`}
      data-nc-id="FiveStartIconForRate"
    >
      {[1, 2, 3, 4, 5].map((item) => (
        <IconStar key={item} className={`${iconClass} text-gray-300 dark:text-gray-600`} />
      ))}
    </div>
  );
}

const FiveStartIconForRate: FC<FiveStartIconForRateProps> = ({
  className = '',
  defaultPoint = 5,
  iconClass = 'w-4 h-4',
  loading = false,
  error,
}) => {
  const [point, setPoint] = useState(defaultPoint);
  const [currentHover, setCurrentHover] = useState(0);
  const [internalError, _setInternalError] = useState<string | null>(null);

  useEffect(() => {
    setPoint(defaultPoint);
  }, [defaultPoint]);

  // Show loading state
  if (loading) {
    return <FiveStartIconForRateSkeleton className={className} iconClass={iconClass} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return (
      <FiveStartIconForRateError error={currentError} className={className} iconClass={iconClass} />
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <FiveStartIconForRateError
          error="Rating component failed to render"
          className={className}
          iconClass={iconClass}
        />
      }
    >
      <div
        className={`nc-FiveStartIconForRate flex items-center text-neutral-300 ${className}`}
        data-nc-id="FiveStartIconForRate"
      >
        {[1, 2, 3, 4, 5].map((item: any) => {
          return (
            <StarIcon
              key={item}
              className={`${
                point >= item || currentHover >= item ? 'text-yellow-500' : ''
              } ${iconClass}`}
              onClick={() => setPoint(() => item)}
              onMouseEnter={() => setCurrentHover(() => item)}
              onMouseLeave={() => setCurrentHover(() => 0)}
            />
          );
        })}
      </div>
    </ErrorBoundary>
  );
};

export default FiveStartIconForRate;
