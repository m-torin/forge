'use client';

import { Menu, Skeleton } from '@mantine/core';
import {
  IconUser,
  IconUserCircle,
  IconClipboardList,
  IconHeart,
  IconHelp,
  IconLogout,
  IconAlertTriangle,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useState } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';

interface Props {
  className?: string;
  'data-testid'?: string;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for AvatarDropdown
function AvatarDropdownSkeleton({ className, testId }: { className?: string; testId?: string }) {
  return (
    <div className={className} data-testid={testId}>
      <Skeleton height={24} width={24} circle />
    </div>
  );
}

// Error state for AvatarDropdown
function AvatarDropdownError({
  error,
  className,
  testId,
}: {
  error: string;
  className?: string;
  testId?: string;
}) {
  return (
    <div className={className} data-testid={testId}>
      <button
        disabled
        className="-m-2.5 flex cursor-not-allowed items-center justify-center rounded-full p-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
        aria-label="Avatar dropdown error"
      >
        <IconAlertTriangle size={20} />
      </button>
    </div>
  );
}

// Zero state for AvatarDropdown
function AvatarDropdownEmpty({ className, testId }: { className?: string; testId?: string }) {
  return (
    <div className={className} data-testid={testId}>
      <button
        disabled
        className="-m-2.5 flex cursor-not-allowed items-center justify-center rounded-full p-2.5 opacity-50"
        aria-label="Avatar dropdown unavailable"
      >
        <IconUserCircle color="currentColor" size={24} stroke={1.5} style={{ opacity: 0.3 }} />
      </button>
    </div>
  );
}

export default function AvatarDropdown({
  className,
  'data-testid': testId = 'avatar-dropdown',
  loading = false,
  error,
}: Props) {
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <AvatarDropdownSkeleton className={className} testId={testId} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <AvatarDropdownError error={currentError} className={className} testId={testId} />;
  }

  const menuItems = [
    {
      href: '/account',
      icon: <IconUser size={20} stroke={1.5} />,
      label: 'My Account',
    },
    {
      href: '/orders',
      icon: <IconClipboardList size={20} stroke={1.5} />,
      label: 'My Orders',
    },
    {
      href: '/account-wishlists',
      icon: <IconHeart size={20} stroke={1.5} />,
      label: 'Wishlist',
    },
    {
      divider: true,
    },
    {
      href: '#',
      icon: <IconHelp size={20} stroke={1.5} />,
      label: 'Help',
    },
    {
      href: '#',
      icon: <IconLogout size={20} stroke={1.5} />,
      label: 'Log out',
    },
  ];

  return (
    <ErrorBoundary
      fallback={
        <AvatarDropdownError
          error="Avatar dropdown failed to render"
          className={className}
          testId={testId}
        />
      }
    >
      <div className={className} data-testid={testId}>
        <Menu
          classNames={{
            dropdown: 'rounded-3xl border-0 ring-1 ring-black/5 dark:ring-white/10 px-0',
          }}
          offset={12}
          position="bottom-end"
          shadow="lg"
          styles={{
            dropdown: {
              backgroundColor: 'transparent',
              padding: 0,
            },
          }}
          transitionProps={{ duration: 200, transition: 'pop-top-right' }}
          width={320}
        >
          <Menu.Target>
            <ErrorBoundary
              fallback={
                <AvatarDropdownError
                  error="Avatar button failed to render"
                  className={className}
                  testId={testId}
                />
              }
            >
              <button className="-m-2.5 flex cursor-pointer items-center justify-center rounded-full p-2.5 hover:bg-neutral-100 focus-visible:outline-hidden dark:hover:bg-neutral-800">
                <IconUserCircle color="currentColor" size={24} stroke={1.5} />
              </button>
            </ErrorBoundary>
          </Menu.Target>

          <Menu.Dropdown>
            <ErrorBoundary
              fallback={
                <AvatarDropdownError
                  error="Dropdown content failed to render"
                  className={className}
                  testId={testId}
                />
              }
            >
              <div className="bg-white dark:bg-neutral-800 rounded-3xl">
                <ErrorBoundary
                  fallback={
                    <div className="px-6 pt-7 pb-4 text-red-500">User info unavailable</div>
                  }
                >
                  <div className="px-6 pt-7 pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="size-12 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                        <IconUser size={24} stroke={1.5} />
                      </div>
                      <div className="grow">
                        <h4 className="font-semibold">Guest User</h4>
                        <p className="mt-0.5 text-xs">Please sign in</p>
                      </div>
                    </div>
                  </div>
                </ErrorBoundary>

                <ErrorBoundary
                  fallback={<div className="px-3 pb-3 text-red-500">Menu items unavailable</div>}
                >
                  <div className="px-3 pb-3">
                    {menuItems.map((item, index) => {
                      if (item.divider) {
                        return (
                          <Menu.Divider
                            key={`divider-${item.divider}-${index}`}
                            className="my-2 mx-3 border-neutral-900/10 dark:border-neutral-100/10"
                          />
                        );
                      }
                      return (
                        <Menu.Item
                          key={item.label}
                          className="flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-neutral-100 dark:hover:bg-neutral-700"
                          classNames={{
                            item: 'p-0 bg-transparent hover:bg-transparent',
                          }}
                          component={Link}
                          href={item.href!}
                          styles={{
                            item: {
                              '&[data-hovered]': {
                                backgroundColor: 'transparent',
                              },
                            },
                          }}
                        >
                          <div className="flex shrink-0 items-center justify-center text-neutral-500 dark:text-neutral-300">
                            {item.icon}
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium">{item.label}</p>
                          </div>
                        </Menu.Item>
                      );
                    })}
                  </div>
                </ErrorBoundary>
              </div>
            </ErrorBoundary>
          </Menu.Dropdown>
        </Menu>
      </div>
    </ErrorBoundary>
  );
}
