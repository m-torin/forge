import type { Meta, StoryObj } from '@storybook/react';

import { Progress } from '@repo/design-system/uix';

/**
 * Displays an indicator showing the completion progress of a task, typically
 * displayed as a progress bar.
 */
const meta = {
  title: 'uix/ui/Progress',
  component: Progress,
  tags: ['autodocs'],
  argTypes: {},
  args: {
    value: 30,
  },
} satisfies Meta<typeof Progress>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the progress.
 */
export const Default: Story = {};

/**
 * Progress with different sizes.
 */
export const Sizes: Story = {
  args: {
    value: 60,
    size: 'lg',
  },
};

/**
 * Progress with striped animation.
 */
export const Striped: Story = {
  args: {
    value: 75,
    striped: true,
    animated: true,
  },
};
