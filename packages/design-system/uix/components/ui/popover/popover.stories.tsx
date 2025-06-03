import { Popover, PopoverContent, PopoverTrigger } from '@repo/design-system/uix';

import type { Meta, StoryObj } from '@storybook/react';

/**
 * Displays rich content in a portal, triggered by a button.
 */
const meta = {
  argTypes: {},
  component: Popover,
  tags: ['autodocs'],
  title: 'uix/ui/Popover',

  parameters: {
    layout: 'centered',
  },
  render: () => (
    <Popover>
      <PopoverTrigger>Open</PopoverTrigger>
      <PopoverContent>Place content for the popover here.</PopoverContent>
    </Popover>
  ),
} satisfies Meta<typeof Popover>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the popover.
 */
export const Default: Story = {};
