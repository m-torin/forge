'use client';

import { createAutocomplete } from '@algolia/autocomplete-core';
import { getAlgoliaResults } from '@algolia/autocomplete-preset-algolia';
import { useEffect, useRef, useState } from 'react';

import { AutocompleteProps, SearchHit } from '../types';
import { createSearchClient } from '../utils/searchClient';

interface AutocompleteInnerProps extends Record<string, any> {
  className?: string;
  detachedMediaQuery?: string;
  indexName: string;
  maxSuggestions?: number;
  onSelect?: (item: SearchHit) => void;
  placeholder?: string;
  searchClient: any;
}

// Main export
export default function Autocomplete(props: AutocompleteProps) {
  return <AutocompleteImpl {...props} />;
}

// Main Autocomplete implementation
function AutocompleteImpl({
  className = '',
  config,
  detachedMediaQuery: detachedMediaQuery = '(max-width: 680px)',
  maxSuggestions = 5,
  onSelect,
  placeholder = 'Search...',
}: AutocompleteProps) {
  const searchClient = createSearchClient(config);
  const indexName = config.indexName;

  return (
    <AutocompleteInner
      className={className}
      detachedMediaQuery={detachedMediaQuery}
      indexName={indexName}
      maxSuggestions={maxSuggestions}
      placeholder={placeholder}
      searchClient={searchClient}
      onSelect={onSelect}
    />
  );
}

// Inner component that handles the actual autocomplete logic
function AutocompleteInner({
  className = '',
  detachedMediaQuery: detachedMediaQuery = '(max-width: 680px)',
  indexName,
  maxSuggestions = 5,
  onSelect,
  placeholder = 'Search...',
  searchClient,
}: AutocompleteInnerProps) {
  const [autocompleteState, setAutocompleteState] = useState<any>({});
  const autocompleteRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!searchClient) return;

    const autocomplete = createAutocomplete({
      getSources() {
        return [
          {
            getItems({ query }: { query: string }) {
              return getAlgoliaResults({
                queries: [
                  {
                    indexName: indexName,
                    params: {
                      hitsPerPage: maxSuggestions,
                      query,
                    },
                  },
                ],
                searchClient: searchClient as any,
              });
            },
            onSelect({ item }: { item: any }) {
              onSelect?.(item as SearchHit);
            },
            sourceId: 'products',
          },
        ];
      },
      onStateChange({ state }: { state: any }) {
        setAutocompleteState(state);
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
          className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-4 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400"
          placeholder={placeholder}
        />
      </form>

      {autocompleteState.isOpen && (
        <div
          ref={panelRef}
          {...panelProps}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700"
        >
          {autocompleteState.collections.map((collection: any) => {
            const { items, source } = collection;

            return (
              <div key={source.sourceId}>
                {items.length > 0 && (
                  <div className="max-h-96 overflow-y-auto">
                    {items.map((item: SearchHit, _itemIndex: number) => (
                      <div
                        key={item.objectID}
                        className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          autocompleteRef.current?.setQuery(item.title);
                          autocompleteRef.current?.refresh();
                          onSelect?.(item);
                        }}
                        onKeyDown={(e: any) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            autocompleteRef.current?.setQuery(item.title);
                            autocompleteRef.current?.refresh();
                            onSelect?.(item);
                          }
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          {item.image && (
                            <img
                              alt={item.title}
                              className="w-10 h-10 rounded-lg object-cover"
                              src={item.image}
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

          {autocompleteState.collections.every(
            (collection: any) => collection.items.length === 0,
          ) && (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">No results found</div>
          )}
        </div>
      )}
    </div>
  );
}
