'use client';

import { useCallback, useState } from 'react';

import { SearchState } from '../types';

export function useSearchState(initialQuery = '') {
  const [state, setState] = useState<SearchState>({
    error: null,
    isLoading: false,
    query: initialQuery,
  });

  const setQuery = useCallback((query: string) => {
    setState((prev: any) => ({ ...prev, query }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState((prev: any) => ({ ...prev, isLoading }));
  }, []);

  const setResults = useCallback((results: any) => {
    setState((prev: any) => ({ ...prev, error: null, isLoading: false, results }));
  }, []);

  const setError = useCallback((error: Error) => {
    setState((prev: any) => ({ ...prev, error, isLoading: false }));
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
