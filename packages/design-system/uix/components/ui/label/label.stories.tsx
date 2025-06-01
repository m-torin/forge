import type { Meta, StoryObj } from '@storybook/react';

import { Label } from '@repo/design-system/uix';

/**
 * Renders an accessible label associated with controls.
 */
const meta = {
  title: 'uix/ui/Label',
  component: Label,
  tags: ['autodocs'],
  argTypes: {
    htmlFor: {
      control: { type: 'text' },
      description: 'The ID of the form element the label is associated with',
    },
  },
  args: {
    htmlFor: 'email',
  },
  render: (args: any) => <Label {...args}>Your email address</Label>,
} satisfies Meta<typeof Label>;

export default meta;

type Story = StoryObj<typeof Label>;

/**
 * The default form of the label.
 */
export const Default: Story = {};
