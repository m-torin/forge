'use client';

import { ReactNode } from 'react';
import { InstantSearch } from 'react-instantsearch';

import { SearchConfig } from '../types';
import { createSearchClient } from '../utils/searchClient';

interface SearchProviderProps extends Record<string, any> {
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
      indexName={config.indexName}
      routing={routing}
      searchClient={searchClient}
      stalledSearchDelay={stalledSearchDelay}
    >
      {children}
    </InstantSearch>
  );
}
