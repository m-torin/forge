import type { SearchResponse } from 'algoliasearch';

export interface SearchHit {
  objectID: string;
  title: string;
  description?: string;
  image?: string;
  url?: string;
  category?: string;
  price?: number;
  [key: string]: unknown;
}

export interface SearchConfig {
  appId: string;
  apiKey: string;
  indexName: string;
}

export interface SearchBoxProps {
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  maxLength?: number;
  onSubmit?: (query: string) => void;
  onReset?: () => void;
}

export interface AutocompleteProps {
  placeholder?: string;
  className?: string;
  maxSuggestions?: number;
  detachedMediaQuery?: string;
  onSelect?: (item: SearchHit) => void;
}

export interface SearchResultsProps {
  className?: string;
  hitComponent?: React.ComponentType<{ hit: SearchHit }>;
  emptyComponent?: React.ComponentType;
  loadingComponent?: React.ComponentType;
}

export interface SearchStatsProps {
  className?: string;
  showQuery?: boolean;
  showTime?: boolean;
}

export interface UseInstantSearchProps {
  searchClient: any;
  indexName: string;
  routing?: boolean;
}

export interface SearchState {
  query: string;
  results?: SearchResponse<SearchHit>;
  isLoading: boolean;
  error?: Error | null;
}