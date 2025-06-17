'use client';

import React, { useState } from 'react';
import {
  Container,
  Stack,
  Title,
  Text,
  Group,
  Card,
  Badge,
  Button,
  Paper,
  Tabs,
  Grid,
  ActionIcon,
  Alert,
  NumberFormatter,
  Skeleton,
} from '@mantine/core';
import {
  IconSearch,
  IconFilter,
  IconSortAscending,
  IconHeart,
  IconShoppingCart,
  IconStar,
  IconTrendingUp,
  IconUsers,
  IconBrain,
  IconSparkles,
  IconChartLine,
  IconBolt,
  IconTarget,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

import {
  InstantSearch,
  SearchBox,
  Hits,
  RefinementList,
  Pagination,
  SortBy,
  Stats,
  ClearRefinements,
  CurrentRefinements,
  HierarchicalMenu,
  RangeInput,
  ToggleRefinement,
  Breadcrumb,
  PoweredBy,
  Configure,
  Index,
  useSearchBox,
  useStats,
  // TODO: These connect functions are deprecated in newer versions
  // connectSearchBox,
  // connectHits,
  // connectRefinementList,
  // connectStats,
  // connectAutoComplete,
} from 'react-instantsearch';

import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { env } from '@/env';

// Initialize search client
const searchClient = algoliasearch(
  env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY,
);

// Type definitions for federated data
interface ProductHit {
  objectID: string;
  name: string;
  brand: string;
  price: {
    currency: string;
    value: number;
    on_sales: boolean;
    discount_level?: number;
    discounted_value?: number;
  };
  image_urls: string[];
  hierarchical_categories: {
    lvl0: string;
    lvl1: string;
    lvl2?: string;
  };
  color: {
    original_name: string;
    filter_group?: string;
  };
  category_page_id: string[];
  list_categories: string[];
  reviews?: {
    rating: number;
    count: number;
    bayesian_avg?: number;
  };
  product_type: string;
  gender: string;
  available_sizes?: string[];
  units_in_stock: number;
  created_at: number;
  _highlightResult?: {
    name?: { value: string };
    brand?: { value: string };
    description?: { value: string };
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
    description?: { value: string };
  };
}

// Enhanced Product Card with all Algolia features
function EnhancedProductCard({ hit }: { hit: ProductHit }) {
  const price = hit.price?.value || 0;
  const discountedPrice = hit.price?.discounted_value || price;
  const currency = hit.price?.currency === 'EUR' ? '€' : '$';
  const isOnSale = hit.price?.on_sales;
  const discountLevel = hit.price?.discount_level || 0;
  const rating = hit.reviews?.rating || 0;
  const reviewCount = hit.reviews?.count || 0;
  const inStock = hit.units_in_stock > 0;
  const category = hit.hierarchical_categories?.lvl1 || hit.hierarchical_categories?.lvl0;

  return (
    <Card shadow="sm" padding="md" radius="md" withBorder style={{ height: '100%' }}>
      <Card.Section>
        <div style={{ position: 'relative' }}>
          {hit.image_urls?.[0] && (
            <img
              src={hit.image_urls[0]}
              alt={hit.name}
              style={{
                width: '100%',
                height: 220,
                objectFit: 'cover',
              }}
            />
          )}

          {/* Badges overlay */}
          <div style={{ position: 'absolute', top: 8, left: 8 }}>
            <Stack gap={4}>
              {isOnSale && discountLevel && (
                <Badge color="red" size="sm">
                  -{Math.abs(discountLevel)}%
                </Badge>
              )}
              {!inStock && (
                <Badge color="gray" size="sm">
                  Out of Stock
                </Badge>
              )}
            </Stack>
          </div>

          {/* Action buttons overlay */}
          <div style={{ position: 'absolute', top: 8, right: 8 }}>
            <Stack gap={4}>
              <ActionIcon variant="filled" color="red" size="sm" radius="xl">
                <IconHeart size={14} />
              </ActionIcon>
            </Stack>
          </div>
        </div>
      </Card.Section>

      <Stack gap="xs" mt="md">
        {/* Brand and category */}
        <Group justify="space-between" align="flex-start">
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            {hit.brand}
          </Text>
          <Badge variant="light" size="xs">
            {hit.product_type}
          </Badge>
        </Group>

        {/* Product name with highlighting */}
        <Text
          fw={500}
          size="sm"
          lineClamp={2}
          dangerouslySetInnerHTML={{
            __html: hit._highlightResult?.name?.value || hit.name,
          }}
        />

        {/* Category breadcrumb */}
        <Text size="xs" c="dimmed" lineClamp={1}>
          {category}
        </Text>

        {/* Color */}
        {hit.color?.original_name && (
          <Group gap={4}>
            <Text size="xs" c="dimmed">
              Color:
            </Text>
            <Text size="xs">{hit.color.original_name}</Text>
          </Group>
        )}

        {/* Reviews */}
        {rating > 0 && (
          <Group gap={4}>
            <Group gap={2}>
              {[...Array(5)].map((_, i) => (
                <IconStar
                  key={i}
                  size={12}
                  style={{
                    color: i < Math.floor(rating) ? '#ffa500' : '#e0e0e0',
                  }}
                />
              ))}
            </Group>
            <Text size="xs" c="dimmed">
              ({reviewCount})
            </Text>
          </Group>
        )}

        {/* Price */}
        <Group justify="space-between" align="center" mt="auto">
          <div>
            {isOnSale && discountedPrice !== price ? (
              <Group gap={4}>
                <Text fw={700} size="lg" c="red">
                  {currency}
                  {discountedPrice.toFixed(2)}
                </Text>
                <Text size="sm" td="line-through" c="dimmed">
                  {currency}
                  {price.toFixed(2)}
                </Text>
              </Group>
            ) : (
              <Text fw={700} size="lg" c="blue">
                {currency}
                {price.toFixed(2)}
              </Text>
            )}
          </div>
        </Group>

        {/* Add to cart */}
        <Button
          variant="light"
          fullWidth
          size="xs"
          leftSection={<IconShoppingCart size={14} />}
          disabled={!inStock}
        >
          {inStock ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </Stack>
    </Card>
  );
}

// Article Card
function ArticleCard({ hit }: { hit: ArticleHit }) {
  const date = new Date(hit.date).toLocaleDateString();

  return (
    <Card shadow="sm" padding="md" radius="md" withBorder style={{ height: '100%' }}>
      <Card.Section>
        <img
          src={hit.image_url}
          alt={hit.title}
          style={{
            width: '100%',
            height: 160,
            objectFit: 'cover',
          }}
        />
      </Card.Section>

      <Stack gap="xs" mt="md">
        <Badge variant="light" size="xs" color="blue">
          Article
        </Badge>
        <Text
          fw={500}
          size="sm"
          lineClamp={2}
          dangerouslySetInnerHTML={{
            __html: hit._highlightResult?.title?.value || hit.title,
          }}
        />
        <Text size="xs" c="dimmed">
          Published {date}
        </Text>
        <Button variant="outline" size="xs" fullWidth mt="auto">
          Read More
        </Button>
      </Stack>
    </Card>
  );
}

// FAQ Card
function FAQCard({ hit }: { hit: FAQHit }) {
  return (
    <Card shadow="sm" padding="md" radius="md" withBorder style={{ height: '100%' }}>
      <Stack gap="xs">
        <Group>
          <Badge variant="light" size="xs" color="green">
            FAQ
          </Badge>
          <Badge variant="outline" size="xs">
            {hit.list_categories.join(', ')}
          </Badge>
        </Group>

        <Text
          fw={500}
          size="sm"
          lineClamp={2}
          dangerouslySetInnerHTML={{
            __html: hit._highlightResult?.title?.value || hit.title,
          }}
        />

        <Text
          size="xs"
          c="dimmed"
          lineClamp={3}
          dangerouslySetInnerHTML={{
            __html: hit._highlightResult?.description?.value || hit.description,
          }}
        />

        <Button variant="outline" size="xs" fullWidth mt="auto">
          View Answer
        </Button>
      </Stack>
    </Card>
  );
}

// Custom SearchBox with advanced features
function AdvancedSearchBox() {
  const { query, refine } = useSearchBox();

  return (
    <Paper p="md" shadow="sm" radius="md">
      <Stack gap="sm">
        <Group>
          <IconSearch size={20} />
          <Text fw={600}>Search Everything</Text>
        </Group>
        <SearchBox
          placeholder="Search products, articles, FAQ..."
          classNames={{
            root: 'w-full',
            form: 'w-full',
            input:
              'w-full p-3 border border-gray-300 rounded-lg text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
            submit: 'hidden',
            reset: query ? 'block' : 'hidden',
          }}
        />
        <Text size="xs" c="dimmed">
          Search across products, articles, and help content
        </Text>
      </Stack>
    </Paper>
  );
}

// Enhanced Stats Component
function EnhancedStats() {
  const { nbHits, nbPages, page, processingTimeMS } = useStats();

  return (
    <Paper p="md" shadow="sm" radius="md">
      <Group justify="space-between">
        <div>
          <Text size="lg" fw={600}>
            <NumberFormatter value={nbHits} thousandSeparator="," /> results
          </Text>
          <Text size="xs" c="dimmed">
            Found in {processingTimeMS}ms
          </Text>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Text size="sm" c="dimmed">
            Page {page + 1} of {nbPages}
          </Text>
        </div>
      </Group>
    </Paper>
  );
}

// Advanced Filters Sidebar
function AdvancedFilters() {
  return (
    <Stack gap="md">
      {/* Clear all filters */}
      <Paper p="md" shadow="sm" radius="md">
        <Group justify="space-between" mb="sm">
          <Text fw={600}>Filters</Text>
          <ClearRefinements
            classNames={{
              button:
                'text-blue-600 text-sm hover:text-blue-800 cursor-pointer border-none bg-transparent p-0',
            }}
          />
        </Group>
        <CurrentRefinements
          classNames={{
            list: 'space-y-1',
            item: 'text-xs',
            label: 'bg-blue-100 text-blue-800 px-2 py-1 rounded',
            delete: 'ml-2 cursor-pointer',
          }}
        />
      </Paper>

      {/* Categories */}
      <Paper p="md" shadow="sm" radius="md">
        <Group mb="sm">
          <IconFilter size={16} />
          <Text fw={600} size="sm">
            Categories
          </Text>
        </Group>
        <HierarchicalMenu
          attributes={[
            'hierarchical_categories.lvl0',
            'hierarchical_categories.lvl1',
            'hierarchical_categories.lvl2',
          ]}
          limit={8}
          showMore={true}
          classNames={{
            list: 'space-y-1',
            item: 'text-sm',
            link: 'cursor-pointer hover:text-blue-600 block py-1',
            count: 'text-gray-500 text-xs ml-auto',
            showMore: 'text-blue-600 text-xs mt-2 cursor-pointer',
          }}
        />
      </Paper>

      {/* Brands */}
      <Paper p="md" shadow="sm" radius="md">
        <Group mb="sm">
          <IconTarget size={16} />
          <Text fw={600} size="sm">
            Brands
          </Text>
        </Group>
        <RefinementList
          attribute="brand"
          limit={8}
          showMore={true}
          searchable={true}
          classNames={{
            list: 'space-y-1',
            item: 'text-sm flex items-center',
            label: 'cursor-pointer hover:text-blue-600 flex items-center w-full',
            checkbox: 'mr-2',
            count: 'text-gray-500 text-xs ml-auto',
            showMore: 'text-blue-600 text-xs mt-2 cursor-pointer block',
            searchBox: 'mb-2 p-2 border border-gray-300 rounded w-full text-sm',
          }}
        />
      </Paper>

      {/* Price Range */}
      <Paper p="md" shadow="sm" radius="md">
        <Group mb="sm">
          <IconTrendingUp size={16} />
          <Text fw={600} size="sm">
            Price Range
          </Text>
        </Group>
        <RangeInput
          attribute="price.value"
          classNames={{
            root: 'space-y-2',
            input: 'w-full p-2 border border-gray-300 rounded text-sm',
            separator: 'text-center text-gray-500',
            submit: 'w-full mt-2 bg-blue-600 text-white p-2 rounded text-sm hover:bg-blue-700',
          }}
        />
      </Paper>

      {/* Colors */}
      <Paper p="md" shadow="sm" radius="md">
        <Group mb="sm">
          <IconSparkles size={16} />
          <Text fw={600} size="sm">
            Colors
          </Text>
        </Group>
        <RefinementList
          attribute="color.original_name"
          limit={6}
          showMore={true}
          classNames={{
            list: 'space-y-1',
            item: 'text-sm flex items-center',
            label: 'cursor-pointer hover:text-blue-600 flex items-center w-full',
            checkbox: 'mr-2',
            count: 'text-gray-500 text-xs ml-auto',
            showMore: 'text-blue-600 text-xs mt-2 cursor-pointer block',
          }}
        />
      </Paper>

      {/* On Sale Toggle */}
      <Paper p="md" shadow="sm" radius="md">
        <Group mb="sm">
          <IconBolt size={16} />
          <Text fw={600} size="sm">
            Special Offers
          </Text>
        </Group>
        <ToggleRefinement
          attribute="price.on_sales"
          label="On Sale Only"
          classNames={{
            label: 'cursor-pointer flex items-center',
            checkbox: 'mr-2',
          }}
        />
      </Paper>

      {/* In Stock */}
      <Paper p="md" shadow="sm" radius="md">
        <ToggleRefinement
          attribute="units_in_stock"
          on={1}
          label="In Stock Only"
          classNames={{
            label: 'cursor-pointer flex items-center',
            checkbox: 'mr-2',
          }}
        />
      </Paper>
    </Stack>
  );
}

// Sort Options
function AdvancedSortBy() {
  return (
    <Paper p="md" shadow="sm" radius="md">
      <Group mb="sm">
        <IconSortAscending size={16} />
        <Text fw={600} size="sm">
          Sort By
        </Text>
      </Group>
      <SortBy
        items={[
          { label: 'Most Relevant', value: 'autocomplete_demo_products' },
          { label: 'Price: Low to High', value: 'autocomplete_demo_products_price_asc' },
          { label: 'Price: High to Low', value: 'autocomplete_demo_products_price_desc' },
          { label: 'Highest Rated', value: 'autocomplete_demo_products_rating_desc' },
          { label: 'Most Popular', value: 'autocomplete_demo_products_popularity_desc' },
          { label: 'Newest First', value: 'autocomplete_demo_products_date_desc' },
        ]}
        classNames={{
          select: 'w-full p-2 border border-gray-300 rounded text-sm focus:border-blue-500',
        }}
      />
    </Paper>
  );
}

interface ComprehensiveAlgoliaShowcaseProps {
  loading?: boolean;
  error?: string;
  'data-testid'?: string;
}

// Loading skeleton for ComprehensiveAlgoliaShowcase
function ComprehensiveAlgoliaShowcaseSkeleton({ testId }: { testId?: string }) {
  return (
    <Container size="xl" py="xl" data-testid={testId}>
      <Stack gap="xl">
        <div style={{ textAlign: 'center' }}>
          <Skeleton height={40} width={400} mx="auto" mb="md" />
          <Skeleton height={24} width={600} mx="auto" />
        </div>
        <Paper p="md">
          <Skeleton height={60} />
        </Paper>
        <div>
          <Group mb="xl">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} height={40} width={120} />
              ))}
          </Group>
          <Group align="flex-start" gap="xl">
            <div style={{ minWidth: '280px' }}>
              <Stack gap="lg">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} height={120} />
                  ))}
              </Stack>
            </div>
            <div style={{ flex: 1 }}>
              <Skeleton height={60} mb="lg" />
              <Grid>
                {Array(8)
                  .fill(0)
                  .map((_, i) => (
                    <Grid.Col key={i} span={3}>
                      <Skeleton height={300} />
                    </Grid.Col>
                  ))}
              </Grid>
            </div>
          </Group>
        </div>
      </Stack>
    </Container>
  );
}

// Error state for ComprehensiveAlgoliaShowcase
function ComprehensiveAlgoliaShowcaseError({ error, testId }: { error: string; testId?: string }) {
  return (
    <Container size="xl" py="xl" data-testid={testId}>
      <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
        <Text size="sm">Algolia showcase failed to load: {error}</Text>
      </Alert>
    </Container>
  );
}

// Main Showcase Component
export default function ComprehensiveAlgoliaShowcase({
  loading = false,
  error,
  'data-testid': testId = 'comprehensive-algolia-showcase',
}: ComprehensiveAlgoliaShowcaseProps = {}) {
  const [activeIndex, setActiveIndex] = useState('products');
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <ComprehensiveAlgoliaShowcaseSkeleton testId={testId} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <ComprehensiveAlgoliaShowcaseError error={currentError} testId={testId} />;
  }

  return (
    <ErrorBoundary
      fallback={
        <ComprehensiveAlgoliaShowcaseError
          error="Algolia showcase failed to render"
          testId={testId}
        />
      }
    >
      <Container size="xl" py="xl" data-testid={testId}>
        <ErrorBoundary
          fallback={
            <ComprehensiveAlgoliaShowcaseError
              error="Search client initialization failed"
              testId={testId}
            />
          }
        >
          <InstantSearch searchClient={searchClient} indexName="autocomplete_demo_products">
            <Stack gap="xl">
              {/* Header */}
              <ErrorBoundary fallback={<Skeleton height={100} />}>
                <div style={{ textAlign: 'center' }}>
                  <Title order={1} mb="md">
                    Complete Algolia React UI Showcase
                  </Title>
                  <Text size="lg" c="dimmed" mb="xl">
                    Demonstrating all Algolia UI components with federated e-commerce data
                  </Text>
                </div>
              </ErrorBoundary>

              {/* Main Search */}
              <ErrorBoundary fallback={<Skeleton height={80} />}>
                <AdvancedSearchBox />
              </ErrorBoundary>

              {/* Multi-Index Tabs */}
              <ErrorBoundary fallback={<Skeleton height={400} />}>
                <Tabs
                  value={activeIndex}
                  onChange={(value) => {
                    try {
                      setActiveIndex(value || 'products');
                    } catch (err) {
                      console.error('Failed to change tab:', err);
                      setInternalError('Failed to change tab');
                    }
                  }}
                >
                  <Tabs.List grow>
                    <Tabs.Tab value="products" leftSection={<IconShoppingCart size={16} />}>
                      Products (
                      <ErrorBoundary fallback={<span>-</span>}>
                        <Stats />
                      </ErrorBoundary>
                      )
                    </Tabs.Tab>
                    <Tabs.Tab value="articles" leftSection={<IconBrain size={16} />}>
                      Articles
                    </Tabs.Tab>
                    <Tabs.Tab value="faq" leftSection={<IconUsers size={16} />}>
                      FAQ
                    </Tabs.Tab>
                  </Tabs.List>

                  {/* Products Tab */}
                  <Tabs.Panel value="products" pt="md">
                    <ErrorBoundary fallback={<Skeleton height={500} />}>
                      <Index indexName="autocomplete_demo_products">
                        <Configure hitsPerPage={12} />

                        <Group align="flex-start" gap="xl" wrap="nowrap">
                          {/* Sidebar */}
                          <div style={{ minWidth: '280px', maxWidth: '320px' }}>
                            <Stack gap="lg">
                              <ErrorBoundary fallback={<Skeleton height={80} />}>
                                <AdvancedSortBy />
                              </ErrorBoundary>
                              <ErrorBoundary fallback={<Skeleton height={200} />}>
                                <AdvancedFilters />
                              </ErrorBoundary>
                              <ErrorBoundary fallback={<Skeleton height={40} />}>
                                <PoweredBy />
                              </ErrorBoundary>
                            </Stack>
                          </div>

                          {/* Main Content */}
                          <div style={{ flex: 1 }}>
                            <Stack gap="lg">
                              <ErrorBoundary fallback={<Skeleton height={60} />}>
                                <EnhancedStats />
                              </ErrorBoundary>

                              <ErrorBoundary fallback={<Skeleton height={30} />}>
                                <Breadcrumb
                                  attributes={[
                                    'hierarchical_categories.lvl0',
                                    'hierarchical_categories.lvl1',
                                    'hierarchical_categories.lvl2',
                                  ]}
                                  classNames={{
                                    list: 'flex space-x-2 text-sm',
                                    item: 'text-blue-600 hover:text-blue-800',
                                    separator: 'text-gray-400 mx-2',
                                  }}
                                />
                              </ErrorBoundary>

                              <ErrorBoundary
                                fallback={
                                  <Grid>
                                    {Array(8)
                                      .fill(0)
                                      .map((_, i) => (
                                        <Grid.Col key={i} span={3}>
                                          <Skeleton height={300} />
                                        </Grid.Col>
                                      ))}
                                  </Grid>
                                }
                              >
                                <Hits
                                  hitComponent={EnhancedProductCard}
                                  classNames={{
                                    list: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
                                  }}
                                />
                              </ErrorBoundary>

                              <ErrorBoundary fallback={<Skeleton height={40} />}>
                                <Group justify="center" mt="xl">
                                  <Pagination
                                    showFirst={false}
                                    showLast={false}
                                    showPrevious={true}
                                    showNext={true}
                                    classNames={{
                                      root: 'flex',
                                      item: 'mx-1 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer',
                                      link: 'block',
                                    }}
                                  />
                                </Group>
                              </ErrorBoundary>
                            </Stack>
                          </div>
                        </Group>
                      </Index>
                    </ErrorBoundary>
                  </Tabs.Panel>

                  {/* Articles Tab */}
                  <Tabs.Panel value="articles" pt="md">
                    <ErrorBoundary fallback={<Skeleton height={400} />}>
                      <Index indexName="autocomplete_demo_articles">
                        <Configure hitsPerPage={9} />
                        <Stack gap="lg">
                          <ErrorBoundary fallback={<Skeleton height={30} />}>
                            <Stats />
                          </ErrorBoundary>
                          <ErrorBoundary
                            fallback={
                              <Grid>
                                {Array(6)
                                  .fill(0)
                                  .map((_, i) => (
                                    <Grid.Col key={i} span={4}>
                                      <Skeleton height={250} />
                                    </Grid.Col>
                                  ))}
                              </Grid>
                            }
                          >
                            <Hits
                              hitComponent={ArticleCard}
                              classNames={{
                                list: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
                              }}
                            />
                          </ErrorBoundary>
                          <ErrorBoundary fallback={<Skeleton height={40} />}>
                            <Group justify="center">
                              <Pagination />
                            </Group>
                          </ErrorBoundary>
                        </Stack>
                      </Index>
                    </ErrorBoundary>
                  </Tabs.Panel>

                  {/* FAQ Tab */}
                  <Tabs.Panel value="faq" pt="md">
                    <ErrorBoundary fallback={<Skeleton height={400} />}>
                      <Index indexName="autocomplete_demo_faq">
                        <Configure hitsPerPage={6} />
                        <Stack gap="lg">
                          <ErrorBoundary fallback={<Skeleton height={40} />}>
                            <Group>
                              <Stats />
                              <RefinementList
                                attribute="list_categories"
                                limit={5}
                                classNames={{
                                  list: 'flex space-x-2',
                                  item: 'text-sm',
                                  label:
                                    'cursor-pointer bg-gray-100 px-3 py-1 rounded hover:bg-gray-200',
                                  checkbox: 'hidden',
                                }}
                              />
                            </Group>
                          </ErrorBoundary>
                          <ErrorBoundary
                            fallback={
                              <Grid>
                                {Array(4)
                                  .fill(0)
                                  .map((_, i) => (
                                    <Grid.Col key={i} span={6}>
                                      <Skeleton height={200} />
                                    </Grid.Col>
                                  ))}
                              </Grid>
                            }
                          >
                            <Hits
                              hitComponent={FAQCard}
                              classNames={{
                                list: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
                              }}
                            />
                          </ErrorBoundary>
                          <ErrorBoundary fallback={<Skeleton height={40} />}>
                            <Group justify="center">
                              <Pagination />
                            </Group>
                          </ErrorBoundary>
                        </Stack>
                      </Index>
                    </ErrorBoundary>
                  </Tabs.Panel>
                </Tabs>
              </ErrorBoundary>

              {/* Features Showcase */}
              <ErrorBoundary fallback={<Skeleton height={200} />}>
                <Paper p="xl" shadow="sm" radius="md" mt="xl">
                  <Stack gap="lg">
                    <Title order={2} ta="center">
                      Algolia Features Demonstrated
                    </Title>

                    <Grid>
                      <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                        <Card shadow="xs" padding="lg" radius="md" withBorder h="100%">
                          <Stack gap="sm" ta="center">
                            <IconSearch size={32} color="#4CAF50" />
                            <Text fw={600}>InstantSearch</Text>
                            <Text size="sm" c="dimmed">
                              Real-time search results with highlighting and typo tolerance
                            </Text>
                          </Stack>
                        </Card>
                      </Grid.Col>

                      <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                        <Card shadow="xs" padding="lg" radius="md" withBorder h="100%">
                          <Stack gap="sm" ta="center">
                            <IconFilter size={32} color="#2196F3" />
                            <Text fw={600}>Faceted Search</Text>
                            <Text size="sm" c="dimmed">
                              Dynamic filters with hierarchical categories and refinements
                            </Text>
                          </Stack>
                        </Card>
                      </Grid.Col>

                      <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                        <Card shadow="xs" padding="lg" radius="md" withBorder h="100%">
                          <Stack gap="sm" ta="center">
                            <IconBrain size={32} color="#FF9800" />
                            <Text fw={600}>Multi-Index</Text>
                            <Text size="sm" c="dimmed">
                              Search across different content types with federated results
                            </Text>
                          </Stack>
                        </Card>
                      </Grid.Col>

                      <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                        <Card shadow="xs" padding="lg" radius="md" withBorder h="100%">
                          <Stack gap="sm" ta="center">
                            <IconChartLine size={32} color="#9C27B0" />
                            <Text fw={600}>Analytics</Text>
                            <Text size="sm" c="dimmed">
                              Search analytics, stats, and performance monitoring
                            </Text>
                          </Stack>
                        </Card>
                      </Grid.Col>
                    </Grid>
                  </Stack>
                </Paper>
              </ErrorBoundary>
            </Stack>
          </InstantSearch>
        </ErrorBoundary>
      </Container>
    </ErrorBoundary>
  );
}
