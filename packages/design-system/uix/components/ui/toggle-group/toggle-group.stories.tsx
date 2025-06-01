import type { Meta, StoryObj } from '@storybook/react';
import { IconBold, IconItalic, IconUnderline } from '@tabler/icons-react';

import { ToggleGroup, ToggleGroupItem } from '@repo/design-system/uix';

/**
 * A set of two-state buttons that can be toggled on or off.
 */
const meta = {
  title: 'uix/ui/ToggleGroup',
  component: ToggleGroup,
  tags: ['autodocs'],
  argTypes: {
    data: {
      control: 'object',
      description: 'Array of items with label and value',
    },
    size: {
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      control: { type: 'select' },
    },
  },
  args: {
    data: [
      { label: 'Bold', value: 'bold' },
      { label: 'Italic', value: 'italic' },
      { label: 'Underline', value: 'underline' },
    ],
    disabled: false,
  },
  render: (args: any) => <ToggleGroup {...args} />,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ToggleGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the toggle group.
 */
export const Default: Story = {};

/**
 * Use the `outline` variant to emphasizing the individuality of each button
 * while keeping them visually cohesive.
 */
export const Outline: Story = {
  args: {
    data: [
      { label: 'Bold', value: 'bold' },
      { label: 'Italic', value: 'italic' },
      { label: 'Underline', value: 'underline' },
    ],
  },
};

/**
 * Use the `single` type to create exclusive selection within the button
 * group, allowing only one button to be active at a time.
 */
export const Single: Story = {
  args: {
    data: [
      { label: 'Bold', value: 'bold' },
      { label: 'Italic', value: 'italic' },
      { label: 'Underline', value: 'underline' },
    ],
  },
};

/**
 * Use the `sm` size for a compact version of the button group, featuring
 * smaller buttons for spaces with limited real estate.
 */
export const Small: Story = {
  args: {
    data: [
      { label: 'Bold', value: 'bold' },
      { label: 'Italic', value: 'italic' },
      { label: 'Underline', value: 'underline' },
    ],
    size: 'sm',
  },
};

/**
 * Use the `lg` size for a more prominent version of the button group, featuring
 * larger buttons for emphasis.
 */
export const Large: Story = {
  args: {
    data: [
      { label: 'Bold', value: 'bold' },
      { label: 'Italic', value: 'italic' },
      { label: 'Underline', value: 'underline' },
    ],
    size: 'lg',
  },
};

/**
 * Add the `disabled` prop to a button to prevent interactions.
 */
export const Disabled: Story = {
  args: {
    data: [
      { label: 'Bold', value: 'bold' },
      { label: 'Italic', value: 'italic' },
      { label: 'Underline', value: 'underline' },
    ],
    disabled: true,
  },
};
