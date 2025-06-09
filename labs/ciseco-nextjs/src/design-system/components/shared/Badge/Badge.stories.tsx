import Badge from './Badge'

import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof Badge> = {
  argTypes: {
    name: {
      control: 'text',
      description: 'Badge content/text',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    color: {
      control: 'select',
      description: 'Color variant of the badge',
      options: ['blue', 'pink', 'red', 'gray', 'green', 'purple', 'indigo', 'yellow'],
    },
    href: {
      control: 'text',
      description: 'URL to link to (makes badge clickable)',
    },
  },
  component: Badge,
  parameters: {
    docs: {
      description: {
        component: 'A badge component with different color variants that can optionally render as a link.',
      },
    },
    layout: 'centered',
  },
  title: 'Ciseco/Shared/Badge',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    name: 'Default Badge',
    color: 'blue',
  },
}

export const Blue: Story = {
  args: {
    name: 'Blue Badge',
    color: 'blue',
  },
}

export const Pink: Story = {
  args: {
    name: 'Pink Badge',
    color: 'pink',
  },
}

export const Red: Story = {
  args: {
    name: 'Red Badge',
    color: 'red',
  },
}

export const Gray: Story = {
  args: {
    name: 'Gray Badge',
    color: 'gray',
  },
}

export const Green: Story = {
  args: {
    name: 'Green Badge',
    color: 'green',
  },
}

export const Purple: Story = {
  args: {
    name: 'Purple Badge',
    color: 'purple',
  },
}

export const Indigo: Story = {
  args: {
    name: 'Indigo Badge',
    color: 'indigo',
  },
}

export const Yellow: Story = {
  args: {
    name: 'Yellow Badge',
    color: 'yellow',
  },
}

export const AsLink: Story = {
  args: {
    name: 'Clickable Badge',
    color: 'blue',
    href: '/example',
  },
}

export const AllColors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge color="blue" name="Blue" />
      <Badge color="pink" name="Pink" />
      <Badge color="red" name="Red" />
      <Badge color="gray" name="Gray" />
      <Badge color="green" name="Green" />
      <Badge color="purple" name="Purple" />
      <Badge color="indigo" name="Indigo" />
      <Badge color="yellow" name="Yellow" />
    </div>
  ),
}

export const WithLinks: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge href="/blue" color="blue" name="Clickable Blue" />
      <Badge href="/pink" color="pink" name="Clickable Pink" />
      <Badge href="/green" color="green" name="Clickable Green" />
      <Badge color="gray" name="Regular Badge" />
    </div>
  ),
}

export const DifferentContent: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge color="green" name="New" />
      <Badge color="red" name="Sale" />
      <Badge color="purple" name="Featured" />
      <Badge color="blue" name="Popular" />
      <Badge color="yellow" name="Limited" />
      <Badge color="pink" name="Hot" />
      <Badge color="indigo" name="Trending" />
      <Badge color="green" name="Best Seller" />
    </div>
  ),
}

export const WithNumbers: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge color="blue" name="1" />
      <Badge color="green" name="5" />
      <Badge color="red" name="12" />
      <Badge color="purple" name="99+" />
      <Badge color="indigo" name="∞" />
    </div>
  ),
}

export const InContext: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <h3 className="text-lg font-semibold">Product Title</h3>
        <Badge color="green" name="New" />
        <Badge color="red" name="Sale" />
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">Categories:</span>
        <Badge href="/electronics" color="blue" name="Electronics" />
        <Badge href="/smartphones" color="purple" name="Smartphones" />
        <Badge href="/apple" color="gray" name="Apple" />
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">Tags:</span>
        <Badge color="yellow" name="Featured" />
        <Badge color="green" name="Best Seller" />
        <Badge color="pink" name="Trending" />
      </div>
    </div>
  ),
}

export const CustomStyling: Story = {
  args: {
    name: 'Custom Badge',
    className: 'text-sm px-4 py-2 shadow-lg',
    color: 'blue',
  },
}
