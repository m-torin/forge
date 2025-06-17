'use client';

import { IconChevronDown, IconSearch, IconAlertTriangle } from '@tabler/icons-react';
import { Accordion, Skeleton } from '@mantine/core';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import Link from 'next/link';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { type SidebarNavigationProps, type TNavigationItem } from '../types';
import { Divider } from '../Divider';
import ButtonPrimary from '../ButtonPrimary';
import SocialsList from '../SocialsList';

// Add error handling props to SidebarNavigationProps
interface SidebarNavigationPropsWithErrorHandling extends SidebarNavigationProps {
  loading?: boolean;
  error?: string;
  'data-testid'?: string;
}

// Loading skeleton for SidebarNavigation
function SidebarNavigationSkeleton({ testId }: { testId?: string }) {
  return (
    <div data-testid={testId}>
      <Skeleton height={60} mb="md" />
      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={32} width={32} circle />
          ))}
        </div>
      </div>
      <div className="mt-5">
        <Skeleton height={48} />
      </div>
      <div className="px-2 py-6 flex flex-col gap-y-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} height={40} mb="xs" />
        ))}
      </div>
      <Skeleton height={1} mb="md" />
      <Skeleton height={48} width={200} />
    </div>
  );
}

// Error state for SidebarNavigation
function SidebarNavigationError({ error, testId }: { error: string; testId?: string }) {
  return (
    <div data-testid={testId}>
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
        <IconAlertTriangle size={24} className="text-red-500 mx-auto mb-2" />
        <p className="text-red-600 dark:text-red-400 text-sm">Sidebar navigation failed to load</p>
      </div>
    </div>
  );
}

// Zero state for SidebarNavigation
function SidebarNavigationEmpty({ testId }: { testId?: string }) {
  return (
    <div data-testid={testId}>
      <span>No navigation items available</span>
    </div>
  );
}

const SidebarNavigation: React.FC<SidebarNavigationPropsWithErrorHandling> = ({
  data,
  loading = false,
  error,
  'data-testid': testId = 'sidebar-navigation',
}) => {
  const router = useRouter();
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <SidebarNavigationSkeleton testId={testId} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <SidebarNavigationError error={currentError} testId={testId} />;
  }

  // Show zero state when no data
  if (!data || data.length === 0) {
    return <SidebarNavigationEmpty testId={testId} />;
  }

  const handleClose = () => {
    // This would typically close the sidebar, but since we don't have access to the aside context,
    // we'll just handle navigation
  };

  const _renderMenuChild = (
    item: TNavigationItem,
    itemClass = 'pl-3 text-neutral-900 dark:text-neutral-200 font-medium',
    level = 0,
  ) => {
    if (!item.children?.length) return null;

    return (
      <Accordion
        chevron={<IconChevronDown className="h-4 w-4" />}
        classNames={{
          chevron: 'ml-2 h-4 w-4 text-neutral-500',
          content: 'p-0',
          control: `mt-0.5 flex rounded-lg pr-4 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 ${itemClass} p-0`,
          item: 'border-0 bg-transparent',
          root: 'nav-mobile-sub-menu pb-1 pl-6 text-base',
        }}
        variant="light"
      >
        {item.children.map((childMenu, index) => {
          const hasChildren = childMenu.children && childMenu.children.length > 0;

          if (!hasChildren) {
            return (
              <Link
                key={childMenu.name}
                className={`mt-0.5 flex rounded-lg pr-4 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 ${itemClass} py-2.5`}
                href={`${childMenu.href ?? '#'}` as any}
                onClick={handleClose}
              >
                {childMenu.name}
              </Link>
            );
          }
          return (
            <Accordion.Item key={childMenu.name} value={`${level}-${index}`}>
              <Accordion.Control>
                <span className="py-2.5">{childMenu.name}</span>
              </Accordion.Control>
              <Accordion.Panel>
                {_renderMenuChild(
                  childMenu,
                  'pl-3 text-neutral-600 dark:text-neutral-400',
                  level + 1,
                )}
              </Accordion.Panel>
            </Accordion.Item>
          );
        })}
      </Accordion>
    );
  };

  const _renderItem = (menu: TNavigationItem, index: number) => {
    const hasChildren = menu.children && menu.children.length > 0;

    if (!hasChildren) {
      return (
        <li key={index} className="text-neutral-900 dark:text-white">
          <Link
            className="flex w-full cursor-pointer rounded-lg px-3 py-2.5 text-start text-sm font-medium tracking-wide uppercase hover:bg-neutral-100 dark:hover:bg-neutral-800"
            href={`${menu.href ?? '#'}` as any}
            onClick={handleClose}
          >
            {menu.name}
          </Link>
        </li>
      );
    }
    return (
      <Accordion.Item key={index} value={`main-${index}`}>
        <Accordion.Control className="flex w-full cursor-pointer rounded-lg px-3 text-start text-sm font-medium tracking-wide uppercase hover:bg-neutral-100 dark:hover:bg-neutral-800">
          {menu.name}
        </Accordion.Control>
        <Accordion.Panel>{_renderMenuChild(menu)}</Accordion.Panel>
      </Accordion.Item>
    );
  };

  const renderSearchForm = () => {
    return (
      <form
        action="#"
        className="flex-1 text-neutral-900 dark:text-neutral-200"
        method="POST"
        onSubmit={(e) => {
          e.preventDefault();
          handleClose();
          router.push('/search');
        }}
      >
        <div className="flex h-full items-center gap-x-2.5 rounded-xl bg-neutral-50 px-3 py-3 dark:bg-neutral-800">
          <IconSearch color="currentColor" size={24} stroke={1.5} />
          <input
            className="w-full border-none bg-transparent text-sm focus:ring-0 focus:outline-hidden"
            placeholder="Type and press enter"
            type="search"
          />
        </div>
        <input hidden type="submit" value="" />
      </form>
    );
  };

  return (
    <ErrorBoundary
      fallback={
        <SidebarNavigationError error="Sidebar navigation failed to render" testId={testId} />
      }
    >
      <div data-testid={testId}>
        <span>
          Discover the most outstanding articles on all topics of life. Write your stories and share
          them
        </span>

        <div className="mt-4 flex items-center justify-between">
          <ErrorBoundary fallback={<div className="text-red-500">Social links unavailable</div>}>
            <SocialsList itemClass="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-xl" />
          </ErrorBoundary>
        </div>
        <div className="mt-5">
          <ErrorBoundary fallback={<div className="text-red-500">Search unavailable</div>}>
            {renderSearchForm()}
          </ErrorBoundary>
        </div>
        <ErrorBoundary
          fallback={<div className="text-red-500 p-4">Navigation menu unavailable</div>}
        >
          <Accordion
            chevron={<IconChevronDown className="h-4 w-4" />}
            classNames={{
              chevron: 'ml-2 h-4 w-4 self-center text-neutral-500',
              content: 'p-0',
              control: 'hover:bg-transparent p-0',
              item: 'border-0 bg-transparent text-neutral-900 dark:text-white',
              root: 'flex flex-col gap-y-1 px-2 py-6',
            }}
            variant="light"
          >
            {data.map((item, index) => {
              try {
                return _renderItem(item, index);
              } catch (err) {
                setInternalError('Menu item rendering failed');
                return (
                  <div key={index} className="text-red-500 p-2">
                    Menu item error
                  </div>
                );
              }
            })}
          </Accordion>
        </ErrorBoundary>
        <ErrorBoundary fallback={<div className="h-px bg-red-200 mb-6" />}>
          <Divider className="mb-6" />
        </ErrorBoundary>

        {/* FOR OUR DEMO */}
        <ErrorBoundary fallback={<div className="text-red-500">Button unavailable</div>}>
          <ButtonPrimary
            className="px-8!"
            href="https://themeforest.net/item/ciseco-shop-ecommerce-nextjs-template/44210635"
            targetBlank
          >
            Buy this template
          </ButtonPrimary>
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
};

export default SidebarNavigation;
