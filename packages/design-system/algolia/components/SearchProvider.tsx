'use client';

import { InstantSearch } from 'react-instantsearch';

import { createSearchClient } from '../utils/searchClient';

import type { SearchConfig } from '../types';
import type { ReactNode } from 'react';

interface SearchProviderProps {
  children: ReactNode;
  config: SearchConfig;
  routing?: boolean;
  stalledSearchDelay?: number;
}

export default function SearchProvider({
  children,
  config,
  routing = false,
  stalledSearchDelay = 200,
}: SearchProviderProps) {
  const searchClient = createSearchClient(config);

  return (
    <InstantSearch
      routing={routing}
      indexName={config.indexName}
      searchClient={searchClient}
      stalledSearchDelay={stalledSearchDelay}
    >
      {children}
    </InstantSearch>
  );
}
