import { RadioGroup, RadioGroupItem } from '@repo/design-system/uix';

import type { Meta, StoryObj } from '@storybook/react';

/**
 * A set of checkable buttons—known as radio buttons—where no more than one of
 * the buttons can be checked at a time.
 */
const meta = {
  args: {
    defaultValue: 'comfortable',
  },
  argTypes: {},
  component: RadioGroup,
  render: (args: any) => (
    <RadioGroup {...args}>
      <RadioGroupItem label="Default" value="default" />
      <RadioGroupItem label="Comfortable" value="comfortable" />
      <RadioGroupItem label="Compact" value="compact" />
    </RadioGroup>
  ),
  tags: ['autodocs'],
  title: 'uix/ui/RadioGroup',
} satisfies Meta<typeof RadioGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the radio group.
 */
export const Default: Story = {
  args: {
    children: (
      <>
        <RadioGroupItem label="Default" value="default" />
        <RadioGroupItem label="Comfortable" value="comfortable" />
        <RadioGroupItem label="Compact" value="compact" />
      </>
    ),
  },
};

/**
 * Radio group with description.
 */
export const WithDescription: Story = {
  args: {
    children: (
      <>
        <RadioGroupItem description="The default option" label="Default" value="default" />
        <RadioGroupItem description="More spacing" label="Comfortable" value="comfortable" />
        <RadioGroupItem description="Less spacing" label="Compact" value="compact" />
      </>
    ),
    defaultValue: 'comfortable',
  },
};
