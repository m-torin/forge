'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  Group,
  Badge,
  Button,
  Grid,
  TextInput,
  Stack,
  Text,
  NumberFormatter,
  Skeleton,
} from '@mantine/core';
import { IconSearch, IconShoppingCart, IconStar } from '@tabler/icons-react';
import {
  InstantSearch,
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
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Algolia configuration
const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APPLICATION_ID || 'NKGBH640ZN',
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY || '44ac5c5a67f3d86fe8b23c2a8c2b8c90',
);

const indexName = 'autocomplete_demo_products';

interface InstantSearchClientWrapperProps {
  locale: string;
  initialData: {
    query: string;
    category: string;
  };
}

// Custom search box component
function CustomSearchBox() {
  const { query, refine } = useSearchBox();

  return (
    <TextInput
      size="lg"
      placeholder="Search products..."
      value={query}
      onChange={(event) => refine(event.currentTarget.value)}
      leftSection={<IconSearch size={20} />}
    />
  );
}

// Custom hits component
function CustomHits() {
  const { status, error } = useInstantSearch();

  if (status === 'error') {
    return <Text c="red">Search error: {error?.message}</Text>;
  }

  if (status === 'loading') {
    return (
      <Grid>
        {Array.from({ length: 8 }).map((_, i) => (
          <Grid.Col key={i} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
            <Skeleton height={300} />
          </Grid.Col>
        ))}
      </Grid>
    );
  }

  return (
    <Hits
      hitComponent={({ hit }: any) => (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Card.Section>
            <Image
              src={hit.image_urls?.[0] || '/placeholder.png'}
              alt={hit.name}
              height={200}
              width={300}
              style={{ objectFit: 'cover' }}
            />
          </Card.Section>

          <Group justify="space-between" mt="md" mb="xs">
            <Text fw={500} size="sm" lineClamp={2}>
              {hit.name}
            </Text>
            <Badge color="blue" variant="light">
              {hit.brand}
            </Badge>
          </Group>

          <Text size="sm" c="dimmed" lineClamp={2} mb="md">
            {hit.hierarchical_categories?.lvl0}
          </Text>

          <Group justify="space-between">
            <div>
              <NumberFormatter
                value={hit.price?.value || 0}
                prefix={hit.price?.currency === 'USD' ? '$' : '€'}
                decimalScale={2}
              />
              {hit.price?.on_sales && (
                <Badge size="xs" color="red" ml="xs">
                  Sale
                </Badge>
              )}
            </div>
            <Group gap="xs">
              <Group gap={4}>
                <IconStar size={16} />
                <Text size="xs">4.5</Text>
              </Group>
              <Button size="xs" leftSection={<IconShoppingCart size={14} />}>
                Add
              </Button>
            </Group>
          </Group>
        </Card>
      )}
    />
  );
}

// Main client wrapper component
export function InstantSearchClientWrapper({
  locale,
  initialData,
}: InstantSearchClientWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <ErrorBoundary
      fallback={
        <Text ta="center" py="xl">
          Search functionality is temporarily unavailable. Please try again later.
        </Text>
      }
    >
      <InstantSearch
        searchClient={searchClient}
        indexName={indexName}
        initialUiState={{
          [indexName]: {
            query: initialData.query,
          },
        }}
        future={{
          preserveSharedStateOnUnmount: true,
        }}
      >
        <Configure
          hitsPerPage={20}
          clickAnalytics={true}
          enablePersonalization={true}
          analytics={true}
        />

        <Grid>
          {/* Search and filters sidebar */}
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Stack gap="lg">
              <ErrorBoundary fallback={<Skeleton height={50} />}>
                <CustomSearchBox />
              </ErrorBoundary>

              <ErrorBoundary fallback={<div>Filters unavailable</div>}>
                <Card withBorder padding="md">
                  <Text fw={500} mb="md">
                    Brand
                  </Text>
                  <RefinementList attribute="brand" limit={10} showMore />
                </Card>
              </ErrorBoundary>

              <ErrorBoundary fallback={<div>Price filter unavailable</div>}>
                <Card withBorder padding="md">
                  <Text fw={500} mb="md">
                    Price Range
                  </Text>
                  <RangeInput attribute="price.value" />
                </Card>
              </ErrorBoundary>

              <ErrorBoundary fallback={<div>Category filter unavailable</div>}>
                <Card withBorder padding="md">
                  <Text fw={500} mb="md">
                    Category
                  </Text>
                  <RefinementList attribute="hierarchical_categories.lvl0" limit={10} showMore />
                </Card>
              </ErrorBoundary>
            </Stack>
          </Grid.Col>

          {/* Search results */}
          <Grid.Col span={{ base: 12, md: 9 }}>
            <Stack gap="lg">
              <Group justify="space-between">
                <ErrorBoundary fallback={<div>Search stats unavailable</div>}>
                  <Stats />
                </ErrorBoundary>

                <ErrorBoundary fallback={<div>Sort unavailable</div>}>
                  <SortBy
                    items={[
                      { label: 'Most Relevant', value: indexName },
                      { label: 'Price: Low to High', value: `${indexName}_price_asc` },
                      { label: 'Price: High to Low', value: `${indexName}_price_desc` },
                    ]}
                  />
                </ErrorBoundary>
              </Group>

              <ErrorBoundary fallback={<Text>Search results unavailable</Text>}>
                <CustomHits />
              </ErrorBoundary>

              <ErrorBoundary fallback={<div>Pagination unavailable</div>}>
                <Pagination />
              </ErrorBoundary>
            </Stack>
          </Grid.Col>
        </Grid>
      </InstantSearch>
    </ErrorBoundary>
  );
}
