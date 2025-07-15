'use client';

import { useCallback, useEffect, useState } from 'react';
import { useInstantSearch } from 'react-instantsearch';

import { SearchState } from '../types';

type SearchResults = {
  nbHits: number;
  [key: string]: any;
};

export function useSearchState(initialQuery = '') {
  const { status, results, error: searchError, setIndexUiState } = useInstantSearch();

  const [state, setState] = useState<SearchState>({
    error: null,
    isLoading: status === 'loading',
    query: initialQuery,
    results: results as any,
  });

  // Sync with InstantSearch state
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isLoading: status === 'loading' || status === 'stalled',
      results: results as any,
      error: searchError || null,
    }));
  }, [status, results, searchError]);

  const setQuery = useCallback(
    (query: string) => {
      setState(prev => ({ ...prev, query }));
      // Update InstantSearch query
      setIndexUiState(prevUiState => ({
        ...prevUiState,
        query,
      }));
    },
    [setIndexUiState],
  );

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  const setResults = useCallback((results: any) => {
    setState(prev => ({
      ...prev,
      error: null,
      isLoading: false,
      results,
    }));
  }, []);

  const setError = useCallback((error: Error) => {
    setState(prev => ({
      ...prev,
      error,
      isLoading: false,
      results: undefined,
    }));
  }, []);

  const clearState = useCallback(() => {
    setState({
      error: null,
      isLoading: false,
      query: '',
      results: undefined,
    });
    // Clear InstantSearch query
    setIndexUiState(prevUiState => ({
      ...prevUiState,
      query: '',
    }));
  }, [setIndexUiState]);

  const retry = useCallback(() => {
    if (state.query) {
      setLoading(true);
      setQuery(state.query);
    }
  }, [state.query, setLoading, setQuery]);

  return {
    ...state,
    clearState,
    setError,
    setLoading,
    setQuery,
    setResults,
    retry,
    // Computed properties
    hasError: !!state.error,
    hasResults: !!state.results && (state.results as SearchResults).nbHits > 0,
    isEmpty: !!state.results && (state.results as SearchResults).nbHits === 0,
  };
}
