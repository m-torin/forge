'use client';
import { Skeleton } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { type FC, useState } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';

export interface RadioProps {
  className?: string;
  'data-testid'?: string;
  defaultChecked?: boolean;
  id: string;
  label?: string;
  name: string;
  onChange?: (value: string) => void;
  sizeClassName?: string;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for Radio
function RadioSkeleton({
  className,
  sizeClassName,
  testId,
}: {
  className?: string;
  sizeClassName?: string;
  testId?: string;
}) {
  return (
    <div className={`flex items-center text-sm sm:text-base ${className}`} data-testid={testId}>
      <Skeleton height={24} width={24} circle className={sizeClassName} />
      <Skeleton height={16} width={80} ml="sm" />
    </div>
  );
}

// Error state for Radio
function RadioError({
  error: _error,
  className,
  testId,
}: {
  error: string;
  className?: string;
  testId?: string;
}) {
  return (
    <div className={`flex items-center text-sm sm:text-base ${className}`} data-testid={testId}>
      <div className="flex items-center text-red-500">
        <IconAlertTriangle size={20} className="mr-2" />
        <span className="text-sm">Radio error</span>
      </div>
    </div>
  );
}

const Radio: FC<RadioProps> = ({
  className = '',
  'data-testid': testId = 'radio',
  defaultChecked,
  id,
  label,
  name,
  onChange,
  sizeClassName = 'w-6 h-6',
  loading = false,
  error,
}) => {
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <RadioSkeleton className={className} sizeClassName={sizeClassName} testId={testId} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <RadioError error={currentError} className={className} testId={testId} />;
  }

  return (
    <ErrorBoundary
      fallback={<RadioError error="Radio failed to render" className={className} testId={testId} />}
    >
      <div className={`flex items-center text-sm sm:text-base ${className}`} data-testid={testId}>
        <input
          className={`focus:ring-action-primary rounded-full border-neutral-400 bg-transparent text-primary-500 hover:border-neutral-700 focus:ring-primary-500 dark:border-neutral-700 dark:checked:bg-primary-500 dark:hover:border-neutral-500 ${sizeClassName}`}
          data-testid={`${testId}-input`}
          defaultChecked={defaultChecked}
          id={id}
          name={name}
          type="radio"
          value={id}
          onChange={(e) => {
            try {
              onChange && onChange(e.target.value);
            } catch (_err) {
              setInternalError('Radio change handler failed');
            }
          }}
        />
        {label && (
          <label
            className="block pl-2.5 text-neutral-900 select-none sm:pl-3 dark:text-neutral-100"
            dangerouslySetInnerHTML={{ __html: label }}
            htmlFor={id}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Radio;
