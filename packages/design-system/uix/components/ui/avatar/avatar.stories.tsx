import { Avatar, AvatarFallback, AvatarImage } from '@repo/design-system/uix';

import type { Meta, StoryObj } from '@storybook/react';

/**
 * An image element with a fallback for representing the user.
 */
const meta = {
  argTypes: {},
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  render: (args: any) => (
    <Avatar {...args}>
      <AvatarImage src="https://github.com/shadcn.png" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
  tags: ['autodocs'],
  title: 'uix/ui/Avatar',
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the avatar.
 */
export const Default: Story = {};
