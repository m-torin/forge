import { Meta, StoryObj } from '@storybook/react';

import {
  Autocomplete,
  SearchBox,
  SearchProvider,
  SearchResults,
  SearchStats,
} from '@repo/design-system/algolia';

const meta: Meta<typeof SearchProvider> = {
  argTypes: {
    config: {
      description: 'Algolia configuration object',
    },
  },
  component: SearchProvider,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'algolia/SearchProvider',
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock Algolia configurations
const mockConfig = {
  apiKey: '6be0576ff61c053d5f9a3225e2a90f76',
  appId: 'latency',
  indexName: 'instant_search',
};

const ecommerceConfig = {
  apiKey: '6be0576ff61c053d5f9a3225e2a90f76',
  appId: 'latency',
  indexName: 'instant_search_demo_query_suggestions',
};

export const BasicSetup: Story = {
  args: {
    config: mockConfig,
  },
  render: args => (
    <SearchProvider {...args}>
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Basic Search Setup</h2>
        <SearchBox placeholder="Search products..." />
        <SearchStats />
        <SearchResults />
      </div>
    </SearchProvider>
  ),
};

export const WithAutocomplete: Story = {
  args: {
    config: ecommerceConfig,
  },
  render: args => (
    <SearchProvider {...args}>
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Search with Autocomplete</h2>
        <Autocomplete config={args.config} placeholder="Type to see suggestions..." />
        <SearchStats />
        <SearchResults />
      </div>
    </SearchProvider>
  ),
};

export const MultiIndexSearch: Story = {
  render: () => (
    <div className="space-y-8">
      <SearchProvider config={mockConfig}>
        <div className="rounded-lg border p-4">
          <h3 className="mb-4 text-lg font-semibold">Products Index</h3>
          <SearchBox placeholder="Search products..." />
          <SearchStats />
          <SearchResults />
        </div>
      </SearchProvider>

      <SearchProvider config={ecommerceConfig}>
        <div className="rounded-lg border p-4">
          <h3 className="mb-4 text-lg font-semibold">Query Suggestions Index</h3>
          <Autocomplete config={ecommerceConfig} placeholder="Search with suggestions..." />
          <SearchStats />
        </div>
      </SearchProvider>
    </div>
  ),
};

export const ECommerceDemo: Story = {
  args: {
    config: mockConfig,
  },
  render: args => (
    <SearchProvider {...args}>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <header className="mb-6 rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">E-Commerce Store</h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Sign In</span>
                <span className="text-sm text-gray-600">Cart (0)</span>
              </div>
            </div>
            <SearchBox
              className="mx-auto w-full max-w-2xl"
              placeholder="Search for products, brands, categories..."
            />
          </header>

          {/* Search Results */}
          <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
            {/* Sidebar Filters */}
            <aside className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold">Filters</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium">Category</h4>
                  <div className="space-y-1 text-sm">
                    <label className="flex items-center gap-2">
                      <input className="rounded" type="checkbox" />
                      Electronics
                    </label>
                    <label className="flex items-center gap-2">
                      <input className="rounded" type="checkbox" />
                      Clothing
                    </label>
                    <label className="flex items-center gap-2">
                      <input className="rounded" type="checkbox" />
                      Home & Garden
                    </label>
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Price Range</h4>
                  <div className="space-y-1 text-sm">
                    <label className="flex items-center gap-2">
                      <input className="rounded" type="checkbox" />
                      Under $25
                    </label>
                    <label className="flex items-center gap-2">
                      <input className="rounded" type="checkbox" />
                      $25 - $100
                    </label>
                    <label className="flex items-center gap-2">
                      <input className="rounded" type="checkbox" />
                      Over $100
                    </label>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="rounded-lg bg-white p-6 shadow-sm">
              <SearchStats className="mb-4" />
              <SearchResults />
            </main>
          </div>
        </div>
      </div>
    </SearchProvider>
  ),
};

export const DocumentationSearch: Story = {
  args: {
    config: mockConfig,
  },
  render: args => (
    <SearchProvider {...args}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-3xl font-bold">Documentation</h1>
          <SearchBox className="mx-auto max-w-lg" placeholder="Search documentation..." />
        </div>

        <div className="grid gap-6 md:grid-cols-[200px_1fr]">
          <nav className="space-y-2 text-sm">
            <div className="font-semibold">Getting Started</div>
            <div className="space-y-1 pl-4">
              <div>Installation</div>
              <div>Quick Start</div>
              <div>Configuration</div>
            </div>
            <div className="mt-4 font-semibold">Components</div>
            <div className="space-y-1 pl-4">
              <div>SearchBox</div>
              <div>SearchResults</div>
              <div>Autocomplete</div>
            </div>
          </nav>

          <div>
            <SearchStats className="mb-4" />
            <SearchResults />
          </div>
        </div>
      </div>
    </SearchProvider>
  ),
};
