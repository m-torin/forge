'use client';

import { Autocomplete, Group, Text, Avatar, Loader, Badge, Skeleton, Alert } from '@mantine/core';
import { useDisclosure, useDebouncedCallback } from '@mantine/hooks';
import {
  IconSearch,
  IconArticle,
  IconQuestionMark,
  IconSparkles,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { type FC, forwardRef, useState, useCallback } from 'react';
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { env } from '@/env';

// Initialize Algolia client with federated e-commerce demo data
const searchClient = algoliasearch(
  env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY,
);

// Federated indices
const INDICES = {
  products: 'autocomplete_demo_products',
  articles: 'autocomplete_demo_articles',
  faq: 'autocomplete_demo_faq',
  querysuggestions: 'autocomplete_demo_products_query_suggestions',
};

interface ProductHit {
  objectID: string;
  name: string;
  brand: string;
  category_page_id: string[];
  hierarchical_categories: {
    lvl0: string;
    lvl1: string;
    lvl2?: string;
  };
  price: {
    currency: string;
    value: number;
    on_sales: boolean;
    discount_level?: number;
  };
  image_urls: string[];
  color: {
    original_name: string;
  };
  _highlightResult?: {
    name?: { value: string };
    brand?: { value: string };
  };
}

interface ArticleHit {
  objectID: string;
  title: string;
  image_url: string;
  date: string;
  _highlightResult?: {
    title?: { value: string };
  };
}

interface FAQHit {
  objectID: string;
  title: string;
  description: string;
  list_categories: string[];
  _highlightResult?: {
    title?: { value: string };
  };
}

interface QuerySuggestionHit {
  objectID: string;
  query: string;
  nb_words: number;
  popularity: number;
  hierarchical_categories?: {
    lvl0?: string[];
    lvl1?: string[];
  };
}

interface FederatedResults {
  products: ProductHit[];
  articles: ArticleHit[];
  faq: FAQHit[];
  querysuggestions: QuerySuggestionHit[];
}

interface FederatedEcommerceAutocompleteProps {
  className?: string;
  placeholder?: string;
  onSelect?: (hit: any, source: string) => void;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  visibleFrom?: string;
  locale?: string;
  loading?: boolean;
  error?: string;
  'data-testid'?: string;
}

// Product item component
const ProductItem = forwardRef<HTMLDivElement, { value: string; hit: ProductHit }>(
  ({ value, hit, ...others }, ref) => {
    const price = hit.price.value;
    const currency = hit.price.currency === 'EUR' ? '€' : '$';
    const isOnSale = hit.price.on_sales;
    const category = hit.hierarchical_categories.lvl1 || hit.hierarchical_categories.lvl0;

    return (
      <div ref={ref} {...others}>
        <Group gap="sm" wrap="nowrap">
          <Avatar src={hit.image_urls?.[0]} size="md" radius="sm" alt={hit.name} />
          <div style={{ flex: 1 }}>
            <Text
              size="sm"
              fw={500}
              dangerouslySetInnerHTML={{
                __html: hit._highlightResult?.name?.value || hit.name,
              }}
            />
            <Text size="xs" c="dimmed" lineClamp={1}>
              {hit._highlightResult?.brand?.value || hit.brand} · {category}
            </Text>
            <Group gap="xs" mt={2}>
              <Text size="xs" fw={600} c={isOnSale ? 'red' : 'blue'}>
                {currency}
                {price}
              </Text>
              {isOnSale && (
                <Badge size="xs" color="red">
                  Sale
                </Badge>
              )}
              <Text size="xs" c="dimmed">
                {hit.color.original_name}
              </Text>
            </Group>
          </div>
        </Group>
      </div>
    );
  },
);

ProductItem.displayName = 'ProductItem';

// Article item component
const ArticleItem = forwardRef<HTMLDivElement, { value: string; hit: ArticleHit }>(
  ({ value, hit, ...others }, ref) => {
    const date = new Date(hit.date).toLocaleDateString();

    return (
      <div ref={ref} {...others}>
        <Group gap="sm" wrap="nowrap">
          <Avatar src={hit.image_url} size="md" radius="sm" alt={hit.title}>
            <IconArticle size={16} />
          </Avatar>
          <div style={{ flex: 1 }}>
            <Text
              size="sm"
              fw={500}
              dangerouslySetInnerHTML={{
                __html: hit._highlightResult?.title?.value || hit.title,
              }}
            />
            <Text size="xs" c="dimmed">
              Article · {date}
            </Text>
          </div>
        </Group>
      </div>
    );
  },
);

ArticleItem.displayName = 'ArticleItem';

// FAQ item component
const FAQItem = forwardRef<HTMLDivElement, { value: string; hit: FAQHit }>(
  ({ value, hit, ...others }, ref) => {
    return (
      <div ref={ref} {...others}>
        <Group gap="sm" wrap="nowrap">
          <Avatar size="md" radius="sm" color="blue" variant="light">
            <IconQuestionMark size={16} />
          </Avatar>
          <div style={{ flex: 1 }}>
            <Text
              size="sm"
              fw={500}
              dangerouslySetInnerHTML={{
                __html: hit._highlightResult?.title?.value || hit.title,
              }}
            />
            <Text size="xs" c="dimmed">
              FAQ · {hit.list_categories.join(', ')}
            </Text>
          </div>
        </Group>
      </div>
    );
  },
);

FAQItem.displayName = 'FAQItem';

// Query suggestion item component
const QuerySuggestionItem = forwardRef<HTMLDivElement, { value: string; hit: QuerySuggestionHit }>(
  ({ value, hit, ...others }, ref) => {
    const category =
      hit.hierarchical_categories?.lvl1?.[0] || hit.hierarchical_categories?.lvl0?.[0];

    return (
      <div ref={ref} {...others}>
        <Group gap="sm" wrap="nowrap">
          <Avatar size="md" radius="sm" color="grape" variant="light">
            <IconSparkles size={16} />
          </Avatar>
          <div style={{ flex: 1 }}>
            <Text size="sm" fw={500}>
              {hit.query}
            </Text>
            <Text size="xs" c="dimmed">
              Popular search{category ? ` in ${category}` : ''}
            </Text>
          </div>
        </Group>
      </div>
    );
  },
);

QuerySuggestionItem.displayName = 'QuerySuggestionItem';

// Loading skeleton for FederatedEcommerceAutocomplete
function FederatedAutocompleteSkeleton({
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

// Error state for FederatedEcommerceAutocomplete
function FederatedAutocompleteError({
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
        <Text size="xs">Search unavailable: {error}</Text>
      </Alert>
    </div>
  );
}

const FederatedEcommerceAutocomplete: FC<FederatedEcommerceAutocompleteProps> = ({
  className,
  placeholder = 'Search products, articles, help...',
  onSelect,
  size = 'md',
  visibleFrom,
  locale = 'en',
  loading: externalLoading = false,
  error: externalError,
  'data-testid': testId = 'federated-autocomplete',
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FederatedResults>({
    products: [],
    articles: [],
    faq: [],
    querysuggestions: [],
  });
  const [internalLoading, { open: startLoading, close: stopLoading }] = useDisclosure(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (externalLoading) {
    return <FederatedAutocompleteSkeleton className={className} size={size} testId={testId} />;
  }

  // Show error state
  const currentError = externalError || internalError;
  if (currentError) {
    return (
      <FederatedAutocompleteError error={currentError} className={className} testId={testId} />
    );
  }

  const loading = internalLoading;

  // Federated search function
  const searchFederated = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults({ products: [], articles: [], faq: [], querysuggestions: [] });
        setInternalError(null);
        return;
      }

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
                'category_page_id',
                'hierarchical_categories',
                'price',
                'image_urls',
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

        setResults({
          products: (searchResults.results[0] as any)?.hits || [],
          articles: (searchResults.results[1] as any)?.hits || [],
          faq: (searchResults.results[2] as any)?.hits || [],
          querysuggestions: (searchResults.results[3] as any)?.hits || [],
        });
      } catch (_error) {
        console.error('Federated search error:', _error);
        setInternalError('Search failed');
        setResults({ products: [], articles: [], faq: [], querysuggestions: [] });
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading],
  );

  // Debounce search requests using Mantine hook
  const debouncedSearch = useDebouncedCallback(searchFederated, 200);

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
        // Don't handle "no results" selection
        if (value === 'no-results') {
          return;
        }

        // Find the selected item across all result types
        const productHit = results.products.find((hit) => hit.objectID === value);
        if (productHit && onSelect) {
          onSelect(productHit, 'products');
          setQuery(''); // Clear search after selection
          return;
        }

        const articleHit = results.articles.find((hit) => hit.objectID === value);
        if (articleHit && onSelect) {
          onSelect(articleHit, 'articles');
          setQuery(''); // Clear search after selection
          return;
        }

        const faqHit = results.faq.find((hit) => hit.objectID === value);
        if (faqHit && onSelect) {
          onSelect(faqHit, 'faq');
          setQuery(''); // Clear search after selection
          return;
        }

        const suggestionHit = results.querysuggestions.find((hit) => hit.objectID === value);
        if (suggestionHit && onSelect) {
          onSelect(suggestionHit, 'querysuggestions');
          setQuery(''); // Clear search after selection
          return;
        }
      } catch (err) {
        console.error('Item select error:', err);
        setInternalError('Selection failed');
      }
    },
    [results, onSelect],
  );

  // Transform all results to autocomplete data format
  const autocompleteData = [
    // Query suggestions first
    ...results.querysuggestions.map((hit) => ({
      value: hit.objectID,
      label: hit.query,
      hit,
      type: 'querysuggestion',
    })),
    // Then products
    ...results.products.map((hit) => ({
      value: hit.objectID,
      label: hit.name,
      hit,
      type: 'product',
    })),
    // Then articles
    ...results.articles.map((hit) => ({
      value: hit.objectID,
      label: hit.title,
      hit,
      type: 'article',
    })),
    // Finally FAQ
    ...results.faq.map((hit) => ({
      value: hit.objectID,
      label: hit.title,
      hit,
      type: 'faq',
    })),
  ];

  // Check if we have any results
  const hasResults = Object.values(results).some((arr) => arr.length > 0);
  const hasNoResults = query.length > 0 && !loading && !hasResults;
  const shouldShowDropdown = query.length > 0 && (loading || hasResults || hasNoResults);

  // Add "no results" item when needed
  const finalAutocompleteData = hasNoResults
    ? [
        {
          value: 'no-results',
          label: `No results found for "${query}"`,
          disabled: true,
          type: 'no-results',
        },
      ]
    : autocompleteData;

  return (
    <ErrorBoundary
      fallback={
        <FederatedAutocompleteError
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
        data={finalAutocompleteData}
        renderOption={({ option }) => {
          const item = option as any;

          // Handle "no results" state
          if (item.type === 'no-results') {
            return (
              <Group gap="sm" p="md" style={{ justifyContent: 'center' }}>
                <Text size="sm" c="dimmed">
                  No results found for "{query}"
                </Text>
              </Group>
            );
          }

          try {
            switch (item.type) {
              case 'product':
                return (
                  <ErrorBoundary
                    fallback={
                      <Text size="sm" c="dimmed">
                        Product unavailable
                      </Text>
                    }
                  >
                    <ProductItem value={item.value} hit={item.hit} />
                  </ErrorBoundary>
                );
              case 'article':
                return (
                  <ErrorBoundary
                    fallback={
                      <Text size="sm" c="dimmed">
                        Article unavailable
                      </Text>
                    }
                  >
                    <ArticleItem value={item.value} hit={item.hit} />
                  </ErrorBoundary>
                );
              case 'faq':
                return (
                  <ErrorBoundary
                    fallback={
                      <Text size="sm" c="dimmed">
                        FAQ unavailable
                      </Text>
                    }
                  >
                    <FAQItem value={item.value} hit={item.hit} />
                  </ErrorBoundary>
                );
              case 'querysuggestion':
                return (
                  <ErrorBoundary
                    fallback={
                      <Text size="sm" c="dimmed">
                        Suggestion unavailable
                      </Text>
                    }
                  >
                    <QuerySuggestionItem value={item.value} hit={item.hit} />
                  </ErrorBoundary>
                );
              default:
                return <Text>{item.label}</Text>;
            }
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
        maxDropdownHeight={500}
        comboboxProps={{
          withinPortal: true,
          shadow: 'md',
          radius: 'md',
          onClose: () => {
            try {
              // Optional: Clear query when dropdown closes
              // setQuery('');
            } catch (err) {
              console.error('Dropdown close error:', err);
            }
          },
        }}
        onBlur={() => {
          try {
            // Close dropdown when clicking outside
            setTimeout(() => {
              if (document.activeElement?.tagName !== 'INPUT') {
                setQuery('');
              }
            }, 150);
          } catch (err) {
            console.error('Blur handler error:', err);
          }
        }}
        data-testid={testId}
      />
    </ErrorBoundary>
  );
};

export default FederatedEcommerceAutocomplete;
export type {
  ProductHit,
  ArticleHit,
  FAQHit,
  QuerySuggestionHit,
  FederatedEcommerceAutocompleteProps,
};
