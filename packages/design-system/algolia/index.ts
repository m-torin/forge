// Algolia Search Components and Hooks
export { default as SearchProvider } from './components/SearchProvider';
export { default as SearchBox } from './components/SearchBox';
export { default as Autocomplete } from './components/Autocomplete';
export { default as SearchResults } from './components/SearchResults';
export { default as SearchStats } from './components/SearchStats';

// Hooks
export { useInstantSearch } from './hooks/useInstantSearch';
export { useSearchBox } from './hooks/useSearchBox';
export { useSearchState } from './hooks/useSearchState';

// Types
export type * from './types';

// Utils
export { createSearchClient } from './utils/searchClient';
export { getSearchConfig } from './utils/config';
