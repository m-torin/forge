import { TextInput } from '@mantine/core';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  argTypes: {
    disabled: {
      control: 'boolean',
    },
    error: {
      control: 'text',
    },
    radius: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    variant: {
      control: 'select',
      options: ['default', 'filled', 'unstyled'],
    },
    withAsterisk: {
      control: 'boolean',
    },
  },
  component: TextInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Mantine/TextInput',
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    description: 'We will never share your email with anyone else',
    label: 'Email',
    placeholder: 'your@email.com',
  },
};

export const WithError: Story = {
  args: {
    error: 'Invalid email address',
    label: 'Email',
    placeholder: 'your@email.com',
  },
};

export const Required: Story = {
  args: {
    label: 'Email',
    placeholder: 'your@email.com',
    withAsterisk: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    label: 'Email',
    placeholder: 'your@email.com',
  },
};

export const WithIcon: Story = {
  args: {
    label: 'Email',
    leftSection: '@',
    placeholder: 'your@email.com',
  },
};

export const Filled: Story = {
  args: {
    label: 'Email',
    placeholder: 'your@email.com',
    variant: 'filled',
  },
};
