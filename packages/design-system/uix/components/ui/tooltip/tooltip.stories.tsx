import type { Meta, StoryObj } from '@storybook/react';
import { IconPlus } from '@tabler/icons-react';

import { Tooltip } from '@repo/design-system/uix';

/**
 * A popup that displays information related to an element when the element
 * receives keyboard focus or the mouse hovers over it.
 */
const meta: Meta<typeof Tooltip> = {
  title: 'uix/ui/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  argTypes: {
    position: {
      options: ['top', 'bottom', 'left', 'right'],
      control: {
        type: 'radio',
      },
    },
    label: {
      control: 'text',
    },
  },
  args: {
    position: 'top',
    label: 'Add to library',
  },
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
    position: 'bottom',
    label: 'Add to library',
  },
};

/**
 * Use the `left` side to display the tooltip to the left of the element.
 */
export const Left: Story = {
  args: {
    position: 'left',
    label: 'Add to library',
  },
};

/**
 * Use the `right` side to display the tooltip to the right of the element.
 */
export const Right: Story = {
  args: {
    position: 'right',
    label: 'Add to library',
  },
};
