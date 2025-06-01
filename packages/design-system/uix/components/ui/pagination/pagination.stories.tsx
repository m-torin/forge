import type { Meta, StoryObj } from '@storybook/react';

import { Pagination } from '@repo/design-system/uix';

/**
 * Pagination with page navigation, next and previous links.
 */
const meta = {
  title: 'uix/ui/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  argTypes: {},
  args: {
    total: 10,
    defaultValue: 1,
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Pagination>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the pagination.
 */
export const Default: Story = {};

/**
 * Pagination with siblings count.
 */
export const WithSiblings: Story = {
  args: {
    siblings: 2,
  },
};

/**
 * Pagination with boundaries.
 */
export const WithBoundaries: Story = {
  args: {
    boundaries: 2,
  },
};
