import type { Meta, StoryObj } from '@storybook/react';

import { Slider } from '@repo/design-system/uix';

/**
 * An input where the user selects a value from within a given range.
 */
const meta = {
  title: 'uix/ui/Slider',
  component: Slider,
  tags: ['autodocs'],
  argTypes: {},
  args: {
    defaultValue: 33,
    max: 100,
    step: 1,
  },
} satisfies Meta<typeof Slider>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the slider.
 */
export const Default: Story = {};

/**
 * Slider with marks.
 */
export const WithMarks: Story = {
  args: {
    marks: [
      { value: 20, label: '20%' },
      { value: 50, label: '50%' },
      { value: 80, label: '80%' },
    ],
  },
};

/**
 * Use the `disabled` prop to disable the slider.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
