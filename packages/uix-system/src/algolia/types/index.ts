import { SearchResponse } from 'algoliasearch';

export interface AutocompleteProps extends Record<string, any> {
  className?: string;
  config: SearchConfig;
  detachedMediaQuery?: string;
  maxSuggestions?: number;
  onSelect?: (item: SearchHit) => void;
  placeholder?: string;
}

export interface InstantSearchContextConfig {
  indexName: string;
  searchClient: any;
  appId?: string;
  apiKey?: string;
}

export interface SearchBoxProps extends Record<string, any> {
  autoFocus?: boolean;
  className?: string;
  maxLength?: number;
  onReset?: () => void;
  onSubmit?: (query: string) => void;
  placeholder?: string;
}

export interface SearchConfig {
  apiKey: string;
  appId: string;
  indexName: string;
}

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

export interface SearchResultsProps extends Record<string, any> {
  className?: string;
  emptyComponent?: React.ComponentType;
  hitComponent?: React.ComponentType<{ hit: SearchHit }>;
  loadingComponent?: React.ComponentType;
}

export interface SearchState {
  error?: Error | null;
  isLoading: boolean;
  query: string;
  results?: SearchResponse<SearchHit>;
}

export interface SearchStatsProps extends Record<string, any> {
  className?: string;
  showQuery?: boolean;
  showTime?: boolean;
}

export interface UseInstantSearchProps extends Record<string, any> {
  indexName: string;
  routing?: boolean;
  searchClient: any;
}

export interface PaginationProps extends Record<string, any> {
  className?: string;
  showFirst?: boolean;
  showLast?: boolean;
  showPrevious?: boolean;
  showNext?: boolean;
  padding?: number;
  totalPages?: number;
}

export interface RefinementListProps extends Record<string, any> {
  attribute: string;
  className?: string;
  limit?: number;
  showMore?: boolean;
  showMoreLimit?: number;
  searchable?: boolean;
  searchablePlaceholder?: string;
  sortBy?: string[] | ((a: any, b: any) => number);
  transformItems?: (items: any[]) => any[];
}

export interface HighlightProps extends Record<string, any> {
  attribute: string;
  hit: any;
  className?: string;
  highlightedTagName?: string;
  nonHighlightedTagName?: string;
  separator?: string;
}

export interface SnippetProps extends Record<string, any> {
  attribute: string;
  hit: any;
  className?: string;
  highlightedTagName?: string;
  nonHighlightedTagName?: string;
  separator?: string;
}
