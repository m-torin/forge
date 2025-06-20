'use client';

import {
  ActionIcon,
  Anchor,
  AppShell,
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Divider,
  Group,
  Menu,
  rem,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
  useMantineColorScheme,
} from '@mantine/core';
import { useHotkeys } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconBell,
  IconChevronDown,
  IconFileText,
  IconFlag,
  IconHome,
  IconLogout,
  IconMoon,
  IconPackage,
  IconRocket,
  IconSearch,
  IconSettings,
  IconShield,
  IconSun,
  IconUser,
  IconUsers,
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, useState, useMemo, Suspense, useEffect } from 'react';

import { useAuth } from '@repo/auth/client/next';

import { ErrorBoundary } from '@/components/pim3/error-boundary';
import { PerformanceMonitor } from '@/components/pim3/performance-monitor';
import { GlobalSearch } from './components/global-search';
import { LoadingState } from '@/components/pim3/loading-state';
import { ModelNav } from './pim3/components/navigation/ModelNav';
import { KeyboardShortcutsHelp } from './components/accessible-actions';

// Generate navigation items with dynamic workflows
function getNavigationItems(workflows: Array<{ id: string; name: string; category: string }>) {
  // Create workflow items from API data using workflow IDs
  const workflowItems = workflows
    .map((workflow) => ({
      href: `/workflows/${workflow.id}`,
      label: workflow.name,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return [
    {
      color: 'blue',
      href: '/',
      icon: IconHome,
      label: 'Dashboard',
    },
    {
      color: 'violet',
      href: '/workflows',
      icon: IconRocket,
      items: workflowItems,
      label: 'Workflows',
    },
    {
      color: 'teal',
      href: '/pim3',
      icon: IconPackage,
      items: [
        { href: '/pim3/assets', label: 'Assets' },
        { href: '/pim3/barcodes', label: 'Barcodes' },
        { href: '/pim3/brands', label: 'Brands' },
        { href: '/pim3/categories', label: 'Categories' },
        { href: '/pim3/collections', label: 'Collections' },
        { href: '/pim3/media', label: 'Media' },
        { href: '/pim3/products', label: 'Products' },
        { href: '/pim3/registries', label: 'Registries' },
        { href: '/pim3/reviews', label: 'Reviews' },
        { href: '/pim3/scan-history', label: 'Scan History' },
        { href: '/pim3/taxonomies', label: 'Taxonomies' },
      ].sort((a, b) => a.label.localeCompare(b.label)),
      label: 'PIM3',
    },
    {
      color: 'orange',
      href: '/cms',
      icon: IconFileText,
      items: [{ href: '/cms/media', label: 'Media Library' }],
      label: 'CMS',
    },
    {
      color: 'cyan',
      href: '/guests',
      icon: IconUsers,
      items: [
        { href: '/guests/people', label: 'People' },
        { href: '/guests/organizations', label: 'Organizations' },
        { href: '/guests/api-keys', label: 'API Keys' },
      ],
      label: 'Guests',
    },
  ];
}

const adminItems = [
  {
    color: 'pink',
    href: '/feature-flags',
    icon: IconFlag,
    label: 'Feature Flags',
  },
  {
    color: 'red',
    href: '/admin/security',
    icon: IconShield,
    label: 'Security Dashboard',
  },
  {
    color: 'gray',
    href: '/settings',
    icon: IconSettings,
    items: [
      { href: '/settings', label: 'General' },
      { href: '/settings/security', label: 'Security' },
    ],
    label: 'Settings',
  },
];

// Custom hook to fetch workflows dynamically
function useWorkflows() {
  const [workflows, setWorkflows] = useState<Array<{ id: string; name: string; category: string }>>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWorkflows() {
      try {
        const response = await fetch('/api/workflows/registry');
        const data = await response.json();
        setWorkflows(data.workflows || []);
      } catch (error) {
        console.error('Failed to fetch workflows:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchWorkflows();
  }, []);

  return { workflows, loading };
}

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [searchOpened, setSearchOpened] = useState(false);
  const { workflows, loading: workflowsLoading } = useWorkflows();

  // Auth state
  const { data: session, loading: authLoading } = useAuth();

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/sign-out', { method: 'POST' });
      notifications.show({
        title: 'Logged out',
        message: 'You have been logged out successfully',
        color: 'blue',
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to log out',
        color: 'red',
      });
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return <div>Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!session?.user) {
    router.push('/login');
    return null;
  }

  // Generate navigation items with dynamic workflows
  const navigationItems = useMemo(() => {
    return getNavigationItems(workflows);
  }, [workflows]);

  // Keyboard shortcuts for global search
  useHotkeys([
    ['mod+K', () => setSearchOpened(true)],
    [
      '/',
      (event) => {
        // Only trigger if not typing in an input
        if (
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement
        ) {
          return;
        }
        event.preventDefault();
        setSearchOpened(true);
      },
    ],
  ]);

  // Generate breadcrumbs - memoized for performance
  const breadcrumbs = useMemo(() => {
    const paths = pathname.split('/').filter(Boolean);
    const crumbs = [{ href: '/', title: 'Home' }];

    let currentPath = '';
    paths.forEach((path) => {
      currentPath += `/${path}`;
      const navItem = [...navigationItems, ...adminItems].find((item) => item.href === currentPath);
      crumbs.push({
        href: currentPath,
        title: navItem?.label || path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' '),
      });
    });

    return crumbs;
  }, [pathname, navigationItems]);

  // Check if we should show sidebar (for PIM3 routes)
  const shouldShowSidebar = pathname.startsWith('/pim3');

  return (
    <ErrorBoundary>
      <PerformanceMonitor />
      <AppShell
        styles={{
          main: {
            background:
              colorScheme === 'dark'
                ? 'var(--mantine-color-dark-8)'
                : 'var(--mantine-color-gray-0)',
          },
        }}
        header={{ height: 60 }}
        navbar={
          shouldShowSidebar
            ? {
                width: { base: 280 },
                breakpoint: 'md',
              }
            : undefined
        }
        padding="md"
      >
        <AppShell.Header
          styles={{ header: { borderBottom: '1px solid var(--mantine-color-gray-2)' } }}
        >
          <Group h="100%" justify="space-between" px="md">
            <Group>
              <Title order={3}>Backstage</Title>

              <Group gap="xs">
                {navigationItems.map((item) => {
                  const isActive =
                    pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                  // Items with dropdown
                  if (item.items) {
                    return (
                      <Menu
                        key={item.label}
                        trigger="click-hover"
                        transitionProps={{ exitDuration: 0 }}
                        withinPortal
                        position="bottom-start"
                      >
                        <Menu.Target>
                          <Button
                            variant={isActive ? 'light' : 'subtle'}
                            color={item.color}
                            leftSection={<item.icon size={16} />}
                            rightSection={<IconChevronDown size={14} />}
                            size="sm"
                          >
                            {item.label}
                          </Button>
                        </Menu.Target>
                        <Menu.Dropdown>
                          {workflowsLoading && item.label === 'Workflows' ? (
                            <Menu.Item disabled>Loading workflows...</Menu.Item>
                          ) : (
                            item.items?.map((subItem) => (
                              <Menu.Item
                                key={subItem.href}
                                onClick={() => router.push(subItem.href as any)}
                              >
                                {subItem.label}
                              </Menu.Item>
                            ))
                          )}
                        </Menu.Dropdown>
                      </Menu>
                    );
                  }

                  // Simple items without dropdown
                  return (
                    <Button
                      key={item.label}
                      variant={isActive ? 'light' : 'subtle'}
                      color={item.color}
                      leftSection={<item.icon size={16} />}
                      onClick={() => router.push(item.href as any)}
                      size="sm"
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </Group>
            </Group>

            <Group>
              <Tooltip label="Global Search (⌘K or /)">
                <ActionIcon
                  color="gray"
                  onClick={() => setSearchOpened(true)}
                  size="lg"
                  variant="subtle"
                  aria-label="Open global search"
                >
                  <IconSearch size={20} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Notifications">
                <ActionIcon color="gray" size="lg" variant="subtle" aria-label="View notifications">
                  <IconBell size={20} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label={colorScheme === 'dark' ? 'Light mode' : 'Dark mode'}>
                <ActionIcon
                  color="gray"
                  onClick={() => toggleColorScheme()}
                  size="lg"
                  variant="subtle"
                  aria-label={`Switch to ${colorScheme === 'dark' ? 'light' : 'dark'} mode`}
                >
                  {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
                </ActionIcon>
              </Tooltip>

              <KeyboardShortcutsHelp />

              <Divider orientation="vertical" />

              <Menu transitionProps={{ exitDuration: 0 }} withinPortal trigger="hover">
                <Menu.Target>
                  <Button
                    color="gray"
                    leftSection={
                      <Avatar size="xs" radius="xl">
                        <IconUser size={14} />
                      </Avatar>
                    }
                    rightSection={<IconChevronDown size={14} />}
                    variant="subtle"
                  >
                    <div style={{ textAlign: 'left' }}>
                      <Text size="sm" fw={500}>
                        {session?.user?.name || 'Admin'}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {session?.user?.role || 'Administrator'}
                      </Text>
                    </div>
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>
                    <Group gap="xs">
                      <Avatar size="sm" radius="xl">
                        <IconUser size={16} />
                      </Avatar>
                      <div>
                        <Text size="sm" fw={500}>
                          {session?.user?.name || 'Admin'}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {session?.user?.email}
                        </Text>
                      </div>
                    </Group>
                  </Menu.Label>
                  <Menu.Divider />
                  <Menu.Label>Administration</Menu.Label>
                  {adminItems.map((item) =>
                    item.items ? (
                      <Menu key={item.label} position="right-start" withinPortal trigger="hover">
                        <Menu.Target>
                          <Menu.Item
                            leftSection={
                              <ThemeIcon color={item.color} size="sm" variant="light">
                                <item.icon size={14} />
                              </ThemeIcon>
                            }
                            rightSection={
                              <IconChevronDown style={{ transform: 'rotate(-90deg)' }} size={14} />
                            }
                          >
                            {item.label}
                          </Menu.Item>
                        </Menu.Target>
                        <Menu.Dropdown>
                          {item.items.map((subItem) => (
                            <Menu.Item
                              key={subItem.href}
                              onClick={() => router.push(subItem.href as any)}
                            >
                              {subItem.label}
                            </Menu.Item>
                          ))}
                        </Menu.Dropdown>
                      </Menu>
                    ) : (
                      <Menu.Item
                        key={item.label}
                        leftSection={
                          <ThemeIcon color={item.color} size="sm" variant="light">
                            <item.icon size={14} />
                          </ThemeIcon>
                        }
                        onClick={() => router.push(item.href as any)}
                      >
                        {item.label}
                      </Menu.Item>
                    ),
                  )}
                  <Menu.Divider />
                  <Menu.Item
                    color="red"
                    leftSection={<IconLogout size={14} />}
                    onClick={handleLogout}
                  >
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
        </AppShell.Header>

        {shouldShowSidebar && (
          <AppShell.Navbar>
            <ModelNav />
          </AppShell.Navbar>
        )}

        <AppShell.Main>
          <Box className="page-transition">
            {pathname !== '/' && (
              <Breadcrumbs
                separator="›"
                styles={{
                  root: {
                    fontSize: rem(14),
                  },
                  separator: {
                    marginLeft: rem(6),
                    marginRight: rem(6),
                  },
                }}
                mb="md"
              >
                {breadcrumbs.map((item: any, index) => (
                  <Anchor
                    key={item.href}
                    href={item.href as any}
                    component={Link}
                    style={{
                      fontWeight: index === breadcrumbs.length - 1 ? 500 : undefined,
                      textDecoration: 'none',
                    }}
                    c={index === breadcrumbs.length - 1 ? 'dimmed' : undefined}
                    size="sm"
                  >
                    {item.title}
                  </Anchor>
                ))}
              </Breadcrumbs>
            )}
            <Suspense fallback={<LoadingState />}>{children}</Suspense>
          </Box>
        </AppShell.Main>

        <GlobalSearch opened={searchOpened} onClose={() => setSearchOpened(false)} />
      </AppShell>
    </ErrorBoundary>
  );
}
