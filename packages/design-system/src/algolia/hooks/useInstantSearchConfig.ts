'use client';

import { useInstantSearch } from 'react-instantsearch';

import { InstantSearchContextConfig } from '../types';

/**
 * Hook to safely extract searchClient and indexName from InstantSearch context
 * Works with react-instantsearch v7+
 *
 * Note: This uses internal properties that may change between versions.
 * It's recommended to provide config directly when possible.
 */
export function useInstantSearchConfig(): InstantSearchContextConfig {
  const instantSearch = useInstantSearch() as any;

  try {
    // Debug: Log the structure to understand what's available
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('InstantSearch context keys: ', Object.keys(instantSearch));
    }

    // In react-instantsearch v7, try accessing through different patterns

    // Pattern 1: Direct mainIndex access
    if (instantSearch.mainIndex) {
      return {
        indexName: instantSearch.mainIndex.getIndexName(),
        searchClient: instantSearch.mainIndex.getSearchClient(),
      };
    }

    // Pattern 2: Private _mainIndex
    if (instantSearch._mainIndex) {
      return {
        indexName: instantSearch._mainIndex.getIndexName(),
        searchClient: instantSearch._mainIndex.getSearchClient(),
      };
    }

    // Pattern 3: Through getMainIndex method
    if (instantSearch.getMainIndex) {
      const mainIndex = instantSearch.getMainIndex();
      return {
        indexName: mainIndex.getIndexName(),
        searchClient: mainIndex.getSearchClient(),
      };
    }

    // Pattern 4: Through use() method (for some versions)
    if (instantSearch.use) {
      const context = instantSearch.use();
      if (context.searchClient && context.indexName) {
        return {
          indexName: context.indexName,
          searchClient: context.searchClient,
        };
      }
    }

    // Pattern 5: Direct properties
    if (instantSearch.searchClient && instantSearch.indexName) {
      return {
        indexName: instantSearch.indexName,
        searchClient: instantSearch.searchClient,
      };
    }

    // Pattern 6: Through indexUiState
    if (instantSearch.indexUiState) {
      const indexNames = Object.keys(instantSearch.indexUiState);
      if (indexNames.length > 0) {
        return {
          indexName: indexNames[0],
          searchClient: instantSearch.searchClient ?? null,
        };
      }
    }

    // Pattern 7: Try through _getHelper (internal method)
    if (instantSearch._getHelper) {
      const helper = instantSearch._getHelper();
      if (helper) {
        return {
          indexName: helper.index ?? helper.indexName,
          searchClient: helper.client ?? helper.searchClient,
        };
      }
    }

    throw new Error('Unable to extract search configuration from InstantSearch context');
  } catch (error: any) {
    throw new Error(
      `Failed to access InstantSearch context: ${error instanceof Error ? (error as Error)?.message || 'Unknown error' : 'Unknown error'}. ` +
        'Make sure this hook is used within an InstantSearch provider. ' +
        'Consider providing the config prop directly to avoid this dependency on internal APIs.',
    );
  }
}
