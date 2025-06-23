'use client';

import React, { useState } from 'react';
import {
  Container,
  Title,
  Text,
  Stack,
  Grid,
  Card,
  Badge,
  Group,
  Switch,
  Paper,
  Code,
  Alert,
  ThemeIcon,
  List,
  Tabs,
  Skeleton,
} from '@mantine/core';
import {
  IconSearch,
  IconBrain,
  IconChartLine,
  IconShoppingCart,
  IconRocket,
  IconBulb,
  IconApi,
  IconCode,
  IconCheck,
  IconX,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Feature categories with their implementations
const algoliaFeatures = {
  core: {
    title: 'Core Search Features',
    icon: IconSearch,
    features: [
      {
        name: 'InstantSearch',
        implemented: true,
        component: 'NextJSOptimizedSearch',
        description: 'Real-time search as you type with <300ms latency',
      },
      {
        name: 'Typo Tolerance',
        implemented: true,
        component: 'Built-in Algolia feature',
        description: 'Handles misspellings and typos automatically',
      },
      {
        name: 'Highlighting',
        implemented: true,
        component: 'SearchResults components',
        description: 'Highlights matching terms in results',
      },
      {
        name: 'Faceted Search',
        implemented: true,
        component: 'SearchFiltersServer',
        description: 'Dynamic filtering by categories, brands, price ranges',
      },
      {
        name: 'Pagination',
        implemented: true,
        component: 'SearchResults with Pagination',
        description: 'Efficient result pagination with infinite scroll option',
      },
    ],
  },
  ai: {
    title: 'AI & Machine Learning',
    icon: IconBrain,
    features: [
      {
        name: 'AI Query Understanding',
        implemented: true,
        component: 'AdvancedAlgoliaSearch',
        description: 'Natural language query processing',
      },
      {
        name: 'Personalization',
        implemented: true,
        component: 'With user profiles',
        description: 'Personalized results based on user behavior',
      },
      {
        name: 'NeuralSearch',
        implemented: false,
        component: 'Not implemented',
        description: 'Vector-based semantic search capabilities',
      },
      {
        name: 'Dynamic Re-ranking',
        implemented: false,
        component: 'Not implemented',
        description: 'ML-based result re-ranking based on user context',
      },
      {
        name: 'Query Categorization',
        implemented: true,
        component: 'AdvancedAlgoliaSearch',
        description: 'Automatic intent detection and categorization',
      },
    ],
  },
  advanced: {
    title: 'Advanced Features',
    icon: IconRocket,
    features: [
      {
        name: 'Federated Search',
        implemented: true,
        component: 'FederatedAlgoliaAutocomplete',
        description: 'Search across products, categories, and content',
      },
      {
        name: 'Voice Search',
        implemented: true,
        component: 'All search components',
        description: 'Web Speech API integration for voice queries',
      },
      {
        name: 'Geographic Search',
        implemented: true,
        component: 'Location-based filtering',
        description: 'Search by location with radius filtering',
      },
      {
        name: 'Multi-Language',
        implemented: true,
        component: 'With i18n support',
        description: 'Language-specific indices and stemming',
      },
      {
        name: 'Visual Search',
        implemented: false,
        component: 'Not implemented',
        description: 'Search by image similarity',
      },
    ],
  },
  analytics: {
    title: 'Analytics & Insights',
    icon: IconChartLine,
    features: [
      {
        name: 'Search Analytics',
        implemented: true,
        component: 'Analytics Dashboard',
        description: 'Track popular searches, CTR, and conversions',
      },
      {
        name: 'A/B Testing',
        implemented: false,
        component: 'Not implemented',
        description: 'Test different ranking strategies',
      },
      {
        name: 'Click Analytics',
        implemented: false,
        component: 'Not implemented',
        description: 'Track user interactions with Insights API',
      },
      {
        name: 'Conversion Tracking',
        implemented: false,
        component: 'Not implemented',
        description: 'Measure search-to-purchase funnel',
      },
      {
        name: 'Performance Monitoring',
        implemented: true,
        component: 'Built-in monitoring',
        description: 'Track search latency and availability',
      },
    ],
  },
  merchandising: {
    title: 'Merchandising & Business',
    icon: IconShoppingCart,
    features: [
      {
        name: 'Query Rules',
        implemented: false,
        component: 'Not implemented',
        description: 'Custom rules for promoting products',
      },
      {
        name: 'Synonyms',
        implemented: false,
        component: 'Not implemented',
        description: 'Manage search synonyms dynamically',
      },
      {
        name: 'Recommend API',
        implemented: false,
        component: 'Not implemented',
        description: 'Related products and trending items',
      },
      {
        name: 'Custom Ranking',
        implemented: true,
        component: 'Index configuration',
        description: 'Business metrics in ranking algorithm',
      },
      {
        name: 'Merchandising Campaigns',
        implemented: false,
        component: 'Not implemented',
        description: 'Time-based promotional rules',
      },
    ],
  },
  developer: {
    title: 'Developer Experience',
    icon: IconCode,
    features: [
      {
        name: 'React InstantSearch',
        implemented: true,
        component: 'react-instantsearch',
        description: 'Full React component library',
      },
      {
        name: 'Next.js Integration',
        implemented: true,
        component: 'react-instantsearch-nextjs',
        description: 'SSR/SSG support with RSC',
      },
      {
        name: 'TypeScript Support',
        implemented: true,
        component: 'Full type safety',
        description: 'Complete TypeScript definitions',
      },
      {
        name: 'API Clients',
        implemented: true,
        component: 'algoliasearch v5',
        description: 'Modern JavaScript/TypeScript client',
      },
      {
        name: 'Debugging Tools',
        implemented: true,
        component: 'Algolia DevTools',
        description: 'Browser extension for debugging',
      },
    ],
  },
};

interface AlgoliaFeaturesShowcaseProps {
  loading?: boolean;
  error?: string;
  'data-testid'?: string;
}

// Loading skeleton for AlgoliaFeaturesShowcase
function AlgoliaFeaturesShowcaseSkeleton({ testId }: { testId?: string }) {
  return (
    <Container size="xl" py="xl" data-testid={testId}>
      <Stack gap="xl">
        <div>
          <Skeleton height={40} width={400} mb="md" />
          <Skeleton height={24} width={600} />
        </div>
        <Paper p="lg">
          <Group justify="space-between">
            <div>
              <Skeleton height={16} width={200} mb="xs" />
              <Skeleton height={32} width={150} mb="xs" />
              <Skeleton height={20} width={100} />
            </div>
            <Group>
              <Skeleton height={40} width={120} />
              <Skeleton height={40} width={100} />
            </Group>
          </Group>
        </Paper>
        <Skeleton height={40} width={300} />
        <div>
          <Group mb="xl">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} height={40} width={120} />
              ))}
          </Group>
          <Grid>
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <Grid.Col key={i} span={6}>
                  <Skeleton height={180} />
                </Grid.Col>
              ))}
          </Grid>
        </div>
      </Stack>
    </Container>
  );
}

// Error state for AlgoliaFeaturesShowcase
function AlgoliaFeaturesShowcaseError({ error, testId }: { error: string; testId?: string }) {
  return (
    <Container size="xl" py="xl" data-testid={testId}>
      <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
        <Text size="sm">Features showcase failed to load: {error}</Text>
      </Alert>
    </Container>
  );
}

export default function AlgoliaFeaturesShowcase({
  loading = false,
  error,
  'data-testid': testId = 'algolia-features-showcase',
}: AlgoliaFeaturesShowcaseProps = {}) {
  const [activeCategory, setActiveCategory] = useState('core');
  const [showOnlyImplemented, setShowOnlyImplemented] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <AlgoliaFeaturesShowcaseSkeleton testId={testId} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <AlgoliaFeaturesShowcaseError error={currentError} testId={testId} />;
  }

  // Calculate implementation stats
  const stats = Object.entries(algoliaFeatures).reduce(
    (acc, [key, category]) => {
      try {
        const implemented = category.features.filter((f) => f.implemented).length;
        const total = category.features.length;
        acc[key] = { implemented, total, percentage: Math.round((implemented / total) * 100) };
        return acc;
      } catch (err) {
        console.error('Error calculating stats for category:', key, err);
        acc[key] = { implemented: 0, total: 0, percentage: 0 };
        return acc;
      }
    },
    {} as Record<string, { implemented: number; total: number; percentage: number }>,
  );

  const totalStats = Object.values(stats).reduce(
    (acc, stat) => ({
      implemented: acc.implemented + stat.implemented,
      total: acc.total + stat.total,
    }),
    { implemented: 0, total: 0 },
  );

  return (
    <ErrorBoundary
      fallback={
        <AlgoliaFeaturesShowcaseError error="Features showcase failed to render" testId={testId} />
      }
    >
      <Container size="xl" py="xl" data-testid={testId}>
        <Stack gap="xl">
          {/* Header */}
          <ErrorBoundary fallback={<Skeleton height={80} />}>
            <div>
              <Title order={1} mb="md">
                Algolia Features Showcase
              </Title>
              <Text size="lg" color="dimmed">
                Comprehensive overview of Algolia search capabilities in our Next.js 15
                implementation
              </Text>
            </div>
          </ErrorBoundary>

          {/* Overall Stats */}
          <ErrorBoundary fallback={<Skeleton height={120} />}>
            <Paper p="lg" shadow="sm" radius="sm">
              <Group justify="space-between" ta="center">
                <div>
                  <Text size="xs" color="dimmed" tt="uppercase" fw={600}>
                    Implementation Progress
                  </Text>
                  <Title order={2}>
                    {totalStats.implemented} of {totalStats.total} features
                  </Title>
                  <Text size="md" color="dimmed">
                    {Math.round((totalStats.implemented / totalStats.total) * 100)}% complete
                  </Text>
                </div>
                <Group>
                  <Badge size="xl" color="green" variant="light">
                    {totalStats.implemented} Implemented
                  </Badge>
                  <Badge size="xl" color="gray" variant="light">
                    {totalStats.total - totalStats.implemented} Planned
                  </Badge>
                </Group>
              </Group>
            </Paper>
          </ErrorBoundary>

          {/* Filter */}
          <ErrorBoundary fallback={<Skeleton height={40} />}>
            <Group justify="space-between">
              <Switch
                label="Show only implemented features"
                checked={showOnlyImplemented}
                onChange={(event: any) => {
                  try {
                    setShowOnlyImplemented(event.currentTarget.checked);
                  } catch (err) {
                    console.error('Failed to toggle filter:', err);
                    setInternalError('Failed to update filter');
                  }
                }}
              />
            </Group>
          </ErrorBoundary>

          {/* Feature Categories */}
          <ErrorBoundary fallback={<Skeleton height={400} />}>
            <Tabs
              value={activeCategory}
              onChange={(value) => {
                try {
                  setActiveCategory(value || '');
                } catch (err) {
                  console.error('Failed to change category:', err);
                  setInternalError('Failed to change category');
                }
              }}
            >
              <Tabs.List>
                {Object.entries(algoliaFeatures).map(([key, category]) => {
                  const Icon = category.icon;
                  return (
                    <ErrorBoundary key={key} fallback={<Skeleton height={40} width={120} />}>
                      <Tabs.Tab
                        value={key}
                        leftSection={<Icon size={16} />}
                        rightSection={
                          <Badge size="md" variant="light">
                            {stats[key]?.percentage || 0}%
                          </Badge>
                        }
                      >
                        {category.title}
                      </Tabs.Tab>
                    </ErrorBoundary>
                  );
                })}
              </Tabs.List>

              {Object.entries(algoliaFeatures).map(([key, category]) => (
                <Tabs.Panel key={key} value={key} pt="xl">
                  <ErrorBoundary fallback={<Skeleton height={300} />}>
                    <Grid>
                      {category.features
                        .filter((feature) => !showOnlyImplemented || feature.implemented)
                        .map((feature, index) => (
                          <Grid.Col key={index} span={{ base: 12, md: 6 }}>
                            <ErrorBoundary fallback={<Skeleton height={180} />}>
                              <Card shadow="sm" radius="sm" h="100%">
                                <Group justify="space-between" mb="md">
                                  <Group>
                                    <ThemeIcon
                                      size="lg"
                                      variant="light"
                                      color={feature.implemented ? 'green' : 'gray'}
                                    >
                                      {feature.implemented ? <IconCheck /> : <IconX />}
                                    </ThemeIcon>
                                    <div>
                                      <Text fw={600}>{feature.name}</Text>
                                      <Badge
                                        size="md"
                                        color={feature.implemented ? 'green' : 'gray'}
                                        variant="light"
                                      >
                                        {feature.implemented ? 'Implemented' : 'Planned'}
                                      </Badge>
                                    </div>
                                  </Group>
                                </Group>
                                <Text size="md" color="dimmed" mb="sm">
                                  {feature.description}
                                </Text>
                                {feature.implemented && (
                                  <Code block color="blue" mt="sm">
                                    {feature.component}
                                  </Code>
                                )}
                              </Card>
                            </ErrorBoundary>
                          </Grid.Col>
                        ))}
                    </Grid>
                  </ErrorBoundary>
                </Tabs.Panel>
              ))}
            </Tabs>
          </ErrorBoundary>

          {/* Implementation Guide */}
          <ErrorBoundary fallback={<Skeleton height={200} />}>
            <Paper p="lg" shadow="sm" radius="sm" mt="xl">
              <Title order={3} mb="md">
                Next.js 15 Optimization Details
              </Title>
              <List spacing="md">
                <List.Item icon={<IconCheck size={20} color="green" />}>
                  <strong>Server Components:</strong> Search results are fetched server-side for
                  better SEO and initial load performance
                </List.Item>
                <List.Item icon={<IconCheck size={20} color="green" />}>
                  <strong>Streaming:</strong> Uses Suspense boundaries to stream search results
                  progressively
                </List.Item>
                <List.Item icon={<IconCheck size={20} color="green" />}>
                  <strong>Partial Pre-rendering:</strong> Enabled with experimental_ppr for optimal
                  performance
                </List.Item>
                <List.Item icon={<IconCheck size={20} color="green" />}>
                  <strong>Edge Runtime:</strong> Compatible with Edge runtime for global low-latency
                  search
                </List.Item>
                <List.Item icon={<IconBulb size={20} color="yellow" />}>
                  <strong>Future:</strong> Server Actions for search state updates without
                  client-side JavaScript
                </List.Item>
              </List>
            </Paper>
          </ErrorBoundary>

          {/* API Usage Examples */}
          <ErrorBoundary fallback={<Skeleton height={150} />}>
            <Alert icon={<IconApi />} title="Algolia API Integration" color="blue">
              <Stack gap="sm">
                <Text size="md">
                  Our implementation uses Algolia's latest v5 client with optimal caching:
                </Text>
                <Code block>
                  {`// Optimized client with caching
const searchClient = algoliasearch(appId, apiKey, {
  responsesCache: createInMemoryCache(),
  requestsCache: createInMemoryCache({ serializable: false }),
  timeouts: { connect: 2000, read: 5000, write: 30000 }
});`}
                </Code>
              </Stack>
            </Alert>
          </ErrorBoundary>
        </Stack>
      </Container>
    </ErrorBoundary>
  );
}
