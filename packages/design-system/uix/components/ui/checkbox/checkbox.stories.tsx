import { Checkbox } from '@repo/design-system/uix';

import type { Meta, StoryObj } from '@storybook/react';

/**
 * A control that allows the user to toggle between checked and not checked.
 */
const meta: Meta<typeof Checkbox> = {
  args: {
    id: 'terms',
    disabled: false,
  },
  argTypes: {},
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  render: (args: any) => (
    <div className="flex space-x-2">
      <Checkbox {...args} />
      <label
        htmlFor={args.id}
        className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
      >
        Accept terms and conditions
      </label>
    </div>
  ),
  tags: ['autodocs'],
  title: 'uix/ui/Checkbox',
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the checkbox.
 */
export const Default: Story = {};

/**
 * Use the `disabled` prop to disable the checkbox.
 */
export const Disabled: Story = {
  args: {
    id: 'disabled-terms',
    disabled: true,
  },
};
