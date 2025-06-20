import React, { type TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  'data-testid'?: string;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for Textarea (Tailwind-only)
function TextareaSkeleton({
  className,
  rows,
  testId,
}: {
  className?: string;
  rows?: number;
  testId?: string;
}) {
  return (
    <div
      className={`block w-full rounded-2xl border border-neutral-200 bg-gray-200 dark:bg-gray-700 dark:border-neutral-700 animate-pulse px-4 py-2.5 ${className}`}
      style={{ height: `${(rows || 4) * 1.5 + 1.25}rem` }}
      data-testid={testId}
    />
  );
}

// Error state for Textarea (Tailwind-only)
function TextareaError({
  error: _error,
  className,
  rows,
  testId,
}: {
  error: string;
  className?: string;
  rows?: number;
  testId?: string;
}) {
  return (
    <div className="relative">
      <textarea
        disabled
        placeholder="Error loading textarea"
        className={`block w-full rounded-2xl border border-red-300 bg-red-50 px-4 py-2.5 text-sm text-red-600 placeholder-red-400 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400 dark:placeholder-red-500 ${className}`}
        data-testid={testId}
        rows={rows || 4}
      />
      <div className="absolute right-3 top-3">
        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
    </div>
  );
}

// Zero state for Textarea (Tailwind-only)
function _TextareaEmpty({
  className,
  rows,
  testId,
}: {
  className?: string;
  rows?: number;
  testId?: string;
}) {
  return (
    <textarea
      disabled
      placeholder="No content available"
      className={`block w-full rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-400 placeholder-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-500 dark:placeholder-gray-500 ${className}`}
      data-testid={testId}
      rows={rows || 4}
    />
  );
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      children,
      className = '',
      'data-testid': testId = 'textarea',
      rows = 4,
      loading = false,
      error: _error,
      ...args
    },
    ref,
  ) => {
    // Show loading state
    if (loading) {
      return <TextareaSkeleton className={className} rows={rows} testId={testId} />;
    }

    // Show error state
    if (_error) {
      return <TextareaError error={_error} className={className} rows={rows} testId={testId} />;
    }

    return (
      <textarea
        className={`block w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm focus:border-primary-300 focus:ring-3 focus:ring-primary-200/50 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:ring-primary-600/25 ${className}`}
        data-testid={testId}
        ref={ref}
        rows={rows}
        {...args}
      >
        {children}
      </textarea>
    );
  },
);

export default Textarea;
