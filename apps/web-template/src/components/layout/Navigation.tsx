'use client';

import { Anchor, Center, Group, Menu, Skeleton, Alert, Text, Stack } from '@mantine/core';
import { IconChevronDown, IconAlertTriangle, IconMenu2 } from '@tabler/icons-react';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type FC, useState } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import type { TCollection, TNavigationItem } from '@/types';

interface NavigationProps {
  featuredCollection?: TCollection;
  locale?: string;
  menu: TNavigationItem[];
  loading?: boolean;
  error?: string;
}

// Loading skeleton for Navigation
function NavigationSkeleton() {
  return (
    <Group gap={5} visibleFrom="lg">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} height={36} width={60 + Math.random() * 40} radius="sm" />
      ))}
    </Group>
  );
}

// Error state for Navigation
function NavigationError({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <Group gap={5} visibleFrom="lg">
      <Alert
        icon={<IconAlertTriangle size={16} />}
        color="red"
        variant="light"
        style={{ fontSize: '12px', padding: '8px' }}
      >
        Navigation Error
      </Alert>
    </Group>
  );
}

// Zero state for Navigation when no menu items
function NavigationEmpty() {
  return (
    <Group gap={5} visibleFrom="lg">
      <Stack align="center" gap={4}>
        <IconMenu2 size={16} color="gray" />
        <Text size="xs" c="dimmed">
          No menu items
        </Text>
      </Stack>
    </Group>
  );
}

const Navigation: FC<NavigationProps> = ({
  featuredCollection: _featuredCollection,
  locale = 'en',
  menu,
  loading = false,
  error,
}) => {
  const pathname = usePathname();
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <NavigationSkeleton />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <NavigationError error={currentError} onRetry={() => setInternalError(null)} />;
  }

  // Show zero state when no menu items
  if (!menu || menu.length === 0) {
    return <NavigationEmpty />;
  }

  const getLocalizedHref = (href: string) => {
    return href.startsWith('/') ? `/${locale}${href}` : href;
  };

  const items = menu.map((link) => {
    try {
      const href = getLocalizedHref(link.href);
      // Check if current page matches this link or any of its children
      // Handle both with and without locale prefix for robust matching
      const isActive =
        pathname === href ||
        pathname === link.href ||
        link.children?.some(
          (child) => pathname === getLocalizedHref(child.href) || pathname === child.href,
        );

      const menuItems = link.children?.map((item: any) => {
        const childHref = getLocalizedHref(item.href);
        const isChildActive = pathname === childHref || pathname === item.href;

        return (
          <ErrorBoundary key={item.id} fallback={<Menu.Item disabled>Menu Item Error</Menu.Item>}>
            <Menu.Item
              component={Link}
              href={childHref}
              style={
                isChildActive
                  ? {
                      backgroundColor: 'var(--mantine-color-blue-filled)',
                      color: 'var(--mantine-color-white)',
                    }
                  : undefined
              }
            >
              {item.name}
            </Menu.Item>
          </ErrorBoundary>
        );
      });

      if (menuItems) {
        return (
          <ErrorBoundary key={link.id} fallback={<Skeleton height={36} width={80} radius="sm" />}>
            <Menu
              closeDelay={150}
              openDelay={0}
              position="bottom-start"
              shadow="md"
              transitionProps={{ exitDuration: 0 }}
              trigger="hover"
              width={200}
              withinPortal
              zIndex={100}
            >
              <Menu.Target>
                <Anchor
                  className={clsx(
                    'block px-3 py-2 rounded-sm text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-500 text-white dark:bg-blue-600'
                      : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-600',
                  )}
                  component="button"
                  data-active={isActive || undefined}
                  underline="never"
                >
                  <Center style={{ gap: '4px' }}>
                    <span>{link.name}</span>
                    <IconChevronDown size={14} />
                  </Center>
                </Anchor>
              </Menu.Target>
              <Menu.Dropdown>{menuItems}</Menu.Dropdown>
            </Menu>
          </ErrorBoundary>
        );
      }

      return (
        <ErrorBoundary key={link.id} fallback={<Skeleton height={36} width={80} radius="sm" />}>
          <Anchor
            className={clsx(
              'block px-3 py-2 rounded-sm text-sm font-medium transition-colors',
              isActive
                ? 'bg-blue-500 text-white dark:bg-blue-600'
                : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-600',
            )}
            component={Link}
            data-active={isActive || undefined}
            href={href}
            underline="never"
          >
            {link.name}
          </Anchor>
        </ErrorBoundary>
      );
    } catch (error) {
      console.error('Navigation item error:', error);
      setInternalError('Failed to render navigation item');
      return <Skeleton key={link.id} height={36} width={80} radius="sm" />;
    }
  });

  return (
    <ErrorBoundary fallback={<NavigationError error="Navigation failed to render" />}>
      <Group gap={5} visibleFrom="lg">
        {items}
      </Group>
    </ErrorBoundary>
  );
};

export default Navigation;
