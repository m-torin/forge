import { Button } from '@mantine/core';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  argTypes: {
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
      options: ['filled', 'light', 'outline', 'subtle', 'white', 'default', 'gradient'],
    },
  },
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'uix/mantine/Button',
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Button',
    color: 'blue',
    size: 'md',
    variant: 'filled',
  },
};

export const Outline: Story = {
  args: {
    children: 'Button',
    color: 'blue',
    size: 'md',
    variant: 'outline',
  },
};

export const Light: Story = {
  args: {
    children: 'Button',
    color: 'blue',
    size: 'md',
    variant: 'light',
  },
};

export const Subtle: Story = {
  args: {
    children: 'Button',
    color: 'blue',
    size: 'md',
    variant: 'subtle',
  },
};

export const Loading: Story = {
  args: {
    children: 'Loading',
    color: 'blue',
    loading: true,
    size: 'md',
    variant: 'filled',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    color: 'blue',
    disabled: true,
    size: 'md',
    variant: 'filled',
  },
};
