import ArchiveFilterListBox from './ArchiveFilterListBox'

import type { Meta, StoryObj } from '@storybook/react'

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
        component: 'A dropdown filter component for sorting/filtering archive or list content with predefined options.',
      },
    },
    layout: 'centered',
  },
  title: 'Ciseco/ArchiveFilterListBox',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    className: '',
  },
}

export const WithCustomStyling: Story = {
  args: {
    className: 'my-4',
  },
}

export const InContainer: Story = {
  render: () => (
    <div className="rounded-lg bg-gray-100 p-6">
      <h3 className="mb-4 text-lg font-semibold">Filter Products</h3>
      <ArchiveFilterListBox />
    </div>
  ),
}

export const MultipleFilters: Story = {
  render: () => (
    <div className="space-y-4 p-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium">Sort by</label>
          <ArchiveFilterListBox />
        </div>
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium">Category</label>
          <ArchiveFilterListBox />
        </div>
      </div>
    </div>
  ),
}

export const InHeader: Story = {
  render: () => (
    <div className="border-b bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Product Archive</h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Sort by:</span>
          <ArchiveFilterListBox />
        </div>
      </div>
    </div>
  ),
}

export const Responsive: Story = {
  render: () => (
    <div className="w-full max-w-4xl p-4">
      <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium">Price Range</label>
          <ArchiveFilterListBox />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Sort Order</label>
          <ArchiveFilterListBox />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">View Type</label>
          <ArchiveFilterListBox />
        </div>
      </div>
    </div>
  ),
}
