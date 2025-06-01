import type { Meta, StoryObj } from '@storybook/react';
import { SearchProvider, SearchBox, SearchResults, SearchStats, Autocomplete } from '@repo/design-system/algolia';

const meta: Meta<typeof SearchProvider> = {
  title: 'algolia/SearchProvider',
  component: SearchProvider,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    config: {
      description: 'Algolia configuration object',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock Algolia configurations
const mockConfig = {
  appId: 'latency',
  apiKey: '6be0576ff61c053d5f9a3225e2a90f76',
  indexName: 'instant_search',
};

const ecommerceConfig = {
  appId: 'latency',
  apiKey: '6be0576ff61c053d5f9a3225e2a90f76',
  indexName: 'instant_search_demo_query_suggestions',
};

export const BasicSetup: Story = {
  args: {
    config: mockConfig,
  },
  render: (args: any) => (
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
  render: (args: any) => (
    <SearchProvider {...args}>
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Search with Autocomplete</h2>
        <Autocomplete placeholder="Type to see suggestions..." />
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
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Products Index</h3>
          <SearchBox placeholder="Search products..." />
          <SearchStats />
          <SearchResults />
        </div>
      </SearchProvider>

      <SearchProvider config={ecommerceConfig}>
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Query Suggestions Index</h3>
          <Autocomplete placeholder="Search with suggestions..." />
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
  render: (args: any) => (
    <SearchProvider {...args}>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">
                E-Commerce Store
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Sign In</span>
                <span className="text-sm text-gray-600">Cart (0)</span>
              </div>
            </div>
            <SearchBox 
              placeholder="Search for products, brands, categories..." 
              className="w-full max-w-2xl mx-auto"
            />
          </header>

          {/* Search Results */}
          <div className="grid lg:grid-cols-[250px_1fr] gap-6">
            {/* Sidebar Filters */}
            <aside className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-4">Filters</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Category</h4>
                  <div className="space-y-1 text-sm">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      Electronics
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      Clothing
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      Home & Garden
                    </label>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Price Range</h4>
                  <div className="space-y-1 text-sm">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      Under $25
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      $25 - $100
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      Over $100
                    </label>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="bg-white rounded-lg shadow-sm p-6">
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
  render: (args: any) => (
    <SearchProvider {...args}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Documentation</h1>
          <SearchBox 
            placeholder="Search documentation..." 
            className="max-w-lg mx-auto"
            autoFocus
          />
        </div>
        
        <div className="grid md:grid-cols-[200px_1fr] gap-6">
          <nav className="space-y-2 text-sm">
            <div className="font-semibold">Getting Started</div>
            <div className="pl-4 space-y-1">
              <div>Installation</div>
              <div>Quick Start</div>
              <div>Configuration</div>
            </div>
            <div className="font-semibold mt-4">Components</div>
            <div className="pl-4 space-y-1">
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