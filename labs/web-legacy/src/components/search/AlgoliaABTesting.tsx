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
  Progress,
  Paper,
  Code,
  Alert,
  ThemeIcon,
  Select,
  TextInput,
  NumberInput,
  Tabs,
  Table,
  ActionIcon,
  Skeleton,
} from '@mantine/core';
import {
  IconTestPipe,
  IconChartBar,
  IconTrendingUp,
  IconPlus,
  IconPlayerPlay,
  IconX,
  IconBrandAlgolia,
  IconFlask,
  IconTarget,
  IconCode,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Types for A/B Testing
interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  variants: TestVariant[];
  metrics: TestMetrics;
  startDate?: string;
  endDate?: string;
  duration: number; // days
  trafficAllocation: number; // percentage
  primaryMetric: 'ctr' | 'conversionRate' | 'revenue' | 'addToCartRate';
}

interface TestVariant {
  id: string;
  name: string;
  description: string;
  trafficPercentage: number;
  configuration: {
    ranking?: string[];
    typoTolerance?: 'min' | 'strict' | 'default';
    relevancy?: number;
    filters?: string;
    facets?: string[];
    customRanking?: string[];
  };
  results?: VariantResults;
}

interface VariantResults {
  searches: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  conversionRate: number;
  averageClickPosition: number;
  noResultsRate: number;
}

interface TestMetrics {
  totalSearches: number;
  statisticalSignificance: number;
  winner?: string;
  uplift?: number;
}

// Sample A/B tests
const sampleTests: ABTest[] = [
  {
    id: 'test-1',
    name: 'Relevancy vs Business Metrics',
    description: 'Testing pure relevancy against business-weighted ranking',
    status: 'running',
    variants: [
      {
        id: 'control',
        name: 'Control (Relevancy)',
        description: 'Default Algolia relevancy',
        trafficPercentage: 50,
        configuration: {
          ranking: ['typo', 'geo', 'words', 'filters', 'proximity', 'attribute', 'exact'],
        },
        results: {
          searches: 12543,
          clicks: 3761,
          conversions: 451,
          revenue: 45123,
          ctr: 29.98,
          conversionRate: 3.59,
          averageClickPosition: 3.2,
          noResultsRate: 2.1,
        },
      },
      {
        id: 'variant-1',
        name: 'Business Weighted',
        description: 'Custom ranking with revenue and popularity',
        trafficPercentage: 50,
        configuration: {
          ranking: ['typo', 'geo', 'words', 'filters', 'proximity', 'attribute', 'exact', 'custom'],
          customRanking: ['desc(revenue)', 'desc(popularity)', 'desc(rating)'],
        },
        results: {
          searches: 12489,
          clicks: 4121,
          conversions: 523,
          revenue: 52341,
          ctr: 32.99,
          conversionRate: 4.19,
          averageClickPosition: 2.8,
          noResultsRate: 2.3,
        },
      },
    ],
    metrics: {
      totalSearches: 25032,
      statisticalSignificance: 94.2,
      winner: 'variant-1',
      uplift: 16.0,
    },
    startDate: '2024-01-15',
    duration: 14,
    trafficAllocation: 100,
    primaryMetric: 'revenue',
  },
  {
    id: 'test-2',
    name: 'Typo Tolerance Test',
    description: 'Testing different typo tolerance levels',
    status: 'completed',
    variants: [
      {
        id: 'strict',
        name: 'Strict Typos',
        description: 'Minimal typo tolerance',
        trafficPercentage: 33,
        configuration: {
          typoTolerance: 'strict',
        },
        results: {
          searches: 8234,
          clicks: 2058,
          conversions: 206,
          revenue: 20600,
          ctr: 25.0,
          conversionRate: 2.5,
          averageClickPosition: 4.1,
          noResultsRate: 8.5,
        },
      },
      {
        id: 'default',
        name: 'Default Typos',
        description: 'Standard typo tolerance',
        trafficPercentage: 34,
        configuration: {
          typoTolerance: 'default',
        },
        results: {
          searches: 8512,
          clicks: 2638,
          conversions: 298,
          revenue: 29800,
          ctr: 31.0,
          conversionRate: 3.5,
          averageClickPosition: 3.5,
          noResultsRate: 3.2,
        },
      },
      {
        id: 'min',
        name: 'Minimum Typos',
        description: 'Maximum typo tolerance',
        trafficPercentage: 33,
        configuration: {
          typoTolerance: 'min',
        },
        results: {
          searches: 8298,
          clicks: 2572,
          conversions: 282,
          revenue: 28200,
          ctr: 31.0,
          conversionRate: 3.4,
          averageClickPosition: 3.3,
          noResultsRate: 1.8,
        },
      },
    ],
    metrics: {
      totalSearches: 25044,
      statisticalSignificance: 98.7,
      winner: 'default',
      uplift: 44.7,
    },
    startDate: '2024-01-01',
    endDate: '2024-01-14',
    duration: 14,
    trafficAllocation: 100,
    primaryMetric: 'revenue',
  },
];

// Test configuration editor
function TestConfigEditor({ test, onChange }: { test: ABTest; onChange: (test: ABTest) => void }) {
  const addVariant = () => {
    const newVariant: TestVariant = {
      id: `variant-${Date.now()}`,
      name: `Variant ${test.variants.length}`,
      description: '',
      trafficPercentage: 0,
      configuration: {},
    };
    onChange({
      ...test,
      variants: [...test.variants, newVariant],
    });
  };

  const updateVariant = (index: number, variant: TestVariant) => {
    const variants = [...test.variants];
    variants[index] = variant;
    onChange({ ...test, variants });
  };

  const removeVariant = (index: number) => {
    onChange({
      ...test,
      variants: test.variants.filter((_, i) => i !== index),
    });
  };

  // Auto-adjust traffic percentages
  const autoAdjustTraffic = () => {
    const equalPercentage = Math.floor(100 / test.variants.length);
    const remainder = 100 - equalPercentage * test.variants.length;

    const variants = test.variants.map((v, i) => ({
      ...v,
      trafficPercentage: equalPercentage + (i === 0 ? remainder : 0),
    }));

    onChange({ ...test, variants });
  };

  return (
    <Card shadow="sm" padding="lg" radius="sm" withBorder={true}>
      <Stack gap="md">
        <Grid>
          <Grid.Col span={8}>
            <TextInput
              label="Test Name"
              value={test.name}
              onChange={(e) => onChange({ ...test, name: e.currentTarget.value })}
              placeholder="e.g., Relevancy vs Business Metrics"
              required
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <Select
              label="Primary Metric"
              value={test.primaryMetric}
              onChange={(value) => onChange({ ...test, primaryMetric: value as any })}
              data={[
                { value: 'ctr', label: 'Click-Through Rate' },
                { value: 'conversionRate', label: 'Conversion Rate' },
                { value: 'revenue', label: 'Revenue' },
                { value: 'addToCartRate', label: 'Add to Cart Rate' },
              ]}
            />
          </Grid.Col>
        </Grid>

        <TextInput
          label="Description"
          value={test.description}
          onChange={(e) => onChange({ ...test, description: e.currentTarget.value })}
          placeholder="What are you testing?"
        />

        <Grid>
          <Grid.Col span={6}>
            <NumberInput
              label="Test Duration (days)"
              value={test.duration}
              onChange={(value) => onChange({ ...test, duration: Number(value) })}
              min={7}
              max={90}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <NumberInput
              label="Traffic Allocation %"
              value={test.trafficAllocation}
              onChange={(value) => onChange({ ...test, trafficAllocation: Number(value) })}
              min={1}
              max={100}
              suffix="%"
            />
          </Grid.Col>
        </Grid>

        <div>
          <Group justify="space-between" mb="sm">
            <Text fw={600}>Variants ({test.variants.length})</Text>
            <Group>
              <Button size="xs" variant="light" onClick={autoAdjustTraffic}>
                Auto-adjust Traffic
              </Button>
              <Button size="xs" leftSection={<IconPlus size={14} />} onClick={addVariant}>
                Add Variant
              </Button>
            </Group>
          </Group>

          <Stack gap="sm">
            {test.variants.map((variant, index) => (
              <Paper key={variant.id} p="md" withBorder={true}>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <TextInput
                      label="Variant Name"
                      value={variant.name}
                      onChange={(e) =>
                        updateVariant(index, { ...variant, name: e.currentTarget.value })
                      }
                      style={{ flex: 1 }}
                    />
                    <NumberInput
                      label="Traffic %"
                      value={variant.trafficPercentage}
                      onChange={(value) =>
                        updateVariant(index, { ...variant, trafficPercentage: Number(value) })
                      }
                      min={0}
                      max={100}
                      suffix="%"
                      style={{ width: 120 }}
                    />
                    {test.variants.length > 2 && (
                      <ActionIcon
                        c="red"
                        variant="light"
                        onClick={() => removeVariant(index)}
                        mt={25}
                      >
                        <IconX size={16} />
                      </ActionIcon>
                    )}
                  </Group>

                  <TextInput
                    label="Description"
                    value={variant.description}
                    onChange={(e) =>
                      updateVariant(index, { ...variant, description: e.currentTarget.value })
                    }
                    placeholder="What makes this variant different?"
                  />

                  {/* Configuration preview */}
                  {Object.keys(variant.configuration).length > 0 && (
                    <Code block>{JSON.stringify(variant.configuration, null, 2)}</Code>
                  )}
                </Stack>
              </Paper>
            ))}
          </Stack>
        </div>
      </Stack>
    </Card>
  );
}

// Test results visualization
function TestResults({ test }: { test: ABTest }) {
  const winner = test.variants.find((v) => v.id === test.metrics.winner);
  const primaryMetricLabel = {
    ctr: 'Click-Through Rate',
    conversionRate: 'Conversion Rate',
    revenue: 'Revenue',
    addToCartRate: 'Add to Cart Rate',
  }[test.primaryMetric];

  return (
    <Stack gap="md">
      {/* Winner announcement */}
      {test.metrics.winner && test.metrics.statisticalSignificance > 95 && (
        <Alert icon={<IconTrendingUp />} title="We have a winner!" c="green">
          <Text size="md">
            <strong>{winner?.name}</strong> is performing {test.metrics.uplift}% better on{' '}
            {primaryMetricLabel}, with {test.metrics.statisticalSignificance.toFixed(1)}%
            confidence.
          </Text>
        </Alert>
      )}

      {/* Statistical significance */}
      <Card shadow="sm" padding="md" radius="sm" withBorder={true}>
        <Group justify="space-between" mb="md">
          <Text fw={600}>Statistical Significance</Text>
          <Badge color={test.metrics.statisticalSignificance >= 95 ? 'green' : 'orange'} size="lg">
            {test.metrics.statisticalSignificance.toFixed(1)}%
          </Badge>
        </Group>
        <Progress
          value={test.metrics.statisticalSignificance}
          size="lg"
          color={test.metrics.statisticalSignificance >= 95 ? 'green' : 'orange'}
        />
        <Text size="xs" c="dimmed" mt="xs">
          95% confidence level required for conclusive results
        </Text>
      </Card>

      {/* Variant comparison */}
      <Card shadow="sm" padding="lg" radius="sm" withBorder={true}>
        <Title order={4} mb="md">
          Variant Performance
        </Title>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Variant</Table.Th>
              <Table.Th>Searches</Table.Th>
              <Table.Th>CTR</Table.Th>
              <Table.Th>Conv. Rate</Table.Th>
              <Table.Th>Revenue</Table.Th>
              <Table.Th>Avg. Position</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {test.variants.map((variant) => (
              <Table.Tr
                key={variant.id}
                style={{
                  backgroundColor:
                    variant.id === test.metrics.winner
                      ? 'var(--mantine-color-green-light)'
                      : undefined,
                }}
              >
                <Table.Td>
                  <Group gap="xs">
                    <Text fw={600}>{variant.name}</Text>
                    {variant.id === test.metrics.winner && (
                      <Badge c="green" size="md">
                        Winner
                      </Badge>
                    )}
                  </Group>
                </Table.Td>
                <Table.Td>{variant.results?.searches.toLocaleString()}</Table.Td>
                <Table.Td>
                  <Badge variant="light" c="blue">
                    {variant.results?.ctr.toFixed(1)}%
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Badge variant="light" c="green">
                    {variant.results?.conversionRate.toFixed(2)}%
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text fw={600}>${variant.results?.revenue.toLocaleString()}</Text>
                </Table.Td>
                <Table.Td>{variant.results?.averageClickPosition.toFixed(1)}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>

      {/* Detailed metrics */}
      <Grid>
        {test.variants.map((variant) => (
          <Grid.Col key={variant.id} span={{ base: 12, md: 6 }}>
            <Card shadow="sm" padding="lg" radius="sm" withBorder={true} h="100%">
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text fw={600}>{variant.name}</Text>
                  <Badge>{variant.trafficPercentage}% traffic</Badge>
                </Group>

                <Grid>
                  <Grid.Col span={6}>
                    <Paper p="xs" withBorder={true}>
                      <Text size="xs" c="dimmed">
                        Clicks
                      </Text>
                      <Text size="lg" fw={700}>
                        {variant.results?.clicks.toLocaleString()}
                      </Text>
                    </Paper>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Paper p="xs" withBorder={true}>
                      <Text size="xs" c="dimmed">
                        Conversions
                      </Text>
                      <Text size="lg" fw={700}>
                        {variant.results?.conversions.toLocaleString()}
                      </Text>
                    </Paper>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Paper p="xs" withBorder={true}>
                      <Text size="xs" c="dimmed">
                        No Results Rate
                      </Text>
                      <Text size="lg" fw={700} c="red">
                        {variant.results?.noResultsRate.toFixed(1)}%
                      </Text>
                    </Paper>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Paper p="xs" withBorder={true}>
                      <Text size="xs" c="dimmed">
                        Avg. Position
                      </Text>
                      <Text size="lg" fw={700}>
                        #{variant.results?.averageClickPosition.toFixed(1)}
                      </Text>
                    </Paper>
                  </Grid.Col>
                </Grid>
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Stack>
  );
}

interface AlgoliaABTestingProps {
  loading?: boolean;
  error?: string;
  'data-testid'?: string;
}

// Loading skeleton for AlgoliaABTesting
function AlgoliaABTestingSkeleton({ testId }: { testId?: string }) {
  return (
    <Container size="xl" py="xl" data-testid={testId}>
      <Stack gap="xl">
        <div>
          <Group gap="md" mb="md">
            <Skeleton height={40} width={40} />
            <div>
              <Skeleton height={32} width={200} mb="xs" />
              <Skeleton height={20} width={300} />
            </div>
          </Group>
        </div>
        <Skeleton height={120} />
        <Group>
          <Skeleton height={40} style={{ flex: 1 }} />
          <Skeleton height={40} width={150} />
        </Group>
        <Card>
          <Skeleton height={400} />
        </Card>
      </Stack>
    </Container>
  );
}

// Error state for AlgoliaABTesting
function AlgoliaABTestingError({ error, testId }: { error: string; testId?: string }) {
  return (
    <Container size="xl" py="xl" data-testid={testId}>
      <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
        <Text size="sm">A/B Testing dashboard failed to load: {error}</Text>
      </Alert>
    </Container>
  );
}

export default function AlgoliaABTesting({
  loading = false,
  error,
  'data-testid': testId = 'algolia-ab-testing',
}: AlgoliaABTestingProps = {}) {
  const [tests, setTests] = useState<ABTest[]>(sampleTests);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(tests[0]);
  const [isCreating, setIsCreating] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <AlgoliaABTestingSkeleton testId={testId} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <AlgoliaABTestingError error={currentError} testId={testId} />;
  }

  const createNewTest = () => {
    try {
      const newTest: ABTest = {
        id: `test-${Date.now()}`,
        name: 'New A/B Test',
        description: '',
        status: 'draft',
        variants: [
          {
            id: 'control',
            name: 'Control',
            description: 'Original configuration',
            trafficPercentage: 50,
            configuration: {},
          },
          {
            id: 'variant-1',
            name: 'Variant A',
            description: 'Test configuration',
            trafficPercentage: 50,
            configuration: {},
          },
        ],
        metrics: {
          totalSearches: 0,
          statisticalSignificance: 0,
        },
        duration: 14,
        trafficAllocation: 100,
        primaryMetric: 'conversionRate',
      };

      setTests([...tests, newTest]);
      setSelectedTest(newTest);
      setIsCreating(true);
    } catch (err) {
      console.error('Failed to create new test:', err);
      setInternalError('Failed to create new test');
    }
  };

  const updateTest = (test: ABTest) => {
    try {
      const updated = tests.map((t) => (t.id === test.id ? test : t));
      setTests(updated);
      setSelectedTest(test);
    } catch (err) {
      console.error('Failed to update test:', err);
      setInternalError('Failed to update test');
    }
  };

  const startTest = (testId: string) => {
    try {
      const updated = tests.map((t) =>
        t.id === testId
          ? { ...t, status: 'running' as const, startDate: new Date().toISOString().split('T')[0] }
          : t,
      );
      setTests(updated);
    } catch (err) {
      console.error('Failed to start test:', err);
      setInternalError('Failed to start test');
    }
  };

  return (
    <ErrorBoundary
      fallback={
        <AlgoliaABTestingError error="A/B Testing dashboard failed to render" testId={testId} />
      }
    >
      <Container size="xl" py="xl" data-testid={testId}>
        <Stack gap="xl">
          {/* Header */}
          <ErrorBoundary fallback={<Skeleton height={80} />}>
            <div>
              <Group gap="md" mb="md">
                <ThemeIcon size="xl" variant="light" c="blue">
                  <IconTestPipe />
                </ThemeIcon>
                <div>
                  <Title order={1}>A/B Testing</Title>
                  <Text size="lg" c="dimmed">
                    Test and optimize your search relevance
                  </Text>
                </div>
              </Group>
            </div>
          </ErrorBoundary>

          {/* Introduction */}
          <ErrorBoundary fallback={<Skeleton height={120} />}>
            <Alert icon={<IconBrandAlgolia />} title="Why A/B Test Your Search?" c="blue">
              <Stack gap="xs">
                <Text size="md">
                  A/B testing helps you make data-driven decisions about your search configuration:
                </Text>
                <ul>
                  <li>Test different ranking strategies</li>
                  <li>Optimize for business metrics vs pure relevance</li>
                  <li>Find the right balance of typo tolerance</li>
                  <li>Measure the impact of filters and facets</li>
                  <li>Validate custom ranking attributes</li>
                </ul>
              </Stack>
            </Alert>
          </ErrorBoundary>

          {/* Test selector and creator */}
          <ErrorBoundary fallback={<Skeleton height={80} />}>
            <Group align="flex-end">
              <Select
                label="Select Test"
                value={selectedTest?.id}
                onChange={(value) => {
                  try {
                    setSelectedTest(tests.find((t) => t.id === value) || null);
                  } catch (err) {
                    console.error('Failed to select test:', err);
                    setInternalError('Failed to select test');
                  }
                }}
                data={tests.map((t) => ({
                  value: t.id,
                  label: t.name,
                }))}
                style={{ flex: 1 }}
              />
              <Button leftSection={<IconPlus />} onClick={createNewTest}>
                Create New Test
              </Button>
            </Group>
          </ErrorBoundary>

          {/* Test details */}
          {selectedTest && (
            <ErrorBoundary fallback={<Skeleton height={400} />}>
              <Tabs
                defaultValue={isCreating || selectedTest.status === 'draft' ? 'setup' : 'results'}
              >
                <Tabs.List>
                  <Tabs.Tab value="setup" leftSection={<IconFlask size={16} />}>
                    Test Setup
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="results"
                    leftSection={<IconChartBar size={16} />}
                    disabled={selectedTest.status === 'draft'}
                  >
                    Results
                  </Tabs.Tab>
                  <Tabs.Tab value="implementation" leftSection={<IconCode size={16} />}>
                    Implementation
                  </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="setup" pt="xl">
                  <ErrorBoundary fallback={<Skeleton height={300} />}>
                    <Stack gap="lg">
                      <TestConfigEditor test={selectedTest} onChange={updateTest} />

                      {selectedTest.status === 'draft' && (
                        <Group justify="flex-end">
                          <Button
                            size="lg"
                            leftSection={<IconPlayerPlay />}
                            onClick={() => startTest(selectedTest.id)}
                            disabled={!selectedTest.name || selectedTest.variants.length < 2}
                          >
                            Start Test
                          </Button>
                        </Group>
                      )}

                      {selectedTest.status === 'running' && (
                        <Alert icon={<IconPlayerPlay />} c="green">
                          This test is currently running. Started on {selectedTest.startDate}
                        </Alert>
                      )}
                    </Stack>
                  </ErrorBoundary>
                </Tabs.Panel>

                <Tabs.Panel value="results" pt="xl">
                  <ErrorBoundary fallback={<Skeleton height={300} />}>
                    <TestResults test={selectedTest} />
                  </ErrorBoundary>
                </Tabs.Panel>

                <Tabs.Panel value="implementation" pt="xl">
                  <ErrorBoundary fallback={<Skeleton height={300} />}>
                    <Stack gap="md">
                      <Title order={3}>Implementation Guide</Title>

                      <Code block>
                        {`// 1. Install A/B Testing client
npm install @algolia/client-abtesting

// 2. Create A/B test
const abTestingClient = createABTestingClient({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
});

const test = await abTestingClient.addABTest({
  name: '${selectedTest.name}',
  variants: [
    {
      index: 'products',
      trafficPercentage: ${selectedTest.variants[0]?.trafficPercentage || 50},
      description: '${selectedTest.variants[0]?.description || 'Control'}',
    },
    {
      index: 'products_variant_a',
      trafficPercentage: ${selectedTest.variants[1]?.trafficPercentage || 50},
      description: '${selectedTest.variants[1]?.description || 'Variant A'}',
      customSearchParameters: {
        ranking: [
          'typo',
          'geo',
          'words',
          'filters',
          'proximity',
          'attribute',
          'exact',
          'custom'
        ],
        customRanking: [
          'desc(revenue)',
          'desc(popularity)'
        ]
      }
    }
  ],
  endAt: '${new Date(Date.now() + selectedTest.duration * 24 * 60 * 60 * 1000).toISOString()}'
});

// 3. Track conversions
aa('convertedObjectIDsAfterSearch', {
  index: 'products',
  eventName: 'Product Purchased',
  objectIDs: ['product-123'],
  queryID: 'query-id-from-search'
});`}
                      </Code>

                      <Alert icon={<IconTarget />} title="Best Practices" c="blue">
                        <ul>
                          <li>Run tests for at least 1-2 weeks to account for weekly patterns</li>
                          <li>Ensure sufficient traffic ({'>'}1000 searches per variant)</li>
                          <li>Test one major change at a time</li>
                          <li>Monitor secondary metrics to avoid negative impacts</li>
                          <li>Document your hypothesis and learnings</li>
                        </ul>
                      </Alert>
                    </Stack>
                  </ErrorBoundary>
                </Tabs.Panel>
              </Tabs>
            </ErrorBoundary>
          )}
        </Stack>
      </Container>
    </ErrorBoundary>
  );
}
