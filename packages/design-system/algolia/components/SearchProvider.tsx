'use client';

import { InstantSearch } from 'react-instantsearch';
import type { ReactNode } from 'react';
import type { SearchConfig } from '../types';
import { createSearchClient } from '../utils/searchClient';

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
      searchClient={searchClient}
      indexName={config.indexName}
      routing={routing}
      stalledSearchDelay={stalledSearchDelay}
    >
      {children}
    </InstantSearch>
  );
}