import type { Meta, StoryObj } from '@storybook/react';
import { IconLoader2, IconMail } from '@tabler/icons-react';
import { Button } from '@mantine/core';

/**
 * Displays a button or a component that looks like a button using Mantine.
 */
const meta = {
  title: 'ui/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
    },
    variant: {
      control: 'select',
      options: ['filled', 'light', 'outline', 'subtle', 'white', 'default', 'gradient'],
    },
    color: {
      control: 'select',
      options: [
        'blue',
        'red',
        'green',
        'yellow',
        'orange',
        'teal',
        'cyan',
        'grape',
        'pink',
        'gray',
      ],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
  },
  parameters: {
    layout: 'centered',
  },
  args: {
    variant: 'filled',
    size: 'md',
    children: 'Button',
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the button, used for primary actions and commands.
 */
export const Default: Story = {
  args: {
    variant: 'filled',
    color: 'blue',
  },
};

/**
 * Use the `outline` button to reduce emphasis on secondary actions, such as
 * canceling or dismissing a dialog.
 */
export const Outline: Story = {
  args: {
    variant: 'outline',
    color: 'blue',
  },
};

/**
 * Use the `subtle` button is minimalistic and subtle, for less intrusive
 * actions.
 */
export const Subtle: Story = {
  args: {
    variant: 'subtle',
    color: 'gray',
  },
};

/**
 * Use the `light` button to call for less emphasized actions, styled to
 * complement the primary button while being less conspicuous.
 */
export const Light: Story = {
  args: {
    variant: 'light',
    color: 'blue',
  },
};

/**
 * Use the red colored button to indicate errors, alerts, or the need for
 * immediate attention.
 */
export const Destructive: Story = {
  args: {
    variant: 'filled',
    color: 'red',
  },
};

/**
 * Use the transparent button to reduce emphasis on tertiary actions, such as
 * hyperlink or navigation, providing a text-only interactive element.
 */
export const Transparent: Story = {
  args: {
    variant: 'transparent',
    color: 'blue',
  },
};

/**
 * Add the `loading` prop to a button to prevent interactions and add a
 * loading indicator, such as a spinner, to signify an in-progress action.
 */
export const Loading: Story = {
  args: {
    variant: 'outline',
    color: 'blue',
    loading: true,
    children: 'Loading...',
  },
};

/**
 * Add an icon element to a button to enhance visual communication and
 * providing additional context for the action.
 */
export const WithIcon: Story = {
  render: (args) => (
    <Button {...args} leftSection={<IconMail size={16} />}>
      Login with Email
    </Button>
  ),
  args: {
    variant: 'light',
    color: 'blue',
  },
};

/**
 * Use the `sm` size for a smaller button, suitable for interfaces needing
 * compact elements without sacrificing usability.
 */
export const Small: Story = {
  args: {
    size: 'sm',
    variant: 'filled',
    color: 'blue',
  },
};

/**
 * Use the `lg` size for a larger button, offering better visibility and
 * easier interaction for users.
 */
export const Large: Story = {
  args: {
    size: 'lg',
    variant: 'filled',
    color: 'blue',
  },
};

/**
 * Use a compact button for a button with only an icon.
 */
export const IconOnly: Story = {
  render: (args) => (
    <Button {...args} size="md" px="xs">
      <IconMail size={18} />
    </Button>
  ),
  args: {
    variant: 'light',
    color: 'blue',
  },
};

/**
 * Add the `disabled` prop to prevent interactions with the button.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
