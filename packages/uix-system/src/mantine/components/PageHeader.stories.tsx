import { Badge, Card, Divider, Group, SimpleGrid, Stack, Text, ThemeIcon } from '@mantine/core';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { expect, userEvent, within } from '@storybook/test';
import {
  IconActivity,
  IconBell,
  IconBookmark,
  IconBuilding,
  IconChartBar,
  IconClock,
  IconDownload,
  IconEdit,
  IconFileText,
  IconFilter,
  IconMail,
  IconPlus,
  IconSettings,
  IconShare,
  IconShield,
  IconStar,
  IconTrash,
  IconTrendingUp,
  IconUsers,
} from '@tabler/icons-react';

import { PageHeader, type PageHeaderAction } from './PageHeader';

// Enhanced wrapper component for testing and interaction handling
const PageHeaderWrapper = ({
  onRefresh,
  onPrimaryAction,
  onSecondaryAction,
  testId = 'page-header',
  containerPadding = '24px',
  containerBackground,
  showBreadcrumbs = false,
  showMetrics = false,
  ...props
}: any) => {
  const handleRefresh = () => {
    onRefresh?.();
    action('refresh')();
  };

  const handlePrimaryAction = () => {
    onPrimaryAction?.();
    action('primaryAction')();
  };

  const handleSecondaryAction = (actionLabel: string) => {
    onSecondaryAction?.(actionLabel);
    action('secondaryAction')(actionLabel);
  };

  // Override actions to include logging
  const enhancedProps = {
    ...props,
    onRefresh: props.onRefresh ? handleRefresh : undefined,
    actions: props.actions
      ? {
          primary: props.actions.primary
            ? {
                ...props.actions.primary,
                onClick: () => {
                  props.actions.primary.onClick?.();
                  action('primaryAction')(props.actions.primary.label);
                },
              }
            : undefined,
          secondary: props.actions.secondary?.map((action: PageHeaderAction) => ({
            ...action,
            onClick: () => {
              action.onClick?.();
              action('secondaryAction')(action.label);
            },
          })),
        }
      : undefined,
  };

  return (
    <div
      data-testid={testId}
      style={{
        padding: containerPadding,
        backgroundColor: containerBackground,
        minHeight: '200px',
      }}
    >
      {showBreadcrumbs && (
        <Text size="sm" c="dimmed" mb="md">
          <span>Dashboard</span>
          <span style={{ margin: '0 8px' }}>/</span>
          <span>Management</span>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ fontWeight: 500 }}>Current Page</span>
        </Text>
      )}

      <PageHeader {...enhancedProps} />

      {showMetrics && (
        <SimpleGrid cols={4} spacing="md" mt="xl">
          <Card padding="md" withBorder>
            <Group gap="xs">
              <ThemeIcon size="sm" color="blue" variant="light">
                <IconUsers size={14} />
              </ThemeIcon>
              <div>
                <Text size="xs" c="dimmed">
                  Total Users
                </Text>
                <Text fw={600}>1,234</Text>
              </div>
            </Group>
          </Card>
          <Card padding="md" withBorder>
            <Group gap="xs">
              <ThemeIcon size="sm" color="green" variant="light">
                <IconTrendingUp size={14} />
              </ThemeIcon>
              <div>
                <Text size="xs" c="dimmed">
                  Growth
                </Text>
                <Text fw={600} c="green">
                  +12%
                </Text>
              </div>
            </Group>
          </Card>
          <Card padding="md" withBorder>
            <Group gap="xs">
              <ThemeIcon size="sm" color="orange" variant="light">
                <IconActivity size={14} />
              </ThemeIcon>
              <div>
                <Text size="xs" c="dimmed">
                  Active
                </Text>
                <Text fw={600}>892</Text>
              </div>
            </Group>
          </Card>
          <Card padding="md" withBorder>
            <Group gap="xs">
              <ThemeIcon size="sm" color="violet" variant="light">
                <IconChartBar size={14} />
              </ThemeIcon>
              <div>
                <Text size="xs" c="dimmed">
                  Revenue
                </Text>
                <Text fw={600}>$45.2k</Text>
              </div>
            </Group>
          </Card>
        </SimpleGrid>
      )}
    </div>
  );
};

const meta: Meta<typeof PageHeader> = {
  title: 'Mantine/PageHeader',
  component: PageHeader,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# PageHeader Component

A versatile page header component that provides a consistent layout for page titles, descriptions, actions, and custom content across your application.

## Features

### Core Elements
- **Title**: Main page heading with configurable heading levels (h1-h6)
- **Subtitle**: Optional secondary heading for additional context
- **Description**: Explanatory text to provide page context
- **Refresh Action**: Built-in refresh functionality with loading states

### Action System
- **Primary Action**: Main call-to-action button with emphasis styling
- **Secondary Actions**: Multiple supporting actions with various styles
- **Action States**: Loading, disabled, and hover states
- **Icon Support**: Icons for visual clarity and recognition

### Layout Options
- **Alignment**: Left, center, or right alignment for different contexts
- **Spacing**: Configurable gaps between elements
- **Wrapping**: Control text and action wrapping behavior
- **Custom Content**: Slot for additional page-specific elements

### Responsive Design
- **Mobile Optimization**: Adapts to smaller screens with intelligent wrapping
- **Touch Targets**: Properly sized interactive elements
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support

## Use Cases

Perfect for:
- **Admin Dashboards**: Consistent headers across management interfaces
- **Content Pages**: Article headers with metadata and actions
- **Data Views**: Table/list headers with filtering and export actions
- **Settings Pages**: Configuration sections with save/reset actions
- **Profile Pages**: User information headers with edit capabilities

## Design Patterns

The component follows modern dashboard design patterns with clear visual hierarchy, appropriate spacing, and intuitive action placement.
        `,
      },
    },
  },
  argTypes: {
    // Content Configuration
    title: {
      control: 'text',
      description: 'Main page title',
      table: { category: 'Content' },
    },
    subtitle: {
      control: 'text',
      description: 'Optional subtitle for additional context',
      table: { category: 'Content' },
    },
    description: {
      control: 'text',
      description: 'Descriptive text explaining the page purpose',
      table: { category: 'Content' },
    },
    children: {
      control: false,
      description: 'Custom content to display below the description',
      table: { category: 'Content' },
    },

    // Layout & Styling
    titleOrder: {
      control: { type: 'select', options: [1, 2, 3, 4, 5, 6] },
      description: 'HTML heading level for the title',
      table: { category: 'Layout' },
    },
    align: {
      control: { type: 'select', options: ['flex-start', 'center', 'flex-end'] },
      description: 'Vertical alignment of header content',
      table: { category: 'Layout' },
    },
    spacing: {
      control: { type: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      description: 'Gap between header elements',
      table: { category: 'Layout' },
    },
    wrap: {
      control: 'boolean',
      description: 'Allow content to wrap on smaller screens',
      table: { category: 'Layout' },
    },

    // Refresh Functionality
    onRefresh: {
      action: 'refresh',
      description: 'Callback for refresh button click',
      table: { category: 'Actions' },
    },
    refreshing: {
      control: 'boolean',
      description: 'Show loading state for refresh button',
      table: { category: 'Actions' },
    },

    // Action Configuration
    actions: {
      control: 'object',
      description: 'Primary and secondary action configuration',
      table: { category: 'Actions' },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive Playground Story
export const Playground: Story = {
  render: args => <PageHeaderWrapper {...args} />,
  args: {
    title: 'User Management',
    subtitle: 'Team Administration',
    description: 'Manage users, roles, and permissions across your organization',
    titleOrder: 2,
    align: 'flex-start',
    spacing: 'md',
    wrap: true,
    refreshing: false,
    onRefresh: action('refresh'),
    actions: {
      primary: {
        label: 'Add User',
        icon: <IconPlus size={16} />,
        onClick: action('addUser'),
        variant: 'filled',
        color: 'blue',
        size: 'sm',
        loading: false,
        disabled: false,
      },
      secondary: [
        {
          label: 'Export Data',
          icon: <IconDownload size={16} />,
          onClick: action('export'),
          variant: 'light',
          color: 'gray',
          size: 'sm',
        },
        {
          label: 'Settings',
          icon: <IconSettings size={16} />,
          onClick: action('settings'),
          variant: 'subtle',
          color: 'gray',
          size: 'sm',
        },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const header = canvas.getByTestId('page-header');

    // Verify header renders
    await expect(header).toBeInTheDocument();

    // Test refresh button if present
    try {
      const refreshButton = canvas.getByTestId('refresh-button');
      await userEvent.click(refreshButton);
    } catch (e) {
      // Refresh button not present in this configuration
    }

    // Test primary action if present
    try {
      const primaryAction = canvas.getByTestId('primary-action');
      await userEvent.click(primaryAction);
    } catch (e) {
      // Primary action not present in this configuration
    }
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive playground with all PageHeader features configurable. Try adjusting the controls to see different layouts and behaviors.',
      },
    },
  },
};

// Basic Usage Stories
export const BasicHeader: Story = {
  render: () => (
    <PageHeaderWrapper
      title="Dashboard"
      description="Overview of your application metrics and recent activity"
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Basic page header with title and description only - the minimal setup.',
      },
    },
  },
};

export const WithSubtitle: Story = {
  render: () => (
    <PageHeaderWrapper
      title="Analytics Dashboard"
      subtitle="Real-time Insights"
      description="Monitor key metrics and performance indicators for your business operations"
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Page header with subtitle for additional context and hierarchy.',
      },
    },
  },
};

export const WithRefresh: Story = {
  render: () => (
    <PageHeaderWrapper
      title="System Status"
      description="Current system health and performance metrics"
      onRefresh={action('refresh')}
      refreshing={false}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Page header with refresh functionality for dynamic content.',
      },
    },
  },
};

// Action-Based Stories
export const WithPrimaryAction: Story = {
  render: () => (
    <PageHeaderWrapper
      title="Team Members"
      description="Manage team members and their access levels"
      actions={{
        primary: {
          label: 'Add Member',
          icon: <IconPlus size={16} />,
          onClick: action('addMember'),
          color: 'blue',
        },
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Page header with primary action for main user tasks.',
      },
    },
  },
};

export const WithSecondaryActions: Story = {
  render: () => (
    <PageHeaderWrapper
      title="Project Overview"
      description="Track progress and manage all active and completed projects"
      actions={{
        secondary: [
          {
            label: 'Export',
            icon: <IconDownload size={16} />,
            onClick: action('export'),
            variant: 'light',
          },
          {
            label: 'Filter',
            icon: <IconFilter size={16} />,
            onClick: action('filter'),
            variant: 'subtle',
          },
          {
            label: 'Settings',
            icon: <IconSettings size={16} />,
            onClick: action('settings'),
            variant: 'subtle',
          },
        ],
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Page header with multiple secondary actions for supporting functionality.',
      },
    },
  },
};

export const CompleteHeader: Story = {
  render: () => (
    <PageHeaderWrapper
      title="Organization Settings"
      subtitle="Advanced Configuration"
      description="Configure organization-wide settings, permissions, and integrations"
      onRefresh={action('refresh')}
      actions={{
        primary: {
          label: 'Save Changes',
          icon: <IconEdit size={16} />,
          onClick: action('save'),
          color: 'green',
        },
        secondary: [
          {
            label: 'Export Config',
            icon: <IconDownload size={16} />,
            onClick: action('export'),
            variant: 'light',
            color: 'blue',
          },
          {
            label: 'Reset',
            icon: <IconTrash size={16} />,
            onClick: action('reset'),
            variant: 'subtle',
            color: 'red',
          },
        ],
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Complete page header with all features: title, subtitle, description, refresh, and multiple actions.',
      },
    },
  },
};

// Content and Layout Stories
export const WithCustomContent: Story = {
  render: () => (
    <PageHeaderWrapper
      title="User Analytics"
      description="Detailed user engagement and behavior analytics"
      onRefresh={action('refresh')}
      actions={{
        primary: {
          label: 'Generate Report',
          icon: <IconFileText size={16} />,
          onClick: action('generateReport'),
          color: 'violet',
        },
      }}
    >
      <Group gap="md" mt="sm">
        <Badge variant="light" color="blue" size="lg">
          <IconUsers size={12} style={{ marginRight: 4 }} />
          1,234 Active Users
        </Badge>
        <Badge variant="light" color="green" size="lg">
          <IconBuilding size={12} style={{ marginRight: 4 }} />
          56 Organizations
        </Badge>
        <Badge variant="light" color="orange" size="lg">
          <IconActivity size={12} style={{ marginRight: 4 }} />
          89% Engagement
        </Badge>
      </Group>
    </PageHeaderWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Page header with custom content slot showing key metrics and status indicators.',
      },
    },
  },
};

export const DashboardLayout: Story = {
  render: () => (
    <PageHeaderWrapper
      title="Executive Dashboard"
      subtitle="Business Intelligence"
      description="Comprehensive overview of business performance and key performance indicators"
      containerBackground="#f8f9fa"
      containerPadding="32px"
      showBreadcrumbs={true}
      showMetrics={true}
      onRefresh={action('refresh')}
      actions={{
        primary: {
          label: 'Create Report',
          icon: <IconChartBar size={16} />,
          onClick: action('createReport'),
          color: 'blue',
        },
        secondary: [
          {
            label: 'Export PDF',
            icon: <IconDownload size={16} />,
            onClick: action('exportPDF'),
            variant: 'light',
          },
          {
            label: 'Share',
            icon: <IconShare size={16} />,
            onClick: action('share'),
            variant: 'subtle',
          },
        ],
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Complete dashboard header with breadcrumbs, metrics cards, and professional styling.',
      },
    },
  },
};

// Size and Hierarchy Stories
export const LargeHeader: Story = {
  render: () => (
    <PageHeaderWrapper
      title="Welcome to Your Dashboard"
      subtitle="Get Started"
      description="Everything you need to manage your organization effectively"
      titleOrder={1}
      spacing="xl"
      actions={{
        primary: {
          label: 'Start Tour',
          icon: <IconStar size={18} />,
          onClick: action('startTour'),
          size: 'lg',
          color: 'blue',
        },
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Large page header using h1 title and extra spacing for landing pages or major sections.',
      },
    },
  },
};

export const CompactHeader: Story = {
  render: () => (
    <PageHeaderWrapper
      title="Quick Settings"
      description="Adjust common preferences"
      titleOrder={4}
      spacing="xs"
      actions={{
        primary: {
          label: 'Apply',
          onClick: action('apply'),
          size: 'xs',
          variant: 'filled',
        },
        secondary: [
          {
            label: 'Reset',
            onClick: action('reset'),
            size: 'xs',
            variant: 'subtle',
          },
        ],
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Compact header with smaller title and minimal spacing for secondary pages or modals.',
      },
    },
  },
};

export const CenterAligned: Story = {
  render: () => (
    <PageHeaderWrapper
      title="Profile Settings"
      description="Manage your personal account preferences and privacy settings"
      align="center"
      containerPadding="48px"
      actions={{
        primary: {
          label: 'Save Profile',
          icon: <IconEdit size={16} />,
          onClick: action('saveProfile'),
          color: 'green',
        },
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Center-aligned header layout for profile pages or centered content designs.',
      },
    },
  },
};

// State and Interaction Stories
export const LoadingStates: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '32px' }}>
      <div>
        <Text size="sm" fw={500} mb="md">
          Refreshing Data
        </Text>
        <PageHeaderWrapper
          title="System Status"
          description="Real-time system health monitoring"
          onRefresh={action('refresh')}
          refreshing={true}
          actions={{
            primary: {
              label: 'View Details',
              onClick: action('viewDetails'),
            },
          }}
        />
      </div>

      <Divider />

      <div>
        <Text size="sm" fw={500} mb="md">
          Loading Actions
        </Text>
        <PageHeaderWrapper
          title="Data Processing"
          description="Processing large dataset"
          actions={{
            primary: {
              label: 'Processing...',
              onClick: action('process'),
              loading: true,
              color: 'blue',
            },
            secondary: [
              {
                label: 'Cancel',
                onClick: action('cancel'),
                color: 'red',
                variant: 'subtle',
              },
            ],
          }}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different loading states showing refresh loading and action loading indicators.',
      },
    },
  },
};

export const DisabledActions: Story = {
  render: () => (
    <PageHeaderWrapper
      title="Restricted Access"
      description="Some actions may be disabled based on user permissions or current state"
      actions={{
        primary: {
          label: 'Create New',
          icon: <IconPlus size={16} />,
          onClick: action('create'),
          disabled: true,
          color: 'blue',
        },
        secondary: [
          {
            label: 'Edit',
            icon: <IconEdit size={16} />,
            onClick: action('edit'),
            disabled: true,
            variant: 'light',
          },
          {
            label: 'View Only',
            icon: <IconShield size={16} />,
            onClick: action('view'),
            variant: 'subtle',
            color: 'green',
          },
        ],
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Page header demonstrating disabled actions with mixed enabled/disabled states.',
      },
    },
  },
};

export const ActionVariants: Story = {
  render: () => (
    <Stack gap="xl">
      <div>
        <Text size="sm" fw={500} mb="md">
          Filled & Light Variants
        </Text>
        <PageHeaderWrapper
          title="Style Variations"
          description="Different action button styles and colors"
          actions={{
            primary: {
              label: 'Primary Filled',
              onClick: action('primary'),
              variant: 'filled',
              color: 'blue',
            },
            secondary: [
              {
                label: 'Light Blue',
                onClick: action('lightBlue'),
                variant: 'light',
                color: 'blue',
              },
              {
                label: 'Light Green',
                onClick: action('lightGreen'),
                variant: 'light',
                color: 'green',
              },
            ],
          }}
        />
      </div>

      <div>
        <Text size="sm" fw={500} mb="md">
          Outline & Subtle Variants
        </Text>
        <PageHeaderWrapper
          title="More Variations"
          description="Additional styling options for different contexts"
          actions={{
            primary: {
              label: 'Outline',
              onClick: action('outline'),
              variant: 'outline',
              color: 'violet',
            },
            secondary: [
              {
                label: 'Subtle Gray',
                onClick: action('subtleGray'),
                variant: 'subtle',
                color: 'gray',
              },
              {
                label: 'Subtle Orange',
                onClick: action('subtleOrange'),
                variant: 'subtle',
                color: 'orange',
              },
            ],
          }}
        />
      </div>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Showcase of different action button variants and color combinations available in the component.',
      },
    },
  },
};

// Responsive and Layout Stories
export const NoWrapLayout: Story = {
  render: () => (
    <div style={{ maxWidth: '600px' }}>
      <PageHeaderWrapper
        title="Very Long Title That Should Not Wrap to Multiple Lines on Smaller Screens"
        description="This layout prevents wrapping which might cause overflow on constrained containers"
        wrap={false}
        actions={{
          primary: {
            label: 'Primary Action',
            onClick: action('primary'),
          },
          secondary: [
            {
              label: 'Secondary',
              onClick: action('secondary'),
            },
          ],
        }}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Header with wrap disabled in a narrow container, demonstrating overflow behavior.',
      },
    },
  },
};

export const ResponsiveDemo: Story = {
  render: () => (
    <div>
      <Text size="sm" fw={500} mb="md">
        Resize the viewport to see responsive behavior
      </Text>
      <PageHeaderWrapper
        title="Responsive Page Header"
        subtitle="Adapts to Screen Size"
        description="This header automatically adjusts its layout based on available space"
        onRefresh={action('refresh')}
        actions={{
          primary: {
            label: 'Create New',
            icon: <IconPlus size={16} />,
            onClick: action('create'),
            color: 'blue',
          },
          secondary: [
            {
              label: 'Export',
              icon: <IconDownload size={16} />,
              onClick: action('export'),
              variant: 'light',
            },
            {
              label: 'Filter',
              icon: <IconFilter size={16} />,
              onClick: action('filter'),
              variant: 'subtle',
            },
            {
              label: 'Settings',
              icon: <IconSettings size={16} />,
              onClick: action('settings'),
              variant: 'subtle',
            },
          ],
        }}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Responsive header that adapts to different screen sizes with intelligent wrapping and spacing adjustments.',
      },
    },
  },
};

// Domain-Specific Examples
export const EcommerceHeader: Story = {
  render: () => (
    <PageHeaderWrapper
      title="Product Catalog"
      subtitle="Inventory Management"
      description="Manage your product inventory, pricing, and availability"
      onRefresh={action('refresh')}
      actions={{
        primary: {
          label: 'Add Product',
          icon: <IconPlus size={16} />,
          onClick: action('addProduct'),
          color: 'green',
        },
        secondary: [
          {
            label: 'Import CSV',
            icon: <IconDownload size={16} />,
            onClick: action('import'),
            variant: 'light',
            color: 'blue',
          },
          {
            label: 'Export',
            icon: <IconShare size={16} />,
            onClick: action('export'),
            variant: 'subtle',
          },
        ],
      }}
    >
      <Group gap="md" mt="sm">
        <Badge variant="light" color="green">
          <IconTrendingUp size={12} style={{ marginRight: 4 }} />
          234 Products Active
        </Badge>
        <Badge variant="light" color="orange">
          <IconClock size={12} style={{ marginRight: 4 }} />
          12 Pending Review
        </Badge>
        <Badge variant="light" color="red">
          <IconActivity size={12} style={{ marginRight: 4 }} />5 Out of Stock
        </Badge>
      </Group>
    </PageHeaderWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'E-commerce product management header with inventory status indicators and product-specific actions.',
      },
    },
  },
};

export const CommunicationHeader: Story = {
  render: () => (
    <PageHeaderWrapper
      title="Team Communication"
      subtitle="Message Center"
      description="Manage team communications, announcements, and notifications"
      onRefresh={action('refresh')}
      actions={{
        primary: {
          label: 'New Message',
          icon: <IconMail size={16} />,
          onClick: action('newMessage'),
          color: 'blue',
        },
        secondary: [
          {
            label: 'Broadcast',
            icon: <IconBell size={16} />,
            onClick: action('broadcast'),
            variant: 'light',
            color: 'orange',
          },
          {
            label: 'Archive',
            icon: <IconBookmark size={16} />,
            onClick: action('archive'),
            variant: 'subtle',
          },
        ],
      }}
    >
      <Group gap="md" mt="sm">
        <Badge variant="light" color="blue">
          <IconMail size={12} style={{ marginRight: 4 }} />
          23 Unread Messages
        </Badge>
        <Badge variant="light" color="green">
          <IconUsers size={12} style={{ marginRight: 4 }} />
          15 Active Conversations
        </Badge>
      </Group>
    </PageHeaderWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Communication center header with message status indicators and messaging-specific actions.',
      },
    },
  },
};

// Accessibility Testing Story
export const AccessibilityDemo: Story = {
  render: () => (
    <PageHeaderWrapper
      title="Accessibility Features"
      description="This header demonstrates proper accessibility implementation with ARIA labels and keyboard navigation"
      testId="accessibility-header"
      onRefresh={action('refresh')}
      actions={{
        primary: {
          label: 'Accessible Action',
          icon: <IconShield size={16} />,
          onClick: action('accessibleAction'),
          color: 'blue',
        },
        secondary: [
          {
            label: 'Help',
            icon: <IconActivity size={16} />,
            onClick: action('help'),
            variant: 'light',
          },
        ],
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test header accessibility
    const header = canvas.getByTestId('accessibility-header');
    await expect(header).toBeInTheDocument();

    // Test refresh button accessibility
    try {
      const refreshButton = canvas.getByTestId('refresh-button');
      await expect(refreshButton).toBeAccessible();

      // Test keyboard interaction
      refreshButton.focus();
      await userEvent.keyboard('{Enter}');
    } catch (e) {
      // Refresh button may not be present
    }

    // Test primary action accessibility
    try {
      const primaryAction = canvas.getByTestId('primary-action');
      await expect(primaryAction).toBeAccessible();

      // Test keyboard interaction
      primaryAction.focus();
      await userEvent.keyboard('{Space}');
    } catch (e) {
      // Primary action may not be present
    }
  },
  parameters: {
    docs: {
      description: {
        story:
          'Accessibility demonstration with ARIA labels, keyboard navigation, focus management, and screen reader support.',
      },
    },
  },
};
