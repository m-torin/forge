'use client';

import { IconChevronDown, IconAlertTriangle } from '@tabler/icons-react';
import { Skeleton } from '@mantine/core';
import clsx from 'clsx';
import Link from 'next/link';
import { type FC, useState } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { type TCollection, type TNavigationItem, type NavigationProps } from '../types';
import CollectionCard3 from '../CollectionCard3';

// Add error handling props to NavigationProps
interface NavigationPropsWithErrorHandling extends NavigationProps {
  loading?: boolean;
  error?: string;
}

// Loading skeleton for Navigation
function NavigationSkeleton({ className, testId }: { className?: string; testId?: string }) {
  return (
    <ul className={clsx('flex', className)} data-testid={testId}>
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i} className="relative menu-item">
          <div className="flex items-center self-center rounded-full px-4 py-2.5">
            <Skeleton height={20} width={60} />
          </div>
        </li>
      ))}
    </ul>
  );
}

// Error state for Navigation
function NavigationError({
  error,
  className,
  testId,
}: {
  error: string;
  className?: string;
  testId?: string;
}) {
  return (
    <ul className={clsx('flex', className)} data-testid={testId}>
      <li className="relative menu-item">
        <div className="flex items-center self-center rounded-full px-4 py-2.5 text-red-600 dark:text-red-400">
          <IconAlertTriangle size={16} className="mr-2" />
          <span className="text-sm">Navigation error</span>
        </div>
      </li>
    </ul>
  );
}

// Zero state for Navigation
function NavigationEmpty({ className, testId }: { className?: string; testId?: string }) {
  return (
    <ul className={clsx('flex', className)} data-testid={testId}>
      <li className="relative menu-item">
        <div className="flex items-center self-center rounded-full px-4 py-2.5 text-gray-400">
          <span className="text-sm">No navigation items</span>
        </div>
      </li>
    </ul>
  );
}

const Lv1MenuItem = ({ menuItem }: { menuItem: TNavigationItem }) => {
  return (
    <ErrorBoundary fallback={<span className="text-red-500 text-sm">Menu item error</span>}>
      <Link
        className="flex items-center self-center rounded-full px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 lg:text-[15px] xl:px-5 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
        data-testid="nav-item"
        href={(menuItem.href || '#') as any}
      >
        {menuItem.name}
        {menuItem.children?.length && (
          <ErrorBoundary fallback={<IconAlertTriangle size={16} />}>
            <IconChevronDown aria-hidden="true" className="-mr-1 ml-1 h-4 w-4 text-neutral-400" />
          </ErrorBoundary>
        )}
      </Link>
    </ErrorBoundary>
  );
};

const MegaMenu = ({
  collection,
  menuItem,
}: {
  collection?: TCollection;
  menuItem: TNavigationItem;
}) => {
  const renderNavlink = (item: TNavigationItem) => {
    return (
      <li key={item.id} className={clsx('menu-item', item.isNew && 'menuIsNew')}>
        <Link
          className="font-normal text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white"
          href={(item.href || '#') as any}
        >
          {item.name}
        </Link>
      </li>
    );
  };

  return (
    <li className="menu-megamenu menu-item">
      <Lv1MenuItem menuItem={menuItem} />

      {menuItem.children?.length && menuItem.type === 'mega-menu' ? (
        <div className="absolute inset-x-0 top-full z-10 sub-menu" data-testid="mega-menu">
          <div className="bg-white shadow-lg dark:bg-neutral-900">
            <div className="container">
              <div className="flex border-t border-neutral-200 py-12 text-sm dark:border-neutral-700">
                <div className="grid flex-1 grid-cols-4 gap-6 pr-6 xl:gap-8 xl:pr-20">
                  {menuItem.children.map((menuChild) => (
                    <div key={menuChild.name}>
                      <p className="font-medium text-neutral-900 dark:text-neutral-200">
                        {menuChild.name}
                      </p>
                      <ul className="mt-4 grid space-y-4">
                        {menuChild.children?.map(renderNavlink)}
                      </ul>
                    </div>
                  ))}
                </div>
                {collection && (
                  <div className="w-2/5 xl:w-5/14">
                    <CollectionCard3 collection={collection} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </li>
  );
};

const DropdownMenu = ({ menuItem }: { menuItem: TNavigationItem }) => {
  const renderMenuLink = (menuItem: TNavigationItem) => {
    return (
      <Link
        className="flex items-center rounded-md px-4 py-2 font-normal text-neutral-600 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
        href={(menuItem.href || '#') as any}
      >
        {menuItem.name}
        {menuItem.children?.length && (
          <IconChevronDown aria-hidden="true" className="ml-2 h-4 w-4 text-neutral-500" />
        )}
      </Link>
    );
  };

  const renderDropdown = (menuItem: TNavigationItem) => {
    return (
      <li key={menuItem.id} className="menu-dropdown relative menu-item px-2">
        {renderMenuLink(menuItem)}
        {menuItem.children?.length && (
          <div className="absolute top-0 left-full z-10 sub-menu w-56 pl-2">
            <ul className="relative grid space-y-1 rounded-lg bg-white py-4 text-sm shadow-lg ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
              {menuItem.children.map((child) => {
                if (child.type === 'dropdown' && child.children?.length) {
                  return renderDropdown(child);
                }
                return (
                  <li key={child.id} className="px-2">
                    {renderMenuLink(child)}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </li>
    );
  };

  return (
    <li className="menu-dropdown relative menu-item">
      <Lv1MenuItem menuItem={menuItem} />

      {menuItem.children?.length && menuItem.type === 'dropdown' ? (
        <div className="absolute top-full left-0 z-10 sub-menu w-56" data-testid="dropdown-menu">
          <ul className="relative grid space-y-1 rounded-lg bg-white py-4 text-sm shadow-lg ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
            {menuItem.children.map((childItem) => {
              if (childItem.type === 'dropdown' && childItem.children?.length) {
                return renderDropdown(childItem);
              }
              return (
                <li key={childItem.id} className="px-2">
                  {renderMenuLink(childItem)}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </li>
  );
};

const Navigation: FC<NavigationPropsWithErrorHandling> = ({
  className,
  'data-testid': testId = 'main-navigation',
  featuredCollection,
  menu,
  loading = false,
  error,
}) => {
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <NavigationSkeleton className={className} testId={testId} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <NavigationError error={currentError} className={className} testId={testId} />;
  }

  // Show zero state when no menu items
  if (!menu || menu.length === 0) {
    return <NavigationEmpty className={className} testId={testId} />;
  }
  return (
    <ErrorBoundary
      fallback={
        <NavigationError
          error="Navigation failed to render"
          className={className}
          testId={testId}
        />
      }
    >
      <ul className={clsx('flex', className)} data-testid={testId}>
        {menu.map((menuItem) => {
          try {
            if (menuItem.type === 'dropdown') {
              return (
                <ErrorBoundary
                  key={menuItem.id}
                  fallback={<li className="text-red-500 text-sm p-2">Menu error</li>}
                >
                  <DropdownMenu menuItem={menuItem} />
                </ErrorBoundary>
              );
            }
            if (menuItem.type === 'mega-menu') {
              return (
                <ErrorBoundary
                  key={menuItem.id}
                  fallback={<li className="text-red-500 text-sm p-2">Menu error</li>}
                >
                  <MegaMenu collection={featuredCollection} menuItem={menuItem} />
                </ErrorBoundary>
              );
            }
            return (
              <ErrorBoundary
                key={menuItem.id}
                fallback={<li className="text-red-500 text-sm p-2">Menu error</li>}
              >
                <li className="relative menu-item">
                  <Lv1MenuItem menuItem={menuItem} />
                </li>
              </ErrorBoundary>
            );
          } catch (err) {
            setInternalError('Menu rendering failed');
            return (
              <li key={menuItem.id} className="text-red-500 text-sm p-2">
                Menu error
              </li>
            );
          }
        })}
      </ul>
    </ErrorBoundary>
  );
};

export { Navigation };
export default Navigation;
