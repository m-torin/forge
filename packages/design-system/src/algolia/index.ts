export { default as Autocomplete } from './components/Autocomplete';
export { default as SearchBox } from './components/SearchBox';
// Algolia Search Components and Hooks
export { default as SearchProvider } from './components/SearchProvider';
export { default as SearchResults } from './components/SearchResults';
export { default as SearchStats } from './components/SearchStats';

// Hooks
export { useInstantSearch } from './hooks/useInstantSearch';
export { useInstantSearchConfig } from './hooks/useInstantSearchConfig';
export { useSearchBox } from './hooks/useSearchBox';
export { useSearchState } from './hooks/useSearchState';

// Types
export type * from './types';

export { getSearchConfig } from './utils/config';
// Utils
export { createSearchClient } from './utils/searchClient';
