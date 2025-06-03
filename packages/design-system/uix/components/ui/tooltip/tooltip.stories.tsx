import { IconPlus } from '@tabler/icons-react';

import { Tooltip } from '@repo/design-system/uix';

import type { Meta, StoryObj } from '@storybook/react';

/**
 * A popup that displays information related to an element when the element
 * receives keyboard focus or the mouse hovers over it.
 */
const meta: Meta<typeof Tooltip> = {
  args: {
    label: 'Add to library',
    position: 'top',
  },
  argTypes: {
    label: {
      control: 'text',
    },
    position: {
      control: {
        type: 'radio',
      },
      options: ['top', 'bottom', 'left', 'right'],
    },
  },
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  render: (args: any) => (
    <Tooltip {...args}>
      <button>
        <IconPlus className="h-4 w-4" />
        <span className="sr-only">Add</span>
      </button>
    </Tooltip>
  ),
  tags: ['autodocs'],
  title: 'uix/ui/Tooltip',
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the tooltip.
 */
export const Default: Story = {};

/**
 * Use the `bottom` side to display the tooltip below the element.
 */
export const Bottom: Story = {
  args: {
    label: 'Add to library',
    position: 'bottom',
  },
};

/**
 * Use the `left` side to display the tooltip to the left of the element.
 */
export const Left: Story = {
  args: {
    label: 'Add to library',
    position: 'left',
  },
};

/**
 * Use the `right` side to display the tooltip to the right of the element.
 */
export const Right: Story = {
  args: {
    label: 'Add to library',
    position: 'right',
  },
};
