'use client';

import { IconMenu2, IconAlertTriangle } from '@tabler/icons-react';
import { Skeleton } from '@mantine/core';
import { useState } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';

interface HamburgerBtnMenuProps {
  'data-testid'?: string;
  onClick?: () => void;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for HamburgerBtnMenu
function HamburgerBtnMenuSkeleton({ testId }: { testId?: string }) {
  return (
    <div
      className="-m-2.5 flex cursor-pointer items-center justify-center rounded-full p-2.5"
      data-testid={testId}
    >
      <Skeleton height={24} width={24} />
    </div>
  );
}

// Error state for HamburgerBtnMenu
function HamburgerBtnMenuError({ error, testId }: { error: string; testId?: string }) {
  return (
    <button
      disabled
      className="-m-2.5 flex cursor-not-allowed items-center justify-center rounded-full p-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
      data-testid={testId}
      aria-label="Menu button error"
    >
      <IconAlertTriangle size={20} />
    </button>
  );
}

// Zero state for HamburgerBtnMenu
function HamburgerBtnMenuEmpty({ testId }: { testId?: string }) {
  return (
    <button
      disabled
      className="-m-2.5 flex cursor-not-allowed items-center justify-center rounded-full p-2.5 opacity-50"
      data-testid={testId}
      aria-label="Menu unavailable"
    >
      <IconMenu2 color="currentColor" size={24} stroke={1.5} style={{ opacity: 0.3 }} />
    </button>
  );
}

const HamburgerBtnMenu = ({
  'data-testid': testId = 'hamburger-menu',
  onClick,
  loading = false,
  error,
}: HamburgerBtnMenuProps) => {
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <HamburgerBtnMenuSkeleton testId={testId} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <HamburgerBtnMenuError error={currentError} testId={testId} />;
  }
  return (
    <ErrorBoundary
      fallback={<HamburgerBtnMenuError error="Menu button failed to render" testId={testId} />}
    >
      <button
        className="-m-2.5 flex cursor-pointer items-center justify-center rounded-full p-2.5 hover:bg-neutral-100 focus-visible:outline-0 dark:hover:bg-neutral-700"
        data-testid={testId}
        type="button"
        onClick={() => {
          try {
            if (onClick) {
              onClick();
            }
          } catch (err) {
            setInternalError('Menu action failed');
          }
        }}
      >
        <span className="sr-only">Open main menu</span>
        <ErrorBoundary fallback={<IconAlertTriangle size={20} />}>
          <IconMenu2 color="currentColor" size={24} stroke={1.5} />
        </ErrorBoundary>
      </button>
    </ErrorBoundary>
  );
};

export default HamburgerBtnMenu;
