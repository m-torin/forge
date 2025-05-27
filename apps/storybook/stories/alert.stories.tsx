import type { Meta, StoryObj } from '@storybook/react';
import { IconAlertCircle, IconInfoCircle } from '@tabler/icons-react';
import { Alert, Title, Text } from '@mantine/core';

/**
 * Displays a callout for user attention using Mantine.
 */
const meta = {
  title: 'ui/Alert',
  component: Alert,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      options: ['light', 'filled', 'outline', 'transparent', 'white'],
      control: { type: 'select' },
    },
    color: {
      options: ['blue', 'red', 'green', 'yellow', 'orange', 'gray'],
      control: { type: 'select' },
    },
    radius: {
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      control: { type: 'select' },
    },
  },
  args: {
    variant: 'light',
    color: 'blue',
    radius: 'md',
  },
  render: (args) => (
    <Alert {...args} icon={<IconInfoCircle />} title="Heads up!">
      You can add components to your app using the cli.
    </Alert>
  ),
} satisfies Meta<typeof Alert>;

export default meta;

type Story = StoryObj<typeof meta>;
/**
 * The default form of the alert.
 */
export const Default: Story = {
  args: {
    variant: 'light',
    color: 'blue',
  },
};

/**
 * Use the red color alert to indicate errors or destructive actions.
 */
export const Error: Story = {
  render: (args) => (
    <Alert {...args} icon={<IconAlertCircle />} title="Error">
      Your session has expired. Please log in again.
    </Alert>
  ),
  args: {
    variant: 'filled',
    color: 'red',
  },
};

/**
 * Success alert variant.
 */
export const Success: Story = {
  render: (args) => (
    <Alert {...args} title="Success">
      Your changes have been saved successfully.
    </Alert>
  ),
  args: {
    variant: 'light',
    color: 'green',
  },
};

/**
 * Warning alert variant.
 */
export const Warning: Story = {
  render: (args) => (
    <Alert {...args} title="Warning">
      Please review your input before proceeding.
    </Alert>
  ),
  args: {
    variant: 'light',
    color: 'yellow',
  },
};

/**
 * Alert without icon.
 */
export const NoIcon: Story = {
  render: (args) => (
    <Alert {...args} title="Information">
      This is an informational message without an icon.
    </Alert>
  ),
  args: {
    variant: 'outline',
    color: 'blue',
  },
};

/**
 * Alert with custom content.
 */
export const CustomContent: Story = {
  render: (args) => (
    <Alert {...args} icon={<IconInfoCircle />}>
      <Title order={5} mb="xs">
        Custom Alert Title
      </Title>
      <Text size="sm" mb="xs">
        This alert demonstrates custom content with multiple paragraphs.
      </Text>
      <Text size="sm" c="dimmed">
        You can include any React components inside the alert body.
      </Text>
    </Alert>
  ),
  args: {
    variant: 'light',
    color: 'blue',
  },
};
