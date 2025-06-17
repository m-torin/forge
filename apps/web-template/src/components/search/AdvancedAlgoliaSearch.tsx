'use client';

import React, { Suspense, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Container,
  Title,
  Text,
  Stack,
  Card,
  Group,
  Badge,
  Button,
  Grid,
  TextInput,
  Breadcrumbs,
  Anchor,
  Modal,
  ActionIcon,
  Loader,
  Paper,
  Skeleton,
  Chip,
  ThemeIcon,
  useMantineColorScheme,
  Tooltip,
  NumberFormatter,
} from '@mantine/core';
import {
  useDisclosure,
  useMediaQuery,
  useDebouncedCallback,
  useLocalStorage,
} from '@mantine/hooks';
import {
  IconSearch,
  IconShoppingCart,
  IconStar,
  IconHome,
  IconMicrophone,
  IconMicrophoneOff,
  IconFilter,
  IconHeart,
  IconShare,
  IconTruck,
  IconBolt as IconFlash,
  IconSparkles,
  IconEye,
  IconAdjustments,
  IconTrendingUp,
  IconBolt,
} from '@tabler/icons-react';
import {
  InstantSearch,
  RefinementList,
  Configure,
  Pagination,
  SortBy,
  RangeInput,
  useInstantSearch,
  useSearchBox,
  useStats,
  ToggleRefinement,
  ClearRefinements,
  CurrentRefinements,
  useCurrentRefinements,
  useSortBy,
  useHits,
} from 'react-instantsearch';
import { liteClient as algoliasearch } from 'algoliasearch/lite';
// import { autocomplete, getAlgoliaResults } from "@algolia/autocomplete-js";
import { createInMemoryCache } from '@algolia/cache-in-memory';
import { env } from '@/env';

// Advanced search client with caching and optimization
const searchClient = algoliasearch(
  env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY,
  {
    // Enable caching for better performance
    responsesCache: createInMemoryCache(),
    requestsCache: createInMemoryCache({ serializable: false }),
  },
);

const indexName = env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME;

// Enhanced hit interface for e-commerce
interface EnhancedHit {
  objectID: string;
  __position: number;
  __queryID?: string;
  name?: string;
  title?: string;
  description?: string;
  short_description?: string;
  image?: string;
  image_url?: string;
  price?: number;
  price_range?: { min: number; max: number };
  currency?: string;
  category?: string;
  categories?: string[];
  brand?: string;
  vendor?: string;
  rating?: number;
  reviews?: { rating: number; count: number };
  nb_reviews?: number;
  free_shipping?: boolean;
  popularity?: number;
  sales?: number;
  hierarchicalCategories?: {
    lvl0: string;
    lvl1?: string;
    lvl2?: string;
  };
  _highlightResult?: {
    name?: { value: string };
    title?: { value: string };
    description?: { value: string };
    short_description?: { value: string };
  };
  _snippetResult?: {
    description?: { value: string };
  };
}

// Advanced voice search hook
const useVoiceSearch = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  React.useEffect(() => {
    setIsSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }, []);

  const startVoiceSearch = useCallback(
    (onResult: (transcript: string) => void) => {
      if (!isSupported) return;

      const SpeechRecognition =
        (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    },
    [isSupported],
  );

  return { isListening, isSupported, startVoiceSearch };
};

// Advanced search box with voice and AI features
function AdvancedSearchBox({ locale }: { locale: string }) {
  const { query, refine } = useSearchBox();
  const { isListening, isSupported, startVoiceSearch } = useVoiceSearch();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Debounced search with AI-powered suggestions
  const debouncedSearch = useDebouncedCallback(async (searchQuery: string) => {
    refine(searchQuery);

    if (searchQuery.length > 2) {
      setIsLoading(true);
      try {
        // Simulate AI-powered suggestions (replace with actual Algolia query suggestions)
        const mockSuggestions = [
          `${searchQuery} best deals`,
          `${searchQuery} reviews`,
          `${searchQuery} on sale`,
          `top rated ${searchQuery}`,
          `cheap ${searchQuery}`,
        ].slice(0, 5);
        setSuggestions(mockSuggestions);
      } catch (error) {
        console.warn('Query suggestions unavailable: ', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, 300);

  const handleVoiceSearch = useCallback(() => {
    startVoiceSearch((transcript) => {
      debouncedSearch(transcript);
      // Update URL for voice searches
      const url = new URL(window.location.href);
      url.searchParams.set('q', transcript);
      url.searchParams.set('voice', 'true');
      router.replace(url.pathname + url.search, { scroll: false });
    });
  }, [startVoiceSearch, debouncedSearch, router]);

  return (
    <Paper shadow="sm" radius="sm" p="md">
      <Group gap="md" wrap="nowrap">
        <TextInput
          placeholder="Search products with AI-powered understanding..."
          value={query}
          onChange={(event: any) => debouncedSearch(event.currentTarget.value)}
          leftSection={<IconSearch size={16} />}
          rightSection={
            <Group gap={4} wrap="nowrap">
              {isLoading && <Loader size="xs" />}
              {isSupported && (
                <Tooltip label={isListening ? 'Listening...' : 'Voice search'}>
                  <ActionIcon
                    variant={isListening ? 'filled' : 'subtle'}
                    color={isListening ? 'red' : 'gray'}
                    onClick={handleVoiceSearch}
                    disabled={isListening}
                  >
                    {isListening ? <IconMicrophoneOff size={16} /> : <IconMicrophone size={16} />}
                  </ActionIcon>
                </Tooltip>
              )}
            </Group>
          }
          radius="sm"
          size="lg"
          style={{ flex: 1 }}
        />
      </Group>

      {/* AI-powered query suggestions */}
      {suggestions.length > 0 && (
        <Stack gap="xs" mt="md">
          <Text size="xs" c="dimmed" fw={500}>
            <IconSparkles size={12} style={{ marginRight: 4 }} />
            AI Suggestions
          </Text>
          <Group gap="xs">
            {suggestions.map((suggestion, index) => (
              <Chip
                key={index}
                size="xs"
                variant="light"
                onClick={() => debouncedSearch(suggestion)}
                style={{ cursor: 'pointer' }}
              >
                {suggestion}
              </Chip>
            ))}
          </Group>
        </Stack>
      )}
    </Paper>
  );
}

// Enhanced product card with advanced features
function EnhancedProductCard({ hit }: { hit: EnhancedHit }) {
  const [isFavorited, setIsFavorited] = useLocalStorage({
    key: `favorite-${hit.objectID}`,
    defaultValue: false,
  });
  const { colorScheme } = useMantineColorScheme();

  const price = hit.price || hit.price_range?.min || 0;
  const currency = hit.currency || '$';
  const rating = hit.rating || hit.reviews?.rating || 4.5;
  const reviewCount = hit.reviews?.count || hit.nb_reviews || 0;
  const brand = hit.brand || hit.vendor;
  const category = hit.categories?.[0] || hit.category;
  const name = hit.name || hit.title || 'Product';
  const description = hit.description || hit.short_description;
  const popularity = hit.popularity || 0;
  const isPopular = popularity > 1000;
  const isTrending = hit.sales && hit.sales > 500;

  return (
    <Card shadow="sm" padding="lg" radius="sm" withBorder={true} style={{ height: '100%' }}>
      <Card.Section>
        <div style={{ position: 'relative' }}>
          {(hit.image || hit.image_url) && (
            <img
              src={hit.image || hit.image_url}
              alt={name}
              style={{ width: '100%', height: 200, objectFit: 'cover' }}
            />
          )}

          {/* Advanced badges */}
          <div style={{ position: 'absolute', top: 8, left: 8 }}>
            <Stack gap={4}>
              {hit.free_shipping && (
                <Badge size="xs" c="green" variant="light" leftSection={<IconTruck size={10} />}>
                  Free Shipping
                </Badge>
              )}
              {isPopular && (
                <Badge
                  size="xs"
                  color="orange"
                  variant="light"
                  leftSection={<IconFlash size={10} />}
                >
                  Popular
                </Badge>
              )}
              {isTrending && (
                <Badge
                  size="xs"
                  c="blue"
                  variant="light"
                  leftSection={<IconTrendingUp size={10} />}
                >
                  Trending
                </Badge>
              )}
            </Stack>
          </div>

          {/* Favorite button */}
          <ActionIcon
            style={{ position: 'absolute', top: 8, right: 8 }}
            variant={isFavorited ? 'filled' : 'light'}
            color={isFavorited ? 'red' : 'gray'}
            onClick={() => setIsFavorited(!isFavorited)}
          >
            <IconHeart size={16} fill={isFavorited ? 'currentColor' : 'none'} />
          </ActionIcon>
        </div>
      </Card.Section>

      <Stack gap="xs" mt="md">
        {/* Brand and category */}
        {(brand || category) && (
          <Group gap="xs" justify="space-between">
            <Text size="xs" c="dimmed" fw={500}>
              {brand && <span>{brand}</span>}
            </Text>
            {category && (
              <Badge size="xs" variant="dot" c="gray">
                {category}
              </Badge>
            )}
          </Group>
        )}

        {/* Product name with highlighting */}
        <Title order={4} lineClamp={2} style={{ minHeight: 48 }}>
          <span
            dangerouslySetInnerHTML={{
              __html:
                hit._highlightResult?.name?.value || hit._highlightResult?.title?.value || name,
            }}
          />
        </Title>

        {/* AI-enhanced description snippet */}
        {description && (
          <Text size="md" c="dimmed" lineClamp={2}>
            <span
              dangerouslySetInnerHTML={{
                __html: hit._snippetResult?.description?.value || description,
              }}
            />
          </Text>
        )}

        {/* Rating and reviews */}
        <Group gap="xs" justify="space-between">
          <Group gap={4}>
            <ThemeIcon size="md" variant="light" c="yellow">
              <IconStar size={12} fill="currentColor" />
            </ThemeIcon>
            <Text size="md" fw={500}>
              {rating.toFixed(1)}
            </Text>
            {reviewCount > 0 && (
              <Text size="xs" c="dimmed">
                ({reviewCount.toLocaleString()} reviews)
              </Text>
            )}
          </Group>

          {/* Price with enhanced formatting */}
          <Group gap="xs">
            <NumberFormatter
              value={price}
              prefix={currency}
              thousandSeparator
              decimalScale={2}
              style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--mantine-color-blue-6)' }}
            />
          </Group>
        </Group>

        {/* Advanced action buttons */}
        <Group mt="md" gap="xs">
          <Button flex={1} leftSection={<IconShoppingCart size={16} />} variant="light" radius="sm">
            Add to cart
          </Button>
          <ActionIcon variant="light" size="lg">
            <IconEye size={16} />
          </ActionIcon>
          <ActionIcon variant="light" size="lg">
            <IconShare size={16} />
          </ActionIcon>
        </Group>
      </Stack>
    </Card>
  );
}

// Smart search statistics with insights
function SmartSearchStats() {
  const { results } = useInstantSearch();
  const { nbHits, processingTimeMS, query } = useStats();

  if (!results) return null;

  const isGoodPerformance = processingTimeMS < 100;
  const hasResults = nbHits > 0;
  const isLargeResultSet = nbHits > 1000;

  return (
    <Paper
      p="md"
      radius="sm"
      bg="gray.0"
      style={{ borderLeft: '4px solid var(--mantine-color-blue-6)' }}
    >
      <Group justify="space-between" ta="center">
        <Group gap="lg">
          <Group gap="xs">
            <ThemeIcon size="md" variant="light" color={hasResults ? 'green' : 'orange'}>
              <IconBolt size={12} />
            </ThemeIcon>
            <Text size="md" fw={500}>
              <NumberFormatter value={nbHits} thousandSeparator /> products found
            </Text>
          </Group>

          <Group gap="xs">
            <ThemeIcon size="md" variant="light" color={isGoodPerformance ? 'green' : 'yellow'}>
              <IconFlash size={12} />
            </ThemeIcon>
            <Text size="md" c="dimmed">
              in {processingTimeMS}ms
            </Text>
          </Group>

          {isLargeResultSet && (
            <Badge size="md" variant="light" c="blue">
              Large catalog
            </Badge>
          )}
        </Group>

        {query && (
          <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>
            for "{query}"
          </Text>
        )}
      </Group>
    </Paper>
  );
}

// Advanced faceting with smart organization
function SmartFacets() {
  const { items: currentRefinements } = useCurrentRefinements();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [filtersOpened, { toggle: toggleFilters }] = useDisclosure(false);

  const FacetContent = () => (
    <Stack gap="lg">
      {/* Active filters with clear options */}
      {currentRefinements.length > 0 && (
        <Paper p="md" radius="sm" bg="blue.0">
          <Group justify="space-between" mb="xs">
            <Text size="md" fw={500}>
              Active Filters
            </Text>
            <ClearRefinements
              translations={{
                resetButtonText: 'Clear all',
              }}
            />
          </Group>
          <CurrentRefinements />
        </Paper>
      )}

      {/* Smart category faceting */}
      <Card padding="md" radius="sm" withBorder={true}>
        <Text fw={500} mb="md" size="md">
          <IconAdjustments size={16} style={{ marginRight: 8 }} />
          Categories
        </Text>
        <RefinementList
          attribute="categories"
          limit={8}
          showMore={true}
          showMoreLimit={20}
          searchable={true}
          searchablePlaceholder="Search categories..."
          translations={{
            showMoreButtonText: () => 'Show more',
          }}
        />
      </Card>

      {/* Brand faceting with search */}
      <Card padding="md" radius="sm" withBorder={true}>
        <Text fw={500} mb="md" size="md">
          Brands
        </Text>
        <RefinementList
          attribute="brand"
          limit={6}
          showMore={true}
          searchable={true}
          searchablePlaceholder="Search brands..."
        />
      </Card>

      {/* Smart price range */}
      <Card padding="md" radius="sm" withBorder={true}>
        <Text fw={500} mb="md" size="md">
          Price Range
        </Text>
        <RangeInput
          attribute="price"
          precision={0}
          translations={{
            separatorElementText: 'to',
            submitButtonText: 'Apply',
          }}
        />
      </Card>

      {/* Advanced toggles */}
      <Card padding="md" radius="sm" withBorder={true}>
        <Text fw={500} mb="md" size="md">
          Special Features
        </Text>
        <Stack gap="md">
          <ToggleRefinement attribute="free_shipping" label="Free Shipping Available" on={true} />
          <RefinementList
            attribute="rating"
            limit={5}
            transformItems={(items) =>
              items.map((item: any) => ({
                ...item,
                label: `${item.label}+ stars (${item.count})`,
              }))
            }
          />
        </Stack>
      </Card>
    </Stack>
  );

  if (isMobile) {
    return (
      <>
        <Button
          variant="light"
          leftSection={<IconFilter size={16} />}
          onClick={toggleFilters}
          fullWidth
        >
          Filters {currentRefinements.length > 0 && `(${currentRefinements.length})`}
        </Button>

        <Modal opened={filtersOpened} onClose={toggleFilters} title="Search Filters" size="lg">
          <FacetContent />
        </Modal>
      </>
    );
  }

  return <FacetContent />;
}

// Advanced sorting with smart recommendations
function SmartSortBy() {
  const { currentRefinement } = useSortBy({
    items: [
      { label: 'Most Relevant', value: 'autocomplete_demo_products' },
      { label: 'Price: Low to High', value: 'autocomplete_demo_products_price_asc' },
      { label: 'Price: High to Low', value: 'autocomplete_demo_products_price_desc' },
      { label: 'Highest Rated', value: 'autocomplete_demo_products_rating_desc' },
      { label: 'Most Popular', value: 'autocomplete_demo_products_popularity_desc' },
      { label: 'Newest First', value: 'autocomplete_demo_products_date_desc' },
      { label: 'Best Selling', value: 'autocomplete_demo_products_sales_desc' },
    ],
  });

  return (
    <Group gap="md" ta="center">
      <Text size="md" c="dimmed">
        Sort by:
      </Text>
      <SortBy
        items={[
          { label: 'Most Relevant', value: 'instant_search' },
          { label: 'Price: Low to High', value: 'instant_search_price_asc' },
          { label: 'Price: High to Low', value: 'instant_search_price_desc' },
          { label: 'Highest Rated', value: 'instant_search_rating_desc' },
          { label: 'Most Popular', value: 'instant_search_popularity_desc' },
          { label: 'Newest First', value: 'instant_search_date_desc' },
          { label: 'Best Selling', value: 'instant_search_sales_desc' },
        ]}
        transformItems={(items) =>
          items.map((item: any) => ({
            ...item,
            label: item.label,
          }))
        }
      />
    </Group>
  );
}

// Main search results with optimization
function OptimizedSearchResults() {
  const { hits } = useHits<EnhancedHit>();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  if (hits.length === 0) {
    return (
      <Paper p="xl" radius="sm" ta="center">
        <Stack gap="md" ta="center">
          <ThemeIcon size={64} variant="light" c="gray">
            <IconSearch size={32} />
          </ThemeIcon>
          <div>
            <Text size="lg" fw={500} mb="xs">
              No products found
            </Text>
            <Text size="md" c="dimmed">
              Try adjusting your search or filters
            </Text>
          </div>
          <Button variant="light" size="md">
            Clear all filters
          </Button>
        </Stack>
      </Paper>
    );
  }

  return (
    <div>
      <Grid>
        {hits.map((hit) => (
          <Grid.Col key={hit.objectID} span={{ base: 12, sm: 6, md: viewMode === 'grid' ? 4 : 12 }}>
            <EnhancedProductCard hit={hit} />
          </Grid.Col>
        ))}
      </Grid>
    </div>
  );
}

// Search loading skeletons
function SearchSkeleton() {
  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Skeleton height={60} radius="sm" />
        <Grid>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Stack gap="lg">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} height={200} radius="sm" />
              ))}
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 9 }}>
            <Stack gap="lg">
              <Skeleton height={40} radius="sm" />
              <Grid>
                {[...Array(6)].map((_, i) => (
                  <Grid.Col key={i} span={{ base: 12, sm: 6, md: 4 }}>
                    <Skeleton height={300} radius="sm" />
                  </Grid.Col>
                ))}
              </Grid>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}

// Main component
export default function AdvancedAlgoliaSearch({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const searchParams = useSearchParams();
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <Container size="xl" py="xl">
      <InstantSearch
        searchClient={searchClient}
        indexName={indexName}
        future={{
          preserveSharedStateOnUnmount: true,
        }}
      >
        <Configure
          hitsPerPage={24}
          clickAnalytics={true}
          enablePersonalization={true}
          analytics={true}
        />

        <Stack gap="xl">
          {/* Breadcrumbs */}
          <Breadcrumbs>
            <Anchor href={`/${locale}`} c="dimmed" size="md">
              <Group gap="xs">
                <IconHome size={14} />
                Home
              </Group>
            </Anchor>
            <Anchor href={`/${locale}/search`} c="dimmed" size="md">
              Search
            </Anchor>
          </Breadcrumbs>

          {/* Advanced search header */}
          <div>
            <Title order={1} mb="md">
              AI-Powered Product Search
            </Title>
            <Text c="dimmed" size="lg">
              Discover products with intelligent search, voice commands, and personalized
              recommendations
            </Text>
          </div>

          {/* Advanced search box */}
          <AdvancedSearchBox locale={locale} />

          {/* Search stats */}
          <SmartSearchStats />

          {/* Main content */}
          <Grid>
            {/* Sidebar filters */}
            <Grid.Col span={{ base: 12, md: 3 }}>
              <Suspense fallback={<Skeleton height={400} />}>
                <SmartFacets />
              </Suspense>
            </Grid.Col>

            {/* Search results */}
            <Grid.Col span={{ base: 12, md: 9 }}>
              <Stack gap="lg">
                <Group justify="space-between" ta="center">
                  <SmartSortBy />
                </Group>

                <Suspense fallback={<Skeleton height={600} />}>
                  <OptimizedSearchResults />
                </Suspense>

                {/* Pagination */}
                <Pagination />
              </Stack>
            </Grid.Col>
          </Grid>
        </Stack>
      </InstantSearch>
    </Container>
  );
}
