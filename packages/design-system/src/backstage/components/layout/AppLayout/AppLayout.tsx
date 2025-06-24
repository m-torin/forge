'use client';

import {
  AppShell,
  Burger,
  Group,
  NavLink,
  ScrollArea,
  Title,
  useMantineColorScheme,
  ActionIcon,
  Tooltip,
  Text,
  Box,
  Divider,
} from '@mantine/core';
import {
  IconSun,
  IconMoon,
  IconHome,
  IconDatabase,
  IconUsers,
  IconChartDots3,
  IconSettings,
  IconLogout,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { PrefetchCrossZoneLinks } from '../PrefetchCrossZoneLinks';
const TypedLink = Link as any;

export interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  appName?: 'main' | 'cms' | 'authmgmt' | 'workflows';
}

const navigationItems = [
  { label: 'Dashboard', href: '/', icon: IconHome, external: true },
  { label: 'CMS + PIM', href: '/cms', icon: IconDatabase, external: true },
  { label: 'Guests & Orgs', href: '/authmgmt', icon: IconUsers, external: true },
  { label: 'Workflows', href: '/workflows', icon: IconChartDots3, external: true },
  { label: 'Settings', href: '/settings', icon: IconSettings },
];

const appConfig = {
  main: { name: 'Dashboard', path: '/', color: 'blue' },
  cms: { name: 'CMS + PIM', path: '/cms', color: 'teal' },
  authmgmt: { name: 'Guests & Orgs', path: '/authmgmt', color: 'orange' },
  workflows: { name: 'Workflows', path: '/workflows', color: 'violet' },
};

export function AppLayout({
  children,
  title = 'Backstage',
  description,
  appName = 'main',
}: AppLayoutProps) {
  const [opened, { toggle }] = useDisclosure();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const pathname = usePathname();

  const currentApp = appConfig[appName];

  // Extract cross-zone links for prefetching
  const crossZoneHrefs = navigationItems.filter((item) => item.external).map((item) => item.href);

  const getActiveState = (href: string) => {
    // For Dashboard link
    if (href === '/') {
      return appName === 'main' && pathname === '/';
    }

    // For main app
    if (appName === 'main') {
      // Don't highlight external app links when in main app
      return (
        pathname.startsWith(href) &&
        !href.startsWith('/cms') &&
        !href.startsWith('/authmgmt') &&
        !href.startsWith('/workflows')
      );
    }

    // For sub-apps, highlight if it's the current app
    return href === currentApp.path;
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 200,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Group gap="xs">
              <Title order={3}>{title}</Title>
              {appName !== 'main' && (
                <>
                  <Text size="lg" c="dimmed">
                    ·
                  </Text>
                  <Text size="sm" fw={500} c={currentApp.color}>
                    {currentApp.name}
                  </Text>
                </>
              )}
            </Group>
          </Group>

          <Group>
            <Tooltip label={`Switch to ${colorScheme === 'dark' ? 'light' : 'dark'} mode`}>
              <ActionIcon
                onClick={() => toggleColorScheme()}
                variant="default"
                size="lg"
                aria-label="Toggle color scheme"
              >
                {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section>
          <Text size="xs" fw={500} c="dimmed" tt="uppercase" mb="xs">
            Navigation
          </Text>
        </AppShell.Section>

        <AppShell.Section grow component={ScrollArea}>
          <Box>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = getActiveState(item.href);

              if (item.external) {
                return (
                  <NavLink
                    key={item.href}
                    component="a"
                    href={item.href}
                    label={item.label}
                    leftSection={<Icon size={20} />}
                    active={isActive}
                    variant="subtle"
                    mb={4}
                  />
                );
              }

              return (
                <NavLink
                  key={item.href}
                  component={TypedLink}
                  href={item.href}
                  label={item.label}
                  leftSection={<Icon size={20} />}
                  active={isActive}
                  variant="subtle"
                  mb={4}
                />
              );
            })}
          </Box>
        </AppShell.Section>

        <AppShell.Section>
          <Divider my="sm" />
          <NavLink
            component="a"
            href="#"
            label="Logout"
            leftSection={<IconLogout size={20} />}
            variant="subtle"
            c="red"
            onClick={(e) => {
              e.preventDefault();
              // Add logout logic here
              console.log('Logout clicked');
            }}
          />
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        {description && (
          <Text c="dimmed" size="sm" mb="md">
            {description}
          </Text>
        )}
        {children}
      </AppShell.Main>

      <PrefetchCrossZoneLinks hrefs={crossZoneHrefs} />
    </AppShell>
  );
}
