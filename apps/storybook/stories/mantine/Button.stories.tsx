import { Button } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Mantine/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
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
    radius: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Button',
    variant: 'filled',
    color: 'blue',
    size: 'md',
  },
};

export const Outline: Story = {
  args: {
    children: 'Button',
    variant: 'outline',
    color: 'blue',
    size: 'md',
  },
};

export const Light: Story = {
  args: {
    children: 'Button',
    variant: 'light',
    color: 'blue',
    size: 'md',
  },
};

export const Subtle: Story = {
  args: {
    children: 'Button',
    variant: 'subtle',
    color: 'blue',
    size: 'md',
  },
};

export const Loading: Story = {
  args: {
    children: 'Loading',
    loading: true,
    variant: 'filled',
    color: 'blue',
    size: 'md',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
    variant: 'filled',
    color: 'blue',
    size: 'md',
  },
};
