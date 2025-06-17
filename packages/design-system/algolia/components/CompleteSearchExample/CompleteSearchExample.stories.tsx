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
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">ShopSearch</h1>
              </div>

              <div className="flex-1 max-w-2xl mx-8">
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-[280px_1fr] gap-8">
            {/* Sidebar Filters */}
            <aside className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Search</h3>
                <Autocomplete
                  className="w-full"
                  config={mockConfig}
                  placeholder="Type for suggestions..."
                />
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Filters</h3>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Category</h4>
                    <div className="space-y-2">
                      {['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books'].map(
                        (category) => (
                          <label key={category} className="flex items-center">
                            <input
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                              type="checkbox"
                            />
                            <span className="text-sm text-gray-700">{category}</span>
                          </label>
                        ),
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Price Range</h4>
                    <div className="space-y-2">
                      {['Under $25', '$25 - $50', '$50 - $100', '$100 - $200', 'Over $200'].map(
                        (range) => (
                          <label key={range} className="flex items-center">
                            <input
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                              type="checkbox"
                            />
                            <span className="text-sm text-gray-700">{range}</span>
                          </label>
                        ),
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Brand</h4>
                    <div className="space-y-2">
                      {['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony'].map((brand) => (
                        <label key={brand} className="flex items-center">
                          <input
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                            type="checkbox"
                          />
                          <span className="text-sm text-gray-700">{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Rating</h4>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((stars) => (
                        <label key={stars} className="flex items-center">
                          <input
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
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
                            <span className="text-sm text-gray-600 ml-1">& Up</span>
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
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <SearchStats />
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">Sort by:</span>
                    <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
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
              <div className="bg-white rounded-lg shadow-sm">
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
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold">Documentation</h1>
              </div>
              <div className="flex-1 max-w-md ml-8">
                <SearchBox autoFocus className="w-full" placeholder="Search docs..." />
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-[240px_1fr] gap-8">
            {/* Navigation */}
            <nav className="space-y-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Getting Started</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <button
                      className="text-blue-600 hover:text-blue-800 bg-transparent border-none cursor-pointer text-left"
                      type="button"
                    >
                      Installation
                    </button>
                  </li>
                  <li>
                    <button
                      className="text-gray-600 hover:text-gray-800 bg-transparent border-none cursor-pointer text-left"
                      type="button"
                    >
                      Quick Start
                    </button>
                  </li>
                  <li>
                    <button
                      className="text-gray-600 hover:text-gray-800 bg-transparent border-none cursor-pointer text-left"
                      type="button"
                    >
                      Configuration
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Components</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <button
                      className="text-gray-600 hover:text-gray-800 bg-transparent border-none cursor-pointer text-left"
                      type="button"
                    >
                      SearchProvider
                    </button>
                  </li>
                  <li>
                    <button
                      className="text-gray-600 hover:text-gray-800 bg-transparent border-none cursor-pointer text-left"
                      type="button"
                    >
                      SearchBox
                    </button>
                  </li>
                  <li>
                    <button
                      className="text-gray-600 hover:text-gray-800 bg-transparent border-none cursor-pointer text-left"
                      type="button"
                    >
                      SearchResults
                    </button>
                  </li>
                  <li>
                    <button
                      className="text-gray-600 hover:text-gray-800 bg-transparent border-none cursor-pointer text-left"
                      type="button"
                    >
                      Autocomplete
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Advanced</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <button
                      className="text-gray-600 hover:text-gray-800 bg-transparent border-none cursor-pointer text-left"
                      type="button"
                    >
                      Custom Styling
                    </button>
                  </li>
                  <li>
                    <button
                      className="text-gray-600 hover:text-gray-800 bg-transparent border-none cursor-pointer text-left"
                      type="button"
                    >
                      Server-Side Rendering
                    </button>
                  </li>
                  <li>
                    <button
                      className="text-gray-600 hover:text-gray-800 bg-transparent border-none cursor-pointer text-left"
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
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Search Our Blog</h1>
          <p className="text-lg text-gray-600 mb-8">Find articles, tutorials, and insights</p>
          <div className="max-w-2xl mx-auto">
            <SearchBox className="text-lg py-4" placeholder="Search articles..." />
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
