import ArchiveFilterListBox from './ArchiveFilterListBox';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof ArchiveFilterListBox> = {
  argTypes: {
    className: {
      control: 'text',
      description: 'CSS classes for styling the component',
    },
  },
  component: ArchiveFilterListBox,
  parameters: {
    docs: {
      description: {
        component:
          'A dropdown filter component for sorting/filtering archive or list content with predefined options.',
      },
    },
    layout: 'centered',
  },
  title: 'Ciseco/ArchiveFilterListBox',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: '',
  },
};

export const WithCustomStyling: Story = {
  args: {
    className: 'my-4',
  },
};

export const InContainer: Story = {
  render: () => (
    <div className="bg-gray-100 p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Filter Products</h3>
      <ArchiveFilterListBox />
    </div>
  ),
};

export const MultipleFilters: Story = {
  render: () => (
    <div className="space-y-4 p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Sort by</label>
          <ArchiveFilterListBox />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Category</label>
          <ArchiveFilterListBox />
        </div>
      </div>
    </div>
  ),
};

export const InHeader: Story = {
  render: () => (
    <div className="bg-white shadow-sm border-b p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Product Archive</h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Sort by:</span>
          <ArchiveFilterListBox />
        </div>
      </div>
    </div>
  ),
};

export const Responsive: Story = {
  render: () => (
    <div className="w-full max-w-4xl p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-2">Price Range</label>
          <ArchiveFilterListBox />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Sort Order</label>
          <ArchiveFilterListBox />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">View Type</label>
          <ArchiveFilterListBox />
        </div>
      </div>
    </div>
  ),
};
