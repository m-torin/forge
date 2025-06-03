import { IconInfoCircle } from '@tabler/icons-react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@repo/design-system/uix';

import type { Meta, StoryObj } from '@storybook/react';

/**
 * An interactive component which expands/collapses a panel.
 */
const meta = {
  args: {
    className: 'w-96',
    disabled: false,
  },
  argTypes: {},
  component: Collapsible,
  parameters: {
    layout: 'centered',
  },
  render: (args: any) => (
    <Collapsible {...args}>
      <CollapsibleTrigger className="flex gap-2">
        <h3 className="font-semibold">Can I use this in my project?</h3>
        <IconInfoCircle className="size-6" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        Yes. Free to use for personal and commercial projects. No attribution required.
      </CollapsibleContent>
    </Collapsible>
  ),
  tags: ['autodocs'],
  title: 'uix/ui/Collapsible',
} satisfies Meta<typeof Collapsible>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the collapsible.
 */
export const Default: Story = {};

/**
 * Use the `disabled` prop to disable the interaction.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
