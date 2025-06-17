'use client';

import { unstable_noStore as noStore } from 'next/cache';
import { useState, useEffect } from 'react';
import { IconAdjustments, IconTag, IconStar, IconAlertTriangle } from '@tabler/icons-react';
import { Card, Text, Stack, Group, Badge, Divider, Paper, Alert, Skeleton } from '@mantine/core';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Error state for search filters
function SearchFiltersError({ error, testId }: { error: string; testId?: string }) {
  return (
    <Alert
      icon={<IconAlertTriangle size={16} />}
      title="Filters Error"
      color="red"
      variant="light"
      data-testid={testId}
    >
      <Text size="sm">{error || 'Failed to load search filters'}</Text>
    </Alert>
  );
}

// Loading skeleton for filters
function SearchFiltersSkeleton({ testId }: { testId?: string }) {
  return (
    <Stack gap="lg" data-testid={`${testId}-skeleton`}>
      {[...Array(4)].map((_, i) => (
        <Card key={i} padding="md" radius="sm" withBorder={true}>
          <Skeleton height={20} width="60%" mb="md" />
          <Stack gap="xs">
            {[...Array(5)].map((_, j) => (
              <Group key={j} justify="space-between">
                <Skeleton height={16} width="70%" />
                <Skeleton height={16} width={30} />
              </Group>
            ))}
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}

// Server Component for search filters
// This provides the static shell that will be enhanced client-side
export async function SearchFiltersServer({
  loading = false,
  error,
  'data-testid': testId = 'search-filters-server',
}: {
  loading?: boolean;
  error?: string;
  'data-testid'?: string;
} = {}) {
  // Opt out of static rendering for dynamic facets
  noStore();

  const [internalError, setInternalError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      setMounted(true);
    } catch (err) {
      console.error('Search filters initialization error:', err);
      setInternalError('Failed to initialize search filters');
    }
  }, []);

  // Show loading state
  if (!mounted || loading) {
    return <SearchFiltersSkeleton testId={testId} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <SearchFiltersError error={currentError} testId={testId} />;
  }

  // Pre-render filter categories structure
  const filterCategories = [
    {
      title: 'Categories',
      attribute: 'categories',
      icon: <IconAdjustments size={16} />,
      options: [
        { label: 'Electronics', count: 1250 },
        { label: 'Fashion', count: 890 },
        { label: 'Home & Garden', count: 567 },
        { label: 'Sports & Outdoors', count: 423 },
        { label: 'Books', count: 234 },
      ],
    },
    {
      title: 'Brands',
      attribute: 'brand',
      icon: <IconTag size={16} />,
      options: [
        { label: 'Apple', count: 145 },
        { label: 'Samsung', count: 123 },
        { label: 'Nike', count: 98 },
        { label: 'Sony', count: 87 },
        { label: 'Adidas', count: 76 },
      ],
    },
    {
      title: 'Rating',
      attribute: 'rating',
      icon: <IconStar size={16} />,
      options: [
        { label: '5 stars', count: 234 },
        { label: '4+ stars', count: 567 },
        { label: '3+ stars', count: 890 },
        { label: '2+ stars', count: 1123 },
      ],
    },
  ];

  return (
    <ErrorBoundary
      fallback={<SearchFiltersError error="Search filters failed to render" testId={testId} />}
    >
      <Stack gap="lg" data-testid={testId}>
        {/* Active filters placeholder */}
        <Paper p="md" radius="sm" bg="blue.0" style={{ display: 'none' }} id="active-filters">
          <Group justify="space-between" mb="xs">
            <Text size="md" fw={500}>
              Active Filters
            </Text>
          </Group>
        </Paper>

        {/* Filter categories */}
        {filterCategories.map((category) => (
          <Card key={category.attribute} padding="md" radius="sm" withBorder={true}>
            <Text fw={500} mb="md" size="md">
              {category.icon}
              <span style={{ marginLeft: 8 }}>{category.title}</span>
            </Text>

            {/* Static filter options that will be enhanced client-side */}
            <Stack gap="xs">
              {category.options.map((option) => (
                <Group
                  key={option.label}
                  justify="space-between"
                  className="filter-option"
                  data-attribute={category.attribute}
                  data-value={option.label}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                  }}
                >
                  <Text size="md">{option.label}</Text>
                  <Badge size="xs" variant="light" c="gray">
                    {option.count}
                  </Badge>
                </Group>
              ))}
            </Stack>

            {/* Placeholder for "Show more" functionality */}
            <div
              id={`${category.attribute}-show-more`}
              style={{ marginTop: '12px', display: 'none' }}
            />
          </Card>
        ))}

        {/* Price range filter */}
        <Card padding="md" radius="sm" withBorder={true}>
          <Text fw={500} mb="md" size="md">
            Price Range
          </Text>

          {/* Static price ranges that will be enhanced client-side */}
          <Stack gap="xs">
            {[
              { label: 'Under $25', value: 'price_0_25' },
              { label: '$25 - $50', value: 'price_25_50' },
              { label: '$50 - $100', value: 'price_50_100' },
              { label: '$100 - $200', value: 'price_100_200' },
              { label: 'Over $200', value: 'price_200_plus' },
            ].map((range) => (
              <Group
                key={range.value}
                justify="space-between"
                className="price-filter-option"
                data-value={range.value}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                }}
              >
                <Text size="md">{range.label}</Text>
              </Group>
            ))}
          </Stack>

          {/* Placeholder for custom price range input */}
          <div id="custom-price-range" style={{ marginTop: '16px' }} />
        </Card>

        {/* Special features */}
        <Card padding="md" radius="sm" withBorder={true}>
          <Text fw={500} mb="md" size="md">
            Special Features
          </Text>

          <Stack gap="md">
            {[
              { label: 'Free Shipping', attribute: 'free_shipping' },
              { label: 'On Sale', attribute: 'on_sale' },
              { label: 'New Arrivals', attribute: 'new_arrival' },
              { label: 'Eco-Friendly', attribute: 'eco_friendly' },
            ].map((feature) => (
              <Group
                key={feature.attribute}
                className="toggle-filter"
                data-attribute={feature.attribute}
                style={{ cursor: 'pointer' }}
              >
                <div
                  className="toggle-placeholder"
                  style={{
                    width: '16px',
                    height: '16px',
                    border: '1px solid #ccc',
                    borderRadius: '3px',
                  }}
                />
                <Text size="md">{feature.label}</Text>
              </Group>
            ))}
          </Stack>
        </Card>

        <Divider />

        {/* Clear filters button placeholder */}
        <div id="clear-filters-container" />
      </Stack>
    </ErrorBoundary>
  );
}
