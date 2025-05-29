import type { Meta, StoryObj } from '@storybook/nextjs';
import {
  IconWaveSquare,
  IconRosetteDiscountCheck,
  IconBell,
  IconBook,
  IconRobot,
  IconChevronRight,
  IconSelector,
  IconCommand,
  IconCreditCard,
  IconFolder,
  IconPlayerTrackNext,
  IconFrame,
  IconLayoutRows,
  IconLogout,
  IconMap,
  IconDots,
  IconChartPie,
  IconPlus,
  IconSettings2,
  IconSparkles,
  IconTerminal,
  IconTrash,
} from '@tabler/icons-react';
import {
  AppShell,
  NavLink,
  ScrollArea,
  Group,
  ActionIcon,
  Menu,
  Avatar,
  Text,
  Box,
  Divider,
  Badge,
  Breadcrumbs,
  Anchor,
  Burger,
  Stack,
  UnstyledButton,
  Collapse,
  Paper,
} from '@mantine/core';
import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';

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
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
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
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <UnstyledButton
                p="sm"
                style={{
                  borderRadius: 'var(--mantine-radius-md)',
                  '&:hover': { backgroundColor: 'var(--mantine-color-gray-1)' },
                }}
              >
                <Group justify="space-between">
                  <Group>
                    <Box
                      bg="blue"
                      c="white"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 'var(--mantine-radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <activeTeam.logo size={16} />
                    </Box>
                    <Box>
                      <Text size="sm" fw={600}>
                        {activeTeam.name}
                      </Text>
                      <Text size="xs" c="dimmed">
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
                  rightSection={
                    <Text size="xs" c="dimmed">
                      ⌘{index + 1}
                    </Text>
                  }
                  onClick={() => setActiveTeam(team)}
                >
                  {team.name}
                </Menu.Item>
              ))}
              <Menu.Divider />
              <Menu.Item leftSection={<IconPlus size={16} />}>Add team</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </AppShell.Section>

        <AppShell.Section grow component={ScrollArea} mt="md">
          <Stack gap="xs">
            <Text size="xs" tt="uppercase" fw={600} c="dimmed" mb="xs">
              Platform
            </Text>
            {data.navMain.map((item) => (
              <Box key={item.title}>
                <NavLink
                  label={item.title}
                  leftSection={<item.icon size={18} />}
                  rightSection={
                    <IconChevronRight
                      size={14}
                      style={{
                        transform: expandedItems.includes(item.title) ? 'rotate(90deg)' : 'none',
                        transition: 'transform 200ms ease',
                      }}
                    />
                  }
                  onClick={() => toggleExpanded(item.title)}
                  active={item.isActive}
                />
                <Collapse in={expandedItems.includes(item.title)}>
                  <Stack gap={0} ml="lg">
                    {item.items?.map((subItem) => (
                      <NavLink key={subItem.title} label={subItem.title} href={subItem.url} />
                    ))}
                  </Stack>
                </Collapse>
              </Box>
            ))}

            <Divider my="md" />

            <Text size="xs" tt="uppercase" fw={600} c="dimmed" mb="xs">
              Projects
            </Text>
            {data.projects.map((item) => (
              <Group key={item.name} wrap="nowrap">
                <NavLink
                  style={{ flex: 1 }}
                  label={item.name}
                  leftSection={<item.icon size={18} />}
                  href={item.url}
                />
                <Menu shadow="md" width={200}>
                  <Menu.Target>
                    <ActionIcon variant="subtle" size="sm">
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
            <NavLink label="More" leftSection={<IconDots size={18} />} c="dimmed" />
          </Stack>
        </AppShell.Section>

        <AppShell.Section>
          <Divider my="md" />
          <Menu shadow="md" width={250}>
            <Menu.Target>
              <UnstyledButton
                p="sm"
                style={{
                  borderRadius: 'var(--mantine-radius-md)',
                  width: '100%',
                  '&:hover': { backgroundColor: 'var(--mantine-color-gray-1)' },
                }}
              >
                <Group justify="space-between">
                  <Group>
                    <Avatar size="sm" radius="md" src={data.user.avatar}>
                      CN
                    </Avatar>
                    <Box>
                      <Text size="sm" fw={600}>
                        {data.user.name}
                      </Text>
                      <Text size="xs" c="dimmed">
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
                  <Avatar size="md" radius="md" src={data.user.avatar}>
                    CN
                  </Avatar>
                  <Box>
                    <Text size="sm" fw={600}>
                      {data.user.name}
                    </Text>
                    <Text size="xs" c="dimmed">
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
            <Paper shadow="xs" p="md" radius="md" withBorder style={{ aspectRatio: '16/9' }} />
            <Paper shadow="xs" p="md" radius="md" withBorder style={{ aspectRatio: '16/9' }} />
            <Paper shadow="xs" p="md" radius="md" withBorder style={{ aspectRatio: '16/9' }} />
          </Group>
          <Paper shadow="xs" p="md" radius="md" withBorder style={{ minHeight: '60vh' }} />
        </Stack>
      </AppShell.Main>
    </AppShell>
  );
};

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
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
  navMain: [
    {
      title: 'Playground',
      url: '#',
      icon: IconTerminal,
      isActive: true,
      items: [
        {
          title: 'History',
          url: '#',
        },
        {
          title: 'Starred',
          url: '#',
        },
        {
          title: 'Settings',
          url: '#',
        },
      ],
    },
    {
      title: 'Models',
      url: '#',
      icon: IconRobot,
      items: [
        {
          title: 'Genesis',
          url: '#',
        },
        {
          title: 'Explorer',
          url: '#',
        },
        {
          title: 'Quantum',
          url: '#',
        },
      ],
    },
    {
      title: 'Documentation',
      url: '#',
      icon: IconBook,
      items: [
        {
          title: 'Introduction',
          url: '#',
        },
        {
          title: 'Get Started',
          url: '#',
        },
        {
          title: 'Tutorials',
          url: '#',
        },
        {
          title: 'Changelog',
          url: '#',
        },
      ],
    },
    {
      title: 'Settings',
      url: '#',
      icon: IconSettings2,
      items: [
        {
          title: 'General',
          url: '#',
        },
        {
          title: 'Team',
          url: '#',
        },
        {
          title: 'Billing',
          url: '#',
        },
        {
          title: 'Limits',
          url: '#',
        },
      ],
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
};

/**
 * Displays a sidebar navigation with Mantine components.
 */
const meta: Meta<typeof MockSidebar> = {
  title: 'ui/Sidebar',
  component: MockSidebar,
  tags: ['autodocs'],
  argTypes: {},
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof MockSidebar>;

/**
 * The default form of the sidebar using Mantine's AppShell.
 */
export const Base: Story = {
  render: () => <MockSidebar />,
  args: {},
};
