import { Switch } from '@repo/design-system/uix';

import type { Meta, StoryObj } from '@storybook/react';

/**
 * A control that allows the user to toggle between checked and not checked.
 */
const meta = {
  argTypes: {},
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  render: (args: any) => (
    <div className="flex items-center space-x-2">
      <Switch {...args} />
      <label htmlFor={args.id} className="peer-disabled:text-foreground/50">
        Airplane Mode
      </label>
    </div>
  ),
  tags: ['autodocs'],
  title: 'uix/ui/Switch',
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the switch.
 */
export const Default: Story = {
  args: {
    id: 'default-switch',
  },
};

/**
 * Use the `disabled` prop to disable the switch.
 */
export const Disabled: Story = {
  args: {
    id: 'disabled-switch',
    disabled: true,
  },
};
