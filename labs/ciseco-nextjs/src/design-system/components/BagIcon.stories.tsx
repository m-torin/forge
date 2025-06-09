import BagIcon from './BagIcon'

import type { Meta, StoryObj } from '@storybook/react'

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
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    className: 'w-5 h-5',
  },
}

export const Small: Story = {
  args: {
    className: 'w-4 h-4',
  },
}

export const Medium: Story = {
  args: {
    className: 'w-6 h-6',
  },
}

export const Large: Story = {
  args: {
    className: 'w-8 h-8',
  },
}

export const ExtraLarge: Story = {
  args: {
    className: 'w-12 h-12',
  },
}

export const WithColor: Story = {
  args: {
    className: 'w-8 h-8 text-blue-600',
  },
}

export const WithCustomColors: Story = {
  render: () => (
    <div className="flex items-center space-x-4">
      <BagIcon className="h-8 w-8 text-red-500" />
      <BagIcon className="h-8 w-8 text-green-500" />
      <BagIcon className="h-8 w-8 text-blue-500" />
      <BagIcon className="h-8 w-8 text-purple-500" />
      <BagIcon className="h-8 w-8 text-yellow-500" />
    </div>
  ),
}

export const DifferentSizes: Story = {
  render: () => (
    <div className="flex items-end space-x-4">
      <BagIcon className="h-4 w-4 text-gray-600" />
      <BagIcon className="h-6 w-6 text-gray-600" />
      <BagIcon className="h-8 w-8 text-gray-600" />
      <BagIcon className="h-10 w-10 text-gray-600" />
      <BagIcon className="h-12 w-12 text-gray-600" />
    </div>
  ),
}

export const InButton: Story = {
  render: () => (
    <button className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
      <BagIcon className="h-5 w-5" />
      <span>Add to Cart</span>
    </button>
  ),
}

export const InNavigation: Story = {
  render: () => (
    <div className="flex items-center space-x-6 rounded-lg bg-gray-100 p-4">
      <div className="flex items-center space-x-2">
        <BagIcon className="h-5 w-5 text-gray-700" />
        <span className="text-sm font-medium">Cart</span>
        <span className="rounded-full bg-red-500 px-2 py-1 text-xs text-white">3</span>
      </div>
      <div className="flex items-center space-x-2">
        <BagIcon className="h-5 w-5 text-gray-700" />
        <span className="text-sm">Shopping Bag</span>
      </div>
    </div>
  ),
}
