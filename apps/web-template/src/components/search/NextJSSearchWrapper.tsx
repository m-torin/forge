'use client';

import { InstantSearchNext } from 'react-instantsearch-nextjs';
import { getSearchClient, getIndexName } from '@/lib/algolia';

interface NextJSSearchWrapperProps {
  children: React.ReactNode;
}

export function NextJSSearchWrapper({ children }: NextJSSearchWrapperProps) {
  const searchClient = getSearchClient();
  const indexName = getIndexName();

  return (
    <InstantSearchNext
      searchClient={searchClient}
      indexName={indexName}
      future={{
        preserveSharedStateOnUnmount: true,
      }}
    >
      {children}
    </InstantSearchNext>
  );
}
