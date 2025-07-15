import { Meta, StoryObj } from '@storybook/react';

import {
  Autocomplete,
  SearchBox,
  SearchProvider,
  SearchResults,
  SearchStats,
} from '@repo/design-system/algolia';

// This is a comprehensive example showing all Algolia components working together
const meta: Meta = {
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  title: 'algolia/CompleteSearchExample',
};

export default meta;
type Story = StoryObj;

// Mock Algolia configuration
const mockConfig = {
  apiKey: '6be0576ff61c053d5f9a3225e2a90f76',
  appId: 'latency',
  indexName: 'instant_search',
};

export const FullECommerceSearch: Story = {
  render: () => (
    <SearchProvider config={mockConfig}>
      <div className="min-h-screen bg-gray-50">
        {/* Header with Search */}
        <header className="sticky top-0 z-50 bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">ShopSearch</h1>
              </div>

              <div className="mx-8 max-w-2xl flex-1">
                <SearchBox
                  className="w-full"
                  placeholder="Search for products, brands, categories..."
                />
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Account</span>
                <span className="text-sm text-gray-600">Cart (0)</span>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            {/* Sidebar Filters */}
            <aside className="space-y-6">
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold">Quick Search</h3>
                <Autocomplete
                  className="w-full"
                  config={mockConfig}
                  placeholder="Type for suggestions..."
                />
              </div>

              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold">Filters</h3>

                <div className="space-y-6">
                  <div>
                    <h4 className="mb-3 font-medium">Category</h4>
                    <div className="space-y-2">
                      {['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books'].map(
                        category => (
                          <label key={category} className="flex items-center">
                            <input
                              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              type="checkbox"
                            />
                            <span className="text-sm text-gray-700">{category}</span>
                          </label>
                        ),
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3 font-medium">Price Range</h4>
                    <div className="space-y-2">
                      {['Under $25', '$25 - $50', '$50 - $100', '$100 - $200', 'Over $200'].map(
                        range => (
                          <label key={range} className="flex items-center">
                            <input
                              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              type="checkbox"
                            />
                            <span className="text-sm text-gray-700">{range}</span>
                          </label>
                        ),
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3 font-medium">Brand</h4>
                    <div className="space-y-2">
                      {['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony'].map(brand => (
                        <label key={brand} className="flex items-center">
                          <input
                            className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            type="checkbox"
                          />
                          <span className="text-sm text-gray-700">{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3 font-medium">Rating</h4>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map(stars => (
                        <label key={stars} className="flex items-center">
                          <input
                            className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            type="checkbox"
                          />
                          <div className="flex items-center">
                            {Array.from({ length: stars }, (_, i) => (
                              <span
                                key={`star-filled-${stars}-pos-${i}`}
                                className="text-yellow-400"
                              >
                                ★
                              </span>
                            ))}
                            {Array.from({ length: 5 - stars }, (_, i) => (
                              <span
                                key={`star-empty-${5 - stars}-pos-${i}`}
                                className="text-gray-300"
                              >
                                ★
                              </span>
                            ))}
                            <span className="ml-1 text-sm text-gray-600">& Up</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="space-y-6">
              {/* Search Stats and Sorting */}
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <SearchStats />
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">Sort by:</span>
                    <select className="rounded-md border border-gray-300 px-3 py-1 text-sm">
                      <option>Relevance</option>
                      <option>Price: Low to High</option>
                      <option>Price: High to Low</option>
                      <option>Customer Rating</option>
                      <option>Newest</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Search Results */}
              <div className="rounded-lg bg-white shadow-sm">
                <SearchResults />
              </div>
            </main>
          </div>
        </div>
      </div>
    </SearchProvider>
  ),
};

export const DocumentationSearch: Story = {
  render: () => (
    <SearchProvider config={mockConfig}>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="border-b bg-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <h1 className="text-xl font-bold">Documentation</h1>
              </div>
              <div className="ml-8 max-w-md flex-1">
                <SearchBox className="w-full" placeholder="Search docs..." />
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-[240px_1fr]">
            {/* Navigation */}
            <nav className="space-y-8">
              <div>
                <h3 className="mb-3 font-semibold text-gray-900">Getting Started</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <button
                      className="cursor-pointer border-none bg-transparent text-left text-blue-600 hover:text-blue-800"
                      type="button"
                    >
                      Installation
                    </button>
                  </li>
                  <li>
                    <button
                      className="cursor-pointer border-none bg-transparent text-left text-gray-600 hover:text-gray-800"
                      type="button"
                    >
                      Quick Start
                    </button>
                  </li>
                  <li>
                    <button
                      className="cursor-pointer border-none bg-transparent text-left text-gray-600 hover:text-gray-800"
                      type="button"
                    >
                      Configuration
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-gray-900">Components</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <button
                      className="cursor-pointer border-none bg-transparent text-left text-gray-600 hover:text-gray-800"
                      type="button"
                    >
                      SearchProvider
                    </button>
                  </li>
                  <li>
                    <button
                      className="cursor-pointer border-none bg-transparent text-left text-gray-600 hover:text-gray-800"
                      type="button"
                    >
                      SearchBox
                    </button>
                  </li>
                  <li>
                    <button
                      className="cursor-pointer border-none bg-transparent text-left text-gray-600 hover:text-gray-800"
                      type="button"
                    >
                      SearchResults
                    </button>
                  </li>
                  <li>
                    <button
                      className="cursor-pointer border-none bg-transparent text-left text-gray-600 hover:text-gray-800"
                      type="button"
                    >
                      Autocomplete
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-gray-900">Advanced</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <button
                      className="cursor-pointer border-none bg-transparent text-left text-gray-600 hover:text-gray-800"
                      type="button"
                    >
                      Custom Styling
                    </button>
                  </li>
                  <li>
                    <button
                      className="cursor-pointer border-none bg-transparent text-left text-gray-600 hover:text-gray-800"
                      type="button"
                    >
                      Server-Side Rendering
                    </button>
                  </li>
                  <li>
                    <button
                      className="cursor-pointer border-none bg-transparent text-left text-gray-600 hover:text-gray-800"
                      type="button"
                    >
                      Performance
                    </button>
                  </li>
                </ul>
              </div>
            </nav>

            {/* Content */}
            <main className="space-y-6">
              <SearchStats />
              <SearchResults />
            </main>
          </div>
        </div>
      </div>
    </SearchProvider>
  ),
};

export const MinimalBlogSearch: Story = {
  render: () => (
    <SearchProvider config={mockConfig}>
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">Search Our Blog</h1>
          <p className="mb-8 text-lg text-gray-600">Find articles, tutorials, and insights</p>
          <div className="mx-auto max-w-2xl">
            <SearchBox className="py-4 text-lg" placeholder="Search articles..." />
          </div>
        </div>

        <div className="space-y-6">
          <SearchStats className="text-center" />
          <SearchResults />
        </div>
      </div>
    </SearchProvider>
  ),
};
