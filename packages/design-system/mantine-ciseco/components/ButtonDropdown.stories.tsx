import { Meta, StoryObj } from '@storybook/react';

import ButtonDropdown from './ButtonDropdown';

const meta: Meta<typeof ButtonDropdown> = {
  argTypes: {
    children: {
      control: 'text',
      description: 'Button content/label',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler function',
    },
  },
  component: ButtonDropdown,
  parameters: {
    docs: {
      description: {
        component:
          'A button component styled for dropdown usage with chevron icon and custom styling.',
      },
    },
    layout: 'centered',
  },
  title: 'Ciseco/ButtonDropdown',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Select Option',
  },
};

export const WithLongText: Story = {
  args: {
    children: 'This is a very long dropdown option text',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Dropdown',
    disabled: true,
  },
};

export const ShortText: Story = {
  args: {
    children: 'Sort',
  },
};

export const FilterOptions: Story = {
  render: () => (
    <div className="space-y-3">
      <ButtonDropdown>Most Recent</ButtonDropdown>
      <ButtonDropdown>Most Popular</ButtonDropdown>
      <ButtonDropdown>Price: Low to High</ButtonDropdown>
      <ButtonDropdown>Price: High to Low</ButtonDropdown>
      <ButtonDropdown>Best Rating</ButtonDropdown>
    </div>
  ),
};

export const DifferentStates: Story = {
  render: () => (
    <div className="space-y-3">
      <ButtonDropdown>Normal State</ButtonDropdown>
      <ButtonDropdown disabled>Disabled State</ButtonDropdown>
      <ButtonDropdown className="bg-blue-50 border-blue-300 text-blue-700">
        Custom Styling
      </ButtonDropdown>
    </div>
  ),
};

export const ResponsiveWidth: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="w-32">
        <ButtonDropdown>Small</ButtonDropdown>
      </div>
      <div className="w-48">
        <ButtonDropdown>Medium Width</ButtonDropdown>
      </div>
      <div className="w-64">
        <ButtonDropdown>Large Width Option</ButtonDropdown>
      </div>
      <div className="w-full max-w-xs">
        <ButtonDropdown>Full Width (with max-width)</ButtonDropdown>
      </div>
    </div>
  ),
};

export const InForm: Story = {
  render: () => (
    <form className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div>
        <label className="block text-sm font-medium mb-2">Category</label>
        <ButtonDropdown>Select Category</ButtonDropdown>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Sort By</label>
        <ButtonDropdown>Choose sorting option</ButtonDropdown>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Status</label>
        <ButtonDropdown>All Statuses</ButtonDropdown>
      </div>
    </form>
  ),
};

export const InToolbar: Story = {
  render: () => (
    <div className="flex items-center justify-between p-4 bg-white border rounded-lg">
      <h3 className="text-lg font-semibold">Product List</h3>
      <div className="flex items-center space-x-3">
        <span className="text-sm text-gray-600">View:</span>
        <ButtonDropdown>Grid View</ButtonDropdown>
        <span className="text-sm text-gray-600">Sort:</span>
        <ButtonDropdown>Name A-Z</ButtonDropdown>
      </div>
    </div>
  ),
};
