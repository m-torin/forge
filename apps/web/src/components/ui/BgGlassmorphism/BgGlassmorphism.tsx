import React, { type FC } from 'react';

export interface BgGlassmorphismProps {
  className?: string;
  'data-testid'?: string;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for BgGlassmorphism (Tailwind-only)
function BgGlassmorphismSkeleton({ className, testId }: { className?: string; testId?: string }) {
  return (
    <div className={`nc-BgGlassmorphism ${className}`} data-testid={testId}>
      <span className="block bg-gray-200 dark:bg-gray-700 w-72 h-72 rounded-full blur-3xl opacity-10 lg:w-96 lg:h-96 animate-pulse" />
      <span className="block bg-gray-200 dark:bg-gray-700 w-72 h-72 -ml-20 mt-40 rounded-full blur-3xl opacity-10 lg:w-96 lg:h-96 animate-pulse" />
    </div>
  );
}

// Error state for BgGlassmorphism (Tailwind-only)
function BgGlassmorphismError({
  error: _error,
  className,
  testId,
}: {
  error: string;
  className?: string;
  testId?: string;
}) {
  return (
    <div className={`nc-BgGlassmorphism ${className}`} data-testid={testId}>
      <span className="block bg-red-100 dark:bg-red-900/20 w-72 h-72 rounded-full mix-blend-multiply blur-3xl opacity-10 lg:w-96 lg:h-96" />
      <span className="block bg-red-100 dark:bg-red-900/20 w-72 h-72 -ml-20 mt-40 rounded-full mix-blend-multiply blur-3xl opacity-10 lg:w-96 lg:h-96" />
    </div>
  );
}

// Zero state for BgGlassmorphism (Tailwind-only)
function _BgGlassmorphismEmpty({ className, testId }: { className?: string; testId?: string }) {
  return (
    <div className={`nc-BgGlassmorphism ${className}`} data-testid={testId}>
      <span className="block bg-gray-100 dark:bg-gray-800 w-72 h-72 rounded-full mix-blend-multiply blur-3xl opacity-5 lg:w-96 lg:h-96" />
      <span className="block bg-gray-100 dark:bg-gray-800 w-72 h-72 -ml-20 mt-40 rounded-full mix-blend-multiply blur-3xl opacity-5 lg:w-96 lg:h-96" />
    </div>
  );
}

const BgGlassmorphism: FC<BgGlassmorphismProps> = ({
  className = 'absolute inset-x-0 md:top-10 min-h-0 pl-20 py-24 flex overflow-hidden z-0',
  'data-testid': testId = 'bg-glassmorphism',
  loading = false,
  error,
}) => {
  // Show loading state
  if (loading) {
    return <BgGlassmorphismSkeleton className={className} testId={testId} />;
  }

  // Show error state
  if (error) {
    return <BgGlassmorphismError error={error} className={className} testId={testId} />;
  }
  return (
    <div
      className={`nc-BgGlassmorphism ${className}`}
      data-nc-id="BgGlassmorphism"
      data-testid={testId}
    >
      <span className="block bg-[#ef233c] w-72 h-72 rounded-full mix-blend-multiply blur-3xl opacity-10 lg:w-96 lg:h-96" />
      <span className="block bg-[#04868b] w-72 h-72 -ml-20 mt-40 rounded-full mix-blend-multiply blur-3xl opacity-10 lg:w-96 lg:h-96 nc-animation-delay-2000" />
    </div>
  );
};

export default BgGlassmorphism;
