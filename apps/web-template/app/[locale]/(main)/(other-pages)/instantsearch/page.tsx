'use client';

import React from 'react';
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
} from '@mantine/core';
import { IconSearch, IconShoppingCart, IconStar, IconHome } from '@tabler/icons-react';
import {
  InstantSearch,
  SearchBox,
  Hits,
  RefinementList,
  Configure,
  Pagination,
  Stats,
  SortBy,
  RangeInput,
  useInstantSearch,
  useSearchBox,
} from 'react-instantsearch';
import { liteClient as algoliasearch } from 'algoliasearch/lite';
// Remove the router import for now to fix the build
import { env } from '@/env';

// Use Algolia's official demo e-commerce dataset for showcasing
const searchClient = algoliasearch(
  env.NEXT_PUBLIC_ALGOLIA_APP_ID || 'latency',
  env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY || '6be0576ff61c053d5f9a3225e2a90f76',
);

// Enhanced hit component for e-commerce products
function Hit({ hit }: { hit: any }) {
  const price = hit.price || hit.price_range?.min || 0;
  const currency = hit.currency || '$';
  const rating = hit.rating || hit.reviews?.rating || 4.5;
  const reviewCount = hit.reviews?.count || hit.nb_reviews || 12;
  const brand = hit.brand || hit.vendor || 'Brand';
  const category = hit.categories?.[0] || hit.category || 'Product';

  return (
    <Card shadow="sm" padding="lg" radius="sm" withBorder={true}>
      <Card.Section>
        {(hit.image || hit.image_url) && (
          <img
            src={hit.image || hit.image_url}
            alt={hit.name || hit.title}
            style={{ width: '100%', height: 200, objectFit: 'cover' }}
          />
        )}
      </Card.Section>

      <Group justify="space-between" mt="md" mb="xs">
        <Text fw={500} lineClamp={1}>
          {hit.name || hit.title}
        </Text>
        <Badge color="pink" variant="light">
          {currency}
          {price}
        </Badge>
      </Group>

      <Text size="xs" c="dimmed" mb="xs">
        {brand} • {category}
      </Text>

      <Text size="md" c="dimmed" lineClamp={2}>
        {hit.description ||
          hit.short_description ||
          'High-quality product with excellent features.'}
      </Text>

      <Group mt="md" gap="xs" justify="space-between">
        <Group gap={5}>
          <IconStar size={16} fill="currentColor" style={{ color: '#ffd43b' }} />
          <Text size="md" fw={500}>
            {rating}
          </Text>
          <Text size="md" c="dimmed">
            ({reviewCount} reviews)
          </Text>
        </Group>
        {hit.free_shipping && (
          <Badge size="xs" c="green" variant="light">
            Free shipping
          </Badge>
        )}
      </Group>

      <Button
        fullWidth
        mt="md"
        radius="sm"
        leftSection={<IconShoppingCart size={16} />}
        variant="light"
      >
        Add to cart
      </Button>
    </Card>
  );
}

// Custom search box with URL sync
function SearchBoxWithURL({ locale }: { locale: string }) {
  const { query, refine } = useSearchBox();
  const router = useRouter();

  const handleQueryChange = (value: string) => {
    refine(value);
    // Update URL with search query for SEO and sharing
    const url = new URL(window.location.href);
    if (value) {
      url.searchParams.set('q', value);
    } else {
      url.searchParams.delete('q');
    }
    router.replace(url.pathname + url.search, { scroll: false });
  };

  return (
    <TextInput
      placeholder="Search products..."
      value={query}
      onChange={(event: any) => handleQueryChange(event.currentTarget.value)}
      leftSection={<IconSearch size={16} />}
      radius="sm"
      size="lg"
    />
  );
}

// Results header with breadcrumbs and stats
function SearchHeader({ locale }: { locale: string }) {
  const { results } = useInstantSearch();
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') || '';

  const breadcrumbItems = [
    { title: 'Home', href: `/${locale}`, icon: IconHome },
    { title: 'Search', href: `/${locale}/instantsearch` },
  ];

  if (query) {
    breadcrumbItems.push({ title: `"${query}"`, href: '#' });
  }

  return (
    <Stack gap="md">
      <Breadcrumbs>
        {breadcrumbItems.map((item, index) => (
          <Anchor key={index} href={item.href} c="dimmed" size="md">
            <Group gap="xs">
              {item.icon && <item.icon size={14} />}
              {item.title}
            </Group>
          </Anchor>
        ))}
      </Breadcrumbs>

      <div>
        <Title order={1} mb="md">
          {query ? `Search Results` : 'Product Search'}
        </Title>
        {results && (
          <Text c="dimmed" size="lg">
            {query
              ? `Found ${results.nbHits.toLocaleString()} products for "${query}" in ${results.processingTimeMS}ms`
              : 'Search through our entire product catalog using advanced filters and faceted search'}
          </Text>
        )}
      </div>
    </Stack>
  );
}

function InstantSearchPageClient({ locale }: { locale: string }) {
  const searchParams = useSearchParams();

  // Initialize with URL query parameter
  const initialQuery = searchParams?.get('q') || '';

  return (
    <Container size="xl" py="xl">
      <InstantSearch
        searchClient={searchClient as any}
        indexName={env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'instant_search'}
        // URL routing will be added in future enhancement
        future={{
          preserveSharedStateOnUnmount: true,
        }}
      >
        <Configure hitsPerPage={12} {...({} as any)} />

        <Stack gap="xl">
          <SearchHeader locale={locale} />

          <Grid>
            <Grid.Col span={{ base: 12, md: 3 }}>
              <Stack gap="lg">
                <Card shadow="sm" padding="lg" radius="sm" withBorder={true}>
                  <Text fw={500} mb="md">
                    Categories
                  </Text>
                  <RefinementList attribute="categories" limit={10} showMore={true} />
                </Card>

                <Card shadow="sm" padding="lg" radius="sm" withBorder={true}>
                  <Text fw={500} mb="md">
                    Brands
                  </Text>
                  <RefinementList attribute="brand" limit={10} showMore={true} />
                </Card>

                <Card shadow="sm" padding="lg" radius="sm" withBorder={true}>
                  <Text fw={500} mb="md">
                    Price Range
                  </Text>
                  <RangeInput attribute="price" precision={0} />
                </Card>

                <Card shadow="sm" padding="lg" radius="sm" withBorder={true}>
                  <Text fw={500} mb="md">
                    Rating
                  </Text>
                  <RefinementList attribute="rating" limit={5} />
                </Card>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 9 }}>
              <Stack gap="lg">
                <Card shadow="sm" padding="lg" radius="sm" withBorder={true}>
                  <SearchBoxWithURL locale={locale} />
                </Card>

                <Group justify="space-between" ta="center">
                  <Stats />
                  <SortBy
                    items={[
                      { label: 'Most Relevant', value: 'instant_search' },
                      {
                        label: 'Price: Low to High',
                        value: 'instant_search_price_asc',
                      },
                      {
                        label: 'Price: High to Low',
                        value: 'instant_search_price_desc',
                      },
                      { label: 'Highest Rated', value: 'instant_search_rating_desc' },
                      { label: 'Most Popular', value: 'instant_search_popularity_desc' },
                    ]}
                  />
                </Group>

                <Hits hitComponent={Hit} />

                <Card shadow="sm" padding="lg" radius="sm" withBorder={true}>
                  <Pagination />
                </Card>
              </Stack>
            </Grid.Col>
          </Grid>
        </Stack>
      </InstantSearch>
    </Container>
  );
}

export default async function InstantSearchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <InstantSearchPageClient locale={locale} />;
}
