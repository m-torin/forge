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
  IconChartLine,
  IconCpu,
  IconExternalLink,
  IconHome,
  IconSettings,
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AppShellLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  {
    description: 'Examples & triggers',
    href: '/',
    icon: IconHome,
    label: 'Home',
  },
  {
    description: 'Execution logs',
    href: '/monitoring',
    icon: IconChartLine,
    label: 'Monitoring',
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
                <Title order={3}>Upstash Workflows</Title>
                <Badge color="blue" size="sm" variant="light">
                  Demo
                </Badge>
              </Group>
            </Group>

            <Group gap="xs">
              <Tooltip label="View on GitHub">
                <ActionIcon
                  href="https://github.com/upstash/workflow-js"
                  color="gray"
                  component="a"
                  target="_blank"
                  variant="subtle"
                >
                  <IconBrandGithub size={18} />
                </ActionIcon>
              </Tooltip>
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
              Production-ready workflow patterns using Upstash QStash.
            </Text>
          </Stack>
        </AppShell.Navbar>

        <AppShell.Main>{children}</AppShell.Main>
      </AppShell>
    </>
  );
}
