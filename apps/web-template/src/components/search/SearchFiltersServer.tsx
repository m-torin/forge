'use client';

import { unstable_noStore as noStore } from 'next/cache';
import {
  IconAdjustments,
  IconTag,
  IconCurrencyDollar,
  IconStar,
  IconShoppingBag,
  IconClock,
  IconFilter,
} from '@tabler/icons-react';
import { Card, Text, Stack, Group, Badge, Divider, Paper, Button } from '@mantine/core';

// Server Component for search filters
// This provides the static shell that will be enhanced client-side
export async function SearchFiltersServer() {
  // Opt out of static rendering for dynamic facets
  noStore();

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
    <Stack gap="lg">
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
  );
}
