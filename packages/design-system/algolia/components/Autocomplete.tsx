'use client';

import { useEffect, useRef, useState } from 'react';
import { createAutocomplete } from '@algolia/autocomplete-core';
import { getAlgoliaResults } from '@algolia/autocomplete-preset-algolia';
import { useInstantSearch } from 'react-instantsearch';
import type { AutocompleteProps, SearchHit, SearchConfig } from '../types';
import { createSearchClient } from '../utils/searchClient';

interface AutocompleteComponentProps extends AutocompleteProps {
  config?: SearchConfig;
}

export default function Autocomplete({
  config,
  placeholder = 'Search...',
  className = '',
  maxSuggestions = 5,
  detachedMediaQuery = '(max-width: 680px)',
  onSelect,
}: AutocompleteComponentProps) {
  const [autocompleteState, setAutocompleteState] = useState<any>({});
  const autocompleteRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Try to get context from InstantSearch if config is not provided
  let instantSearch: any = null;
  let indexName = '';
  let searchClient: any = null;

  try {
    if (!config) {
      instantSearch = useInstantSearch();
      indexName = instantSearch.indexName;
      searchClient = instantSearch.instantSearchInstance.searchClient;
    } else {
      searchClient = createSearchClient(config);
      indexName = config.indexName;
    }
  } catch (error) {
    // Not inside InstantSearch context and no config provided
    if (!config) {
      throw new Error('Autocomplete component must either be used inside SearchProvider or provided with a config prop');
    }
    searchClient = createSearchClient(config);
    indexName = config.indexName;
  }

  useEffect(() => {
    if (!searchClient) return;

    const autocomplete = createAutocomplete({
      onStateChange({ state }: { state: any }) {
        setAutocompleteState(state);
      },
      getSources() {
        return [
          {
            sourceId: 'products',
            getItems({ query }: { query: string }) {
              return getAlgoliaResults({
                searchClient: searchClient as any,
                queries: [
                  {
                    indexName: indexName,
                    params: {
                      query,
                      hitsPerPage: maxSuggestions,
                    },
                  },
                ],
              });
            },
            onSelect({ item }: { item: any }) {
              onSelect?.(item as SearchHit);
            },
          },
        ];
      },
    });

    autocompleteRef.current = autocomplete;

    return () => {
      if (autocompleteRef.current) {
        autocompleteRef.current.destroy();
      }
    };
  }, [searchClient, indexName, maxSuggestions, onSelect]);

  const inputProps = autocompleteRef.current?.getInputProps({
    inputElement: inputRef.current,
  });

  const panelProps = autocompleteRef.current?.getPanelProps({
    panelElement: panelRef.current,
  });

  const formProps = autocompleteRef.current?.getFormProps({
    inputElement: inputRef.current,
  });

  return (
    <div className={`relative ${className}`}>
      <form ref={formRef} {...formProps}>
        <input
          ref={inputRef}
          {...inputProps}
          placeholder={placeholder}
          className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-4 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400"
        />
      </form>

      {autocompleteState.isOpen && (
        <div
          ref={panelRef}
          {...panelProps}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700"
        >
          {autocompleteState.collections.map((collection: any, index: number) => {
            const { source, items } = collection;
            
            return (
              <div key={`source-${index}`}>
                {items.length > 0 && (
                  <div className="max-h-96 overflow-y-auto">
                    {items.map((item: SearchHit, itemIndex: number) => (
                      <div
                        key={item.objectID}
                        className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                        onClick={() => {
                          autocompleteRef.current?.setQuery(item.title);
                          autocompleteRef.current?.refresh();
                          onSelect?.(item);
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {item.title}
                            </div>
                            {item.category && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {item.category}
                              </div>
                            )}
                          </div>
                          {item.price && (
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              ${item.price}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          
          {autocompleteState.collections.every((collection: any) => collection.items.length === 0) && (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
}