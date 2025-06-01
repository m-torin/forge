'use client';

import { useInstantSearch as useInstantSearchCore } from 'react-instantsearch';
import type { UseInstantSearchProps } from '../types';

interface ExtendedInstantSearchResult {
  query: string;
  isSearchStalled: boolean;
  hasResults: boolean;
  nbHits: number;
  processingTimeMS: number;
  status: string;
  uiState: any;
  results: any;
  refresh: () => void;
  error?: Error;
  addMiddlewares: (...middlewares: any[]) => () => void;
}

export function useInstantSearch(): ExtendedInstantSearchResult {
  const instantSearch = useInstantSearchCore();
  
  return {
    ...instantSearch,
    query: (instantSearch.uiState as any)?.query || '',
    isSearchStalled: instantSearch.status === 'stalled',
    hasResults: instantSearch.results && instantSearch.results.nbHits > 0,
    nbHits: instantSearch.results?.nbHits || 0,
    processingTimeMS: instantSearch.results?.processingTimeMS || 0,
  };
}