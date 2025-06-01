'use client';

import { useState, useCallback } from 'react';
import type { SearchState, SearchHit } from '../types';

export function useSearchState(initialQuery = '') {
  const [state, setState] = useState<SearchState>({
    query: initialQuery,
    isLoading: false,
    error: null,
  });

  const setQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, query }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  const setResults = useCallback((results: any) => {
    setState(prev => ({ ...prev, results, isLoading: false, error: null }));
  }, []);

  const setError = useCallback((error: Error) => {
    setState(prev => ({ ...prev, error, isLoading: false }));
  }, []);

  const clearState = useCallback(() => {
    setState({
      query: '',
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    setQuery,
    setLoading,
    setResults,
    setError,
    clearState,
  };
}