import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@repo/design-system/uix';

import type { Meta, StoryObj } from '@storybook/react';

/**
 * Accessible one-time password component with copy paste functionality.
 */
const meta = {
  args: {
    children: null,
    length: 6,
  },
  argTypes: {},
  component: InputOTP,
  tags: ['autodocs'],
  title: 'uix/ui/InputOTP',

  parameters: {
    layout: 'centered',
  },
  render: (args: any) => (
    <InputOTP {...args} render={undefined}>
      <InputOTPGroup>
        <InputOTPSlot _index={0} />
        <InputOTPSlot _index={1} />
        <InputOTPSlot _index={2} />
        <InputOTPSlot _index={3} />
        <InputOTPSlot _index={4} />
        <InputOTPSlot _index={5} />
      </InputOTPGroup>
    </InputOTP>
  ),
} satisfies Meta<typeof InputOTP>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the InputOTP field.
 */
export const Default: Story = {};

/**
 * Use multiple groups to separate the input slots.
 */
export const SeparatedGroup: Story = {
  render: (args: any) => (
    <InputOTP {...args} render={undefined}>
      <InputOTPGroup>
        <InputOTPSlot _index={0} />
        <InputOTPSlot _index={1} />
        <InputOTPSlot _index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot _index={3} />
        <InputOTPSlot _index={4} />
        <InputOTPSlot _index={5} />
      </InputOTPGroup>
    </InputOTP>
  ),
};
