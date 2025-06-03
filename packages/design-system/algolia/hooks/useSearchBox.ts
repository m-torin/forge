'use client';

import { useSearchBox as useSearchBoxCore } from 'react-instantsearch';

export function useSearchBox() {
  const { clear, isSearchStalled, query, refine } = useSearchBoxCore();

  return {
    clearQuery: clear,
    isSearchStalled,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      refine(event.target.value);
    },
    onReset: () => {
      clear();
    },
    onSubmit: (event: React.FormEvent) => {
      event.preventDefault();
      // Form submission is handled automatically by InstantSearch
    },
    query,
    setQuery: refine,
  };
}
