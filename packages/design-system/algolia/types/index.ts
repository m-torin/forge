import type { SearchResponse } from 'algoliasearch';

export interface SearchHit {
  [key: string]: unknown;
  category?: string;
  description?: string;
  image?: string;
  objectID: string;
  price?: number;
  title: string;
  url?: string;
}

export interface SearchConfig {
  apiKey: string;
  appId: string;
  indexName: string;
}

export interface SearchBoxProps {
  autoFocus?: boolean;
  className?: string;
  maxLength?: number;
  onReset?: () => void;
  onSubmit?: (query: string) => void;
  placeholder?: string;
}

export interface AutocompleteProps {
  className?: string;
  detachedMediaQuery?: string;
  maxSuggestions?: number;
  onSelect?: (item: SearchHit) => void;
  placeholder?: string;
}

export interface SearchResultsProps {
  className?: string;
  emptyComponent?: React.ComponentType;
  hitComponent?: React.ComponentType<{ hit: SearchHit }>;
  loadingComponent?: React.ComponentType;
}

export interface SearchStatsProps {
  className?: string;
  showQuery?: boolean;
  showTime?: boolean;
}

export interface UseInstantSearchProps {
  indexName: string;
  routing?: boolean;
  searchClient: any;
}

export interface SearchState {
  error?: Error | null;
  isLoading: boolean;
  query: string;
  results?: SearchResponse<SearchHit>;
}
