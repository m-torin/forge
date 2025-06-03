'use client';

import { useCallback, useState } from 'react';

import type { SearchState } from '../types';

export function useSearchState(initialQuery = '') {
  const [state, setState] = useState<SearchState>({
    error: null,
    isLoading: false,
    query: initialQuery,
  });

  const setQuery = useCallback((query: string) => {
    setState((prev) => ({ ...prev, query }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState((prev) => ({ ...prev, isLoading }));
  }, []);

  const setResults = useCallback((results: any) => {
    setState((prev) => ({ ...prev, error: null, isLoading: false, results }));
  }, []);

  const setError = useCallback((error: Error) => {
    setState((prev) => ({ ...prev, error, isLoading: false }));
  }, []);

  const clearState = useCallback(() => {
    setState({
      error: null,
      isLoading: false,
      query: '',
    });
  }, []);

  return {
    ...state,
    clearState,
    setError,
    setLoading,
    setQuery,
    setResults,
  };
}
