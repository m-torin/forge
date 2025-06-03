import { Calendar } from '@repo/design-system/uix';

import type { Meta, StoryObj } from '@storybook/react';

// Simple action function for Storybook
const action =
  (name: string) =>
  (...args: any[]) =>
    console.log(name, ...args);

/**
 * A date picker component that allows users to select dates.
 */
const meta = {
  args: {
    onChange: action('onChange'),
  },
  argTypes: {},
  component: Calendar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'uix/ui/Calendar',
} satisfies Meta<typeof Calendar>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the calendar.
 */
export const Default: Story = {};

/**
 * Calendar with multiple dates selection.
 */
export const Multiple: Story = {
  args: {},
  render: (args) => <Calendar {...args} />,
};

/**
 * Calendar with date range selection.
 */
export const Range: Story = {
  args: {},
  render: (args) => <Calendar {...args} />,
};

/**
 * Calendar with week selection.
 */
export const WeekPicker: Story = {
  args: {
    getDayProps: (date: string) => {
      const dateObj = new Date(date);
      const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
      return {
        style: { color: isWeekend ? 'red' : undefined },
      };
    },
  },
};

/**
 * Calendar with custom date formatting.
 */
export const CustomDayFormat: Story = {
  args: {
    monthLabelFormat: 'MMMM YYYY',
    yearLabelFormat: 'YYYY',
  },
};
