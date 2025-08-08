// Example of a complete SSR search page with Next.js App Router
// This file demonstrates how to use Algolia with full SSR support

'use client';

import singletonRouter from 'next/router';

import ClearRefinements from '../components/ClearRefinements';
import CurrentRefinements from '../components/CurrentRefinements';
import Highlight from '../components/Highlight';
import InstantSearchSSRProvider from '../components/InstantSearchSSRProvider';
import Pagination from '../components/Pagination';
import RefinementList from '../components/RefinementList';
import SearchBox from '../components/SearchBox';
import SearchProvider from '../components/SearchProvider';
import SearchResults from '../components/SearchResults';
import SearchStats from '../components/SearchStats';
import { SearchHit } from '../types';
import { getSearchConfig } from '../utils/config';

interface SearchPageSSRProps {
  serverState?: any;
  url?: string;
}

// Custom hit component with highlighting
function HitComponent({ hit }: { hit: SearchHit }) {
  return (
    <article className="flex flex-col gap-2 rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-lg dark:border-gray-700">
      {hit.image && (
        <img alt={hit.title} className="h-48 w-full rounded-md object-cover" src={hit.image} />
      )}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        <Highlight attribute="title" hit={hit} />
      </h3>
      {hit.description && (
        <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
          <Highlight attribute="description" hit={hit} />
        </p>
      )}
      {hit.price && (
        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
          ${hit.price.toFixed(2)}
        </p>
      )}
      {hit.category && (
        <span className="text-xs text-gray-500 dark:text-gray-500">
          <Highlight attribute="category" hit={hit} />
        </span>
      )}
    </article>
  );
}

export default function SearchPageSSR({ serverState, url }: SearchPageSSRProps) {
  const config = getSearchConfig();

  // Wrap with SSR provider if server state is available
  const content = (
    <SearchProvider
      config={config}
      enableSSR
      routing
      serverUrl={url}
      singletonRouter={singletonRouter}
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">Search</h1>
          <SearchBox className="mb-4" placeholder="Search products..." />
          <div className="flex items-center justify-between">
            <SearchStats />
            <ClearRefinements />
          </div>
          <CurrentRefinements className="mt-2" />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <aside className="lg:col-span-1">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>

            <div className="space-y-6">
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category
                </h3>
                <RefinementList attribute="category" limit={5} showMore />
              </div>

              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Brand</h3>
                <RefinementList attribute="brand" limit={5} searchable />
              </div>

              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Price Range
                </h3>
                <RefinementList
                  attribute="price_range"
                  sortBy={['name:asc']}
                  transformItems={items =>
                    items.map(item => ({
                      ...item,
                      label: item.label.replace('_', ' - '),
                    }))
                  }
                />
              </div>
            </div>
          </aside>

          <div className="lg:col-span-3">
            <SearchResults hitComponent={HitComponent} />
            <Pagination className="mt-8" />
          </div>
        </div>
      </div>
    </SearchProvider>
  );

  // If we have server state, wrap with SSR provider
  if (serverState) {
    return <InstantSearchSSRProvider {...serverState}>{content}</InstantSearchSSRProvider>;
  }

  return content;
}

// Example of how to use this in a Next.js page:
/*
// app/search/page.tsx
import { SearchPageSSR } from '../index';
import { getServerState } from '../index';

export const dynamic = 'force-dynamic';

export default async function SearchPage() {
  // Get server state for SSR
  const serverState = await getServerState(SearchPageSSR);
  const url = 'https://yoursite.com/search'; // Get from request

  return <SearchPageSSR serverState={serverState} url={url} />;
}
*/
