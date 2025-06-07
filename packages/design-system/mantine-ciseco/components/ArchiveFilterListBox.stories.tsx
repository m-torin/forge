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
    options: [
      { label: 'Most Recent', value: 'recent' },
      { label: 'Oldest', value: 'oldest' },
      { label: 'Most Popular', value: 'popular' },
    ],
  },
};

export const WithCustomStyling: Story = {
  args: {
    className: 'my-4',
    options: [
      { label: 'Most Recent', value: 'recent' },
      { label: 'Oldest', value: 'oldest' },
      { label: 'Most Popular', value: 'popular' },
    ],
  },
};

export const InContainer: Story = {
  render: () => (
    <div className="bg-gray-100 p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Filter Products</h3>
      <ArchiveFilterListBox
        options={[
          { label: 'Most Recent', value: 'recent' },
          { label: 'Oldest', value: 'oldest' },
          { label: 'Most Popular', value: 'popular' },
        ]}
      />
    </div>
  ),
};

export const MultipleFilters: Story = {
  render: () => (
    <div className="space-y-4 p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Sort by</label>
          <ArchiveFilterListBox
            options={[
              { label: 'Most Recent', value: 'recent' },
              { label: 'Oldest', value: 'oldest' },
              { label: 'Most Popular', value: 'popular' },
            ]}
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Category</label>
          <ArchiveFilterListBox
            options={[
              { label: 'Electronics', value: 'electronics' },
              { label: 'Clothing', value: 'clothing' },
              { label: 'Books', value: 'books' },
            ]}
          />
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
          <ArchiveFilterListBox
            options={[
              { label: 'Most Recent', value: 'recent' },
              { label: 'Oldest', value: 'oldest' },
              { label: 'Most Popular', value: 'popular' },
            ]}
          />
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
          <ArchiveFilterListBox
            options={[
              { label: 'Under $50', value: 'under-50' },
              { label: '$50 - $100', value: '50-100' },
              { label: 'Over $100', value: 'over-100' },
            ]}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Sort Order</label>
          <ArchiveFilterListBox
            options={[
              { label: 'Ascending', value: 'asc' },
              { label: 'Descending', value: 'desc' },
            ]}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">View Type</label>
          <ArchiveFilterListBox
            options={[
              { label: 'Grid View', value: 'grid' },
              { label: 'List View', value: 'list' },
            ]}
          />
        </div>
      </div>
    </div>
  ),
};
