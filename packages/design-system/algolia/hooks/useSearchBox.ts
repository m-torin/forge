'use client';

import { useSearchBox as useSearchBoxCore } from 'react-instantsearch';

export function useSearchBox() {
  const { query, refine, clear, isSearchStalled } = useSearchBoxCore();

  return {
    query,
    setQuery: refine,
    clearQuery: clear,
    isSearchStalled,
    onSubmit: (event: React.FormEvent) => {
      event.preventDefault();
      // Form submission is handled automatically by InstantSearch
    },
    onReset: () => {
      clear();
    },
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      refine(event.target.value);
    },
  };
}