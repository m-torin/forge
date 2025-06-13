'use client';

import React, { useState, useCallback } from 'react';
import { Container, Stack, Tabs, Text, Title, Paper, Group } from '@mantine/core';
import { useRouter } from 'next/navigation';
import {
  IconBrain,
  IconBrandAlgolia,
  IconChartBar,
  IconChartLine,
  IconDatabase,
  IconLanguage,
  IconPhoto,
  IconSearch,
  IconSparkles,
  IconTag,
  IconTestPipe,
} from '@tabler/icons-react';

import {
  AlgoliaABTesting,
  AlgoliaAnalyticsDashboard,
  AlgoliaFeaturesShowcase,
  AlgoliaInsightsDemo,
  AlgoliaMultiIndex,
  AlgoliaNeuralSearch,
  AlgoliaQueryRules,
  AlgoliaRecommendDemo,
  AlgoliaSynonyms,
  AlgoliaVisualSearch,
  ComprehensiveAlgoliaShowcase,
  ProductionFederatedAutocomplete,
  NextJSSearchWrapper,
} from '@/components/search';

export default function AlgoliaShowcasePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [locale, setLocale] = useState<string>('en');
  const router = useRouter();

  React.useEffect(() => {
    params.then(({ locale: paramLocale }) => setLocale(paramLocale));
  }, [params]);

  // Handle federated search selection with proper locale routing
  const handleFederatedSearchSelect = useCallback(
    (item: any, source: string) => {
      if (source === 'products' && item.objectID) {
        router.push(`/${locale}/products/${item.objectID}`);
      } else if (source === 'articles' && item.objectID) {
        router.push(`/${locale}/blog/${item.objectID}`);
      } else if (source === 'faq' && item.objectID) {
        router.push(`/${locale}/help?faq=${item.objectID}`);
      } else if (source === 'querysuggestions' && item.query) {
        router.push(`/${locale}/search?q=${encodeURIComponent(item.query)}`);
      } else {
        router.push(
          `/${locale}/search?q=${encodeURIComponent(item.query || item.name || item.title)}`,
        );
      }
    },
    [router, locale],
  );

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Page Header */}
        <div>
          <Title order={1} mb="md">
            Algolia Complete Feature Showcase
          </Title>
          <Text size="lg" c="dimmed">
            Comprehensive demonstration of Algolia's search capabilities optimized for Next.js 15
          </Text>
        </div>

        {/* Feature Tabs - Left Side Layout */}
        <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'overview')} orientation="vertical">
          <Group align="flex-start" gap="xl" wrap="nowrap">
            <div style={{ minWidth: '200px' }}>
              <Tabs.List>
                <Tabs.Tab value="overview" leftSection={<IconBrandAlgolia size={16} />}>
                  Overview
                </Tabs.Tab>
                <Tabs.Tab value="federated" leftSection={<IconSearch size={16} />}>
                  Federated
                </Tabs.Tab>
                <Tabs.Tab value="insights" leftSection={<IconChartLine size={16} />}>
                  Insights
                </Tabs.Tab>
                <Tabs.Tab value="recommend" leftSection={<IconSparkles size={16} />}>
                  Recommend
                </Tabs.Tab>
                <Tabs.Tab value="query-rules" leftSection={<IconTag size={16} />}>
                  Rules
                </Tabs.Tab>
                <Tabs.Tab value="synonyms" leftSection={<IconLanguage size={16} />}>
                  Synonyms
                </Tabs.Tab>
                <Tabs.Tab value="ab-testing" leftSection={<IconTestPipe size={16} />}>
                  A/B Test
                </Tabs.Tab>
                <Tabs.Tab value="visual-search" leftSection={<IconPhoto size={16} />}>
                  Visual
                </Tabs.Tab>
                <Tabs.Tab value="neural-search" leftSection={<IconBrain size={16} />}>
                  Neural
                </Tabs.Tab>
                <Tabs.Tab value="multi-index" leftSection={<IconDatabase size={16} />}>
                  Multi-Index
                </Tabs.Tab>
                <Tabs.Tab value="analytics" leftSection={<IconChartBar size={16} />}>
                  Analytics
                </Tabs.Tab>
              </Tabs.List>
            </div>

            <div style={{ flex: 1 }}>
              <Tabs.Panel value="overview">
                <ComprehensiveAlgoliaShowcase />
              </Tabs.Panel>

              <Tabs.Panel value="federated">
                <Stack gap="xl">
                  <div>
                    <Title order={2} mb="md">
                      Production Federated Search
                    </Title>
                    <Text c="dimmed" size="lg">
                      Enterprise-grade federated search with TypeScript safety and error handling
                    </Text>
                  </div>
                  
                  <Paper p="xl" shadow="sm" radius="md">
                    <Stack gap="md">
                      <Text fw={600} size="lg">
                        Production-Ready Autocomplete
                      </Text>
                      <Text c="dimmed" size="sm">
                        Try searching for "jacket", "blue", "care", "return policy" - includes error handling, accessibility, and performance optimizations
                      </Text>
                      <Group justify="center">
                        <ProductionFederatedAutocomplete
                          size="lg"
                          placeholder="Search products, articles, help..."
                          locale={locale}
                          onSelect={handleFederatedSearchSelect}
                          style={{ width: '400px' }}
                        />
                      </Group>
                    </Stack>
                  </Paper>

                  <div>
                    <Title order={3} mb="md">
                      Production Features
                    </Title>
                    <Group gap="lg" grow>
                      <Paper p="md" shadow="xs" radius="sm">
                        <Text fw={600} size="sm" mb="xs">Type Safety</Text>
                        <Text size="xs" c="dimmed">Full TypeScript with strict type checking and validation</Text>
                      </Paper>
                      <Paper p="md" shadow="xs" radius="sm">
                        <Text fw={600} size="sm" mb="xs">Error Handling</Text>
                        <Text size="xs" c="dimmed">Graceful error states with user feedback</Text>
                      </Paper>
                      <Paper p="md" shadow="xs" radius="sm">
                        <Text fw={600} size="sm" mb="xs">Performance</Text>
                        <Text size="xs" c="dimmed">Optimized with memoization and cancellation</Text>
                      </Paper>
                      <Paper p="md" shadow="xs" radius="sm">
                        <Text fw={600} size="sm" mb="xs">Security</Text>
                        <Text size="xs" c="dimmed">XSS protection and input validation</Text>
                      </Paper>
                    </Group>
                  </div>
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="insights">
                <NextJSSearchWrapper>
                  <AlgoliaInsightsDemo />
                </NextJSSearchWrapper>
              </Tabs.Panel>

              <Tabs.Panel value="recommend">
                <AlgoliaRecommendDemo />
              </Tabs.Panel>

              <Tabs.Panel value="query-rules">
                <AlgoliaQueryRules />
              </Tabs.Panel>

              <Tabs.Panel value="synonyms">
                <AlgoliaSynonyms />
              </Tabs.Panel>

              <Tabs.Panel value="ab-testing">
                <AlgoliaABTesting />
              </Tabs.Panel>

              <Tabs.Panel value="visual-search">
                <AlgoliaVisualSearch />
              </Tabs.Panel>

              <Tabs.Panel value="neural-search">
                <AlgoliaNeuralSearch />
              </Tabs.Panel>

              <Tabs.Panel value="multi-index">
                <AlgoliaMultiIndex />
              </Tabs.Panel>

              <Tabs.Panel value="analytics">
                <AlgoliaAnalyticsDashboard />
              </Tabs.Panel>
            </div>
          </Group>
        </Tabs>
      </Stack>
    </Container>
  );
}
