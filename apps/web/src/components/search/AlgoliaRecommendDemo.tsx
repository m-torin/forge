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
  Button,
  Tabs,
  ThemeIcon,
  Paper,
  Alert,
  Code,
  Avatar,
  Rating,
  Skeleton,
} from '@mantine/core';
import {
  IconShoppingCart,
  IconTrendingUp,
  IconEye,
  IconSparkles,
  IconBrandAlgolia,
  IconArrowRight,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Mock product data for recommendations
const mockProducts = {
  trending: [
    {
      objectID: 'trend-1',
      name: 'Wireless Noise-Canceling Headphones',
      price: 299.99,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop',
      rating: 4.8,
      sales: 1234,
      trend: '+45%',
    },
    {
      objectID: 'trend-2',
      name: 'Smart Home Security Camera',
      price: 149.99,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop',
      rating: 4.6,
      sales: 892,
      trend: '+32%',
    },
    {
      objectID: 'trend-3',
      name: 'Portable Power Bank 20000mAh',
      price: 49.99,
      image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=200&h=200&fit=crop',
      rating: 4.7,
      sales: 2103,
      trend: '+28%',
    },
  ],
  related: [
    {
      objectID: 'rel-1',
      name: 'Laptop Stand Adjustable',
      price: 39.99,
      image: 'https: //images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200&h=200&fit=crop',
      rating: 4.5,
      similarity: 0.92,
    },
    {
      objectID: 'rel-2',
      name: 'USB-C Hub 7-in-1',
      price: 59.99,
      image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=200&h=200&fit=crop',
      rating: 4.4,
      similarity: 0.88,
    },
    {
      objectID: 'rel-3',
      name: 'Wireless Mouse Ergonomic',
      price: 29.99,
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200&h=200&fit=crop',
      rating: 4.6,
      similarity: 0.85,
    },
  ],
  frequentlyBought: [
    {
      objectID: 'fb-1',
      name: 'Screen Protector Glass',
      price: 12.99,
      image: 'https: //images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=200&h=200&fit=crop',
      confidence: 0.78,
    },
    {
      objectID: 'fb-2',
      name: 'Phone Case Premium',
      price: 24.99,
      image: 'https: //images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=200&h=200&fit=crop',
      confidence: 0.65,
    },
  ],
  lookingSimilar: [
    {
      objectID: 'sim-1',
      name: 'Minimalist Laptop Bag',
      price: 79.99,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop',
      visualSimilarity: 0.94,
    },
    {
      objectID: 'sim-2',
      name: 'Premium Backpack Tech',
      price: 119.99,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop',
      visualSimilarity: 0.89,
    },
  ],
};

// Recommendation models showcase
const recommendModels = [
  {
    id: 'related-products',
    name: 'Related Products',
    icon: IconSparkles,
    description: 'Items similar to what the user is viewing',
    apiEndpoint: '/1/indexes/*/recommendations',
    color: 'blue',
  },
  {
    id: 'frequently-bought',
    name: 'Frequently Bought Together',
    icon: IconShoppingCart,
    description: 'Products often purchased with this item',
    apiEndpoint: '/1/indexes/*/recommendations',
    color: 'green',
  },
  {
    id: 'trending-items',
    name: 'Trending Items',
    icon: IconTrendingUp,
    description: 'Popular products based on recent activity',
    apiEndpoint: '/1/indexes/*/trending',
    color: 'orange',
  },
  {
    id: 'looking-similar',
    name: 'Looking Similar',
    icon: IconEye,
    description: 'Visually similar products using AI',
    apiEndpoint: '/1/indexes/*/similar',
    color: 'purple',
  },
];

// Product card component
function RecommendProductCard({
  product,
  badge,
  badgeColor = 'blue',
}: {
  product: any;
  badge?: string;
  badgeColor?: string;
}) {
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = () => {
    try {
      console.log('Adding to cart:', product.objectID);
      // Add to cart logic would go here
    } catch (_error) {
      console.error('Failed to add to cart:', _error);
    }
  };

  return (
    <ErrorBoundary
      fallback={
        <Card shadow="sm" padding="lg" radius="sm" withBorder={true} h="100%">
          <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
            <Text size="sm">Product card failed to load</Text>
          </Alert>
        </Card>
      }
    >
      <Card shadow="sm" padding="lg" radius="sm" withBorder={true} h="100%">
        <Card.Section>
          <Avatar
            src={imageError ? undefined : product.image}
            size={120}
            radius="sm"
            mx="auto"
            mt="md"
            onError={() => setImageError(true)}
          >
            {imageError && <IconShoppingCart size={40} />}
          </Avatar>
        </Card.Section>

        <Stack gap="xs" mt="md">
          <Text fw={600} size="md" lineClamp={2}>
            {product.name || 'Unknown Product'}
          </Text>

          {product.rating && (
            <Group gap="xs">
              <Rating value={product.rating} readOnly size="xs" />
              <Text size="xs" color="dimmed">
                ({product.rating})
              </Text>
            </Group>
          )}

          <Group justify="space-between" align="flex-end">
            <Text fw={700} size="lg" color="blue">
              ${product.price || '0.00'}
            </Text>
            {badge && (
              <Badge color={badgeColor} size="md" variant="light">
                {badge}
              </Badge>
            )}
          </Group>

          {product.trend && (
            <Badge color="green" leftSection={<IconTrendingUp size={12} />}>
              {product.trend}, this week
            </Badge>
          )}

          {product.sales && (
            <Text size="xs" color="dimmed">
              {product.sales.toLocaleString()}, sold
            </Text>
          )}

          {product.similarity && (
            <Badge color="blue" variant="dot">
              {Math.round(product.similarity * 100)}% match
            </Badge>
          )}

          {product.confidence && (
            <Badge color="green" variant="dot">
              {Math.round(product.confidence * 100)}% buy together
            </Badge>
          )}

          {product.visualSimilarity && (
            <Badge color="purple" variant="dot">
              {Math.round(product.visualSimilarity * 100)}% visual match
            </Badge>
          )}
        </Stack>

        <Button
          fullWidth
          mt="md"
          size="md"
          variant="light"
          leftSection={<IconShoppingCart size={16} />}
          onClick={handleAddToCart}
        >
          Add to Cart
        </Button>
      </Card>
    </ErrorBoundary>
  );
}

interface AlgoliaRecommendDemoProps {
  loading?: boolean;
  error?: string;
  'data-testid'?: string;
}

// Loading skeleton for AlgoliaRecommendDemo
function AlgoliaRecommendDemoSkeleton({ testId }: { testId?: string }) {
  return (
    <Container size="xl" py="xl" data-testid={testId}>
      <Stack gap="xl">
        <div>
          <Group gap="md" mb="md">
            <Skeleton height={64} width={64} radius="md" />
            <div>
              <Skeleton height={32} width={300} mb="xs" />
              <Skeleton height={20} width={400} />
            </div>
          </Group>
        </div>
        <Skeleton height={120} />
        <div>
          <Skeleton height={32} width={200} mb="md" />
          <Grid>
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <Grid.Col key={i} span={{ base: 12, sm: 6, md: 3 }}>
                  <Skeleton height={200} />
                </Grid.Col>
              ))}
          </Grid>
        </div>
        <div>
          <Skeleton height={40} mb="xl" />
          <Grid>
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <Grid.Col key={i} span={{ base: 12, sm: 6, md: 4 }}>
                  <Skeleton height={400} />
                </Grid.Col>
              ))}
          </Grid>
        </div>
      </Stack>
    </Container>
  );
}

// Error state for AlgoliaRecommendDemo
function AlgoliaRecommendDemoError({ error, testId }: { error: string; testId?: string }) {
  return (
    <Container size="xl" py="xl" data-testid={testId}>
      <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
        <Text size="sm">Algolia Recommend demo failed to load: {error}</Text>
      </Alert>
    </Container>
  );
}

export default function AlgoliaRecommendDemo({
  loading = false,
  error,
  'data-testid': testId = 'algolia-recommend-demo',
}: AlgoliaRecommendDemoProps = {}) {
  const [activeModel, setActiveModel] = useState('related-products');
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <AlgoliaRecommendDemoSkeleton testId={testId} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <AlgoliaRecommendDemoError error={currentError} testId={testId} />;
  }

  const handleModelChange = (modelId: string) => {
    try {
      setActiveModel(modelId);
    } catch (err) {
      console.error('Failed to change model:', err);
      setInternalError('Failed to change recommendation model');
    }
  };

  return (
    <ErrorBoundary
      fallback={
        <AlgoliaRecommendDemoError error="Recommend demo failed to render" testId={testId} />
      }
    >
      <Container size="xl" py="xl" data-testid={testId}>
        <Stack gap="xl">
          {/* Header */}
          <ErrorBoundary fallback={<Skeleton height={80} />}>
            <div>
              <Group gap="md" mb="md">
                <ThemeIcon size="xl" variant="light" color="blue">
                  <IconBrandAlgolia />
                </ThemeIcon>
                <div>
                  <Title order={1}>Algolia Recommend API</Title>
                  <Text size="lg" color="dimmed">
                    AI-powered product recommendations for e-commerce
                  </Text>
                </div>
              </Group>
            </div>
          </ErrorBoundary>

          {/* Introduction */}
          <ErrorBoundary fallback={<Skeleton height={120} />}>
            <Alert icon={<IconSparkles />} title="What is Algolia Recommend?" color="blue">
              <Text size="md">
                Algolia Recommend uses machine learning to provide personalized product
                recommendations:
              </Text>
              <ul>
                <li>Increase average order value with "Frequently Bought Together"</li>
                <li>Improve discovery with "Related Products"</li>
                <li>Boost engagement with "Trending Items"</li>
                <li>Enable visual search with "Looking Similar"</li>
              </ul>
            </Alert>
          </ErrorBoundary>

          {/* Recommendation Models */}
          <ErrorBoundary fallback={<Skeleton height={300} />}>
            <Stack gap="md">
              <Title order={2}>Recommendation Models</Title>

              <Grid>
                {recommendModels.map((model) => {
                  const Icon = model.icon;
                  return (
                    <Grid.Col key={model.id} span={{ base: 12, sm: 6, md: 3 }}>
                      <ErrorBoundary fallback={<Skeleton height={200} />}>
                        <Paper
                          p="md"
                          radius="sm"
                          withBorder={true}
                          style={{
                            cursor: 'pointer',
                            borderColor:
                              activeModel === model.id
                                ? `var(--mantine-color-${model.color}-6)`
                                : undefined,
                            borderWidth: activeModel === model.id ? 2 : 1,
                          }}
                          onClick={() => handleModelChange(model.id)}
                        >
                          <Stack gap="sm" ta="center">
                            <ThemeIcon size="xl" variant="light" color={model.color}>
                              <Icon size={24} />
                            </ThemeIcon>
                            <Text fw={600}>{model.name}</Text>
                            <Text size="xs" color="dimmed">
                              {model.description}
                            </Text>
                            <Code block>{model.apiEndpoint}</Code>
                          </Stack>
                        </Paper>
                      </ErrorBoundary>
                    </Grid.Col>
                  );
                })}
              </Grid>
            </Stack>
          </ErrorBoundary>

          {/* Recommendation Results */}
          <ErrorBoundary fallback={<Skeleton height={400} />}>
            <Tabs value={activeModel} onChange={(value) => handleModelChange(value || '')}>
              <Tabs.List>
                <Tabs.Tab value="related-products" leftSection={<IconSparkles size={16} />}>
                  Related Products
                </Tabs.Tab>
                <Tabs.Tab value="frequently-bought" leftSection={<IconShoppingCart size={16} />}>
                  Frequently Bought
                </Tabs.Tab>
                <Tabs.Tab value="trending-items" leftSection={<IconTrendingUp size={16} />}>
                  Trending Items
                </Tabs.Tab>
                <Tabs.Tab value="looking-similar" leftSection={<IconEye size={16} />}>
                  Looking Similar
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="related-products" pt="xl">
                <ErrorBoundary
                  fallback={
                    <Grid>
                      {Array(3)
                        .fill(0)
                        .map((_, i) => (
                          <Grid.Col key={i} span={{ base: 12, sm: 6, md: 4 }}>
                            <Skeleton height={400} />
                          </Grid.Col>
                        ))}
                    </Grid>
                  }
                >
                  <Grid>
                    {mockProducts.related.map((product: any) => (
                      <Grid.Col key={product.objectID} span={{ base: 12, sm: 6, md: 4 }}>
                        <RecommendProductCard product={product} badge="Related" />
                      </Grid.Col>
                    ))}
                  </Grid>
                </ErrorBoundary>
              </Tabs.Panel>

              <Tabs.Panel value="frequently-bought" pt="xl">
                <ErrorBoundary
                  fallback={
                    <Grid>
                      {Array(2)
                        .fill(0)
                        .map((_, i) => (
                          <Grid.Col key={i} span={{ base: 12, sm: 6, md: 4 }}>
                            <Skeleton height={400} />
                          </Grid.Col>
                        ))}
                    </Grid>
                  }
                >
                  <Grid>
                    {mockProducts.frequentlyBought.map((product: any) => (
                      <Grid.Col key={product.objectID} span={{ base: 12, sm: 6, md: 4 }}>
                        <RecommendProductCard
                          product={product}
                          badge="Often bought together"
                          badgeColor="green"
                        />
                      </Grid.Col>
                    ))}
                  </Grid>
                </ErrorBoundary>
              </Tabs.Panel>

              <Tabs.Panel value="trending-items" pt="xl">
                <ErrorBoundary
                  fallback={
                    <Grid>
                      {Array(3)
                        .fill(0)
                        .map((_, i) => (
                          <Grid.Col key={i} span={{ base: 12, sm: 6, md: 4 }}>
                            <Skeleton height={400} />
                          </Grid.Col>
                        ))}
                    </Grid>
                  }
                >
                  <Grid>
                    {mockProducts.trending.map((product: any) => (
                      <Grid.Col key={product.objectID} span={{ base: 12, sm: 6, md: 4 }}>
                        <RecommendProductCard
                          product={product}
                          badge="Trending"
                          badgeColor="orange"
                        />
                      </Grid.Col>
                    ))}
                  </Grid>
                </ErrorBoundary>
              </Tabs.Panel>

              <Tabs.Panel value="looking-similar" pt="xl">
                <ErrorBoundary
                  fallback={
                    <Grid>
                      {Array(2)
                        .fill(0)
                        .map((_, i) => (
                          <Grid.Col key={i} span={{ base: 12, sm: 6, md: 4 }}>
                            <Skeleton height={400} />
                          </Grid.Col>
                        ))}
                    </Grid>
                  }
                >
                  <Grid>
                    {mockProducts.lookingSimilar.map((product: any) => (
                      <Grid.Col key={product.objectID} span={{ base: 12, sm: 6, md: 4 }}>
                        <RecommendProductCard
                          product={product}
                          badge="Visually similar"
                          badgeColor="purple"
                        />
                      </Grid.Col>
                    ))}
                  </Grid>
                </ErrorBoundary>
              </Tabs.Panel>
            </Tabs>
          </ErrorBoundary>

          {/* Implementation Guide */}
          <ErrorBoundary fallback={<Skeleton height={400} />}>
            <Card shadow="sm" padding="lg" radius="sm" withBorder={true}>
              <Title order={3} mb="md">
                Implementation Guide
              </Title>

              <Stack gap="md">
                <div>
                  <Text fw={600} mb="xs">
                    1. Install Recommend Client
                  </Text>
                  <Code block>npm install @algolia/recommend</Code>
                </div>

                <div>
                  <Text fw={600} mb="xs">
                    2. Initialize Client
                  </Text>
                  <Code block>
                    {`import { getRecommendClient } from '@algolia/recommend';

const recommendClient = getRecommendClient({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
});`}
                  </Code>
                </div>

                <div>
                  <Text fw={600} mb="xs">
                    3. Get Recommendations
                  </Text>
                  <Code block>
                    {`// Related Products
const { results } = await recommendClient.getRelatedProducts([
  {
    indexName: 'products',
    objectID: 'product-123',
    maxRecommendations: 4}
]);

// Frequently Bought Together
const { results } = await recommendClient.getFrequentlyBoughtTogether([
  {
    indexName: 'products',
    objectID: 'product-123',
    maxRecommendations: 2}
]);`}
                  </Code>
                </div>

                <div>
                  <Text fw={600} mb="xs">
                    4. React Component
                  </Text>
                  <Code block>
                    {`import { FrequentlyBoughtTogether } from '@algolia/recommend-react';
import { recommendClient } from './algolia';

<FrequentlyBoughtTogether
  recommendClient={recommendClient}
        indexName="products"
  objectIDs={['product-123']}
        itemComponent={({ item }) => <ProductCard product={item} />}
            maxRecommendations={3}
/>`}
                  </Code>
                </div>
              </Stack>
            </Card>
          </ErrorBoundary>

          {/* Performance Benefits */}
          <ErrorBoundary fallback={<Skeleton height={150} />}>
            <Alert icon={<IconArrowRight />} title="Performance Benefits" color="green">
              <Stack gap="xs">
                <Text size="md">Algolia Recommend delivers significant business impact: </Text>
                <ul>
                  <li>
                    <strong>+22% Average Order Value</strong> with Frequently Bought Together
                  </li>
                  <li>
                    <strong>+15% Click-Through Rate</strong> with Related Products
                  </li>
                  <li>
                    <strong>+18% Conversion Rate</strong> with personalized recommendations
                  </li>
                  <li>
                    <strong>-30% Bounce Rate</strong> by improving product discovery
                  </li>
                </ul>
              </Stack>
            </Alert>
          </ErrorBoundary>
        </Stack>
      </Container>
    </ErrorBoundary>
  );
}
