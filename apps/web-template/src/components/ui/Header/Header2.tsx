import clsx from 'clsx';
import { type FC } from 'react';

import Logo from '../../layout/Logo';
import { type Header2Props } from './types';

import AvatarDropdown from './AvatarDropdown';
import CartBtn from './CartBtn';
import HamburgerBtnMenu from './HamburgerBtnMenu';
import Navigation from './Navigation/Navigation';
import SearchBtnPopover from './SearchBtnPopover';

export type { Header2Props };

// Add error handling props to Header2Props interface extension
interface Header2PropsWithErrorHandling extends Header2Props {
  'data-testid'?: string;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for Header2 (Tailwind-only)
function Header2Skeleton({ testId }: { testId?: string }) {
  return (
    <div className="relative z-10 w-full bg-white" data-testid={testId}>
      <div className="relative border-b border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
        <div className="container flex h-20 justify-between">
          <div className="flex flex-1 items-center lg:hidden">
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="flex items-center lg:flex-1">
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="mx-4 hidden flex-2 justify-center lg:flex">
            <div className="flex gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                />
              ))}
            </div>
          </div>
          <div className="flex flex-1 items-center justify-end gap-x-2.5 sm:gap-x-5">
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Error state for Header2 (Tailwind-only)
function Header2Error({ error, testId }: { error: string; testId?: string }) {
  return (
    <div className="relative z-10 w-full bg-red-50 dark:bg-red-900/20" data-testid={testId}>
      <div className="relative border-b border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
        <div className="container flex h-20 justify-between items-center">
          <div className="flex items-center text-red-600 dark:text-red-400">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <span className="text-sm font-medium">Header failed to load</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Zero state for Header2 (Tailwind-only)
function Header2Empty({ testId }: { testId?: string }) {
  return (
    <div className="relative z-10 w-full bg-gray-50 dark:bg-gray-800" data-testid={testId}>
      <div className="relative border-b border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
        <div className="container flex h-20 justify-between items-center">
          <div className="flex items-center text-gray-400">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <span className="text-sm">Header content unavailable</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const Header2: FC<Header2PropsWithErrorHandling> = ({
  featuredCollection,
  hasBorder = true,
  navigationMenu = [],
  'data-testid': testId = 'header-2',
  loading = false,
  error,
}) => {
  // Show loading state
  if (loading) {
    return <Header2Skeleton testId={testId} />;
  }

  // Show error state
  if (error) {
    return <Header2Error error={error} testId={testId} />;
  }
  return (
    <div className="relative z-10 w-full bg-white" data-testid={testId}>
      <div
        className={clsx(
          'relative border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900',
          hasBorder && 'border-b',
          !hasBorder && 'has-[.header-popover-full-panel]:border-b',
        )}
      >
        <div className="container flex h-20 justify-between">
          <div className="flex flex-1 items-center lg:hidden">
            <HamburgerBtnMenu />
          </div>

          <div className="flex items-center lg:flex-1">
            <Logo />
          </div>

          <div className="mx-4 hidden flex-2 justify-center lg:flex">
            <Navigation featuredCollection={featuredCollection} menu={navigationMenu} />
          </div>

          <div className="flex flex-1 items-center justify-end gap-x-2.5 sm: gap-x-5">
            <SearchBtnPopover />
            <AvatarDropdown />
            <CartBtn />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header2;
