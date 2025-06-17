'use client';

import { useInstantSearch as useInstantSearchCore } from 'react-instantsearch';

interface ExtendedInstantSearchResult {
  addMiddlewares: (...middlewares: any[]) => void;
  error?: Error;
  hasResults: boolean;
  isSearchStalled: boolean;
  nbHits: number;
  processingTimeMS: number;
  query: string;
  refresh: () => void;
  results: any;
  status: string;
  uiState: any;
}

export function useInstantSearch(): ExtendedInstantSearchResult {
  const instantSearch = useInstantSearchCore();

  return {
    ...instantSearch,
    hasResults: Boolean(instantSearch.results?.nbHits),
    isSearchStalled: instantSearch.status === 'stalled',
    nbHits: instantSearch.results?.nbHits ?? 0,
    processingTimeMS: instantSearch.results?.processingTimeMS ?? 0,
    query: (instantSearch.uiState as any)?.query ?? '',
  };
}
