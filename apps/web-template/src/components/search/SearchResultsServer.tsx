import React from 'react';
import {
  IconShoppingCart,
  IconStar,
  IconHeart,
  IconEye,
  IconShare,
  IconTruck,
  IconBolt,
  IconTrendingUp,
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

// Main server component for search results
export async function SearchResultsServer({
  initialData,
  locale: _locale,
}: SearchResultsServerProps) {
  // Opt out of static rendering for dynamic content
  noStore();

  // Use initial data if available, otherwise show empty state
  const hits = initialData?.hits || [];

  if (hits.length === 0) {
    return (
      <Paper p="xl" radius="sm" ta="center">
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
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {hits.map((hit: SearchResult) => (
          <div key={hit.objectID}>
            <ServerProductCard hit={hit} />
          </div>
        ))}
      </div>

      {/* Pagination will be added as a client component */}
      <div id="pagination-container" style={{ marginTop: '2rem' }} />
    </div>
  );
}
