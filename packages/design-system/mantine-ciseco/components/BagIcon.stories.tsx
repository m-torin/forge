import BagIcon from './BagIcon';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof BagIcon> = {
  argTypes: {
    className: {
      control: 'text',
      description: 'CSS classes for styling the icon',
    },
  },
  component: BagIcon,
  parameters: {
    docs: {
      description: {
        component: 'A shopping bag icon component with customizable size and styling.',
      },
    },
    layout: 'centered',
  },
  title: 'Ciseco/BagIcon',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: 'w-5 h-5',
  },
};

export const Small: Story = {
  args: {
    className: 'w-4 h-4',
  },
};

export const Medium: Story = {
  args: {
    className: 'w-6 h-6',
  },
};

export const Large: Story = {
  args: {
    className: 'w-8 h-8',
  },
};

export const ExtraLarge: Story = {
  args: {
    className: 'w-12 h-12',
  },
};

export const WithColor: Story = {
  args: {
    className: 'w-8 h-8 text-blue-600',
  },
};

export const WithCustomColors: Story = {
  render: () => (
    <div className="flex space-x-4 items-center">
      <BagIcon className="w-8 h-8 text-red-500" />
      <BagIcon className="w-8 h-8 text-green-500" />
      <BagIcon className="w-8 h-8 text-blue-500" />
      <BagIcon className="w-8 h-8 text-purple-500" />
      <BagIcon className="w-8 h-8 text-yellow-500" />
    </div>
  ),
};

export const DifferentSizes: Story = {
  render: () => (
    <div className="flex space-x-4 items-end">
      <BagIcon className="w-4 h-4 text-gray-600" />
      <BagIcon className="w-6 h-6 text-gray-600" />
      <BagIcon className="w-8 h-8 text-gray-600" />
      <BagIcon className="w-10 h-10 text-gray-600" />
      <BagIcon className="w-12 h-12 text-gray-600" />
    </div>
  ),
};

export const InButton: Story = {
  render: () => (
    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
      <BagIcon className="w-5 h-5" />
      <span>Add to Cart</span>
    </button>
  ),
};

export const InNavigation: Story = {
  render: () => (
    <div className="flex items-center space-x-6 p-4 bg-gray-100 rounded-lg">
      <div className="flex items-center space-x-2">
        <BagIcon className="w-5 h-5 text-gray-700" />
        <span className="text-sm font-medium">Cart</span>
        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">3</span>
      </div>
      <div className="flex items-center space-x-2">
        <BagIcon className="w-5 h-5 text-gray-700" />
        <span className="text-sm">Shopping Bag</span>
      </div>
    </div>
  ),
};
