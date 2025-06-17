'use client';
import { Alert, Text } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { clsx } from 'clsx';
import Link from 'next/link';
import { type ComponentType, type ElementType, type FC, useState } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';

export interface ButtonProps {
  [key: string]: any;
  as?: ComponentType<any> | ElementType;
  className?: string;
  'data-testid'?: string;
  fontSize?: string;
  href?: string;
  loading?: boolean;
  sizeClass?: string;
  targetBlank?: boolean;
  error?: string;
}

// Error state for Button
function ButtonError({
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
      <Text size="sm">Button error: {error}</Text>
    </Alert>
  );
}

const Button: FC<ButtonProps> = ({
  as,
  children,
  className = 'text-neutral-700 dark:text-neutral-200 disabled:cursor-not-allowed',
  'data-testid': testId = 'button',
  disabled,
  fontSize = 'text-sm sm:text-base font-nomal',
  href,
  loading,
  sizeClass = 'py-3 px-4 sm:py-3.5 sm:px-6',
  targetBlank,
  error,
  ...props
}) => {
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <ButtonError error={currentError} className={className} testId={testId} />;
  }

  const classes = clsx(
    'nc-Button relative inline-flex h-auto cursor-pointer items-center justify-center rounded-full transition-colors',
    fontSize,
    sizeClass,
    className,
  );

  let Component = as ?? 'button';
  if (href) {
    Component = Link;
  }

  return (
    <ErrorBoundary
      fallback={
        <ButtonError error="Button failed to render" className={className} testId={testId} />
      }
    >
      <Component
        className={classes}
        data-testid={testId}
        disabled={disabled ?? loading}
        onClick={(e: any) => {
          try {
            if (props.onClick) {
              props.onClick(e);
            }
          } catch (err) {
            setInternalError('Button click failed');
          }
        }}
        {...props}
        href={href}
        rel={targetBlank ? 'noopener noreferrer' : undefined}
        target={targetBlank ? '_blank' : undefined}
      >
        {loading && (
          <svg
            className="-ml-1 mr-3 size-5 animate-spin"
            data-testid="loading-spinner"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              fill="currentColor"
            />
          </svg>
        )}
        {children ?? 'Button'}
      </Component>
    </ErrorBoundary>
  );
};

export { Button };
export default Button;
