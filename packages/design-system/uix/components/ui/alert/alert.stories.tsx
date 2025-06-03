import { Alert, Text, Title } from '@mantine/core';
import { IconAlertCircle, IconInfoCircle } from '@tabler/icons-react';

import type { Meta, StoryObj } from '@storybook/react';

/**
 * Displays a callout for user attention using Mantine.
 */
const meta = {
  args: {
    color: 'blue',
    radius: 'md',
    variant: 'light',
  },
  argTypes: {
    color: {
      control: { type: 'select' },
      options: ['blue', 'red', 'green', 'yellow', 'orange', 'gray'],
    },
    radius: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    variant: {
      control: { type: 'select' },
      options: ['light', 'filled', 'outline', 'transparent', 'white'],
    },
  },
  component: Alert,
  render: (args: any) => (
    <Alert {...args} icon={<IconInfoCircle />} title="Heads up!">
      You can add components to your app using the cli.
    </Alert>
  ),
  tags: ['autodocs'],
  title: 'uix/ui/Alert',
} satisfies Meta<typeof Alert>;

export default meta;

type Story = StoryObj<typeof meta>;
/**
 * The default form of the alert.
 */
export const Default: Story = {
  args: {
    color: 'blue',
    variant: 'light',
  },
};

/**
 * Use the red color alert to indicate errors or destructive actions.
 */
export const Error: Story = {
  args: {
    color: 'red',
    variant: 'filled',
  },
  render: (args: any) => (
    <Alert {...args} icon={<IconAlertCircle />} title="Error">
      Your session has expired. Please log in again.
    </Alert>
  ),
};

/**
 * Success alert variant.
 */
export const Success: Story = {
  args: {
    color: 'green',
    variant: 'light',
  },
  render: (args: any) => (
    <Alert {...args} title="Success">
      Your changes have been saved successfully.
    </Alert>
  ),
};

/**
 * Warning alert variant.
 */
export const Warning: Story = {
  args: {
    color: 'yellow',
    variant: 'light',
  },
  render: (args: any) => (
    <Alert {...args} title="Warning">
      Please review your input before proceeding.
    </Alert>
  ),
};

/**
 * Alert without icon.
 */
export const NoIcon: Story = {
  args: {
    color: 'blue',
    variant: 'outline',
  },
  render: (args: any) => (
    <Alert {...args} title="Information">
      This is an informational message without an icon.
    </Alert>
  ),
};

/**
 * Alert with custom content.
 */
export const CustomContent: Story = {
  args: {
    color: 'blue',
    variant: 'light',
  },
  render: (args: any) => (
    <Alert {...args} icon={<IconInfoCircle />}>
      <Title order={5} mb="xs">
        Custom Alert Title
      </Title>
      <Text mb="xs" size="sm">
        This alert demonstrates custom content with multiple paragraphs.
      </Text>
      <Text c="dimmed" size="sm">
        You can include any React components inside the alert body.
      </Text>
    </Alert>
  ),
};
