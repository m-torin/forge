'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Autocomplete, Group, Text, Avatar, Loader, Badge, Alert, Skeleton } from '@mantine/core';
import { useDebouncedCallback, useDisclosure } from '@mantine/hooks';
import {
  IconSearch,
  IconArticle,
  IconQuestionMark,
  IconSparkles,
  IconExclamationCircle,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { env } from '@/env';

// Strict TypeScript interfaces
interface BaseHit {
  readonly objectID: string;
}

interface ProductHit extends BaseHit {
  readonly name: string;
  readonly brand: string;
  readonly price: {
    readonly currency: string;
    readonly value: number;
    readonly on_sales: boolean;
  };
  readonly image_urls: readonly string[];
  readonly hierarchical_categories: {
    readonly lvl0: string;
    readonly lvl1: string;
  };
  readonly color: {
    readonly original_name: string;
  };
  readonly _highlightResult?: {
    readonly name?: { readonly value: string };
    readonly brand?: { readonly value: string };
  };
}

interface ArticleHit extends BaseHit {
  readonly title: string;
  readonly image_url: string;
  readonly date: string;
  readonly _highlightResult?: {
    readonly title?: { readonly value: string };
  };
}

interface FAQHit extends BaseHit {
  readonly title: string;
  readonly description: string;
  readonly list_categories: readonly string[];
  readonly _highlightResult?: {
    readonly title?: { readonly value: string };
  };
}

interface QuerySuggestionHit extends BaseHit {
  readonly query: string;
  readonly nb_words: number;
  readonly popularity: number;
  readonly hierarchical_categories?: {
    readonly lvl0?: readonly string[];
    readonly lvl1?: readonly string[];
  };
}

type SearchHit = ProductHit | ArticleHit | FAQHit | QuerySuggestionHit;
type SearchSource = 'products' | 'articles' | 'faq' | 'querysuggestions';

interface SearchResults {
  readonly products: readonly ProductHit[];
  readonly articles: readonly ArticleHit[];
  readonly faq: readonly FAQHit[];
  readonly querysuggestions: readonly QuerySuggestionHit[];
}

interface AutocompleteItem {
  readonly value: string;
  readonly label: string;
  readonly hit: SearchHit;
  readonly type: SearchSource;
  readonly disabled?: boolean;
}

interface Props {
  readonly className?: string;
  readonly placeholder?: string;
  readonly onSelect?: (hit: SearchHit, source: SearchSource) => void;
  readonly size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  readonly visibleFrom?: string;
  readonly locale?: string;
  readonly loading?: boolean;
  readonly error?: string;
  readonly 'data-testid'?: string;
}

// Loading skeleton for ProductionFederatedAutocomplete
function ProductionFederatedAutocompleteSkeleton({
  className,
  size,
  testId,
}: {
  className?: string;
  size?: string;
  testId?: string;
}) {
  return (
    <div className={className} data-testid={testId}>
      <Skeleton
        height={
          size === 'xs' ? 32 : size === 'sm' ? 36 : size === 'lg' ? 44 : size === 'xl' ? 48 : 40
        }
        radius="sm"
      />
    </div>
  );
}

// Error state for ProductionFederatedAutocomplete
function ProductionFederatedAutocompleteError({
  error,
  className,
  testId,
}: {
  error: string;
  className?: string;
  testId?: string;
}) {
  return (
    <div className={className} data-testid={testId}>
      <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
        <Text size="xs">Production search unavailable: {error}</Text>
      </Alert>
    </div>
  );
}

// Validation and error handling
const validateEnvironment = (): { isValid: boolean; error?: string } => {
  if (!env.NEXT_PUBLIC_ALGOLIA_APP_ID) {
    return { isValid: false, error: 'Missing Algolia App ID' };
  }
  if (!env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY) {
    return { isValid: false, error: 'Missing Algolia API Key' };
  }
  return { isValid: true };
};

// Safe search client initialization
const createSearchClient = () => {
  const validation = validateEnvironment();
  if (!validation.isValid) {
    console.error('Algolia configuration error:', validation.error);
    return null;
  }

  return algoliasearch(env.NEXT_PUBLIC_ALGOLIA_APP_ID, env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY);
};

const searchClient = createSearchClient();

// Constants
const INDICES = {
  products: 'autocomplete_demo_products',
  articles: 'autocomplete_demo_articles',
  faq: 'autocomplete_demo_faq',
  querysuggestions: 'autocomplete_demo_products_query_suggestions',
} as const;

const EMPTY_RESULTS: SearchResults = {
  products: [],
  articles: [],
  faq: [],
  querysuggestions: [],
};

// Safe HTML rendering
const createSafeHTML = (html: string): string => {
  // Basic XSS protection - only allow highlighting tags
  return html
    .replace(/<(?!\/?(mark|em)\b)[^>]*>/g, '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

// Type guards
const isProductHit = (hit: SearchHit): hit is ProductHit => {
  return 'name' in hit && 'price' in hit;
};

const isArticleHit = (hit: SearchHit): hit is ArticleHit => {
  return 'title' in hit && 'date' in hit && 'image_url' in hit;
};

const isFAQHit = (hit: SearchHit): hit is FAQHit => {
  return 'title' in hit && 'description' in hit && 'list_categories' in hit;
};

const isQuerySuggestionHit = (hit: SearchHit): hit is QuerySuggestionHit => {
  return 'query' in hit && 'nb_words' in hit;
};

// Memoized item components
const ProductItem = React.memo<{ hit: ProductHit }>(({ hit }) => {
  const price = hit.price?.value ?? 0;
  const currency = hit.price?.currency === 'EUR' ? '€' : '$';
  const isOnSale = hit.price?.on_sales ?? false;
  const category = hit.hierarchical_categories?.lvl1 ?? hit.hierarchical_categories?.lvl0 ?? '';
  const highlightedName = hit._highlightResult?.name?.value ?? hit.name;
  const highlightedBrand = hit._highlightResult?.brand?.value ?? hit.brand;

  return (
    <Group gap="sm" wrap="nowrap" p="xs">
      <Avatar src={hit.image_urls?.[0]} size="md" radius="sm" alt={hit.name} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <Text
          size="sm"
          fw={500}
          lineClamp={1}
          dangerouslySetInnerHTML={{
            __html: createSafeHTML(highlightedName),
          }}
        />
        <Text
          size="xs"
          c="dimmed"
          lineClamp={1}
          dangerouslySetInnerHTML={{
            __html: createSafeHTML(`${highlightedBrand} • ${category}`),
          }}
        />
        <Group gap="xs" mt={2}>
          <Text size="xs" fw={600} c={isOnSale ? 'red' : 'blue'}>
            {currency}
            {price.toFixed(2)}
          </Text>
          {isOnSale && (
            <Badge size="xs" color="red">
              Sale
            </Badge>
          )}
          {hit.color?.original_name && (
            <Text size="xs" c="dimmed">
              {hit.color.original_name}
            </Text>
          )}
        </Group>
      </div>
    </Group>
  );
});

const ArticleItem = React.memo<{ hit: ArticleHit }>(({ hit }) => {
  const date = useMemo(() => {
    try {
      return new Date(hit.date).toLocaleDateString();
    } catch {
      return 'Unknown date';
    }
  }, [hit.date]);

  const highlightedTitle = hit._highlightResult?.title?.value ?? hit.title;

  return (
    <Group gap="sm" wrap="nowrap" p="xs">
      <Avatar src={hit.image_url} size="md" radius="sm" alt={hit.title}>
        <IconArticle size={16} />
      </Avatar>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Text
          size="sm"
          fw={500}
          lineClamp={1}
          dangerouslySetInnerHTML={{
            __html: createSafeHTML(highlightedTitle),
          }}
        />
        <Text size="xs" c="dimmed">
          Article • {date}
        </Text>
      </div>
    </Group>
  );
});

const FAQItem = React.memo<{ hit: FAQHit }>(({ hit }) => {
  const categories = hit.list_categories?.join(', ') ?? '';
  const highlightedTitle = hit._highlightResult?.title?.value ?? hit.title;

  return (
    <Group gap="sm" wrap="nowrap" p="xs">
      <Avatar size="md" radius="sm" color="blue" variant="light">
        <IconQuestionMark size={16} />
      </Avatar>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Text
          size="sm"
          fw={500}
          lineClamp={1}
          dangerouslySetInnerHTML={{
            __html: createSafeHTML(highlightedTitle),
          }}
        />
        <Text size="xs" c="dimmed">
          FAQ{categories && ` • ${categories}`}
        </Text>
      </div>
    </Group>
  );
});

const QuerySuggestionItem = React.memo<{ hit: QuerySuggestionHit }>(({ hit }) => {
  const category = hit.hierarchical_categories?.lvl1?.[0] ?? hit.hierarchical_categories?.lvl0?.[0];

  return (
    <Group gap="sm" wrap="nowrap" p="xs">
      <Avatar size="md" radius="sm" color="grape" variant="light">
        <IconSparkles size={16} />
      </Avatar>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Text size="sm" fw={500} lineClamp={1}>
          {hit.query}
        </Text>
        <Text size="xs" c="dimmed">
          Popular search{category ? ` in ${category}` : ''}
        </Text>
      </div>
    </Group>
  );
});

const NoResultsItem = React.memo<{ query: string }>(({ query }) => (
  <Group gap="sm" p="md" justify="center">
    <Text size="sm" c="dimmed" ta="center">
      No results found for "{query}"
    </Text>
  </Group>
));

const ErrorItem = React.memo<{ error: string }>(({ error }) => (
  <Alert icon={<IconExclamationCircle size={16} />} color="red" variant="light" m="xs">
    <Text size="sm">Search temporarily unavailable</Text>
    <Text size="xs" c="dimmed">
      Please try again later
    </Text>
  </Alert>
));

// Main component
export default function ProductionFederatedAutocomplete({
  className,
  placeholder = 'Search products, articles, help...',
  onSelect,
  size = 'md',
  visibleFrom,
  locale = 'en',
  loading: externalLoading = false,
  error: externalError,
  'data-testid': testId = 'production-federated-autocomplete',
}: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS);
  const [loading, { open: startLoading, close: stopLoading }] = useDisclosure(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Show loading state
  if (externalLoading) {
    return (
      <ProductionFederatedAutocompleteSkeleton className={className} size={size} testId={testId} />
    );
  }

  // Show error state
  const currentError = externalError || internalError;
  if (currentError) {
    return (
      <ProductionFederatedAutocompleteError
        error={currentError}
        className={className}
        testId={testId}
      />
    );
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // Federated search with proper error handling and cancellation
  const searchFederated = useCallback(
    async (searchQuery: string) => {
      if (!searchClient) {
        setInternalError('Search unavailable');
        return;
      }

      if (!searchQuery.trim()) {
        setResults(EMPTY_RESULTS);
        setInternalError(null);
        return;
      }

      // Cancel previous request
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      startLoading();
      setInternalError(null);

      try {
        const queries = [
          {
            indexName: INDICES.products,
            query: searchQuery,
            params: {
              hitsPerPage: 6,
              attributesToRetrieve: [
                'objectID',
                'name',
                'brand',
                'price',
                'image_urls',
                'hierarchical_categories',
                'color',
              ],
              attributesToHighlight: ['name', 'brand'],
            },
          },
          {
            indexName: INDICES.articles,
            query: searchQuery,
            params: {
              hitsPerPage: 3,
              attributesToRetrieve: ['objectID', 'title', 'image_url', 'date'],
              attributesToHighlight: ['title'],
            },
          },
          {
            indexName: INDICES.faq,
            query: searchQuery,
            params: {
              hitsPerPage: 3,
              attributesToRetrieve: ['objectID', 'title', 'description', 'list_categories'],
              attributesToHighlight: ['title'],
            },
          },
          {
            indexName: INDICES.querysuggestions,
            query: searchQuery,
            params: {
              hitsPerPage: 4,
              attributesToRetrieve: [
                'objectID',
                'query',
                'nb_words',
                'popularity',
                'hierarchical_categories',
              ],
            },
          },
        ];

        const searchResults = await searchClient.search(queries);

        // Validate results structure
        if (!Array.isArray(searchResults.results) || searchResults.results.length < 4) {
          throw new Error('Invalid search results structure');
        }

        const [productsResult, articlesResult, faqResult, suggestionsResult] =
          searchResults.results;

        setResults({
          products: (productsResult as any)?.hits ?? [],
          articles: (articlesResult as any)?.hits ?? [],
          faq: (faqResult as any)?.hits ?? [],
          querysuggestions: (suggestionsResult as any)?.hits ?? [],
        });
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return; // Request was cancelled, ignore
        }

        console.error('Federated search error:', err);
        setInternalError('Search failed');
        setResults(EMPTY_RESULTS);
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading],
  );

  // Debounced search with proper cleanup
  const debouncedSearch = useDebouncedCallback(searchFederated, 300);

  const handleInputChange = useCallback(
    (value: string) => {
      try {
        setQuery(value);
        debouncedSearch(value);
      } catch (err) {
        console.error('Input change error:', err);
        setInternalError('Search input failed');
      }
    },
    [debouncedSearch],
  );

  const handleItemSelect = useCallback(
    (value: string) => {
      try {
        if (value === 'no-results' || value === 'error' || !onSelect) {
          return;
        }

        // Find the selected item with type safety
        for (const [source, hits] of Object.entries(results) as Array<
          [SearchSource, readonly SearchHit[]]
        >) {
          const hit = hits.find((h) => h.objectID === value);
          if (hit) {
            onSelect(hit, source);
            setQuery(''); // Clear search after selection
            return;
          }
        }
      } catch (err) {
        console.error('Item select error:', err);
        setInternalError('Selection failed');
      }
    },
    [results, onSelect],
  );

  // Memoized autocomplete data transformation
  const autocompleteData = useMemo((): AutocompleteItem[] => {
    if (currentError) {
      return [
        {
          value: 'error',
          label: 'Error',
          hit: { objectID: 'error' } as SearchHit,
          type: 'products' as SearchSource,
          disabled: true,
        },
      ];
    }

    const hasResults = Object.values(results).some((arr) => arr.length > 0);

    if (query.length > 0 && !loading && !hasResults) {
      return [
        {
          value: 'no-results',
          label: `No results found for "${query}"`,
          hit: { objectID: 'no-results' } as SearchHit,
          type: 'products' as SearchSource,
          disabled: true,
        },
      ];
    }

    return [
      ...results.querysuggestions.map((hit) => ({
        value: hit.objectID,
        label: hit.query,
        hit: hit as SearchHit,
        type: 'querysuggestions' as SearchSource,
      })),
      ...results.products.map((hit) => ({
        value: hit.objectID,
        label: hit.name,
        hit: hit as SearchHit,
        type: 'products' as SearchSource,
      })),
      ...results.articles.map((hit) => ({
        value: hit.objectID,
        label: hit.title,
        hit: hit as SearchHit,
        type: 'articles' as SearchSource,
      })),
      ...results.faq.map((hit) => ({
        value: hit.objectID,
        label: hit.title,
        hit: hit as SearchHit,
        type: 'faq' as SearchSource,
      })),
    ];
  }, [results, query, loading, currentError]);

  const shouldShowDropdown = query.length > 0 && (loading || autocompleteData.length > 0);

  return (
    <ErrorBoundary
      fallback={
        <ProductionFederatedAutocompleteError
          error="Search component failed to render"
          className={className}
          testId={testId}
        />
      }
    >
      <Autocomplete
        className={className}
        placeholder={placeholder}
        value={query}
        onChange={handleInputChange}
        onOptionSubmit={handleItemSelect}
        data={autocompleteData}
        renderOption={({ option }) => {
          const item = option as AutocompleteItem;

          try {
            if (item.value === 'error') {
              return <ErrorItem error="Search failed" />;
            }

            if (item.value === 'no-results') {
              return <NoResultsItem query={query} />;
            }

            const { hit } = item;

            if (isProductHit(hit)) {
              return (
                <ErrorBoundary
                  fallback={
                    <Text size="sm" c="dimmed">
                      Product unavailable
                    </Text>
                  }
                >
                  <ProductItem hit={hit} />
                </ErrorBoundary>
              );
            }
            if (isArticleHit(hit)) {
              return (
                <ErrorBoundary
                  fallback={
                    <Text size="sm" c="dimmed">
                      Article unavailable
                    </Text>
                  }
                >
                  <ArticleItem hit={hit} />
                </ErrorBoundary>
              );
            }
            if (isFAQHit(hit)) {
              return (
                <ErrorBoundary
                  fallback={
                    <Text size="sm" c="dimmed">
                      FAQ unavailable
                    </Text>
                  }
                >
                  <FAQItem hit={hit} />
                </ErrorBoundary>
              );
            }
            if (isQuerySuggestionHit(hit)) {
              return (
                <ErrorBoundary
                  fallback={
                    <Text size="sm" c="dimmed">
                      Suggestion unavailable
                    </Text>
                  }
                >
                  <QuerySuggestionItem hit={hit} />
                </ErrorBoundary>
              );
            }

            return <Text size="sm">{item.label}</Text>;
          } catch (err) {
            console.error('Render option error:', err);
            return (
              <Text size="sm" c="dimmed">
                Item unavailable
              </Text>
            );
          }
        }}
        leftSection={<IconSearch size={16} stroke={1.5} />}
        rightSection={loading ? <Loader size="xs" /> : null}
        size={size}
        visibleFrom={visibleFrom}
        dropdownOpened={shouldShowDropdown}
        withScrollArea={false}
        maxDropdownHeight={400}
        comboboxProps={{
          withinPortal: true,
          shadow: 'md',
          radius: 'md',
        }}
        onBlur={() => {
          try {
            // Clear search when focus is lost
            setTimeout(() => {
              if (document.activeElement?.tagName !== 'INPUT') {
                setQuery('');
              }
            }, 150);
          } catch (err) {
            console.error('Blur handler error:', err);
            setInternalError('Focus handling failed');
          }
        }}
        data-testid={testId}
      />
    </ErrorBoundary>
  );
}

// Set display names for debugging
ProductItem.displayName = 'ProductItem';
ArticleItem.displayName = 'ArticleItem';
FAQItem.displayName = 'FAQItem';
QuerySuggestionItem.displayName = 'QuerySuggestionItem';
NoResultsItem.displayName = 'NoResultsItem';
ErrorItem.displayName = 'ErrorItem';
