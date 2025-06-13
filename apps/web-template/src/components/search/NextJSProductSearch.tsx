'use client';

import React, { useState } from 'react';
import { Container, Stack, Title, Text, Group, Card, Avatar, Badge, Button, Skeleton } from '@mantine/core';
import { IconShoppingCart, IconHeart, IconStar } from '@tabler/icons-react';
import { InstantSearch, SearchBox, Hits, Pagination, RefinementList, Configure } from 'react-instantsearch';
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { env } from '@/env';

// Initialize Algolia client for products only
const searchClient = algoliasearch(
  env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY,
);

interface ProductHit {
  objectID: string;
  name: string;
  brand: string;
  price: {
    currency: string;
    value: number;
    on_sales: boolean;
  };
  image_urls: string[];
  hierarchical_categories: {
    lvl0: string;
    lvl1: string;
  };
  reviews?: {
    rating: number;
    count: number;
  };
  _highlightResult?: {
    name?: { value: string };
    brand?: { value: string };
  };
}

interface NextJSProductSearchProps {
  locale: string;
}

// Product Hit Component
function ProductHit({ hit }: { hit: ProductHit }) {
  const price = hit.price?.value || 0;
  const currency = hit.price?.currency === 'EUR' ? '€' : '$';
  const isOnSale = hit.price?.on_sales;
  const rating = hit.reviews?.rating || 0;
  const reviewCount = hit.reviews?.count || 0;

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: '100%' }}>
      <Card.Section>
        {hit.image_urls?.[0] && (
          <img
            src={hit.image_urls[0]}
            alt={hit.name}
            style={{ width: '100%', height: 200, objectFit: 'cover' }}
          />
        )}
      </Card.Section>

      <Stack gap="sm" mt="md">
        <div>
          <Text
            fw={600}
            size="sm"
            lineClamp={2}
            dangerouslySetInnerHTML={{
              __html: hit._highlightResult?.name?.value || hit.name,
            }}
          />
          <Text
            size="xs"
            c="dimmed"
            dangerouslySetInnerHTML={{
              __html: hit._highlightResult?.brand?.value || hit.brand,
            }}
          />
        </div>

        <Group justify="space-between" align="center">
          <div>
            <Text fw={700} size="lg" c={isOnSale ? 'red' : 'blue'}>
              {currency}{price}
            </Text>
            {isOnSale && (
              <Badge size="xs" color="red" variant="light">
                Sale
              </Badge>
            )}
          </div>
          
          {rating > 0 && (
            <Group gap={4}>
              <IconStar size={14} style={{ color: '#ffa500' }} />
              <Text size="xs" c="dimmed">
                {rating.toFixed(1)} ({reviewCount})
              </Text>
            </Group>
          )}
        </Group>

        <Group gap="xs" mt="auto">
          <Button variant="light" size="xs" flex={1} leftSection={<IconShoppingCart size={14} />}>
            Add to Cart
          </Button>
          <Button variant="subtle" size="xs" p="xs">
            <IconHeart size={14} />
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}

// Custom SearchBox component
function CustomSearchBox() {
  return (
    <SearchBox
      placeholder="Search products..."
      classNames={{
        root: 'w-full',
        form: 'w-full',
        input: 'w-full p-3 border border-gray-300 rounded-lg text-base',
        submit: 'hidden',
        reset: 'hidden',
      }}
    />
  );
}

// Refinement filters
function CategoryFilter() {
  return (
    <Card shadow="sm" padding="md" radius="sm" withBorder>
      <Text fw={600} size="sm" mb="sm">
        Categories
      </Text>
      <RefinementList 
        attribute="hierarchical_categories.lvl0"
        limit={10}
        showMore={true}
        classNames={{
          list: 'space-y-1',
          item: 'text-sm',
          label: 'cursor-pointer hover:text-blue-600',
          checkbox: 'mr-2',
          count: 'text-gray-500 text-xs ml-auto',
        }}
      />
    </Card>
  );
}

function BrandFilter() {
  return (
    <Card shadow="sm" padding="md" radius="sm" withBorder>
      <Text fw={600} size="sm" mb="sm">
        Brands
      </Text>
      <RefinementList 
        attribute="brand"
        limit={8}
        showMore={true}
        classNames={{
          list: 'space-y-1',
          item: 'text-sm',
          label: 'cursor-pointer hover:text-blue-600',
          checkbox: 'mr-2',
          count: 'text-gray-500 text-xs ml-auto',
        }}
      />
    </Card>
  );
}

// Loading skeleton
function ProductSkeleton() {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: '100%' }}>
      <Card.Section>
        <Skeleton height={200} />
      </Card.Section>
      <Stack gap="sm" mt="md">
        <Skeleton height={16} width="80%" />
        <Skeleton height={12} width="60%" />
        <Group justify="space-between">
          <Skeleton height={20} width="25%" />
          <Skeleton height={12} width="30%" />
        </Group>
        <Group gap="xs">
          <Skeleton height={28} flex={1} />
          <Skeleton height={28} width={40} />
        </Group>
      </Stack>
    </Card>
  );
}

export default function NextJSProductSearch({ locale }: NextJSProductSearchProps) {
  return (
    <Container size="xl" py="xl">
      <InstantSearch 
        searchClient={searchClient} 
        indexName="autocomplete_demo_products"
      >
        <Configure hitsPerPage={12} />
        
        <Stack gap="xl">
          {/* Page Header */}
          <div>
            <Title order={1} mb="md">
              Product Search
            </Title>
            <Text c="dimmed" size="lg">
              Search through our collection of fashion products
            </Text>
          </div>

          {/* Search Box */}
          <CustomSearchBox />

          {/* Main Content */}
          <Group align="flex-start" gap="xl" wrap="nowrap">
            {/* Sidebar Filters */}
            <div style={{ minWidth: '250px', maxWidth: '300px' }}>
              <Stack gap="md">
                <CategoryFilter />
                <BrandFilter />
              </Stack>
            </div>

            {/* Results */}
            <div style={{ flex: 1 }}>
              <Stack gap="lg">
                {/* Results Grid */}
                <Hits
                  hitComponent={ProductHit}
                  classNames={{
                    root: 'w-full',
                    list: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
                    item: 'w-full',
                  }}
                />

                {/* Pagination */}
                <Group justify="center" mt="xl">
                  <Pagination
                    classNames={{
                      root: 'flex justify-center',
                      control: 'mx-1 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50',
                    }}
                  />
                </Group>
              </Stack>
            </div>
          </Group>
        </Stack>
      </InstantSearch>
    </Container>
  );
}