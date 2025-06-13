'use client';

import { Container, Tabs } from '@mantine/core';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type FC } from 'react';

import classes from './TabNavigation.module.css';

interface TabNavigationProps {
  locale?: string;
}

const tabs = [
  { href: '/', label: 'Home', value: 'home' },
  { href: '/brands', label: 'Brands', value: 'brands' },
  { href: '/categories', label: 'Categories', value: 'categories' },
  { href: '/collections', label: 'Collections', value: 'collections' },
  { href: '/tags', label: 'Tags', value: 'tags' },
  { href: '/attributes', label: 'Attributes', value: 'attributes' },
];

const TabNavigation: FC<TabNavigationProps> = ({ locale = 'en' }) => {
  const pathname = usePathname();

  // Determine active tab based on pathname
  const getActiveTab = () => {
    for (const tab of tabs) {
      const localizedHref = `/${locale}${tab.href}`;
      // Check exact match first
      if (pathname === localizedHref || pathname === tab.href) {
        return tab.value;
      }
      // Check if pathname starts with the tab href (for taxonomy types)
      if (pathname.startsWith(localizedHref) || pathname.startsWith(tab.href)) {
        return tab.value;
      }
    }
    return 'home'; // Default to home
  };

  const items = tabs.map((tab) => {
    const href = `/${locale}${tab.href}`;
    return (
      <Tabs.Tab key={tab.value} value={tab.value}>
        <Link href={href} style={{ color: 'inherit', textDecoration: 'none' }}>
          {tab.label}
        </Link>
      </Tabs.Tab>
    );
  });

  return (
    <Container size="md">
      <Tabs
        classNames={{
          list: classes.tabsList,
          root: classes.tabs,
          tab: classes.tab,
        }}
        value={getActiveTab()}
        variant="outline"
        visibleFrom="sm"
      >
        <Tabs.List>{items}</Tabs.List>
      </Tabs>
    </Container>
  );
};

export default TabNavigation;
