import type { Meta, StoryObj } from '@storybook/react';
import { IconBold, IconItalic } from '@tabler/icons-react';

import { Toggle } from '@repo/design-system/uix';

/**
 * A two-state button that can be either on or off.
 */
const meta: Meta<typeof Toggle> = {
  title: 'uix/ui/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: { disable: true },
    },
  },
  args: {
    children: <IconBold className="h-4 w-4" />,
  },
  parameters: {
    layout: 'centered',
  },
};
export default meta;

type Story = StoryObj<typeof Toggle>;

/**
 * The default form of the toggle.
 */
export const Default: Story = {
  render: (args: any) => <Toggle {...args} aria-label="Toggle bold" />,
};

/**
 * Use the `outline` variant for a distinct outline, emphasizing the boundary
 * of the selection circle for clearer visibility
 */
export const Outline: Story = {
  args: {
    variant: 'outline',
    children: <IconItalic className="h-4 w-4" />,
  },
  render: (args: any) => <Toggle {...args} aria-label="Toggle italic" />,
};

/**
 * Use the text element to add a label to the toggle.
 */
export const WithText: Story = {
  render: (args: any) => (
    <Toggle {...args} aria-label="Toggle italic">
      <IconItalic className="mr-2 h-4 w-4" />
      Italic
    </Toggle>
  ),
  args: {
    variant: 'outline',
  },
};

/**
 * Use the `sm` size for a smaller toggle, suitable for interfaces needing
 * compact elements without sacrificing usability.
 */
export const Small: Story = {
  args: {
    size: 'sm',
  },
};

/**
 * Use the `lg` size for a larger toggle, offering better visibility and
 * easier interaction for users.
 */
export const Large: Story = {
  args: {
    size: 'lg',
  },
};

/**
 * Add the `disabled` prop to prevent interactions with the toggle.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
