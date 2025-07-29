'use client';

import type { SingletonRouter } from 'next/router';
import { ReactNode } from 'react';
import { InstantSearch } from 'react-instantsearch';
import { InstantSearchNext } from 'react-instantsearch-nextjs';

import { SearchConfig } from '../types';
import { createRouter } from '../utils/router';
import { createSearchClient } from '../utils/searchClient';

interface SearchProviderProps extends Record<string, any> {
  children: ReactNode;
  config: SearchConfig;
  routing?: boolean | { router?: any };
  stalledSearchDelay?: number;
  serverState?: any;
  serverUrl?: string;
  enableSSR?: boolean;
  singletonRouter?: SingletonRouter;
  routerOptions?: any;
}

export default function SearchProvider({
  children,
  config,
  routing = false,
  stalledSearchDelay = 200,
  serverState: _serverState,
  serverUrl,
  enableSSR = true,
  singletonRouter,
  routerOptions,
}: SearchProviderProps) {
  const searchClient = createSearchClient(config);

  // Use InstantSearchNext for SSR support in Next.js environments
  // Check if we're in a Next.js environment
  const isNextJs = (typeof window !== 'undefined' && '_next' in window) || process.env.NEXT_RUNTIME;

  // Configure routing
  let routingConfig = routing;
  if (routing === true && singletonRouter) {
    routingConfig = {
      router: createRouter({
        singletonRouter,
        serverUrl,
        routerOptions,
      }),
    };
  }

  if (enableSSR && isNextJs) {
    return (
      <InstantSearchNext
        indexName={config.indexName}
        routing={routingConfig}
        searchClient={searchClient}
        stalledSearchDelay={stalledSearchDelay}
      >
        {children}
      </InstantSearchNext>
    );
  }

  // Fallback to regular InstantSearch for non-Next.js environments
  return (
    <InstantSearch
      indexName={config.indexName}
      routing={routingConfig}
      searchClient={searchClient}
      stalledSearchDelay={stalledSearchDelay}
    >
      {children}
    </InstantSearch>
  );
}
