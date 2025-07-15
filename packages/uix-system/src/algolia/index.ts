// Components
export { default as Autocomplete } from './components/Autocomplete';
export { default as ClearRefinements } from './components/ClearRefinements';
export { default as CurrentRefinements } from './components/CurrentRefinements';
export { default as Highlight } from './components/Highlight';
export { default as InfiniteHits, useInfiniteHits } from './components/InfiniteHits';
export { default as InstantSearchSSRProvider } from './components/InstantSearchSSRProvider';
export { default as Pagination } from './components/Pagination';
export { default as RefinementList } from './components/RefinementList';
export { default as SearchBox } from './components/SearchBox';
export { default as SearchProvider } from './components/SearchProvider';
export { default as SearchResults } from './components/SearchResults';
export { default as SearchStats } from './components/SearchStats';
export { default as Snippet } from './components/Snippet';

// Hooks
export { useInstantSearch } from './hooks/useInstantSearch';
export { useInstantSearchConfig } from './hooks/useInstantSearchConfig';
export { useSearchBox } from './hooks/useSearchBox';
export { useSearchState } from './hooks/useSearchState';

// Types
export type * from './types';

// Utils
export { getSearchConfig } from './utils/config';
export { getServerState } from './utils/getServerState';
export { createRouter } from './utils/router';
export { createSearchClient } from './utils/searchClient';

// Examples
export { default as SearchPageSSR } from './examples/SearchPageSSR';
