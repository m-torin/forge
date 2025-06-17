import Link from 'next/link';
import { type ReactNode } from 'react';
import clsx from 'clsx';

interface ButtonPrimaryProps {
  className?: string;
  href?: string;
  targetBlank?: boolean;
  children: ReactNode;
  onClick?: () => void;
  'data-testid'?: string;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for ButtonPrimary (Tailwind-only)
function ButtonPrimarySkeleton({ className, testId }: { className?: string; testId?: string }) {
  return (
    <div
      className={clsx(
        'inline-flex items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse h-10 w-24',
        className,
      )}
      data-testid={testId}
    />
  );
}

// Error state for ButtonPrimary (Tailwind-only)
function ButtonPrimaryError({
  error,
  className,
  testId,
}: {
  error: string;
  className?: string;
  testId?: string;
}) {
  return (
    <button
      disabled
      className={clsx(
        'inline-flex items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/20 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 cursor-not-allowed',
        className,
      )}
      data-testid={testId}
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      Button Error
    </button>
  );
}

const ButtonPrimary = ({
  className,
  href,
  targetBlank,
  children,
  onClick,
  'data-testid': testId = 'button-primary',
  loading = false,
  error,
}: ButtonPrimaryProps) => {
  // Show loading state
  if (loading) {
    return <ButtonPrimarySkeleton className={className} testId={testId} />;
  }

  // Show error state
  if (error) {
    return <ButtonPrimaryError error={error} className={className} testId={testId} />;
  }

  const baseClasses = clsx(
    'inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-600 dark:hover:bg-primary-700',
    className,
  );

  if (href) {
    if (href.startsWith('http')) {
      return (
        <a
          className={baseClasses}
          href={href}
          rel={targetBlank ? 'noopener noreferrer' : undefined}
          target={targetBlank ? '_blank' : undefined}
          data-testid={testId}
        >
          {children}
        </a>
      );
    }

    return (
      <Link className={baseClasses} href={href} data-testid={testId}>
        {children}
      </Link>
    );
  }

  return (
    <button className={baseClasses} onClick={onClick} data-testid={testId}>
      {children}
    </button>
  );
};

export default ButtonPrimary;
