import { TextInput } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/nextjs';

const meta = {
  title: 'Mantine/TextInput',
  component: TextInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'filled', 'unstyled'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    radius: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    withAsterisk: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    error: {
      control: 'text',
    },
  },
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Email',
    placeholder: 'your@email.com',
    description: 'We will never share your email with anyone else',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    placeholder: 'your@email.com',
    error: 'Invalid email address',
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
    label: 'Email',
    placeholder: 'your@email.com',
    disabled: true,
  },
};

export const WithIcon: Story = {
  args: {
    label: 'Email',
    placeholder: 'your@email.com',
    leftSection: '@',
  },
};

export const Filled: Story = {
  args: {
    label: 'Email',
    placeholder: 'your@email.com',
    variant: 'filled',
  },
};
