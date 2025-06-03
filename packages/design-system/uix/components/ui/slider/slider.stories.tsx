import { Slider } from '@repo/design-system/uix';

import type { Meta, StoryObj } from '@storybook/react';

/**
 * An input where the user selects a value from within a given range.
 */
const meta = {
  args: {
    defaultValue: 33,
    max: 100,
    step: 1,
  },
  argTypes: {},
  component: Slider,
  tags: ['autodocs'],
  title: 'uix/ui/Slider',
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
      { label: '20%', value: 20 },
      { label: '50%', value: 50 },
      { label: '80%', value: 80 },
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
