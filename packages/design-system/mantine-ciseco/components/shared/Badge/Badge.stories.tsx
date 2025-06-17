import { Meta, StoryObj } from '@storybook/react';

import Badge from './Badge';

const meta: Meta<typeof Badge> = {
  argTypes: {
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
    name: {
      control: 'text',
      description: 'Badge content/text',
    },
  },
  component: Badge,
  parameters: {
    docs: {
      description: {
        component:
          'A badge component with different color variants that can optionally render as a link.',
      },
    },
    layout: 'centered',
  },
  title: 'Ciseco/Shared/Badge',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    color: 'blue',
    name: 'Default Badge',
  },
};

export const Blue: Story = {
  args: {
    color: 'blue',
    name: 'Blue Badge',
  },
};

export const Pink: Story = {
  args: {
    color: 'pink',
    name: 'Pink Badge',
  },
};

export const Red: Story = {
  args: {
    color: 'red',
    name: 'Red Badge',
  },
};

export const Gray: Story = {
  args: {
    color: 'gray',
    name: 'Gray Badge',
  },
};

export const Green: Story = {
  args: {
    color: 'green',
    name: 'Green Badge',
  },
};

export const Purple: Story = {
  args: {
    color: 'purple',
    name: 'Purple Badge',
  },
};

export const Indigo: Story = {
  args: {
    color: 'indigo',
    name: 'Indigo Badge',
  },
};

export const Yellow: Story = {
  args: {
    color: 'yellow',
    name: 'Yellow Badge',
  },
};

export const AsLink: Story = {
  args: {
    color: 'blue',
    href: '/example',
    name: 'Clickable Badge',
  },
};

export const AllColors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge c="blue" name="Blue" />
      <Badge c="pink" name="Pink" />
      <Badge c="red" name="Red" />
      <Badge c="gray" name="Gray" />
      <Badge c="green" name="Green" />
      <Badge c="purple" name="Purple" />
      <Badge c="indigo" name="Indigo" />
      <Badge c="yellow" name="Yellow" />
    </div>
  ),
};

export const WithLinks: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge c="blue" href="/blue" name="Clickable Blue" />
      <Badge c="pink" href="/pink" name="Clickable Pink" />
      <Badge c="green" href="/green" name="Clickable Green" />
      <Badge c="gray" name="Regular Badge" />
    </div>
  ),
};

export const DifferentContent: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge c="green" name="New" />
      <Badge c="red" name="Sale" />
      <Badge c="purple" name="Featured" />
      <Badge c="blue" name="Popular" />
      <Badge c="yellow" name="Limited" />
      <Badge c="pink" name="Hot" />
      <Badge c="indigo" name="Trending" />
      <Badge c="green" name="Best Seller" />
    </div>
  ),
};

export const WithNumbers: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge c="blue" name="1" />
      <Badge c="green" name="5" />
      <Badge c="red" name="12" />
      <Badge c="purple" name="99+" />
      <Badge c="indigo" name="∞" />
    </div>
  ),
};

export const InContext: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <h3 className="text-lg font-semibold">Product Title</h3>
        <Badge c="green" name="New" />
        <Badge c="red" name="Sale" />
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">Categories:</span>
        <Badge c="blue" href="/electronics" name="Electronics" />
        <Badge c="purple" href="/smartphones" name="Smartphones" />
        <Badge c="gray" href="/apple" name="Apple" />
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">Tags:</span>
        <Badge c="yellow" name="Featured" />
        <Badge c="green" name="Best Seller" />
        <Badge c="pink" name="Trending" />
      </div>
    </div>
  ),
};

export const CustomStyling: Story = {
  args: {
    className: 'text-sm px-4 py-2 shadow-lg',
    color: 'blue',
    name: 'Custom Badge',
  },
};
