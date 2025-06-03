import { HoverCard, HoverCardContent, HoverCardTrigger } from '@repo/design-system/uix';

import type { Meta, StoryObj } from '@storybook/react';

/**
 * For sighted users to preview content available behind a link.
 */
const meta = {
  args: {},
  argTypes: {},
  component: HoverCard,
  parameters: {
    layout: 'centered',
  },
  render: (args: any) => (
    <HoverCard {...args}>
      <HoverCardTrigger>Hover</HoverCardTrigger>
      <HoverCardContent>The React Framework - created and maintained by @vercel.</HoverCardContent>
    </HoverCard>
  ),
  tags: ['autodocs'],
  title: 'uix/ui/HoverCard',
} satisfies Meta<typeof HoverCard>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the hover card.
 */
export const Default: Story = {};

/**
 * Use the `openDelay` and `closeDelay` props to control the delay before the
 * hover card opens and closes.
 */
export const Instant: Story = {
  args: {
    closeDelay: 0,
    openDelay: 0,
  },
};
