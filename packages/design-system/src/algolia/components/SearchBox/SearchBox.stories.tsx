import { Meta, StoryObj } from '@storybook/react';

import { SearchBox, SearchProvider, SearchResults, SearchStats } from '@repo/design-system/algolia';

const meta: Meta<typeof SearchBox> = {
  argTypes: {
    autoFocus: {
      control: 'boolean',
      description: 'Auto focus the search input on mount',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    maxLength: {
      control: 'number',
      description: 'Maximum length of search query',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the search input',
    },
  },
  component: SearchBox,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'algolia/SearchBox',
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock Algolia configuration for demo purposes
const mockConfig = {
  apiKey: '6be0576ff61c053d5f9a3225e2a90f76',
  appId: 'latency',
  indexName: 'instant_search',
};

export const Default: Story = {
  args: {
    autoFocus: false,
    placeholder: 'Search products...',
  },
  render: args => (
    <SearchProvider config={mockConfig}>
      <div className="space-y-4">
        <SearchBox {...args} />
        <SearchStats />
        <SearchResults />
      </div>
    </SearchProvider>
  ),
};

export const WithAutoFocus: Story = {
  args: {
    autoFocus: true,
    placeholder: 'Search with auto focus...',
  },
  render: args => (
    <SearchProvider config={mockConfig}>
      <div className="space-y-4">
        <SearchBox {...args} />
        <SearchStats />
      </div>
    </SearchProvider>
  ),
};

export const WithMaxLength: Story = {
  args: {
    maxLength: 50,
    placeholder: 'Search (max 50 chars)...',
  },
  render: args => (
    <SearchProvider config={mockConfig}>
      <div className="space-y-4">
        <SearchBox {...args} />
        <SearchStats />
        <SearchResults />
      </div>
    </SearchProvider>
  ),
};

export const CustomStyling: Story = {
  args: {
    className: 'max-w-lg mx-auto border-2 border-blue-300 rounded-lg',
    placeholder: 'Custom styled search...',
  },
  render: args => (
    <SearchProvider config={mockConfig}>
      <div className="space-y-6">
        <SearchBox {...args} />
        <SearchStats className="text-center text-blue-600" />
        <SearchResults className="rounded-lg border p-4" />
      </div>
    </SearchProvider>
  ),
};

export const ECommercSearch: Story = {
  args: {
    autoFocus: false,
    placeholder: 'Search for products, brands, categories...',
  },
  render: args => (
    <SearchProvider config={mockConfig}>
      <div className="rounded-lg bg-gray-50 p-6">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-6 text-center text-2xl font-bold">Product Search</h2>
          <SearchBox {...args} className="border-gray-300 shadow-lg" />
          <SearchStats className="mt-4 text-center text-gray-600" />
          <div className="mt-6">
            <SearchResults className="rounded-lg bg-white shadow-sm" />
          </div>
        </div>
      </div>
    </SearchProvider>
  ),
};

export const MinimalSearch: Story = {
  args: {
    placeholder: 'Type to search...',
  },
  render: args => (
    <SearchProvider config={mockConfig}>
      <div className="mx-auto max-w-md">
        <SearchBox
          {...args}
          className="rounded-none border-0 border-b-2 border-gray-300 focus:border-blue-500"
        />
      </div>
    </SearchProvider>
  ),
};

export const SearchWithFilters: Story = {
  render: () => (
    <SearchProvider config={mockConfig}>
      <div className="space-y-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <SearchBox placeholder="Search everything..." />
          </div>
          <select className="rounded-lg border px-3 py-2">
            <option>All Categories</option>
            <option>Electronics</option>
            <option>Clothing</option>
            <option>Home & Garden</option>
          </select>
        </div>
        <SearchStats />
        <div className="grid gap-6 md:grid-cols-[250px_1fr]">
          <div className="space-y-4">
            <h3 className="font-semibold">Filters</h3>
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" /> In Stock
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" /> On Sale
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" /> Free Shipping
              </label>
            </div>
          </div>
          <SearchResults />
        </div>
      </div>
    </SearchProvider>
  ),
};
