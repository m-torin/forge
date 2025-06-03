import { BackButton } from './back-button';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof BackButton> = {
  argTypes: {
    children: {
      control: 'text',
      description: 'The button text content',
    },
    href: {
      control: 'text',
      description: 'The URL to navigate to when clicked',
    },
    mb: {
      control: 'text',
      description: 'Margin bottom spacing',
    },
    variant: {
      control: 'select',
      description: 'The button variant style',
      options: ['subtle', 'light', 'outline', 'filled'],
    },
  },
  component: BackButton,
  parameters: {
    docs: {
      description: {
        component:
          'A reusable back button component with consistent styling and icon. Used across apps for navigation.',
      },
    },
    layout: 'centered',
  },
  title: 'UIX/UI/BackButton',
};

export default meta;
type Story = StoryObj<typeof BackButton>;

export const Default: Story = {
  args: {
    children: 'Back',
    href: '/dashboard',
  },
};

export const CustomText: Story = {
  args: {
    children: 'Back to Settings',
    href: '/settings',
  },
};

export const DifferentVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <BackButton href="/dashboard" variant="subtle">
        Back (Subtle)
      </BackButton>
      <BackButton href="/dashboard" variant="light">
        Back (Light)
      </BackButton>
      <BackButton href="/dashboard" variant="outline">
        Back (Outline)
      </BackButton>
      <BackButton href="/dashboard" variant="filled">
        Back (Filled)
      </BackButton>
    </div>
  ),
};

export const WithCustomIcon: Story = {
  args: {
    children: 'Back to Home',
    href: '/home',
  },
  parameters: {
    docs: {
      description: {
        story: 'Back button uses the built-in arrow icon (leftSection cannot be customized).',
      },
    },
  },
};

export const AccountNavigation: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <BackButton href="/account">Back to Account</BackButton>
      <BackButton href="/settings">Back to Settings</BackButton>
      <BackButton href="/dashboard">Back to Dashboard</BackButton>
    </div>
  ),
};

export const AdminNavigation: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <BackButton href="/admin">Back to Admin</BackButton>
      <BackButton href="/admin/users">Back to Users</BackButton>
      <BackButton href="/admin/settings">Back to Admin Settings</BackButton>
    </div>
  ),
};
