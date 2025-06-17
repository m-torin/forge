'use client';

import {
  ActionIcon,
  Anchor,
  AppShell,
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
  UnstyledButton,
  useMantineColorScheme,
} from '@mantine/core';
import { useHotkeys } from '@mantine/hooks';
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
  IconUsers,
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, useState } from 'react';

import { ErrorBoundary } from '../components/error-boundary';
import { PerformanceMonitor } from '../components/performance-monitor';
import { SearchModal } from './components/search-modal';

const navigationItems = [
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
    items: [
      { href: '/workflows/product-classification', label: 'Product Classification' },
      { href: '/workflows/batch-processing', label: 'Batch Processing' },
      { href: '/workflows/schedules', label: 'Schedules' },
      { href: '/workflows/integrations', label: 'Integrations' },
      { href: '/workflows/configuration', label: 'Configuration' },
    ],
    label: 'Workflows',
  },
  {
    color: 'teal',
    href: '/pim3',
    icon: IconPackage,
    items: [
      { href: '/pim3', label: 'Dashboard' },
      { href: '/pim3/products', label: 'Products' },
      { href: '/pim3/categories', label: 'Categories' },
      { href: '/pim3/taxonomies', label: 'Taxonomies' },
      { href: '/pim3/brands', label: 'Brands' },
      { href: '/pim3/collections', label: 'Collections' },
      { href: '/pim3/assets', label: 'Assets' },
      { href: '/pim3/barcodes', label: 'Barcodes' },
      { href: '/pim3/scan-history', label: 'Scan History' },
      { href: '/pim3/registries', label: 'Registries' },
      { href: '/pim3/reviews', label: 'Reviews' },
      { href: '/pim3/media', label: 'Media' },
    ],
    label: 'PIM3',
  },
  {
    color: 'orange',
    href: '/cms',
    icon: IconFileText,
    items: [
      { href: '/cms/editor', label: 'Content Editor' },
      { href: '/cms/media', label: 'Media Library' },
    ],
    label: 'CMS',
  },
  {
    color: 'cyan',
    href: '/guests',
    icon: IconUsers,
    items: [
      { href: '/guests', label: 'Users' },
      { href: '/guests/organizations', label: 'Organizations' },
    ],
    label: 'Guests',
  },
];

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

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [searchOpened, setSearchOpened] = useState(false);

  // Keyboard shortcuts
  useHotkeys([
    ['mod+K', () => setSearchOpened(true)],
    ['/', () => setSearchOpened(true)],
  ]);

  // Generate breadcrumbs
  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ href: '/', title: 'Home' }];

    let currentPath = '';
    paths.forEach((path) => {
      currentPath += `/${path}`;
      const navItem = [...navigationItems, ...adminItems].find((item) => item.href === currentPath);
      breadcrumbs.push({
        href: currentPath,
        title: navItem?.label || path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' '),
      });
    });

    return breadcrumbs;
  };

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
        padding="md"
      >
        <AppShell.Header
          styles={{ header: { borderBottom: '1px solid var(--mantine-color-gray-2)' } }}
        >
          <Group h="100%" justify="space-between" px="md">
            <Group>
              <Title order={3}>Backstage</Title>

              <Group gap={0}>
                {navigationItems.map((item) => (
                  <Menu
                    key={item.label}
                    transitionProps={{ exitDuration: 0 }}
                    withinPortal
                    trigger="hover"
                  >
                    <Menu.Target>
                      <UnstyledButton
                        onClick={() => router.push(item.href as any)}
                        styles={{
                          root: {
                            '&:hover': {
                              backgroundColor: 'var(--mantine-color-gray-0)',
                            },
                            backgroundColor:
                              pathname === item.href ||
                              (item.href !== '/' && pathname.startsWith(item.href))
                                ? `var(--mantine-color-${item.color}-0)`
                                : undefined,
                            borderRadius: rem(4),
                            color:
                              pathname === item.href ||
                              (item.href !== '/' && pathname.startsWith(item.href))
                                ? `var(--mantine-color-${item.color}-6)`
                                : undefined,
                          },
                        }}
                        px="md"
                        py="sm"
                      >
                        <Group gap="xs">
                          <item.icon size={16} />
                          <Text fw={500} size="sm">
                            {item.label}
                          </Text>
                          {item.items && <IconChevronDown size={14} />}
                        </Group>
                      </UnstyledButton>
                    </Menu.Target>
                    {item.items && (
                      <Menu.Dropdown>
                        {item.items.map((subItem) => (
                          <Menu.Item
                            key={subItem.href}
                            leftSection={<div style={{ width: rem(14) }} />}
                            onClick={() => router.push(subItem.href as any)}
                          >
                            {subItem.label}
                          </Menu.Item>
                        ))}
                      </Menu.Dropdown>
                    )}
                  </Menu>
                ))}
              </Group>
            </Group>

            <Group>
              <Tooltip label="Search (⌘K)">
                <ActionIcon
                  color="gray"
                  onClick={() => setSearchOpened(true)}
                  size="lg"
                  variant="subtle"
                >
                  <IconSearch size={20} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Notifications">
                <ActionIcon color="gray" size="lg" variant="subtle">
                  <IconBell size={20} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label={colorScheme === 'dark' ? 'Light mode' : 'Dark mode'}>
                <ActionIcon
                  color="gray"
                  onClick={() => toggleColorScheme()}
                  size="lg"
                  variant="subtle"
                >
                  {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
                </ActionIcon>
              </Tooltip>

              <Divider orientation="vertical" />

              <Menu transitionProps={{ exitDuration: 0 }} withinPortal trigger="hover">
                <Menu.Target>
                  <Button
                    color="gray"
                    rightSection={<IconChevronDown size={14} />}
                    variant="subtle"
                  >
                    Admin
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
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
                    onClick={() => router.push('/' as any)}
                  >
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
        </AppShell.Header>

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
                {getBreadcrumbs().map((item: any, index) => (
                  <Anchor
                    key={item.href}
                    href={item.href as any}
                    component={Link}
                    style={{
                      fontWeight: index === getBreadcrumbs().length - 1 ? 500 : undefined,
                      textDecoration: 'none',
                    }}
                    c={index === getBreadcrumbs().length - 1 ? 'dimmed' : undefined}
                    size="sm"
                  >
                    {item.title}
                  </Anchor>
                ))}
              </Breadcrumbs>
            )}
            {children}
          </Box>
        </AppShell.Main>

        <SearchModal onClose={() => setSearchOpened(false)} opened={searchOpened} />
      </AppShell>
    </ErrorBoundary>
  );
}
