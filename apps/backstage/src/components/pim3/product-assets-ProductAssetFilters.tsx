'use client';

import {
  Button,
  Card,
  Chip,
  Group,
  MultiSelect,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconFilter, IconFilterOff, IconSearch } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { getProducts } from '@/actions/pim3/actions';

import type { MediaType } from '@repo/database/prisma';

interface ProductAssetFiltersProps {
  onProductFilter: (products: string[]) => void;
  onSearchChange: (search: string) => void;
  onTypeFilter: (type: MediaType | null) => void;
  searchQuery: string;
  selectedProducts: string[];
  selectedType: MediaType | null;
}

interface ProductOption {
  label: string;
  value: string;
}

const ASSET_TYPE_OPTIONS = [
  { label: 'Images', value: 'IMAGE' },
  { label: 'Videos', value: 'VIDEO' },
  { label: 'Documents', value: 'DOCUMENT' },
  { label: 'Manuals', value: 'MANUAL' },
  { label: 'Specifications', value: 'SPECIFICATION' },
  { label: 'Certificates', value: 'CERTIFICATE' },
  { label: 'Other', value: 'OTHER' },
];

const FILE_SIZE_OPTIONS = [
  { label: 'Small (< 1MB)', value: 'small' },
  { label: 'Medium (1-10MB)', value: 'medium' },
  { label: 'Large (> 10MB)', value: 'large' },
];

const DATE_RANGE_OPTIONS = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'This Quarter', value: 'quarter' },
  { label: 'This Year', value: 'year' },
];

export function ProductAssetFilters({
  onProductFilter,
  onSearchChange,
  onTypeFilter,
  searchQuery,
  selectedProducts,
  selectedType,
}: ProductAssetFiltersProps) {
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<string | null>(null);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [hasFilters, setHasFilters] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const hasActiveFilters =
      searchQuery ||
      selectedType ||
      selectedProducts.length > 0 ||
      selectedSizes.length > 0 ||
      selectedDateRange ||
      selectedFormats.length > 0;

    setHasFilters(!!hasActiveFilters);
  }, [
    searchQuery,
    selectedType,
    selectedProducts,
    selectedSizes,
    selectedDateRange,
    selectedFormats,
  ]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const result = await getProducts({ limit: 100 });
      if (result.success && result.data) {
        const productOptions = result.data.map((product) => ({
          label: `${product.name} (${product.sku})`,
          value: product.id,
        }));
        setProducts(productOptions);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAllFilters = () => {
    onSearchChange('');
    onTypeFilter(null);
    onProductFilter([]);
    setSelectedSizes([]);
    setSelectedDateRange(null);
    setSelectedFormats([]);
  };

  return (
    <Card withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={5}>Filters</Title>
          {hasFilters && (
            <Button
              leftSection={<IconFilterOff size={14} />}
              onClick={clearAllFilters}
              size="xs"
              variant="subtle"
            >
              Clear All
            </Button>
          )}
        </Group>

        {/* Search */}
        <TextInput
          leftSection={<IconSearch size={16} />}
          onChange={(e) => onSearchChange(e.currentTarget.value)}
          placeholder="Search assets..."
          value={searchQuery}
        />

        {/* Asset Type */}
        <div>
          <Text fw={500} mb="xs" size="sm">
            Asset Type
          </Text>
          <Select
            onChange={(value) => onTypeFilter(value as MediaType | null)}
            placeholder="All types"
            clearable
            data={ASSET_TYPE_OPTIONS}
            value={selectedType}
          />
        </div>

        {/* Products */}
        <div>
          <Text fw={500} mb="xs" size="sm">
            Products
          </Text>
          <MultiSelect
            onChange={onProductFilter}
            placeholder="Select products..."
            data={products}
            disabled={loading}
            limit={20}
            searchable
            value={selectedProducts}
          />
        </div>

        {/* File Size */}
        <div>
          <Text fw={500} mb="xs" size="sm">
            File Size
          </Text>
          <Chip.Group onChange={setSelectedSizes} multiple value={selectedSizes}>
            <Stack gap="xs">
              {FILE_SIZE_OPTIONS.map((option) => (
                <Chip key={option.value} size="sm" value={option.value}>
                  {option.label}
                </Chip>
              ))}
            </Stack>
          </Chip.Group>
        </div>

        {/* Date Range */}
        <div>
          <Text fw={500} mb="xs" size="sm">
            Upload Date
          </Text>
          <Select
            onChange={setSelectedDateRange}
            placeholder="All dates"
            clearable
            data={DATE_RANGE_OPTIONS}
            value={selectedDateRange}
          />
        </div>

        {/* File Formats */}
        <div>
          <Text fw={500} mb="xs" size="sm">
            Format
          </Text>
          <Chip.Group onChange={setSelectedFormats} multiple value={selectedFormats}>
            <Group gap="xs">
              <Chip size="sm" value="jpg">
                JPG
              </Chip>
              <Chip size="sm" value="png">
                PNG
              </Chip>
              <Chip size="sm" value="webp">
                WebP
              </Chip>
              <Chip size="sm" value="mp4">
                MP4
              </Chip>
              <Chip size="sm" value="pdf">
                PDF
              </Chip>
              <Chip size="sm" value="doc">
                DOC
              </Chip>
            </Group>
          </Chip.Group>
        </div>

        {/* Quick Filters */}
        <div>
          <Text fw={500} mb="xs" size="sm">
            Quick Filters
          </Text>
          <Stack gap="xs">
            <Button
              leftSection={<IconFilter size={14} />}
              onClick={() => {
                // Filter for assets missing alt text
                onSearchChange('missing:alt');
              }}
              size="xs"
              variant="light"
            >
              Missing Alt Text
            </Button>
            <Button
              leftSection={<IconFilter size={14} />}
              onClick={() => {
                // Filter for unoptimized assets
                onSearchChange('unoptimized:true');
              }}
              size="xs"
              variant="light"
            >
              Needs Optimization
            </Button>
            <Button
              leftSection={<IconFilter size={14} />}
              onClick={() => {
                // Filter for recently uploaded
                setSelectedDateRange('week');
              }}
              size="xs"
              variant="light"
            >
              Recently Added
            </Button>
          </Stack>
        </div>
      </Stack>
    </Card>
  );
}
