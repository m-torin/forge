'use client';

import { useWorkflow } from '@/contexts/workflow-context';
import {
  ActionIcon,
  AppShell,
  Badge,
  Burger,
  Divider,
  Group,
  NavLink,
  ScrollArea,
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
  IconCircleCheck,
  IconCpu,
  IconExternalLink,
  IconHome,
  IconPhoto,
  IconRobot,
  IconSettings,
  IconStack2,
  IconUpload,
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { HeaderSearch } from '@repo/design-system/components/search';

interface AppShellLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  {
    description: 'Overview of all workflows and system status',
    href: '/',
    icon: IconHome,
    label: 'Dashboard',
  },
];

// Static workflow navigation items based on your existing workflow definitions
const workflowNavItems = [
  {
    description: 'Minimal test workflow to verify the system is working',
    href: '/workflows/test-simple',
    icon: IconCircleCheck,
    label: 'Test Simple',
  },
  {
    description: 'Essential workflow pattern with validation and batch processing',
    href: '/workflows/basic',
    icon: IconStack2,
    label: 'Basic Workflow',
  },
  {
    description: 'Comprehensive feature demonstration',
    href: '/workflows/kitchen-sink',
    icon: IconSettings,
    label: 'Kitchen Sink',
  },
  {
    description: 'Image processing and optimization',
    href: '/workflows/image-processing',
    icon: IconPhoto,
    label: 'Image Processing',
  },
  {
    description: 'AI-powered product classification',
    href: '/workflows/product-classification',
    icon: IconRobot,
    label: 'Product Classification',
  },
  {
    description: 'Import and process external media',
    href: '/workflows/import-external-media',
    icon: IconUpload,
    label: 'Import Media',
  },
  {
    description: 'Generate product description pages',
    href: '/workflows/chart-pdps',
    icon: IconPhoto,
    label: 'Chart PDPs',
  },
  {
    description: 'Generate site map charts',
    href: '/workflows/chart-sitemaps',
    icon: IconSettings,
    label: 'Chart Sitemaps',
  },
  {
    description: 'Generate marketing copy',
    href: '/workflows/gen-copy',
    icon: IconSettings,
    label: 'Generate Copy',
  },
  {
    description: 'Map taxonomy terms',
    href: '/workflows/map-taxterm',
    icon: IconSettings,
    label: 'Map Tax Terms',
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
  const { sseConnected } = useWorkflow();

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
              <Tooltip label={sseConnected ? 'SSE Connected' : 'SSE Disconnected'}>
                <Badge color={sseConnected ? 'green' : 'red'} size="sm" variant="dot">
                  SSE
                </Badge>
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

        <AppShell.Navbar>
          <ScrollArea h="100%" p="md">
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
                Workflows
              </Text>

              {workflowNavItems.map((workflow) => (
                <NavLink
                  key={workflow.href}
                  href={workflow.href as any}
                  component={Link}
                  description={workflow.description}
                  leftSection={<workflow.icon size={18} />}
                  onClick={() => opened && toggle()}
                  active={pathname === workflow.href}
                  label={workflow.label}
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
          </ScrollArea>
        </AppShell.Navbar>

        <AppShell.Main>{children}</AppShell.Main>
      </AppShell>
    </>
  );
}
