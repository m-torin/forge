'use client';

import { useDebouncedValue, useLocalStorage, usePagination } from '@mantine/hooks';
import { useCallback, useMemo, useState } from 'react';
import type { SavedDocument } from './use-document-persistence';

export interface DocumentSearchFilters {
  dateRange?: {
    start?: string;
    end?: string;
  };
  wordCountRange?: {
    min?: number;
    max?: number;
  };
  hasContent?: boolean;
  searchIn: ('title' | 'content' | 'both')[];
  sortBy: 'relevance' | 'modified' | 'created' | 'title' | 'wordCount';
  sortOrder: 'asc' | 'desc';
}

export interface DocumentSearchResult {
  document: SavedDocument;
  relevanceScore: number;
  titleMatches: Array<{ text: string; isMatch: boolean }>;
  contentMatches: Array<{
    text: string;
    isMatch: boolean;
    context: string;
    position: number;
  }>;
  matchCount: number;
}

export interface SearchHistory {
  query: string;
  timestamp: string;
  resultCount: number;
}

export interface UseDocumentSearchOptions {
  maxResults?: number;
  enableHistory?: boolean;
  contextLength?: number;
  maxContentMatches?: number;
  debounceMs?: number; // Debounce delay for search queries
  pageSize?: number; // Number of results per page
  enablePagination?: boolean; // Enable pagination for results
}

export function useDocumentSearch(
  documents: Record<string, SavedDocument>,
  options: UseDocumentSearchOptions = {},
) {
  const {
    maxResults = 50,
    enableHistory = true,
    contextLength = 100,
    maxContentMatches = 3,
    debounceMs = 300,
    pageSize = 10,
    enablePagination = true,
  } = options;

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<DocumentSearchFilters>({
    searchIn: ['both'],
    sortBy: 'relevance',
    sortOrder: 'desc',
  });
  const [isSearching, setIsSearching] = useState(false);

  // Debounce the search query to avoid excessive search operations
  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, debounceMs);

  // Search history stored in localStorage
  const [searchHistory, setSearchHistory] = useLocalStorage<SearchHistory[]>({
    key: 'notion-editor-search-history',
    defaultValue: [],
    serialize: JSON.stringify,
    deserialize: value => (value === undefined ? [] : JSON.parse(value)),
  });

  // Search preferences
  const [searchPreferences, setSearchPreferences] = useLocalStorage({
    key: 'notion-editor-search-preferences',
    defaultValue: {
      highlightMatches: true,
      showContentPreview: true,
      saveSearchHistory: true,
      maxHistoryItems: 20,
    },
    serialize: JSON.stringify,
    deserialize: value =>
      value === undefined
        ? {
            highlightMatches: true,
            showContentPreview: true,
            saveSearchHistory: true,
            maxHistoryItems: 20,
          }
        : JSON.parse(value),
  });

  // Enhanced search algorithm with scoring
  const performSearch = useCallback(
    (query: string, docs: Record<string, SavedDocument>): DocumentSearchResult[] => {
      if (!query.trim()) return [];

      setIsSearching(true);
      const searchTerms = query
        .toLowerCase()
        .split(/\s+/)
        .filter(term => term.length > 0);
      const results: DocumentSearchResult[] = [];

      try {
        Object.values(docs).forEach(document => {
          let relevanceScore = 0;
          let matchCount = 0;
          const titleMatches: Array<{ text: string; isMatch: boolean }> = [];
          const contentMatches: Array<{
            text: string;
            isMatch: boolean;
            context: string;
            position: number;
          }> = [];

          // Apply filters
          if (filters.dateRange?.start || filters.dateRange?.end) {
            const docDate = new Date(document.modified);
            if (filters.dateRange.start && docDate < new Date(filters.dateRange.start)) return;
            if (filters.dateRange.end && docDate > new Date(filters.dateRange.end)) return;
          }

          if (filters.wordCountRange?.min && document.wordCount < filters.wordCountRange.min)
            return;
          if (filters.wordCountRange?.max && document.wordCount > filters.wordCountRange.max)
            return;
          if (filters.hasContent && document.content.text.trim().length === 0) return;

          // Search in title
          if (filters.searchIn.includes('title') || filters.searchIn.includes('both')) {
            const titleWords = document.title.split(/(\s+)/);

            titleWords.forEach(word => {
              const wordLower = word.toLowerCase();
              const isMatch = searchTerms.some(term => {
                if (wordLower.includes(term)) {
                  matchCount++;
                  // Calculate relevance score
                  if (wordLower === term)
                    relevanceScore += 10; // Exact match
                  else if (wordLower.startsWith(term))
                    relevanceScore += 7; // Starts with
                  else relevanceScore += 4; // Contains
                  return true;
                }
                return false;
              });
              titleMatches.push({ text: word, isMatch });
            });
          }

          // Search in content
          if (filters.searchIn.includes('content') || filters.searchIn.includes('both')) {
            const contentText = document.content.text;
            const contentLower = contentText.toLowerCase();

            searchTerms.forEach(term => {
              let index = 0;
              let termMatches = 0;

              while (
                (index = contentLower.indexOf(term, index)) !== -1 &&
                termMatches < maxContentMatches
              ) {
                matchCount++;
                termMatches++;
                relevanceScore += 2; // Content matches get lower score than title

                // Extract context around the match
                const contextStart = Math.max(0, index - Math.floor(contextLength / 2));
                const contextEnd = Math.min(
                  contentText.length,
                  index + term.length + Math.floor(contextLength / 2),
                );
                let context = contentText.slice(contextStart, contextEnd);

                // Clean up context boundaries
                if (contextStart > 0) {
                  const firstSpace = context.indexOf(' ');
                  if (firstSpace !== -1) context = context.slice(firstSpace + 1);
                }

                if (contextEnd < contentText.length) {
                  const lastSpace = context.lastIndexOf(' ');
                  if (lastSpace !== -1) context = context.slice(0, lastSpace);
                }

                contentMatches.push({
                  text: term,
                  isMatch: true,
                  context,
                  position: index,
                });

                index += term.length;
              }
            });
          }

          // Apply relevance boosts
          const daysSinceModified =
            (Date.now() - new Date(document.modified).getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceModified < 7)
            relevanceScore += 3; // Recent documents
          else if (daysSinceModified < 30) relevanceScore += 1;

          if (document.wordCount > 500) relevanceScore += 1; // Longer documents
          if (matchCount > 5) relevanceScore += 2; // Documents with many matches

          // Exact phrase matching bonus
          const exactPhraseMatch = document.content.text
            .toLowerCase()
            .includes(query.toLowerCase());
          if (exactPhraseMatch) relevanceScore += 5;

          if (matchCount > 0) {
            results.push({
              document,
              relevanceScore,
              titleMatches,
              contentMatches: contentMatches.slice(0, maxContentMatches),
              matchCount,
            });
          }
        });

        // Sort results
        results.sort((a, b) => {
          let comparison = 0;

          switch (filters.sortBy) {
            case 'relevance':
              comparison = a.relevanceScore - b.relevanceScore;
              break;
            case 'title':
              comparison = a.document.title.localeCompare(b.document.title);
              break;
            case 'modified':
              comparison =
                new Date(a.document.modified).getTime() - new Date(b.document.modified).getTime();
              break;
            case 'created':
              comparison =
                new Date(a.document.created).getTime() - new Date(b.document.created).getTime();
              break;
            case 'wordCount':
              comparison = a.document.wordCount - b.document.wordCount;
              break;
          }

          return filters.sortOrder === 'asc' ? comparison : -comparison;
        });

        // Add to search history
        if (enableHistory && searchPreferences.saveSearchHistory && query.trim()) {
          const historyEntry: SearchHistory = {
            query: query.trim(),
            timestamp: new Date().toISOString(),
            resultCount: results.length,
          };

          setSearchHistory(prev => {
            const filtered = prev.filter(h => h.query !== query.trim());
            const updated = [historyEntry, ...filtered];
            return updated.slice(0, searchPreferences.maxHistoryItems);
          });
        }

        return results.slice(0, maxResults);
      } finally {
        setIsSearching(false);
      }
    },
    [
      filters,
      maxResults,
      maxContentMatches,
      contextLength,
      enableHistory,
      searchPreferences,
      setSearchHistory,
    ],
  );

  // Memoized search results using debounced query
  const allSearchResults = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return [];
    return performSearch(debouncedSearchQuery, documents);
  }, [debouncedSearchQuery, documents, performSearch]);

  // Pagination for search results
  const pagination = usePagination({
    total: enablePagination ? Math.ceil(allSearchResults.length / pageSize) : 1,
    initialPage: 1,
    onChange: () => {
      // Reset to page 1 when search query changes
      if (enablePagination) {
        // The pagination hook will handle page changes
      }
    },
  });

  // Get current page results
  const searchResults = useMemo(() => {
    if (!enablePagination) {
      return allSearchResults.slice(0, maxResults);
    }

    const startIndex = (pagination.active - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return allSearchResults.slice(startIndex, endIndex);
  }, [allSearchResults, pagination.active, pageSize, enablePagination, maxResults]);

  // Reset pagination when search query changes
  useMemo(() => {
    if (enablePagination) {
      pagination.setPage(1);
    }
  }, [debouncedSearchQuery, enablePagination]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setIsSearching(false);
    if (enablePagination) {
      pagination.setPage(1);
    }
  }, [enablePagination, pagination]);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      searchIn: ['both'],
      sortBy: 'relevance',
      sortOrder: 'desc',
    });
  }, []);

  // Get recent searches
  const getRecentSearches = useCallback(
    (limit = 5) => {
      return searchHistory.slice(0, limit);
    },
    [searchHistory],
  );

  // Clear search history
  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
  }, [setSearchHistory]);

  // Search suggestions based on content
  const getSearchSuggestions = useCallback(
    (query: string, limit = 5) => {
      if (!query.trim()) return [];

      const suggestions = new Set<string>();
      const queryLower = query.toLowerCase();

      Object.values(documents).forEach(doc => {
        // Extract words from title and content
        const words = [...doc.title.split(/\s+/), ...doc.content.text.split(/\s+/)].filter(
          word =>
            word.length > 3 &&
            word.toLowerCase().startsWith(queryLower) &&
            word.toLowerCase() !== queryLower,
        );

        words.forEach(word => suggestions.add(word.toLowerCase()));
      });

      return Array.from(suggestions).slice(0, limit);
    },
    [documents],
  );

  return {
    // Search state
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    searchResults,
    allSearchResults,
    isSearching,

    // Filters
    filters,
    setFilters,
    resetFilters,

    // Actions
    clearSearch,
    performSearch,

    // Pagination
    pagination: enablePagination ? pagination : null,
    pageSize,
    currentPage: enablePagination ? pagination.active : 1,
    totalPages: enablePagination ? Math.ceil(allSearchResults.length / pageSize) : 1,

    // History
    searchHistory,
    getRecentSearches,
    clearSearchHistory,

    // Preferences
    searchPreferences,
    setSearchPreferences,

    // Utilities
    getSearchSuggestions,

    // Stats
    totalDocuments: Object.keys(documents).length,
    hasResults: searchResults.length > 0,
    resultCount: searchResults.length,
    totalResultCount: allSearchResults.length,
  };
}
