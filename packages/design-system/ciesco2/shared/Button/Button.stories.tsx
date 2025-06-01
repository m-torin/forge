import type { Meta, StoryObj } from '@storybook/react';
import { ButtonPrimary, ButtonSecondary } from '@repo/design-system/ciesco2/shared';
import { ShoppingBag03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

const meta: Meta<typeof ButtonPrimary> = {
  title: 'ciesco2/Button',
  component: ButtonPrimary,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'Button content',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the button',
    },
    sizeClass: {
      control: 'text',
      description: 'Size classes for padding',
    },
    fontSize: {
      control: 'text',
      description: 'Font size classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Add to Cart',
    sizeClass: 'py-3 px-6',
    fontSize: 'text-sm',
  },
};

export const Secondary: Story = {
  render: (args: any) => (
    <ButtonSecondary {...args}>
      {args.children}
    </ButtonSecondary>
  ),
  args: {
    children: 'View Details',
    sizeClass: 'py-3 px-6',
    fontSize: 'text-sm',
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <HugeiconsIcon icon={ShoppingBag03Icon} size={16} />
        <span className="ml-2">Add to Bag</span>
      </>
    ),
    sizeClass: 'py-3 px-6',
    fontSize: 'text-sm',
  },
};

export const Loading: Story = {
  args: {
    children: 'Processing...',
    disabled: true,
    sizeClass: 'py-3 px-6',
    fontSize: 'text-sm',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Unavailable',
    disabled: true,
    sizeClass: 'py-3 px-6',
    fontSize: 'text-sm',
  },
};

export const Small: Story = {
  args: {
    children: 'Small Button',
    sizeClass: 'py-2 px-4',
    fontSize: 'text-xs',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    sizeClass: 'py-4 px-8',
    fontSize: 'text-lg',
  },
};

export const ButtonVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <ButtonPrimary sizeClass="py-3 px-6" fontSize="text-sm">
        Primary Button
      </ButtonPrimary>
      <ButtonSecondary sizeClass="py-3 px-6" fontSize="text-sm">
        Secondary Button
      </ButtonSecondary>
      <ButtonPrimary 
        sizeClass="py-2 px-4" 
        fontSize="text-xs"
        className="bg-red-600 hover:bg-red-700"
      >
        Destructive Button
      </ButtonPrimary>
    </div>
  ),
};