'use client';

import { createAutocomplete } from '@algolia/autocomplete-core';
import { getAlgoliaResults } from '@algolia/autocomplete-preset-algolia';
import {
  ActionIcon,
  Avatar,
  Group,
  Modal,
  Paper,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from '@mantine/core';
import { useDisclosure, useHotkeys } from '@mantine/hooks';
import { IconCommand, IconSearch } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';

import { getSearchConfig } from '../../algolia/utils/config';
import { createSearchClient } from '../../algolia/utils/searchClient';

import type { SearchConfig, SearchHit } from '../../algolia/types';

interface HeaderSearchProps {
  className?: string;
  config?: SearchConfig;
  maxSuggestions?: number;
  onSelect?: (item: SearchHit) => void;
  placeholder?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function HeaderSearch({
  className = '',
  config,
  maxSuggestions = 8,
  onSelect,
  placeholder = 'Search...',
  size = 'sm',
}: HeaderSearchProps) {
  const [autocompleteState, setAutocompleteState] = useState<any>({});
  const [opened, { close, open }] = useDisclosure(false);
  const autocompleteRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use provided config or try to get from environment with fallback
  let searchConfig: SearchConfig;
  let searchClient: any;

  try {
    searchConfig = config || getSearchConfig();
    searchClient = createSearchClient(searchConfig);
  } catch (error) {
    // Use mock configuration for development when Algolia is not configured
    searchConfig = {
      apiKey: 'mock',
      appId: 'mock',
      indexName: 'mock',
    };
    searchClient = null;
    console.warn('Algolia not configured, using mock search');
  }

  useHotkeys([
    ['mod+K', open],
    [
      '/',
      (e) => {
        e.preventDefault();
        open();
      },
    ],
  ]);

  useEffect(() => {
    if (!opened) return;

    // Mock search data for development
    const mockSearchResults: SearchHit[] = [
      {
        type: 'workflow',
        url: '/workflows/product-classification',
        category: 'Workflows',
        description: 'AI-powered product categorization system',
        objectID: 'workflow-1',
        title: 'Product Classification Workflow',
      },
      {
        type: 'product',
        url: '/pim/catalog',
        category: 'PIM',
        description: 'Manage product information and attributes',
        objectID: 'pim-1',
        title: 'Product Catalog',
      },
      {
        type: 'content',
        url: '/cms/editor',
        category: 'CMS',
        description: 'Rich text editor for creating content',
        objectID: 'cms-1',
        title: 'Content Editor',
      },
    ];

    const autocomplete = createAutocomplete({
      getSources() {
        return [
          {
            getItems({ query }: { query: string }) {
              if (!query.trim()) return [];

              if (searchClient) {
                // Use real Algolia search
                return getAlgoliaResults({
                  queries: [
                    {
                      indexName: searchConfig.indexName,
                      params: {
                        attributesToRetrieve: [
                          'objectID',
                          'title',
                          'description',
                          'category',
                          'type',
                          'url',
                          'image',
                          'price',
                        ],
                        hitsPerPage: maxSuggestions,
                        query,
                      },
                    },
                  ],
                  searchClient: searchClient as any,
                });
              } else {
                // Use mock search results
                return Promise.resolve([
                  mockSearchResults
                    .filter(
                      (item) =>
                        item.title.toLowerCase().includes(query.toLowerCase()) ||
                        item.description?.toLowerCase().includes(query.toLowerCase()) ||
                        item.category?.toLowerCase().includes(query.toLowerCase()),
                    )
                    .slice(0, maxSuggestions),
                ]);
              }
            },
            onSelect({ item }: { item: any }) {
              onSelect?.(item as SearchHit);
              close();
            },
            sourceId: 'unified_search',
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
  }, [searchClient, searchConfig.indexName, maxSuggestions, onSelect, opened]);

  const inputProps = autocompleteRef.current?.getInputProps({
    inputElement: inputRef.current,
  });

  const renderSearchResult = (item: SearchHit) => {
    const getItemIcon = (type?: string) => {
      switch (type) {
        case 'product':
          return '📦';
        case 'article':
          return '📄';
        case 'user':
          return '👤';
        case 'workflow':
          return '⚡';
        default:
          return '🔍';
      }
    };

    return (
      <UnstyledButton
        key={item.objectID}
        onMouseDown={() => {
          autocompleteRef.current?.setQuery(item.title);
          onSelect?.(item);
          close();
        }}
        style={{
          borderRadius: 8,
        }}
        p="md"
        w="100%"
      >
        <Group gap="sm">
          {item.image ? (
            <Avatar radius="sm" size="sm" src={item.image} />
          ) : (
            <Avatar radius="sm" size="sm">
              {getItemIcon(item.type as string)}
            </Avatar>
          )}
          <Stack style={{ flex: 1 }} gap={2}>
            <Text fw={500} lineClamp={1} size="sm">
              {item.title}
            </Text>
            {item.description && (
              <Text c="dimmed" lineClamp={1} size="xs">
                {item.description}
              </Text>
            )}
            {item.category && (
              <Text c="blue" size="xs">
                {item.category}
              </Text>
            )}
          </Stack>
          {item.price && (
            <Text fw={500} size="sm">
              ${item.price}
            </Text>
          )}
        </Group>
      </UnstyledButton>
    );
  };

  return (
    <>
      {/* Search Trigger */}
      <UnstyledButton
        onClick={open}
        className={className}
        style={{
          backgroundColor: 'var(--mantine-color-gray-0)',
          border: '1px solid var(--mantine-color-gray-3)',
          borderRadius: 6,
        }}
      >
        <Group style={{ minWidth: 200 }} gap="xs" p="xs">
          <IconSearch color="var(--mantine-color-dimmed)" size={16} />
          <Text c="dimmed" size={size}>
            {placeholder}
          </Text>
          <Group gap={4} ml="auto">
            <ActionIcon color="gray" size="xs" variant="light">
              <IconCommand size={10} />
            </ActionIcon>
            <Text c="dimmed" size="xs">
              K
            </Text>
          </Group>
        </Group>
      </UnstyledButton>

      {/* Search Modal */}
      <Modal
        onClose={close}
        opened={opened}
        overlayProps={{ blur: 3 }}
        centered
        size="lg"
        title="Search"
      >
        <Stack gap="md">
          <TextInput
            ref={inputRef}
            {...inputProps}
            autoFocus
            leftSection={<IconSearch size={18} />}
            placeholder="Search products, articles, workflows..."
            size="md"
          />

          {autocompleteState.isOpen && autocompleteState.query && (
            <Paper withBorder>
              {autocompleteState.collections?.map((collection: any, index: number) => {
                const { items } = collection;

                if (items.length === 0) return null;

                return (
                  <Stack key={`collection-${index}`} gap={0}>
                    {items.map((item: SearchHit) => renderSearchResult(item))}
                  </Stack>
                );
              })}

              {autocompleteState.collections?.every(
                (collection: any) => collection.items.length === 0,
              ) && (
                <Text c="dimmed" p="xl" ta="center">
                  No results found for "{autocompleteState.query}"
                </Text>
              )}
            </Paper>
          )}

          {!autocompleteState.query && (
            <Paper withBorder p="md">
              <Stack gap="xs">
                <Text c="dimmed" fw={500} size="sm">
                  Quick Actions
                </Text>
                <Group gap="md">
                  <Text c="dimmed" size="xs">
                    Press ⌘K to search
                  </Text>
                  <Text c="dimmed" size="xs">
                    Type to find anything
                  </Text>
                </Group>
              </Stack>
            </Paper>
          )}
        </Stack>
      </Modal>
    </>
  );
}

export default HeaderSearch;
