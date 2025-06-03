import {
  ActionIcon,
  Anchor,
  AppShell,
  Avatar,
  Box,
  Breadcrumbs,
  Burger,
  Collapse,
  Divider,
  Group,
  Menu,
  NavLink,
  Paper,
  ScrollArea,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconBell,
  IconBook,
  IconChartPie,
  IconChevronRight,
  IconCommand,
  IconCreditCard,
  IconDots,
  IconFolder,
  IconFrame,
  IconLayoutRows,
  IconLogout,
  IconMap,
  IconPlayerTrackNext,
  IconPlus,
  IconRobot,
  IconRosetteDiscountCheck,
  IconSelector,
  IconSettings2,
  IconSparkles,
  IconTerminal,
  IconTrash,
  IconWaveSquare,
} from '@tabler/icons-react';
import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

// Mock sidebar component for Storybook
const MockSidebar = () => {
  const [opened, { toggle }] = useDisclosure();
  const [activeTeam, setActiveTeam] = useState(data.teams[0]);
  const [expandedItems, setExpandedItems] = useState<string[]>(['Playground']);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title],
    );
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger hiddenFrom="sm" onClick={toggle} opened={opened} size="sm" />
          <Breadcrumbs separator="›">
            <Anchor href="#" size="sm">
              Building Your Application
            </Anchor>
            <Text size="sm">Data Fetching</Text>
          </Breadcrumbs>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section>
          <Menu width={200} shadow="md">
            <Menu.Target>
              <UnstyledButton
                style={{
                  '&:hover': { backgroundColor: 'var(--mantine-color-gray-1)' },
                  borderRadius: 'var(--mantine-radius-md)',
                }}
                p="sm"
              >
                <Group justify="space-between">
                  <Group>
                    <Box
                      style={{
                        width: 32,
                        alignItems: 'center',
                        borderRadius: 'var(--mantine-radius-md)',
                        display: 'flex',
                        height: 32,
                        justifyContent: 'center',
                      }}
                      bg="blue"
                      c="white"
                    >
                      <activeTeam.logo size={16} />
                    </Box>
                    <Box>
                      <Text fw={600} size="sm">
                        {activeTeam.name}
                      </Text>
                      <Text c="dimmed" size="xs">
                        {activeTeam.plan}
                      </Text>
                    </Box>
                  </Group>
                  <IconSelector size={16} />
                </Group>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Teams</Menu.Label>
              {data.teams.map((team, index) => (
                <Menu.Item
                  key={team.name}
                  leftSection={<team.logo size={16} />}
                  onClick={() => setActiveTeam(team)}
                  rightSection={
                    <Text c="dimmed" size="xs">
                      ⌘{index + 1}
                    </Text>
                  }
                >
                  {team.name}
                </Menu.Item>
              ))}
              <Menu.Divider />
              <Menu.Item leftSection={<IconPlus size={16} />}>Add team</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </AppShell.Section>

        <AppShell.Section component={ScrollArea} grow mt="md">
          <Stack gap="xs">
            <Text c="dimmed" fw={600} mb="xs" size="xs" tt="uppercase">
              Platform
            </Text>
            {data.navMain.map((item) => (
              <Box key={item.title}>
                <NavLink
                  leftSection={<item.icon size={18} />}
                  onClick={() => toggleExpanded(item.title)}
                  rightSection={
                    <IconChevronRight
                      style={{
                        transform: expandedItems.includes(item.title) ? 'rotate(90deg)' : 'none',
                        transition: 'transform 200ms ease',
                      }}
                      size={14}
                    />
                  }
                  active={item.isActive}
                  label={item.title}
                />
                <Collapse in={expandedItems.includes(item.title)}>
                  <Stack gap={0} ml="lg">
                    {item.items?.map((subItem) => (
                      <NavLink key={subItem.title} href={subItem.url} label={subItem.title} />
                    ))}
                  </Stack>
                </Collapse>
              </Box>
            ))}

            <Divider my="md" />

            <Text c="dimmed" fw={600} mb="xs" size="xs" tt="uppercase">
              Projects
            </Text>
            {data.projects.map((item) => (
              <Group key={item.name} wrap="nowrap">
                <NavLink
                  href={item.url}
                  leftSection={<item.icon size={18} />}
                  style={{ flex: 1 }}
                  label={item.name}
                />
                <Menu width={200} shadow="md">
                  <Menu.Target>
                    <ActionIcon size="sm" variant="subtle">
                      <IconDots size={16} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item leftSection={<IconFolder size={16} />}>View Project</Menu.Item>
                    <Menu.Item leftSection={<IconPlayerTrackNext size={16} />}>
                      Share Project
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item color="red" leftSection={<IconTrash size={16} />}>
                      Delete Project
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            ))}
            <NavLink leftSection={<IconDots size={18} />} c="dimmed" label="More" />
          </Stack>
        </AppShell.Section>

        <AppShell.Section>
          <Divider my="md" />
          <Menu width={250} shadow="md">
            <Menu.Target>
              <UnstyledButton
                style={{
                  width: '100%',
                  '&:hover': { backgroundColor: 'var(--mantine-color-gray-1)' },
                  borderRadius: 'var(--mantine-radius-md)',
                }}
                p="sm"
              >
                <Group justify="space-between">
                  <Group>
                    <Avatar radius="md" size="sm" src={data.user.avatar}>
                      CN
                    </Avatar>
                    <Box>
                      <Text fw={600} size="sm">
                        {data.user.name}
                      </Text>
                      <Text c="dimmed" size="xs">
                        {data.user.email}
                      </Text>
                    </Box>
                  </Group>
                  <IconSelector size={16} />
                </Group>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <Box p="xs">
                <Group>
                  <Avatar radius="md" size="md" src={data.user.avatar}>
                    CN
                  </Avatar>
                  <Box>
                    <Text fw={600} size="sm">
                      {data.user.name}
                    </Text>
                    <Text c="dimmed" size="xs">
                      {data.user.email}
                    </Text>
                  </Box>
                </Group>
              </Box>
              <Menu.Divider />
              <Menu.Item leftSection={<IconSparkles size={16} />}>Upgrade to Pro</Menu.Item>
              <Menu.Divider />
              <Menu.Item leftSection={<IconRosetteDiscountCheck size={16} />}>Account</Menu.Item>
              <Menu.Item leftSection={<IconCreditCard size={16} />}>Billing</Menu.Item>
              <Menu.Item leftSection={<IconBell size={16} />}>Notifications</Menu.Item>
              <Menu.Divider />
              <Menu.Item color="red" leftSection={<IconLogout size={16} />}>
                Log out
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Stack gap="md">
          <Group grow>
            <Paper shadow="xs" withBorder style={{ aspectRatio: '16/9' }} p="md" radius="md" />
            <Paper shadow="xs" withBorder style={{ aspectRatio: '16/9' }} p="md" radius="md" />
            <Paper shadow="xs" withBorder style={{ aspectRatio: '16/9' }} p="md" radius="md" />
          </Group>
          <Paper shadow="xs" withBorder style={{ minHeight: '60vh' }} p="md" radius="md" />
        </Stack>
      </AppShell.Main>
    </AppShell>
  );
};

const data = {
  navMain: [
    {
      url: '#',
      icon: IconTerminal,
      isActive: true,
      items: [
        {
          url: '#',
          title: 'History',
        },
        {
          url: '#',
          title: 'Starred',
        },
        {
          url: '#',
          title: 'Settings',
        },
      ],
      title: 'Playground',
    },
    {
      url: '#',
      icon: IconRobot,
      items: [
        {
          url: '#',
          title: 'Genesis',
        },
        {
          url: '#',
          title: 'Explorer',
        },
        {
          url: '#',
          title: 'Quantum',
        },
      ],
      title: 'Models',
    },
    {
      url: '#',
      icon: IconBook,
      items: [
        {
          url: '#',
          title: 'Introduction',
        },
        {
          url: '#',
          title: 'Get Started',
        },
        {
          url: '#',
          title: 'Tutorials',
        },
        {
          url: '#',
          title: 'Changelog',
        },
      ],
      title: 'Documentation',
    },
    {
      url: '#',
      icon: IconSettings2,
      items: [
        {
          url: '#',
          title: 'General',
        },
        {
          url: '#',
          title: 'Team',
        },
        {
          url: '#',
          title: 'Billing',
        },
        {
          url: '#',
          title: 'Limits',
        },
      ],
      title: 'Settings',
    },
  ],
  projects: [
    {
      name: 'Design Engineering',
      url: '#',
      icon: IconFrame,
    },
    {
      name: 'Sales & Marketing',
      url: '#',
      icon: IconChartPie,
    },
    {
      name: 'Travel',
      url: '#',
      icon: IconMap,
    },
  ],
  teams: [
    {
      name: 'Acme Inc',
      logo: IconLayoutRows,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: IconWaveSquare,
      plan: 'Startup',
    },
    {
      name: 'Evil Corp.',
      logo: IconCommand,
      plan: 'Free',
    },
  ],
  user: {
    name: 'shadcn',
    avatar: '/avatars/shadcn.jpg',
    email: 'm@example.com',
  },
};

/**
 * Displays a sidebar navigation with Mantine components.
 */
const meta: Meta<typeof MockSidebar> = {
  argTypes: {},
  component: MockSidebar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  title: 'uix/ui/Sidebar',
};

export default meta;

type Story = StoryObj<typeof MockSidebar>;

/**
 * The default form of the sidebar using Mantine's AppShell.
 */
export const Base: Story = {
  args: {},
  render: () => <MockSidebar />,
};
