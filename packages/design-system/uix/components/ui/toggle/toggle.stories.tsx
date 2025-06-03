import { IconBold, IconItalic } from '@tabler/icons-react';

import { Toggle } from '@repo/design-system/uix';

import type { Meta, StoryObj } from '@storybook/react';

/**
 * A two-state button that can be either on or off.
 */
const meta: Meta<typeof Toggle> = {
  args: {
    children: <IconBold className="h-4 w-4" />,
  },
  argTypes: {
    children: {
      control: { disable: true },
    },
  },
  component: Toggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'uix/ui/Toggle',
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
    children: <IconItalic className="h-4 w-4" />,
    variant: 'outline',
  },
  render: (args: any) => <Toggle {...args} aria-label="Toggle italic" />,
};

/**
 * Use the text element to add a label to the toggle.
 */
export const WithText: Story = {
  args: {
    variant: 'outline',
  },
  render: (args: any) => (
    <Toggle {...args} aria-label="Toggle italic">
      <IconItalic className="mr-2 h-4 w-4" />
      Italic
    </Toggle>
  ),
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
