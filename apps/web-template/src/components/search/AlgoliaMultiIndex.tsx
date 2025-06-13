'use client';

import React, { useState } from 'react';
import {
  Container,
  Title,
  Text,
  Stack,
  Card,
  Grid,
  Badge,
  Group,
  Button,
  TextInput,
  Paper,
  Code,
  Alert,
  ThemeIcon,
  Progress,
  Tabs,
  Table,
  Switch,
  Select,
  NumberInput,
  ActionIcon,
  Collapse,
  Avatar,
  RingProgress,
} from '@mantine/core';
import {
  IconDatabase,
  IconSearch,
  IconBrandAlgolia,
  IconFilter,
  IconUsers,
  IconShoppingCart,
  IconBook,
  IconPhoto,
  IconMessage,
  IconFileText,
  IconMapPin,
  IconCalendar,
  IconChevronDown,
  IconChevronUp,
  IconSettings,
  IconTrendingUp,
  IconEye,
  IconClick,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';

// Types for Multi-Index Search
interface SearchIndex {
  name: string;
  displayName: string;
  icon: any;
  color: string;
  enabled: boolean;
  weight: number;
  resultLimit: number;
  searchableAttributes: string[];
  description: string;
  totalRecords: number;
  averageLatency: number;
}

interface MultiIndexResult {
  indexName: string;
  query: string;
  hits: any[];
  nbHits: number;
  processingTimeMS: number;
  page: number;
  hitsPerPage: number;
}

interface SearchResult {
  objectID: string;
  title: string;
  description: string;
  category: string;
  type: string;
  image?: string;
  price?: number;
  author?: string;
  date?: string;
  location?: string;
  relevanceScore: number;
  indexSource: string;
}

// Mock search indices configuration
const searchIndices: SearchIndex[] = [
  {
    name: 'products',
    displayName: 'Products',
    icon: IconShoppingCart,
    color: 'blue',
    enabled: true,
    weight: 1.0,
    resultLimit: 8,
    searchableAttributes: ['name', 'description', 'brand', 'category'],
    description: 'E-commerce products catalog',
    totalRecords: 50000,
    averageLatency: 12,
  },
  {
    name: 'articles',
    displayName: 'Articles',
    icon: IconFileText,
    color: 'green',
    enabled: true,
    weight: 0.8,
    resultLimit: 6,
    searchableAttributes: ['title', 'content', 'author', 'tags'],
    description: 'Blog posts and articles',
    totalRecords: 12000,
    averageLatency: 15,
  },
  {
    name: 'users',
    displayName: 'Users',
    icon: IconUsers,
    color: 'purple',
    enabled: false,
    weight: 0.6,
    resultLimit: 4,
    searchableAttributes: ['name', 'bio', 'skills', 'location'],
    description: 'User profiles and experts',
    totalRecords: 25000,
    averageLatency: 8,
  },
  {
    name: 'docs',
    displayName: 'Documentation',
    icon: IconBook,
    color: 'orange',
    enabled: true,
    weight: 0.9,
    resultLimit: 5,
    searchableAttributes: ['title', 'content', 'section', 'tags'],
    description: 'Help docs and guides',
    totalRecords: 8000,
    averageLatency: 10,
  },
  {
    name: 'media',
    displayName: 'Media',
    icon: IconPhoto,
    color: 'pink',
    enabled: false,
    weight: 0.5,
    resultLimit: 6,
    searchableAttributes: ['title', 'description', 'tags', 'alt_text'],
    description: 'Images and videos',
    totalRecords: 100000,
    averageLatency: 20,
  },
  {
    name: 'locations',
    displayName: 'Locations',
    icon: IconMapPin,
    color: 'red',
    enabled: true,
    weight: 0.7,
    resultLimit: 4,
    searchableAttributes: ['name', 'address', 'description', 'amenities'],
    description: 'Physical locations and stores',
    totalRecords: 5000,
    averageLatency: 18,
  },
];

// Mock multi-index results
const mockMultiResults: Record<string, SearchResult[]> = {
  products: [
    {
      objectID: 'prod-1',
      title: 'Wireless Noise-Canceling Headphones',
      description: 'Premium audio experience with active noise cancellation',
      category: 'Electronics',
      type: 'product',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop',
      price: 299.99,
      relevanceScore: 0.95,
      indexSource: 'products',
    },
    {
      objectID: 'prod-2',
      title: 'Ergonomic Office Chair',
      description: 'Comfortable seating for long work sessions',
      category: 'Furniture',
      type: 'product',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100&h=100&fit=crop',
      price: 399.99,
      relevanceScore: 0.88,
      indexSource: 'products',
    },
  ],
  articles: [
    {
      objectID: 'art-1',
      title: 'Best Practices for Remote Work',
      description: 'How to maintain productivity while working from home',
      category: 'Productivity',
      type: 'article',
      author: 'Jane Smith',
      date: '2024-01-15',
      relevanceScore: 0.92,
      indexSource: 'articles',
    },
    {
      objectID: 'art-2',
      title: 'Ergonomics Guide for Home Office',
      description: 'Setting up your workspace for health and comfort',
      category: 'Health',
      type: 'article',
      author: 'Dr. Johnson',
      date: '2024-01-10',
      relevanceScore: 0.87,
      indexSource: 'articles',
    },
  ],
  docs: [
    {
      objectID: 'doc-1',
      title: 'Search API Documentation',
      description: 'Complete guide to implementing search functionality',
      category: 'API Reference',
      type: 'documentation',
      relevanceScore: 0.9,
      indexSource: 'docs',
    },
    {
      objectID: 'doc-2',
      title: 'Getting Started Guide',
      description: 'Quick setup instructions for new users',
      category: 'Tutorial',
      type: 'documentation',
      relevanceScore: 0.85,
      indexSource: 'docs',
    },
  ],
  locations: [
    {
      objectID: 'loc-1',
      title: 'Downtown Showroom',
      description: 'Visit our flagship store for hands-on experience',
      category: 'Retail',
      type: 'location',
      location: 'New York, NY',
      relevanceScore: 0.83,
      indexSource: 'locations',
    },
  ],
};

// Index configuration component
function IndexConfiguration({
  indices,
  onUpdate,
}: {
  indices: SearchIndex[];
  onUpdate: (indices: SearchIndex[]) => void;
}) {
  const [configExpanded, { toggle }] = useDisclosure(false);

  const updateIndex = (name: string, updates: Partial<SearchIndex>) => {
    const updated = indices.map((index) =>
      index.name === name ? { ...index, ...updates } : index,
    );
    onUpdate(updated);
  };

  return (
    <Card shadow="sm" padding="lg" radius="sm" withBorder={true}>
      <Group justify="space-between" mb="md">
        <Title order={4}>Index Configuration</Title>
        <ActionIcon onClick={toggle}>
          {configExpanded ? <IconChevronUp /> : <IconChevronDown />}
        </ActionIcon>
      </Group>

      <Collapse in={configExpanded}>
        <Stack gap="md">
          {indices.map((index) => {
            const Icon = index.icon;
            return (
              <Paper key={index.name} p="md" withBorder={true}>
                <Grid ta="center">
                  <Grid.Col span={3}>
                    <Group gap="xs">
                      <ThemeIcon size="md" color={index.color} variant="light">
                        <Icon size={16} />
                      </ThemeIcon>
                      <div>
                        <Text fw={600} size="md">
                          {index.displayName}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {index.totalRecords.toLocaleString()} records
                        </Text>
                      </div>
                    </Group>
                  </Grid.Col>
                  <Grid.Col span={2}>
                    <Switch
                      checked={index.enabled}
                      onChange={(e) =>
                        updateIndex(index.name, { enabled: e.currentTarget.checked })
                      }
                      label="Enabled"
                      size="md"
                    />
                  </Grid.Col>
                  <Grid.Col span={2}>
                    <NumberInput
                      label="Weight"
                      value={index.weight}
                      onChange={(value) => updateIndex(index.name, { weight: Number(value) })}
                      min={0}
                      max={2}
                      step={0.1}
                      size="xs"
                      disabled={!index.enabled}
                    />
                  </Grid.Col>
                  <Grid.Col span={2}>
                    <NumberInput
                      label="Results"
                      value={index.resultLimit}
                      onChange={(value) => updateIndex(index.name, { resultLimit: Number(value) })}
                      min={1}
                      max={20}
                      size="xs"
                      disabled={!index.enabled}
                    />
                  </Grid.Col>
                  <Grid.Col span={3}>
                    <Text size="xs" c="dimmed">
                      Avg: {index.averageLatency}ms
                    </Text>
                    <Text size="xs">{index.description}</Text>
                  </Grid.Col>
                </Grid>
              </Paper>
            );
          })}
        </Stack>
      </Collapse>
    </Card>
  );
}

// Multi-index search results display
function MultiIndexResults({
  results,
  indices,
}: {
  results: Record<string, SearchResult[]>;
  indices: SearchIndex[];
}) {
  const enabledIndices = indices.filter((i) => i.enabled);
  const totalResults = Object.values(results).flat().length;

  return (
    <Stack gap="lg">
      {/* Results summary */}
      <Group justify="space-between">
        <Title order={3}>Search Results</Title>
        <Badge size="lg" variant="light">
          {totalResults} results across {enabledIndices.length} indices
        </Badge>
      </Group>

      {/* Results by index */}
      {enabledIndices.map((index) => {
        const Icon = index.icon;
        const indexResults = results[index.name] || [];

        if (indexResults.length === 0) return null;

        return (
          <Card key={index.name} shadow="sm" padding="lg" radius="sm" withBorder={true}>
            <Stack gap="md">
              <Group justify="space-between">
                <Group gap="xs">
                  <ThemeIcon size="md" color={index.color} variant="light">
                    <Icon size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={600}>{index.displayName}</Text>
                    <Text size="xs" c="dimmed">
                      {indexResults.length} of {index.resultLimit} results
                    </Text>
                  </div>
                </Group>
                <Badge color={index.color} variant="light">
                  Weight: {index.weight}
                </Badge>
              </Group>

              <Grid>
                {indexResults.map((result: any) => (
                  <Grid.Col key={result.objectID} span={{ base: 12, md: 6, lg: 4 }}>
                    <Paper p="md" withBorder={true} h="100%">
                      <Stack gap="xs">
                        <Group justify="space-between" align="flex-start">
                          <div style={{ flex: 1 }}>
                            <Text fw={600} size="md" lineClamp={2}>
                              {result.title}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {result.category}
                            </Text>
                          </div>
                          {result.image && <Avatar src={result.image} size="md" radius="sm" />}
                        </Group>

                        <Text size="xs" c="dimmed" lineClamp={2}>
                          {result.description}
                        </Text>

                        <Group justify="space-between" ta="center">
                          <Group gap="xs">
                            {result.price && (
                              <Text fw={600} c="green">
                                ${result.price}
                              </Text>
                            )}
                            {result.author && (
                              <Text size="xs" c="dimmed">
                                by {result.author}
                              </Text>
                            )}
                            {result.location && (
                              <Group gap={2}>
                                <IconMapPin size={12} />
                                <Text size="xs" c="dimmed">
                                  {result.location}
                                </Text>
                              </Group>
                            )}
                          </Group>
                          <Badge size="xs" color={index.color}>
                            {Math.round(result.relevanceScore * 100)}%
                          </Badge>
                        </Group>
                      </Stack>
                    </Paper>
                  </Grid.Col>
                ))}
              </Grid>
            </Stack>
          </Card>
        );
      })}
    </Stack>
  );
}

export default function AlgoliaMultiIndex() {
  const [query, setQuery] = useState('office ergonomic productivity');
  const [indices, setIndices] = useState<SearchIndex[]>(searchIndices);
  const [results, setResults] = useState<Record<string, SearchResult[]>>({});
  const [isSearching, setIsSearching] = useState(false);
  const [searchStrategy, setSearchStrategy] = useState<'parallel' | 'sequential'>('parallel');

  const performMultiIndexSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Filter enabled indices and get mock results
    const enabledIndices = indices.filter((i) => i.enabled);
    const searchResults: Record<string, SearchResult[]> = {};

    enabledIndices.forEach((index) => {
      if (mockMultiResults[index.name]) {
        searchResults[index.name] = mockMultiResults[index.name]
          .slice(0, index.resultLimit)
          .map((result: any) => ({
            ...result,
            relevanceScore: result.relevanceScore * index.weight,
          }));
      }
    });

    setResults(searchResults);
    setIsSearching(false);
  };

  const enabledIndices = indices.filter((i) => i.enabled);
  const totalEstimatedRecords = enabledIndices.reduce((sum, i) => sum + i.totalRecords, 0);
  const avgLatency =
    enabledIndices.reduce((sum, i) => sum + i.averageLatency, 0) / enabledIndices.length || 0;

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <div>
          <Title order={1} mb="md">
            Multi-Index Search Demo
          </Title>
          <Text c="dimmed" size="lg">
            Search across multiple indices simultaneously with weighted relevance scoring
          </Text>
        </div>

        {/* Search Configuration */}
        <Card shadow="sm" padding="lg" radius="sm" withBorder={true}>
          <Stack gap="md">
            <Group>
              <TextInput
                flex={1}
                placeholder="Search across all indices..."
                value={query}
                onChange={(e) => setQuery(e.currentTarget.value)}
                onKeyDown={(e) => e.key === 'Enter' && performMultiIndexSearch()}
                leftSection={<IconSearch size={16} />}
                size="md"
              />
              <Select
                value={searchStrategy}
                onChange={(value) => setSearchStrategy(value as 'parallel' | 'sequential')}
                data={[
                  { value: 'parallel', label: 'Parallel' },
                  { value: 'sequential', label: 'Sequential' },
                ]}
                w={120}
              />
              <Button
                onClick={performMultiIndexSearch}
                loading={isSearching}
                leftSection={<IconBrandAlgolia size={16} />}
              >
                Search
              </Button>
            </Group>

            {/* Index Statistics */}
            <Group gap="xl">
              <div>
                <Text size="xs" c="dimmed">
                  Active Indices
                </Text>
                <Text fw={600}>{enabledIndices.length}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">
                  Total Records
                </Text>
                <Text fw={600}>{totalEstimatedRecords.toLocaleString()}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">
                  Avg Latency
                </Text>
                <Text fw={600}>{Math.round(avgLatency)}ms</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">
                  Strategy
                </Text>
                <Text fw={600}>{searchStrategy}</Text>
              </div>
            </Group>
          </Stack>
        </Card>

        {/* Index Configuration */}
        <IndexConfiguration indices={indices} onUpdate={setIndices} />

        {/* Search Progress */}
        {isSearching && (
          <Card shadow="sm" padding="lg" radius="sm" withBorder={true}>
            <Stack gap="md">
              <Text fw={600}>Searching across indices...</Text>
              <Progress value={40} animated />
              <Text size="xs" c="dimmed">
                Querying {enabledIndices.length} indices in {searchStrategy} mode
              </Text>
            </Stack>
          </Card>
        )}

        {/* Results */}
        {Object.keys(results).length > 0 && !isSearching && (
          <MultiIndexResults results={results} indices={indices} />
        )}

        {/* Feature Info */}
        <Alert icon={<IconDatabase size={16} />} title="Multi-Index Search Features" color="blue">
          <Stack gap="xs">
            <Text size="md">This demonstrates Algolia's multi-index search capabilities:</Text>
            <Text size="md">• Search across multiple indices simultaneously</Text>
            <Text size="md">• Configure index weights for relevance tuning</Text>
            <Text size="md">• Control result limits per index</Text>
            <Text size="md">• Choose between parallel or sequential search strategies</Text>
            <Text size="md">• Aggregate and display heterogeneous results</Text>
          </Stack>
        </Alert>
      </Stack>
    </Container>
  );
}
