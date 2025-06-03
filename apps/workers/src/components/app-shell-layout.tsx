'use client';

import {
  ActionIcon,
  AppShell,
  Badge,
  Burger,
  Divider,
  Group,
  NavLink,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Notifications } from '@mantine/notifications';
import {
  IconBrandGithub,
  IconCpu,
  IconExternalLink,
  IconHome,
  IconSettings,
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { HeaderSearch } from '@repo/design-system/components/search';
import { UserButton } from '@repo/design-system/uix';

interface AppShellLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  {
    description: 'Trigger workflows and monitor execution',
    href: '/',
    icon: IconHome,
    label: 'Dashboard',
  },
];

const externalLinks = [
  {
    href: 'https://upstash.com/docs/qstash/workflows',
    icon: IconExternalLink,
    label: 'Workflow Docs',
  },
  {
    href: 'https://console.upstash.com/qstash',
    icon: IconSettings,
    label: 'QStash Console',
  },
  {
    href: 'https://github.com/upstash/workflow-js',
    icon: IconBrandGithub,
    label: 'GitHub Repo',
  },
];

export function AppShellLayout({ children }: AppShellLayoutProps) {
  const [opened, { toggle }] = useDisclosure();
  const pathname = usePathname();

  return (
    <>
      <Notifications position="top-right" />
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 250,
          breakpoint: 'sm',
          collapsed: { mobile: !opened },
        }}
        padding="md"
      >
        <AppShell.Header>
          <Group h="100%" justify="space-between" px="md">
            <Group>
              <Burger hiddenFrom="sm" onClick={toggle} opened={opened} size="sm" />
              <Group gap="xs">
                <ThemeIcon gradient={{ from: 'blue', to: 'cyan' }} size="lg" variant="gradient">
                  <IconCpu size={20} />
                </ThemeIcon>
                <Title order={3}>Workers</Title>
                <Badge color="blue" size="sm" variant="light">
                  Workflow Engine
                </Badge>
              </Group>
            </Group>

            <Group gap="md">
              <HeaderSearch
                onSelect={(item) => {
                  // Handle navigation based on search result
                  if (item.url) {
                    window.location.href = item.url;
                  }
                }}
                placeholder="Search workflows, jobs..."
                size="sm"
              />
              <Tooltip label="QStash Console">
                <ActionIcon
                  href="https://console.upstash.com/qstash"
                  color="gray"
                  component="a"
                  target="_blank"
                  variant="subtle"
                >
                  <IconSettings size={18} />
                </ActionIcon>
              </Tooltip>
              <UserButton />
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="md">
          <Stack gap="xs">
            <Text c="dimmed" fw={700} mb="xs" size="xs" tt="uppercase">
              Navigation
            </Text>

            {navigation.map((item) => (
              <NavLink
                key={item.href}
                href={item.href as any}
                component={Link}
                description={item.description}
                leftSection={<item.icon size={18} />}
                onClick={() => opened && toggle()}
                active={pathname === item.href}
                label={item.label}
              />
            ))}

            <Divider my="md" />

            <Text c="dimmed" fw={700} mb="xs" size="xs" tt="uppercase">
              Resources
            </Text>

            {externalLinks.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                component="a"
                leftSection={<link.icon size={18} />}
                rightSection={<IconExternalLink size={14} />}
                label={link.label}
                target="_blank"
              />
            ))}

            <Divider my="md" />

            <Text c="dimmed" size="xs">
              Background workflow execution engine
            </Text>
          </Stack>
        </AppShell.Navbar>

        <AppShell.Main>{children}</AppShell.Main>
      </AppShell>
    </>
  );
}
