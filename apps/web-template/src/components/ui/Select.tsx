import { type FC, type SelectHTMLAttributes } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
  'data-testid'?: string;
  sizeClass?: string;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for Select (Tailwind-only)
function SelectSkeleton({
  className,
  sizeClass,
  testId,
}: {
  className?: string;
  sizeClass?: string;
  testId?: string;
}) {
  return (
    <div
      className={`${sizeClass} ${className} block w-full rounded-2xl border border-neutral-200 bg-gray-200 dark:bg-gray-700 dark:border-neutral-700 animate-pulse`}
      data-testid={testId}
    />
  );
}

// Error state for Select (Tailwind-only)
function SelectError({
  error,
  className,
  sizeClass,
  testId,
}: {
  error: string;
  className?: string;
  sizeClass?: string;
  testId?: string;
}) {
  return (
    <div className="relative">
      <select
        disabled
        className={`${sizeClass} ${className} block w-full rounded-2xl border border-red-300 bg-red-50 px-2.5 text-sm text-red-600 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400`}
        data-testid={testId}
      >
        <option>Error loading options</option>
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2">
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

// Zero state for Select (Tailwind-only)
function SelectEmpty({
  className,
  sizeClass,
  testId,
}: {
  className?: string;
  sizeClass?: string;
  testId?: string;
}) {
  return (
    <select
      disabled
      className={`${sizeClass} ${className} block w-full rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-2.5 text-sm text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-500`}
      data-testid={testId}
    >
      <option>No options available</option>
    </select>
  );
}

const Select: FC<SelectProps> = ({
  children,
  className = '',
  'data-testid': testId = 'select',
  sizeClass = 'h-11',
  loading = false,
  error,
  ...args
}) => {
  // Show loading state
  if (loading) {
    return <SelectSkeleton className={className} sizeClass={sizeClass} testId={testId} />;
  }

  // Show error state
  if (error) {
    return (
      <SelectError error={error} className={className} sizeClass={sizeClass} testId={testId} />
    );
  }

  // Show zero state when no children
  if (!children) {
    return <SelectEmpty className={className} sizeClass={sizeClass} testId={testId} />;
  }
  return (
    <select
      className={`${sizeClass} ${className} block w-full rounded-2xl border border-neutral-200 bg-white px-2.5 text-sm focus:border-primary-300 focus:ring-3 focus:ring-primary-200/50 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:ring-primary-600/25`}
      data-testid={testId}
      {...args}
    >
      {children}
    </select>
  );
};

export { Select };
export default Select;
