import { Progress } from '@repo/design-system/uix';

import type { Meta, StoryObj } from '@storybook/react';

/**
 * Displays an indicator showing the completion progress of a task, typically
 * displayed as a progress bar.
 */
const meta = {
  args: {
    value: 30,
  },
  argTypes: {},
  component: Progress,
  tags: ['autodocs'],
  title: 'uix/ui/Progress',
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
    size: 'lg',
    value: 60,
  },
};

/**
 * Progress with striped animation.
 */
export const Striped: Story = {
  args: {
    animated: true,
    striped: true,
    value: 75,
  },
};
