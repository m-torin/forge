import { Badge, Group } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/nextjs';
import {
  IconBuilding,
  IconDownload,
  IconEdit,
  IconPlus,
  IconSettings,
  IconTrash,
  IconUsers,
} from '@tabler/icons-react';
import { PageHeader } from './PageHeader';

const meta: Meta<typeof PageHeader> = {
  title: 'Components/PageHeader',
  component: PageHeader,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'desktop',
    },
  },
  tags: ['autodocs'],
  argTypes: {
    titleOrder: {
      control: 'select',
      options: [1, 2, 3, 4, 5, 6],
    },
    align: {
      control: 'select',
      options: ['flex-start', 'center', 'flex-end'],
    },
    spacing: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    refreshing: { control: 'boolean' },
    wrap: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock handlers
const mockRefresh = () => {
  // console.log('Refresh clicked');
};
const mockPrimaryAction = () => {
  // console.log('Primary action clicked');
};
const mockSecondaryAction = () => {
  // console.log('Secondary action clicked');
};

export const Basic: Story = {
  args: {
    title: 'User Management',
    description: 'Manage users, roles, and permissions across your organization',
  },
};

export const WithSubtitle: Story = {
  args: {
    title: 'Analytics Dashboard',
    subtitle: 'Real-time insights',
    description: 'Monitor key metrics and performance indicators for your business',
  },
};

export const WithRefresh: Story = {
  args: {
    title: 'Data Overview',
    description: 'Current system status and metrics',
    onRefresh: mockRefresh,
  },
};

export const WithPrimaryAction: Story = {
  args: {
    title: 'Team Members',
    description: 'Manage team members and their access levels',
    actions: {
      primary: {
        label: 'Add Member',
        icon: <IconPlus size={16} />,
        onClick: mockPrimaryAction,
      },
    },
  },
};

export const WithSecondaryActions: Story = {
  args: {
    title: 'Projects',
    description: 'Overview of all active and completed projects',
    actions: {
      secondary: [
        {
          label: 'Export',
          icon: <IconDownload size={16} />,
          onClick: mockSecondaryAction,
          variant: 'subtle',
        },
        {
          label: 'Settings',
          icon: <IconSettings size={16} />,
          onClick: mockSecondaryAction,
          variant: 'subtle',
        },
      ],
    },
  },
};

export const FullyLoaded: Story = {
  args: {
    title: 'Organization Settings',
    subtitle: 'Advanced Configuration',
    description: 'Configure organization-wide settings, permissions, and integrations',
    onRefresh: mockRefresh,
    actions: {
      primary: {
        label: 'Save Changes',
        icon: <IconEdit size={16} />,
        onClick: mockPrimaryAction,
        color: 'blue',
      },
      secondary: [
        {
          label: 'Export Config',
          icon: <IconDownload size={16} />,
          onClick: mockSecondaryAction,
          variant: 'light',
        },
        {
          label: 'Reset',
          icon: <IconTrash size={16} />,
          onClick: mockSecondaryAction,
          variant: 'subtle',
          color: 'red',
        },
      ],
    },
  },
};

export const WithCustomContent: Story = {
  args: {
    title: 'User Analytics',
    description: 'Detailed user engagement and behavior analytics',
    onRefresh: mockRefresh,
    actions: {
      primary: {
        label: 'Generate Report',
        onClick: mockPrimaryAction,
      },
    },
    children: (
      <Group gap="md" mt="sm">
        <Badge variant="light" color="blue">
          <IconUsers size={12} style={{ marginRight: 4 }} />
          1,234 Active Users
        </Badge>
        <Badge variant="light" color="green">
          <IconBuilding size={12} style={{ marginRight: 4 }} />
          56 Organizations
        </Badge>
      </Group>
    ),
  },
};

export const LoadingState: Story = {
  args: {
    title: 'System Status',
    description: 'Real-time system health and performance metrics',
    onRefresh: mockRefresh,
    refreshing: true,
    actions: {
      primary: {
        label: 'Run Diagnostics',
        onClick: mockPrimaryAction,
        loading: true,
      },
    },
  },
};

export const DifferentSizes: Story = {
  args: {
    title: 'Large Header',
    subtitle: 'Important Section',
    description: 'This header uses a larger title for emphasis',
    titleOrder: 1,
    spacing: 'xl',
    actions: {
      primary: {
        label: 'Primary Action',
        onClick: mockPrimaryAction,
        size: 'lg',
      },
    },
  },
};

export const CenterAligned: Story = {
  args: {
    title: 'Centered Layout',
    description: 'This header is center-aligned for a different visual approach',
    align: 'center',
    actions: {
      primary: {
        label: 'Get Started',
        onClick: mockPrimaryAction,
      },
    },
  },
};

export const DisabledActions: Story = {
  args: {
    title: 'Restricted Access',
    description: 'Some actions may be disabled based on user permissions',
    actions: {
      primary: {
        label: 'Create New',
        onClick: mockPrimaryAction,
        disabled: true,
      },
      secondary: [
        {
          label: 'Edit',
          onClick: mockSecondaryAction,
          disabled: true,
        },
        {
          label: 'View Only',
          onClick: mockSecondaryAction,
        },
      ],
    },
  },
};

export const NoWrap: Story = {
  args: {
    title: 'Long Title That Should Not Wrap to Multiple Lines',
    description: 'This layout prevents wrapping which might cause overflow on smaller screens',
    wrap: false,
    actions: {
      primary: {
        label: 'Action',
        onClick: mockPrimaryAction,
      },
      secondary: [
        {
          label: 'Secondary',
          onClick: mockSecondaryAction,
        },
      ],
    },
  },
};
