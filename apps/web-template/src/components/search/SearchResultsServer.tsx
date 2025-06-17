import React from 'react';
import {
  Card,
  Stack,
  Badge,
  Text,
  Title,
  Group,
  ThemeIcon,
  NumberFormatter,
  ActionIcon,
  Paper,
} from '@mantine/core';
import {
  IconShoppingCart,
  IconStar,
  IconHeart,
  IconEye,
  IconShare,
  IconTruck,
  IconBolt,
  IconTrendingUp,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { unstable_noStore as noStore } from 'next/cache';

// Server Component for search results with streaming
interface SearchResult {
  objectID: string;
  name?: string;
  title?: string;
  image?: string;
  image_url?: string;
  price?: number;
  price_range?: { min: number; max: number };
  currency?: string;
  brand?: string;
  rating?: number;
  reviews?: { count: number };
  free_shipping?: boolean;
  popularity?: number;
  sales?: number;
  _highlightResult?: {
    name?: { value: string };
    title?: { value: string };
  };
}

interface SearchResultsServerProps {
  initialData?: any;
  locale: string;
  loading?: boolean;
  error?: string;
  'data-testid'?: string;
}

// Server-side product card component
function ServerProductCard({ hit }: { hit: SearchResult }) {
  const price = hit.price || hit.price_range?.min || 0;
  const currency = hit.currency || '$';
  const rating = hit.rating || 4.5;
  const reviewCount = hit.reviews?.count || 0;
  const name = hit.name || hit.title || 'Product';
  const isPopular = (hit.popularity || 0) > 1000;
  const isTrending = (hit.sales || 0) > 500;

  return (
    <Card shadow="sm" padding="lg" radius="sm" withBorder={true} style={{ height: '100%' }}>
      <Card.Section>
        <div style={{ position: 'relative' }}>
          {(hit.image || hit.image_url) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={hit.image || hit.image_url}
              alt={name}
              style={{ width: '100%', height: 200, objectFit: 'cover' }}
            />
          )}

          {/* Server-rendered badges */}
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
                  leftSection={<IconBolt size={10} />}
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
        </div>
      </Card.Section>

      <Stack gap="xs" mt="md">
        {/* Brand */}
        {hit.brand && (
          <Text size="xs" c="dimmed" fw={500}>
            {hit.brand}
          </Text>
        )}

        {/* Product name with highlighting (server-rendered) */}
        <Title order={4} lineClamp={2} style={{ minHeight: 48 }}>
          <span
            dangerouslySetInnerHTML={{
              __html:
                hit._highlightResult?.name?.value || hit._highlightResult?.title?.value || name,
            }}
          />
        </Title>

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

          {/* Price */}
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

        {/* Action buttons (these will be hydrated client-side) */}
        <Group mt="md" gap="xs">
          <ActionIcon
            variant="light"
            size="lg"
            style={{ flex: 1 }}
            component="button"
            data-product-id={hit.objectID}
          >
            <IconShoppingCart size={16} />
          </ActionIcon>
          <ActionIcon variant="light" size="lg">
            <IconEye size={16} />
          </ActionIcon>
          <ActionIcon variant="light" size="lg">
            <IconHeart size={16} />
          </ActionIcon>
          <ActionIcon variant="light" size="lg">
            <IconShare size={16} />
          </ActionIcon>
        </Group>
      </Stack>
    </Card>
  );
}

// Loading skeleton for SearchResultsServer
function SearchResultsSkeleton({ testId }: { testId?: string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" data-testid={testId}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 dark:bg-gray-700 h-[200px] rounded-t-md" />
          <div className="p-4 bg-white dark:bg-gray-800 rounded-b-md border border-gray-200 dark:border-gray-700">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5 mb-3" />
            <div className="flex justify-between items-center mb-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-9 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Error state for SearchResultsServer
function SearchResultsError({ error, testId }: { error: string; testId?: string }) {
  return (
    <Paper p="xl" radius="sm" ta="center" data-testid={testId}>
      <Stack gap="md" align="center">
        <ThemeIcon size={64} variant="light" color="red">
          <IconAlertTriangle size={32} />
        </ThemeIcon>
        <div>
          <Text size="lg" fw={500} mb="xs">
            Search Error
          </Text>
          <Text size="md" c="dimmed">
            {error || 'Unable to load search results'}
          </Text>
        </div>
      </Stack>
    </Paper>
  );
}

// Main server component for search results
export async function SearchResultsServer({
  initialData,
  locale: _locale,
  loading = false,
  error,
  'data-testid': testId = 'search-results-server',
}: SearchResultsServerProps) {
  // Opt out of static rendering for dynamic content
  noStore();

  // Show loading state
  if (loading) {
    return <SearchResultsSkeleton testId={testId} />;
  }

  // Show error state
  if (error) {
    return <SearchResultsError error={error} testId={testId} />;
  }

  try {
    // Use initial data if available, otherwise show empty state
    const hits = initialData?.hits || [];

    if (hits.length === 0) {
      return (
        <Paper p="xl" radius="sm" ta="center" data-testid={testId}>
          <Stack gap="md" ta="center">
            <ThemeIcon size={64} variant="light" c="gray">
              <IconBolt size={32} />
            </ThemeIcon>
            <div>
              <Text size="lg" fw={500} mb="xs">
                Ready to search
              </Text>
              <Text size="md" c="dimmed">
                Enter a query to see results
              </Text>
            </div>
          </Stack>
        </Paper>
      );
    }

    return (
      <div data-testid={testId}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {hits.map((hit: SearchResult) => {
            try {
              return (
                <div key={hit.objectID}>
                  <ServerProductCard hit={hit} />
                </div>
              );
            } catch (err) {
              console.error('Error rendering search result:', err);
              return (
                <div key={hit.objectID} className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
                  <Text size="sm" c="red">
                    Failed to render product
                  </Text>
                </div>
              );
            }
          })}
        </div>

        {/* Pagination will be added as a client component */}
        <div id="pagination-container" style={{ marginTop: '2rem' }} />
      </div>
    );
  } catch (err) {
    console.error('SearchResultsServer error:', err);
    return <SearchResultsError error="Failed to render search results" testId={testId} />;
  }
}
