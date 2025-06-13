'use client';

import React from 'react';
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
  Divider,
} from '@mantine/core';
import {
  IconShoppingCart,
  IconTrendingUp,
  IconUsers,
  IconEye,
  IconSparkles,
  IconHistory,
  IconBrandAlgolia,
  IconArrowRight,
} from '@tabler/icons-react';

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
  return (
    <Card shadow="sm" padding="lg" radius="sm" withBorder={true} h="100%">
      <Card.Section>
        <Avatar src={product.image} size={120} radius="sm" mx="auto" mt="md" />
      </Card.Section>

      <Stack gap="xs" mt="md">
        <Text fw={600} size="md" lineClamp={2}>
          {product.name}
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
            ${product.price}
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
      >
        Add to Cart
      </Button>
    </Card>
  );
}

export default function AlgoliaRecommendDemo() {
  const [activeModel, setActiveModel] = React.useState('related-products');

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
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

        {/* Introduction */}
        <Alert icon={<IconSparkles />} title="What is Algolia Recommend?" color="blue">
          <Text size="md">
            Algolia Recommend uses machine learning to provide personalized product recommendations:
          </Text>
          <ul>
            <li>Increase average order value with "Frequently Bought Together"</li>
            <li>Improve discovery with "Related Products"</li>
            <li>Boost engagement with "Trending Items"</li>
            <li>Enable visual search with "Looking Similar"</li>
          </ul>
        </Alert>

        {/* Recommendation Models */}
        <Stack gap="md">
          <Title order={2}>Recommendation Models</Title>

          <Grid>
            {recommendModels.map((model) => {
              const Icon = model.icon;
              return (
                <Grid.Col key={model.id} span={{ base: 12, sm: 6, md: 3 }}>
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
                    onClick={() => setActiveModel(model.id)}
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
                </Grid.Col>
              );
            })}
          </Grid>
        </Stack>

        {/* Recommendation Results */}
        <Tabs value={activeModel} onChange={(value) => setActiveModel(value || '')}>
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
            <Grid>
              {mockProducts.related.map((product: any) => (
                <Grid.Col key={product.objectID} span={{ base: 12, sm: 6, md: 4 }}>
                  <RecommendProductCard product={product} badge="Related" />
                </Grid.Col>
              ))}
            </Grid>
          </Tabs.Panel>

          <Tabs.Panel value="frequently-bought" pt="xl">
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
          </Tabs.Panel>

          <Tabs.Panel value="trending-items" pt="xl">
            <Grid>
              {mockProducts.trending.map((product: any) => (
                <Grid.Col key={product.objectID} span={{ base: 12, sm: 6, md: 4 }}>
                  <RecommendProductCard product={product} badge="Trending" badgeColor="orange" />
                </Grid.Col>
              ))}
            </Grid>
          </Tabs.Panel>

          <Tabs.Panel value="looking-similar" pt="xl">
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
          </Tabs.Panel>
        </Tabs>

        {/* Implementation Guide */}
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

        {/* Performance Benefits */}
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
      </Stack>
    </Container>
  );
}
