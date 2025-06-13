'use client';

import { Anchor, Center, Group, Menu } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type FC } from 'react';

import { TCollection, TNavigationItem } from '@/types';

interface NavigationProps {
  featuredCollection?: TCollection;
  locale?: string;
  menu: TNavigationItem[];
}

const Navigation: FC<NavigationProps> = ({
  featuredCollection: _featuredCollection,
  locale = 'en',
  menu,
}) => {
  const pathname = usePathname();

  const getLocalizedHref = (href: string) => {
    return href.startsWith('/') ? `/${locale}${href}` : href;
  };

  const items = menu.map((link) => {
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
        <Menu.Item
          key={item.id}
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
      );
    });

    if (menuItems) {
      return (
        <Menu
          key={link.id}
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
      );
    }

    return (
      <Anchor
        key={link.id}
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
    );
  });

  return (
    <Group gap={5} visibleFrom="lg">
      {items}
    </Group>
  );
};

export default Navigation;
