'use client';
import { Skeleton } from '@mantine/core';
import { IconCheck, IconAlertTriangle } from '@tabler/icons-react';
import { clsx } from 'clsx';
import { type FC, useState } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className' | 'onChange'> {
  'data-testid'?: string;
  description?: string;
  label?: string;
  labelClassName?: string;
  onChange?: (e: boolean) => void;
  sizeClassName?: string;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for Checkbox
function CheckboxSkeleton({ testId }: { testId?: string }) {
  return (
    <div className="flex gap-3" data-testid={testId}>
      <div className="flex h-6 shrink-0 items-center">
        <Skeleton height={24} width={24} radius="sm" />
      </div>
      <div className="text-sm/6">
        <Skeleton height={16} width={100} mb="xs" />
        <Skeleton height={14} width={150} />
      </div>
    </div>
  );
}

// Error state for Checkbox
function CheckboxError({ error: _error, testId }: { error: string; testId?: string }) {
  return (
    <div className="flex gap-3" data-testid={testId}>
      <div className="flex h-6 shrink-0 items-center">
        <div className="size-6 rounded-sm bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 flex items-center justify-center">
          <IconAlertTriangle size={16} className="text-red-500" />
        </div>
      </div>
      <div className="text-sm/6 text-red-500">Checkbox error</div>
    </div>
  );
}

const Checkbox: FC<CheckboxProps> = ({
  'data-testid': testId = 'checkbox',
  description,
  id,
  label,
  labelClassName,
  name,
  onChange,
  sizeClassName = 'size-6',
  loading = false,
  error,
  ...props
}) => {
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <CheckboxSkeleton testId={testId} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <CheckboxError error={currentError} testId={testId} />;
  }

  return (
    <ErrorBoundary fallback={<CheckboxError error="Checkbox failed to render" testId={testId} />}>
      <div className="flex gap-3" data-testid={testId}>
        <div className="flex h-6 shrink-0 items-center">
          <div className="group grid size-6 grid-cols-1">
            <input
              className={clsx(
                'col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-primary-600 checked:bg-primary-600 indeterminate:border-primary-600 indeterminate:bg-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto',
                sizeClassName,
              )}
              data-testid={`${testId}-input`}
              id={id ?? name + '-checkbox'}
              name={name}
              type="checkbox"
              onChange={(e) => {
                try {
                  onChange?.(e.target.checked);
                } catch (_err) {
                  setInternalError('Checkbox change handler failed');
                }
              }}
              {...props}
            />

            <IconCheck
              className="pointer-events-none col-start-1 row-start-1 size-4 self-center justify-self-center text-white opacity-0 group-has-[:checked]:opacity-100"
              color="#ffffff"
              size={16}
              stroke={3}
            />
          </div>
        </div>
        <div className="text-sm/6">
          <label className={labelClassName} htmlFor={id ?? name + '-checkbox'}>
            {label}
          </label>
          {description && <p className="text-neutral-400">{description}</p>}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Checkbox;
