import { Label } from '@repo/design-system/uix';

import type { Meta, StoryObj } from '@storybook/react';

/**
 * Renders an accessible label associated with controls.
 */
const meta = {
  args: {
    htmlFor: 'email',
  },
  argTypes: {
    htmlFor: {
      control: { type: 'text' },
      description: 'The ID of the form element the label is associated with',
    },
  },
  component: Label,
  render: (args: any) => <Label {...args}>Your email address</Label>,
  tags: ['autodocs'],
  title: 'uix/ui/Label',
} satisfies Meta<typeof Label>;

export default meta;

type Story = StoryObj<typeof Label>;

/**
 * The default form of the label.
 */
export const Default: Story = {};
