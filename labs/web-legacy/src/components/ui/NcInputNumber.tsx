'use client';

import { MinusIcon, PlusIcon } from '@heroicons/react/24/solid';
import { IconAlertTriangle } from '@tabler/icons-react';
import { Skeleton, Alert, Text } from '@mantine/core';
import { useCounter } from '@mantine/hooks';
import React, { type FC, useEffect } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';

export interface NcInputNumberProps {
  className?: string;
  'data-testid'?: string;
  defaultValue?: number;
  desc?: string;
  label?: string;
  max?: number;
  min?: number;
  onChange?: (value: number) => void;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for NcInputNumber
function NcInputNumberSkeleton({ className, testId }: { className?: string; testId?: string }) {
  return (
    <div
      className={`nc-NcInputNumber flex items-center justify-between space-x-5 ${className}`}
      data-testid={testId}
    >
      <div className="flex flex-col">
        <Skeleton height={20} width="60%" mb="xs" />
        <Skeleton height={16} width="40%" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton height={32} width={32} radius="xl" />
        <Skeleton height={20} width={24} />
        <Skeleton height={32} width={32} radius="xl" />
      </div>
    </div>
  );
}

// Error state for NcInputNumber
function NcInputNumberError({
  error: _error,
  className,
  testId,
}: {
  error: string;
  className?: string;
  testId?: string;
}) {
  return (
    <div
      className={`nc-NcInputNumber flex items-center justify-between space-x-5 ${className}`}
      data-testid={testId}
    >
      <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
        <Text size="sm">Number input failed to load</Text>
      </Alert>
    </div>
  );
}

// Zero state for NcInputNumber
function _NcInputNumberEmpty({ className, testId }: { className?: string; testId?: string }) {
  return (
    <div
      className={`nc-NcInputNumber flex items-center justify-between space-x-5 ${className}`}
      data-testid={testId}
    >
      <div className="flex flex-col">
        <span className="font-medium text-neutral-400 dark:text-neutral-500">Number input</span>
        <span className="text-xs text-neutral-400 dark:text-neutral-500">Not available</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          disabled
          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed"
        >
          <MinusIcon className="w-4 h-4 mx-auto text-gray-400" />
        </button>
        <span className="text-gray-400">--</span>
        <button
          disabled
          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed"
        >
          <PlusIcon className="w-4 h-4 mx-auto text-gray-400" />
        </button>
      </div>
    </div>
  );
}

const NcInputNumber: FC<NcInputNumberProps> = ({
  className = 'w-full',
  'data-testid': testId = 'number-input',
  defaultValue = 1,
  desc,
  label,
  max = 99,
  min = 1,
  onChange,
  loading = false,
  error,
}) => {
  const [value, { increment, decrement, set }] = useCounter(defaultValue, { min, max });

  useEffect(() => {
    set(defaultValue);
  }, [defaultValue, set]);

  // Show loading state
  if (loading) {
    return <NcInputNumberSkeleton className={className} testId={testId} />;
  }

  // Show error state
  if (error) {
    return <NcInputNumberError error={error} className={className} testId={testId} />;
  }

  const handleClickDecrement = () => {
    if (min >= value) return;
    decrement();
    onChange && onChange(value - 1);
  };

  const handleClickIncrement = () => {
    if (max && max <= value) return;
    increment();
    onChange && onChange(value + 1);
  };

  const renderLabel = () => {
    return (
      <div className="flex flex-col">
        <span className="font-medium text-neutral-800 dark:text-neutral-200">{label}</span>
        {desc && (
          <span className="text-xs text-neutral-500 dark:text-neutral-400 font-normal">{desc}</span>
        )}
      </div>
    );
  };

  return (
    <ErrorBoundary
      fallback={
        <NcInputNumberError
          error="Number input failed to render"
          className={className}
          testId={testId}
        />
      }
    >
      <div
        className={`nc-NcInputNumber flex items-center justify-between space-x-5 ${className}`}
        data-testid={testId}
      >
        <ErrorBoundary fallback={<Skeleton height={20} width="60%" />}>
          {label && renderLabel()}
        </ErrorBoundary>

        <ErrorBoundary fallback={<Skeleton height={32} width={104} />}>
          <div className="nc-NcInputNumber__content flex items-center justify-between w-[104px] sm:w-28">
            <button
              className="w-8 h-8 rounded-full flex items-center justify-center border border-neutral-400 dark:border-neutral-500 bg-white dark:bg-neutral-900 focus:outline-hidden hover:border-neutral-700 dark:hover:border-neutral-400 disabled:hover:border-neutral-400 dark:disabled:hover:border-neutral-500 disabled:opacity-50 disabled:cursor-default"
              data-testid="decrement-button"
              disabled={min >= value}
              type="button"
              onClick={handleClickDecrement}
            >
              <MinusIcon className="w-4 h-4" />
            </button>
            <span className="select-none block flex-1 text-center leading-none">{value}</span>
            <button
              className="w-8 h-8 rounded-full flex items-center justify-center border border-neutral-400 dark:border-neutral-500 bg-white dark:bg-neutral-900 focus:outline-hidden hover:border-neutral-700 dark:hover:border-neutral-400 disabled:hover:border-neutral-400 dark:disabled:hover:border-neutral-500 disabled:opacity-50 disabled:cursor-default"
              data-testid="increment-button"
              disabled={max ? max <= value : false}
              type="button"
              onClick={handleClickIncrement}
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
};

export default NcInputNumber;
