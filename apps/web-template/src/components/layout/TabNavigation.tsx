'use client';

import { Container, Tabs, Skeleton, Group, Alert, Text, Stack, Center } from '@mantine/core';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type FC, useState } from 'react';
import { IconAlertTriangle, IconLayoutGrid } from '@tabler/icons-react';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import classes from './TabNavigation.module.css';

interface TabNavigationProps {
  locale?: string;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for TabNavigation
function TabNavigationSkeleton() {
  return (
    <Container size="md">
      <Group gap="md" visibleFrom="sm">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} height={32} width={60 + Math.random() * 40} radius="sm" />
        ))}
      </Group>
    </Container>
  );
}

// Error state for TabNavigation
function TabNavigationError({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <Container size="md">
      <Center py="sm" visibleFrom="sm">
        <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
          <Text size="xs">Tab navigation error</Text>
        </Alert>
      </Center>
    </Container>
  );
}

// Zero state for TabNavigation when no tabs
function TabNavigationEmpty() {
  return (
    <Container size="md">
      <Center py="sm" visibleFrom="sm">
        <Stack align="center" gap={4}>
          <IconLayoutGrid size={16} color="gray" />
          <Text size="xs" c="dimmed">
            No navigation tabs
          </Text>
        </Stack>
      </Center>
    </Container>
  );
}

const tabs = [
  { href: '/', label: 'Home', value: 'home' },
  { href: '/brands', label: 'Brands', value: 'brands' },
  { href: '/categories', label: 'Categories', value: 'categories' },
  { href: '/collections', label: 'Collections', value: 'collections' },
  { href: '/tags', label: 'Tags', value: 'tags' },
  { href: '/attributes', label: 'Attributes', value: 'attributes' },
];

const TabNavigation: FC<TabNavigationProps> = ({ locale = 'en', loading = false, error }) => {
  const pathname = usePathname();
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <TabNavigationSkeleton />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <TabNavigationError error={currentError} onRetry={() => setInternalError(null)} />;
  }

  // Show zero state if no tabs (though unlikely with hardcoded tabs)
  if (!tabs || tabs.length === 0) {
    return <TabNavigationEmpty />;
  }

  // Determine active tab based on pathname
  const getActiveTab = () => {
    try {
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
    } catch (error) {
      console.error('Tab navigation active tab error:', error);
      setInternalError('Failed to determine active tab');
      return 'home';
    }
  };

  const items = tabs.map((tab) => {
    try {
      const href = `/${locale}${tab.href}`;
      return (
        <ErrorBoundary
          key={tab.value}
          fallback={
            <Tabs.Tab value={tab.value} disabled>
              Error
            </Tabs.Tab>
          }
        >
          <Tabs.Tab value={tab.value}>
            <Link href={href} style={{ color: 'inherit', textDecoration: 'none' }}>
              {tab.label}
            </Link>
          </Tabs.Tab>
        </ErrorBoundary>
      );
    } catch (error) {
      console.error('Tab navigation item error:', error);
      setInternalError('Failed to render tab');
      return (
        <Tabs.Tab key={tab.value} value={tab.value} disabled>
          Error
        </Tabs.Tab>
      );
    }
  });

  return (
    <ErrorBoundary fallback={<TabNavigationError error="Tab navigation failed to render" />}>
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
    </ErrorBoundary>
  );
};

export default TabNavigation;
