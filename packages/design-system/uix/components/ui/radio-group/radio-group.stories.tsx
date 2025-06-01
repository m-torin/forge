import type { Meta, StoryObj } from '@storybook/react';

import { RadioGroup, RadioGroupItem } from '@repo/design-system/uix';

/**
 * A set of checkable buttons—known as radio buttons—where no more than one of
 * the buttons can be checked at a time.
 */
const meta = {
  title: 'uix/ui/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  argTypes: {},
  args: {
    defaultValue: 'comfortable',
  },
  render: (args: any) => (
    <RadioGroup {...args}>
      <RadioGroupItem value="default" label="Default" />
      <RadioGroupItem value="comfortable" label="Comfortable" />
      <RadioGroupItem value="compact" label="Compact" />
    </RadioGroup>
  ),
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
        <RadioGroupItem value="default" label="Default" />
        <RadioGroupItem value="comfortable" label="Comfortable" />
        <RadioGroupItem value="compact" label="Compact" />
      </>
    ),
  },
};

/**
 * Radio group with description.
 */
export const WithDescription: Story = {
  args: {
    defaultValue: 'comfortable',
    children: (
      <>
        <RadioGroupItem value="default" label="Default" description="The default option" />
        <RadioGroupItem value="comfortable" label="Comfortable" description="More spacing" />
        <RadioGroupItem value="compact" label="Compact" description="Less spacing" />
      </>
    ),
  },
};
