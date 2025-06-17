'use client';
import { Skeleton, Alert, Text } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { forwardRef, type InputHTMLAttributes, useState } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  'data-testid'?: string;
  fontClass?: string;
  rounded?: string;
  sizeClass?: string;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for Input
function InputSkeleton({
  className,
  sizeClass: _sizeClass,
  rounded,
  testId,
}: {
  className?: string;
  sizeClass?: string;
  rounded?: string;
  testId?: string;
}) {
  return (
    <Skeleton
      height={44}
      radius={rounded === 'rounded-full' ? 'xl' : 'sm'}
      className={className}
      data-testid={testId}
    />
  );
}

// Error state for Input
function InputError({
  error,
  className,
  testId,
}: {
  error: string;
  className?: string;
  testId?: string;
}) {
  return (
    <Alert
      icon={<IconAlertTriangle size={16} />}
      color="red"
      variant="light"
      className={className}
      data-testid={testId}
    >
      <Text size="sm">Input error: {error}</Text>
    </Alert>
  );
}

const InputWithError = forwardRef<HTMLInputElement, InputProps & { internalError?: string | null }>(
  ({ internalError: _internalError, ...props }, ref) => {
    return <Input {...props} ref={ref} />;
  },
);

InputWithError.displayName = 'InputWithError';

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      children: _children,
      className = '',
      'data-testid': testId = 'input-field',
      fontClass = 'text-sm font-normal',
      rounded = 'rounded-full',
      sizeClass = 'h-11 px-4 py-3',
      type = 'text',
      loading = false,
      error,
      ...args
    },
    ref,
  ) => {
    const [internalError, setInternalError] = useState<string | null>(null);

    // Show loading state
    if (loading) {
      return (
        <InputSkeleton
          className={className}
          sizeClass={sizeClass}
          rounded={rounded}
          testId={testId}
        />
      );
    }

    // Show error state
    const currentError = error || internalError;
    if (currentError) {
      return <InputError error={currentError} className={className} testId={testId} />;
    }

    return (
      <ErrorBoundary
        fallback={
          <InputError error="Input failed to render" className={className} testId={testId} />
        }
      >
        <input
          className={`block w-full border border-neutral-200 bg-white focus:border-primary-300 focus:ring-3 focus:ring-primary-200/50 disabled:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:ring-primary-600/25 dark:disabled:bg-neutral-800 ${rounded} ${fontClass} ${sizeClass} ${className}`}
          data-testid={testId}
          ref={ref}
          type={type}
          onChange={(e) => {
            try {
              if (args.onChange) {
                args.onChange(e);
              }
            } catch (_err) {
              setInternalError('Input change failed');
            }
          }}
          {...args}
        />
      </ErrorBoundary>
    );
  },
);

Input.displayName = 'Input';

export { Input };
export default Input;
