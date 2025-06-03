import { Pagination } from '@repo/design-system/uix';

import type { Meta, StoryObj } from '@storybook/react';

/**
 * Pagination with page navigation, next and previous links.
 */
const meta = {
  args: {
    defaultValue: 1,
    total: 10,
  },
  argTypes: {},
  component: Pagination,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'uix/ui/Pagination',
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
