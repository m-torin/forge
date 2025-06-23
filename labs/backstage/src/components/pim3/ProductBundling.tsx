'use client';

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Checkbox,
  Group,
  NumberInput,
  Progress,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconBox,
  IconBulb,
  IconChartBar,
  IconEdit,
  IconEye,
  IconPlus,
  IconStar,
  IconTrash,
} from '@tabler/icons-react';
import { useState } from 'react';

// Product bundling and recommendations data structures (UI only)
interface ProductBundle {
  createdAt: Date;
  description: string;
  id: string;
  name: string;
  performance: {
    views: number;
    purchases: number;
    conversionRate: number;
    revenue: number;
    averageOrderValue: number;
  };
  pricing: {
    bundlePrice?: number;
    totalRegularPrice: number;
    savings: number;
    savingsPercentage: number;
    discountType: 'percentage' | 'fixed_amount' | 'tiered';
  };
  products: {
    productId: string;
    productName: string;
    productSku: string;
    quantity: number;
    isRequired: boolean;
    discount?: number;
    position: number;
  }[];
  rules: {
    minimumQuantity?: number;
    maximumQuantity?: number;
    eligibleCategories?: string[];
    exclusionList?: string[];
    validFrom: Date;
    validUntil?: Date;
  };
  status: 'active' | 'inactive' | 'draft' | 'archived';
  type: 'fixed' | 'flexible' | 'upsell' | 'cross_sell' | 'seasonal';
  updatedAt: Date;
}

interface ProductRecommendation {
  createdAt: Date;
  id: string;
  isActive: boolean;
  performance: {
    impressions: number;
    clicks: number;
    conversions: number;
    clickThroughRate: number;
    conversionRate: number;
    revenue: number;
  };
  recommendedProducts: {
    productId: string;
    productName: string;
    productSku: string;
    score: number; // 0-100
    reason: string;
    price: number;
    category: string;
  }[];
  rules: {
    maxRecommendations: number;
    minimumScore: number;
    categories?: string[];
    priceRange?: { min: number; max: number };
    excludeOutOfStock: boolean;
  };
  targetProductId: string;
  type:
    | 'frequently_bought_together'
    | 'similar_products'
    | 'upsell'
    | 'cross_sell'
    | 'trending'
    | 'personalized';
  updatedAt: Date;
}

interface RecommendationEngine {
  configuration: {
    dataSource: string[];
    updateFrequency: 'real_time' | 'hourly' | 'daily' | 'weekly';
    minDataPoints: number;
    confidenceThreshold: number;
  };
  description: string;
  id: string;
  name: string;
  performance: {
    accuracy: number;
    precision: number;
    recall: number;
    coverage: number;
    lastTrainingDate: Date;
    totalRecommendations: number;
  };
  status: 'active' | 'inactive' | 'training' | 'error';
  type: 'collaborative_filtering' | 'content_based' | 'hybrid' | 'rule_based' | 'ai_powered';
}

interface ProductBundlingProps {
  onUpdate?: () => void;
  productId: string;
  productName: string;
  form: UseFormReturnType<any>;
}

export function ProductBundling({ onUpdate, productId, productName, form }: ProductBundlingProps) {
  // Get data from form context
  const bundles = form.values.bundles || [];
  const recommendations = form.values.recommendations || [];

  const [engines] = useState<RecommendationEngine[]>([
    {
      id: 'engine-1',
      name: 'Collaborative Filtering Engine',
      type: 'collaborative_filtering',
      configuration: {
        confidenceThreshold: 0.75,
        dataSource: ['purchase_history', 'view_history', 'ratings'],
        minDataPoints: 100,
        updateFrequency: 'daily',
      },
      description: 'User-based collaborative filtering for personalized recommendations',
      performance: {
        accuracy: 87.5,
        coverage: 89.2,
        lastTrainingDate: new Date('2025-01-15'),
        precision: 82.3,
        recall: 76.8,
        totalRecommendations: 45678,
      },
      status: 'active',
    },
    {
      id: 'engine-2',
      name: 'AI-Powered Recommendations',
      type: 'ai_powered',
      configuration: {
        confidenceThreshold: 0.8,
        dataSource: ['purchase_history', 'view_history', 'product_attributes', 'user_behavior'],
        minDataPoints: 500,
        updateFrequency: 'real_time',
      },
      description: 'Deep learning model for advanced product recommendations',
      performance: {
        accuracy: 92.1,
        coverage: 94.6,
        lastTrainingDate: new Date('2025-01-16'),
        precision: 88.7,
        recall: 85.4,
        totalRecommendations: 123456,
      },
      status: 'active',
    },
    {
      id: 'engine-3',
      name: 'Rule-Based Engine',
      type: 'rule_based',
      configuration: {
        confidenceThreshold: 0.7,
        dataSource: ['product_categories', 'pricing', 'inventory'],
        minDataPoints: 50,
        updateFrequency: 'hourly',
      },
      description: 'Business rule-driven recommendations for specific scenarios',
      performance: {
        accuracy: 79.3,
        coverage: 78.9,
        lastTrainingDate: new Date('2025-01-16'),
        precision: 84.1,
        recall: 71.2,
        totalRecommendations: 23456,
      },
      status: 'active',
    },
  ]);

  const [activeTab, setActiveTab] = useState<
    'bundles' | 'recommendations' | 'engines' | 'analytics' | 'create'
  >('bundles');

  const getBundleTypeColor = (type: string) => {
    switch (type) {
      case 'fixed':
        return 'blue';
      case 'flexible':
        return 'green';
      case 'upsell':
        return 'purple';
      case 'cross_sell':
        return 'orange';
      case 'seasonal':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'gray';
      case 'draft':
        return 'blue';
      case 'archived':
        return 'red';
      case 'training':
        return 'yellow';
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getRecommendationTypeColor = (type: string) => {
    switch (type) {
      case 'frequently_bought_together':
        return 'blue';
      case 'similar_products':
        return 'green';
      case 'upsell':
        return 'purple';
      case 'cross_sell':
        return 'orange';
      case 'trending':
        return 'red';
      case 'personalized':
        return 'pink';
      default:
        return 'gray';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      currency: 'USD',
      style: 'currency',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const getTotalBundleRevenue = () => {
    return bundles.reduce(
      (total: number, bundle: ProductBundle) => total + bundle.performance.revenue,
      0,
    );
  };

  const getAverageBundleConversion = () => {
    const total = bundles.reduce(
      (sum: number, bundle: ProductBundle) => sum + bundle.performance.conversionRate,
      0,
    );
    return total / bundles.length;
  };

  const getTotalRecommendationRevenue = () => {
    return recommendations.reduce(
      (total: number, rec: ProductRecommendation) => total + rec.performance.revenue,
      0,
    );
  };

  const handleCreateBundle = () => {
    const bundleForm = form.values.bundleForm;
    if (!bundleForm?.name || !bundleForm?.type) {
      notifications.show({
        color: 'red',
        message: 'Please fill in all required fields',
        title: 'Error',
      });
      return;
    }

    const newBundle = {
      id: `bundle-${Date.now()}`,
      name: bundleForm.name,
      type: bundleForm.type,
      createdAt: new Date(),
      description: bundleForm.description || '',
      performance: {
        averageOrderValue: 0,
        conversionRate: 0,
        purchases: 0,
        revenue: 0,
        views: 0,
      },
      pricing: {
        bundlePrice: 0,
        discountType: 'percentage',
        savings: 0,
        savingsPercentage: bundleForm.discount || 0,
        totalRegularPrice: 0,
      },
      products: bundleForm.productIds.map((id: string, index: number) => ({
        isRequired: index === 0,
        position: index + 1,
        productId: id,
        productName: `Product ${index + 1}`, // In real app, would look up product name
        productSku: `SKU-${index + 1}`,
        quantity: 1,
      })),
      rules: {
        validFrom: new Date(),
      },
      status: 'draft',
      updatedAt: new Date(),
    };

    form.setFieldValue('bundles', [...bundles, newBundle]);

    // Reset form
    form.setFieldValue('bundleForm', {
      name: '',
      type: 'fixed',
      description: '',
      discount: 0,
      productIds: [],
    });

    notifications.show({
      color: 'green',
      message: 'Product bundle created successfully',
      title: 'Success',
    });
  };

  const handleCreateRecommendation = () => {
    // For now just show notification
    notifications.show({
      color: 'green',
      message: 'Recommendation rule created successfully',
      title: 'Success',
    });
  };

  return (
    <Stack>
      {/* Tab Navigation */}
      <Group>
        <Button
          leftSection={<IconBox size={16} />}
          onClick={() => setActiveTab('bundles')}
          variant={activeTab === 'bundles' ? 'filled' : 'light'}
        >
          Bundles ({bundles.length})
        </Button>
        <Button
          leftSection={<IconBulb size={16} />}
          onClick={() => setActiveTab('recommendations')}
          variant={activeTab === 'recommendations' ? 'filled' : 'light'}
        >
          Recommendations ({recommendations.length})
        </Button>
        <Button
          leftSection={<IconStar size={16} />}
          onClick={() => setActiveTab('engines')}
          variant={activeTab === 'engines' ? 'filled' : 'light'}
        >
          Engines ({engines.length})
        </Button>
        <Button
          leftSection={<IconChartBar size={16} />}
          onClick={() => setActiveTab('analytics')}
          variant={activeTab === 'analytics' ? 'filled' : 'light'}
        >
          Analytics
        </Button>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => setActiveTab('create')}
          variant={activeTab === 'create' ? 'filled' : 'light'}
        >
          Create
        </Button>
      </Group>

      {/* Bundles Tab */}
      {activeTab === 'bundles' && (
        <Stack>
          <Group justify="space-between">
            <Text fw={600} size="lg">
              Product Bundles
            </Text>
            <Button leftSection={<IconPlus size={16} />} size="sm">
              Create Bundle
            </Button>
          </Group>

          <Stack>
            {bundles.map((bundle: ProductBundle) => (
              <Card key={bundle.id} withBorder>
                <Group justify="space-between" mb="sm">
                  <div>
                    <Group gap="sm">
                      <Text fw={600}>{bundle.name}</Text>
                      <Badge color={getBundleTypeColor(bundle.type)} size="sm" variant="light">
                        {bundle.type.toUpperCase().replace('_', ' ')}
                      </Badge>
                      <Badge color={getStatusColor(bundle.status)} size="sm" variant="light">
                        {bundle.status.toUpperCase()}
                      </Badge>
                    </Group>
                    <Text c="dimmed" size="sm">
                      {bundle.description}
                    </Text>
                  </div>
                  <Group gap="xs">
                    <ActionIcon variant="subtle">
                      <IconEye size={16} />
                    </ActionIcon>
                    <ActionIcon variant="subtle">
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon color="red" variant="subtle">
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Group>

                <SimpleGrid cols={4} mb="md" spacing="md">
                  <div>
                    <Text c="dimmed" size="xs">
                      Bundle Price
                    </Text>
                    <Text fw={600}>{formatCurrency(bundle.pricing.bundlePrice || 0)}</Text>
                  </div>
                  <div>
                    <Text c="dimmed" size="xs">
                      Total Savings
                    </Text>
                    <Text c="green" fw={600}>
                      {formatCurrency(bundle.pricing.savings)} (
                      {formatPercentage(bundle.pricing.savingsPercentage)})
                    </Text>
                  </div>
                  <div>
                    <Text c="dimmed" size="xs">
                      Conversion Rate
                    </Text>
                    <Text fw={600}>{formatPercentage(bundle.performance.conversionRate)}</Text>
                  </div>
                  <div>
                    <Text c="dimmed" size="xs">
                      Revenue
                    </Text>
                    <Text fw={600}>{formatCurrency(bundle.performance.revenue)}</Text>
                  </div>
                </SimpleGrid>

                {/* Bundle Products */}
                <Card withBorder>
                  <Text fw={500} mb="sm" size="sm">
                    Bundle Products ({bundle.products.length})
                  </Text>
                  <Stack gap="xs">
                    {bundle.products.map(
                      (
                        product: {
                          productId: string;
                          productName: string;
                          productSku: string;
                          quantity: number;
                          isRequired: boolean;
                          discount?: number;
                          position: number;
                        },
                        index: number,
                      ) => (
                        <Group key={index} justify="space-between">
                          <div>
                            <Group gap="sm">
                              <Text fw={500} size="sm">
                                {product.productName}
                              </Text>
                              <Text c="dimmed" size="xs">
                                SKU: {product.productSku}
                              </Text>
                              {product.isRequired && (
                                <Badge color="red" size="xs" variant="light">
                                  REQUIRED
                                </Badge>
                              )}
                              {product.discount && (
                                <Badge color="green" size="xs" variant="light">
                                  -{product.discount}%
                                </Badge>
                              )}
                            </Group>
                          </div>
                          <Text size="sm">Qty: {product.quantity}</Text>
                        </Group>
                      ),
                    )}
                  </Stack>
                </Card>

                {/* Performance Metrics */}
                <SimpleGrid cols={3} mt="md" spacing="md">
                  <div>
                    <Text c="dimmed" size="xs">
                      Views
                    </Text>
                    <Text fw={500}>{bundle.performance.views.toLocaleString()}</Text>
                  </div>
                  <div>
                    <Text c="dimmed" size="xs">
                      Purchases
                    </Text>
                    <Text fw={500}>{bundle.performance.purchases.toLocaleString()}</Text>
                  </div>
                  <div>
                    <Text c="dimmed" size="xs">
                      AOV
                    </Text>
                    <Text fw={500}>{formatCurrency(bundle.performance.averageOrderValue)}</Text>
                  </div>
                </SimpleGrid>
              </Card>
            ))}
          </Stack>
        </Stack>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <Stack>
          <Group justify="space-between">
            <Text fw={600} size="lg">
              Product Recommendations
            </Text>
            <Button leftSection={<IconPlus size={16} />} size="sm">
              Create Recommendation
            </Button>
          </Group>

          <Stack>
            {recommendations.map((rec: ProductRecommendation) => (
              <Card key={rec.id} withBorder>
                <Group justify="space-between" mb="sm">
                  <div>
                    <Group gap="sm">
                      <Text fw={600}>{rec.type.replace(/_/g, ' ').toUpperCase()}</Text>
                      <Badge color={getRecommendationTypeColor(rec.type)} size="sm" variant="light">
                        {rec.recommendedProducts.length} Products
                      </Badge>
                      <Badge color={rec.isActive ? 'green' : 'gray'} size="sm" variant="light">
                        {rec.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </Badge>
                    </Group>
                  </div>
                  <Group gap="xs">
                    <ActionIcon variant="subtle">
                      <IconEye size={16} />
                    </ActionIcon>
                    <ActionIcon variant="subtle">
                      <IconEdit size={16} />
                    </ActionIcon>
                  </Group>
                </Group>

                <SimpleGrid cols={4} mb="md" spacing="md">
                  <div>
                    <Text c="dimmed" size="xs">
                      Click Through Rate
                    </Text>
                    <Text fw={600}>{formatPercentage(rec.performance.clickThroughRate)}</Text>
                  </div>
                  <div>
                    <Text c="dimmed" size="xs">
                      Conversion Rate
                    </Text>
                    <Text fw={600}>{formatPercentage(rec.performance.conversionRate)}</Text>
                  </div>
                  <div>
                    <Text c="dimmed" size="xs">
                      Revenue
                    </Text>
                    <Text fw={600}>{formatCurrency(rec.performance.revenue)}</Text>
                  </div>
                  <div>
                    <Text c="dimmed" size="xs">
                      Impressions
                    </Text>
                    <Text fw={600}>{rec.performance.impressions.toLocaleString()}</Text>
                  </div>
                </SimpleGrid>

                {/* Recommended Products */}
                <Card withBorder>
                  <Text fw={500} mb="sm" size="sm">
                    Recommended Products
                  </Text>
                  <Stack gap="xs">
                    {rec.recommendedProducts.map(
                      (
                        product: {
                          productId: string;
                          productName: string;
                          productSku: string;
                          score: number;
                          reason: string;
                          price: number;
                          category: string;
                        },
                        index: number,
                      ) => (
                        <Group key={index} justify="space-between">
                          <div>
                            <Group gap="sm">
                              <Text fw={500} size="sm">
                                {product.productName}
                              </Text>
                              <Badge color="blue" size="xs" variant="outline">
                                Score: {product.score}
                              </Badge>
                              <Text c="dimmed" size="xs">
                                {product.reason}
                              </Text>
                            </Group>
                          </div>
                          <Group gap="xs">
                            <Text size="sm">{formatCurrency(product.price)}</Text>
                            <Progress size="sm" value={product.score} w={60} />
                          </Group>
                        </Group>
                      ),
                    )}
                  </Stack>
                </Card>
              </Card>
            ))}
          </Stack>
        </Stack>
      )}

      {/* Engines Tab */}
      {activeTab === 'engines' && (
        <Stack>
          <Group justify="space-between">
            <Text fw={600} size="lg">
              Recommendation Engines
            </Text>
            <Button leftSection={<IconPlus size={16} />} size="sm">
              Add Engine
            </Button>
          </Group>

          <Stack>
            {engines.map((engine) => (
              <Card key={engine.id} withBorder>
                <Group justify="space-between" mb="sm">
                  <div>
                    <Group gap="sm">
                      <Text fw={600}>{engine.name}</Text>
                      <Badge color={getStatusColor(engine.status)} size="sm" variant="light">
                        {engine.status.toUpperCase()}
                      </Badge>
                      <Badge color="blue" size="sm" variant="outline">
                        {engine.type.replace(/_/g, ' ').toUpperCase()}
                      </Badge>
                    </Group>
                    <Text c="dimmed" size="sm">
                      {engine.description}
                    </Text>
                  </div>
                  <Group gap="xs">
                    <ActionIcon variant="subtle">
                      <IconEye size={16} />
                    </ActionIcon>
                    <ActionIcon variant="subtle">
                      <IconEdit size={16} />
                    </ActionIcon>
                  </Group>
                </Group>

                <SimpleGrid cols={4} mb="md" spacing="md">
                  <div>
                    <Text c="dimmed" size="xs">
                      Accuracy
                    </Text>
                    <Group gap="xs">
                      <Text fw={600}>{formatPercentage(engine.performance.accuracy)}</Text>
                      <Progress style={{ flex: 1 }} size="sm" value={engine.performance.accuracy} />
                    </Group>
                  </div>
                  <div>
                    <Text c="dimmed" size="xs">
                      Precision
                    </Text>
                    <Group gap="xs">
                      <Text fw={600}>{formatPercentage(engine.performance.precision)}</Text>
                      <Progress
                        style={{ flex: 1 }}
                        size="sm"
                        value={engine.performance.precision}
                      />
                    </Group>
                  </div>
                  <div>
                    <Text c="dimmed" size="xs">
                      Coverage
                    </Text>
                    <Group gap="xs">
                      <Text fw={600}>{formatPercentage(engine.performance.coverage)}</Text>
                      <Progress style={{ flex: 1 }} size="sm" value={engine.performance.coverage} />
                    </Group>
                  </div>
                  <div>
                    <Text c="dimmed" size="xs">
                      Total Recs
                    </Text>
                    <Text fw={600}>{engine.performance.totalRecommendations.toLocaleString()}</Text>
                  </div>
                </SimpleGrid>

                <Group gap="md">
                  <Text size="sm">
                    <Text c="dimmed" span>
                      Update Frequency:
                    </Text>{' '}
                    {engine.configuration.updateFrequency.replace('_', ' ')}
                  </Text>
                  <Text size="sm">
                    <Text c="dimmed" span>
                      Last Training:
                    </Text>{' '}
                    {formatDate(engine.performance.lastTrainingDate)}
                  </Text>
                  <Text size="sm">
                    <Text c="dimmed" span>
                      Confidence:
                    </Text>{' '}
                    {formatPercentage(engine.configuration.confidenceThreshold * 100)}
                  </Text>
                </Group>
              </Card>
            ))}
          </Stack>
        </Stack>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <Stack>
          <Text fw={600} size="lg">
            Bundling & Recommendations Analytics
          </Text>

          <SimpleGrid cols={3} spacing="md">
            <Card withBorder>
              <Text c="dimmed" size="sm">
                Total Bundle Revenue
              </Text>
              <Text fw={700} size="xl">
                {formatCurrency(getTotalBundleRevenue())}
              </Text>
              <Text c="dimmed" size="xs">
                From {bundles.length} active bundles
              </Text>
            </Card>
            <Card withBorder>
              <Text c="dimmed" size="sm">
                Avg Bundle Conversion
              </Text>
              <Text fw={700} size="xl">
                {formatPercentage(getAverageBundleConversion())}
              </Text>
              <Text c="dimmed" size="xs">
                Across all bundles
              </Text>
            </Card>
            <Card withBorder>
              <Text c="dimmed" size="sm">
                Recommendation Revenue
              </Text>
              <Text fw={700} size="xl">
                {formatCurrency(getTotalRecommendationRevenue())}
              </Text>
              <Text c="dimmed" size="xs">
                From recommendation clicks
              </Text>
            </Card>
          </SimpleGrid>

          {/* Bundle Performance */}
          <Card withBorder>
            <Text fw={500} mb="md">
              Bundle Performance Comparison
            </Text>
            <Stack gap="md">
              {bundles.map((bundle: ProductBundle) => (
                <div key={bundle.id}>
                  <Group justify="space-between" mb="xs">
                    <Text fw={500} size="sm">
                      {bundle.name}
                    </Text>
                    <Text size="sm">{formatCurrency(bundle.performance.revenue)}</Text>
                  </Group>
                  <SimpleGrid cols={3} spacing="md">
                    <div>
                      <Text c="dimmed" size="xs">
                        Conversion Rate
                      </Text>
                      <Progress
                        color="green"
                        size="sm"
                        value={bundle.performance.conversionRate * 10}
                      />
                      <Text size="xs">{formatPercentage(bundle.performance.conversionRate)}</Text>
                    </div>
                    <div>
                      <Text c="dimmed" size="xs">
                        Views
                      </Text>
                      <Text fw={500} size="sm">
                        {bundle.performance.views.toLocaleString()}
                      </Text>
                    </div>
                    <div>
                      <Text c="dimmed" size="xs">
                        Purchases
                      </Text>
                      <Text fw={500} size="sm">
                        {bundle.performance.purchases.toLocaleString()}
                      </Text>
                    </div>
                  </SimpleGrid>
                </div>
              ))}
            </Stack>
          </Card>

          {/* Recommendation Performance */}
          <Card withBorder>
            <Text fw={500} mb="md">
              Recommendation Performance
            </Text>
            <Stack gap="md">
              {recommendations.map((rec: ProductRecommendation) => (
                <div key={rec.id}>
                  <Group justify="space-between" mb="xs">
                    <Text fw={500} size="sm">
                      {rec.type.replace(/_/g, ' ').toUpperCase()}
                    </Text>
                    <Text size="sm">{formatCurrency(rec.performance.revenue)}</Text>
                  </Group>
                  <SimpleGrid cols={3} spacing="md">
                    <div>
                      <Text c="dimmed" size="xs">
                        CTR
                      </Text>
                      <Progress
                        color="blue"
                        size="sm"
                        value={rec.performance.clickThroughRate * 10}
                      />
                      <Text size="xs">{formatPercentage(rec.performance.clickThroughRate)}</Text>
                    </div>
                    <div>
                      <Text c="dimmed" size="xs">
                        Conversion Rate
                      </Text>
                      <Progress
                        color="green"
                        size="sm"
                        value={rec.performance.conversionRate * 10}
                      />
                      <Text size="xs">{formatPercentage(rec.performance.conversionRate)}</Text>
                    </div>
                    <div>
                      <Text c="dimmed" size="xs">
                        Impressions
                      </Text>
                      <Text fw={500} size="sm">
                        {rec.performance.impressions.toLocaleString()}
                      </Text>
                    </div>
                  </SimpleGrid>
                </div>
              ))}
            </Stack>
          </Card>
        </Stack>
      )}

      {/* Create Tab */}
      {activeTab === 'create' && (
        <Stack>
          <Text fw={600} size="lg">
            Create Bundle or Recommendation
          </Text>

          <SimpleGrid cols={2} spacing="xl">
            {/* Create Bundle */}
            <Card withBorder>
              <Stack>
                <Text fw={500}>Create Product Bundle</Text>
                <TextInput
                  placeholder="e.g., Gaming Starter Kit"
                  label="Bundle Name"
                  required
                  {...form.getInputProps('bundleForm.name')}
                />
                <Textarea
                  placeholder="Describe the bundle"
                  rows={3}
                  label="Description"
                  {...form.getInputProps('bundleForm.description')}
                />
                <Select
                  data={[
                    { label: 'Fixed Bundle', value: 'fixed' },
                    { label: 'Flexible Bundle', value: 'flexible' },
                    { label: 'Upsell Bundle', value: 'upsell' },
                    { label: 'Cross-sell Bundle', value: 'cross_sell' },
                    { label: 'Seasonal Bundle', value: 'seasonal' },
                  ]}
                  label="Bundle Type"
                  required
                  {...form.getInputProps('bundleForm.type')}
                />
                <NumberInput
                  placeholder="0"
                  rightSection="%"
                  label="Discount Percentage"
                  max={100}
                  min={0}
                  {...form.getInputProps('bundleForm.discount')}
                />
                <Text c="dimmed" size="xs">
                  Add products to the bundle after creation
                </Text>
                <Button fullWidth onClick={handleCreateBundle}>
                  Create Bundle
                </Button>
              </Stack>
            </Card>

            {/* Create Recommendation */}
            <Card withBorder>
              <Stack>
                <Text fw={500}>Create Recommendation Rule</Text>
                <Select
                  data={[
                    { label: 'Frequently Bought Together', value: 'frequently_bought_together' },
                    { label: 'Similar Products', value: 'similar_products' },
                    { label: 'Upsell Recommendations', value: 'upsell' },
                    { label: 'Cross-sell Recommendations', value: 'cross_sell' },
                    { label: 'Trending Products', value: 'trending' },
                    { label: 'Personalized Recommendations', value: 'personalized' },
                  ]}
                  label="Recommendation Type"
                  required
                />
                <NumberInput placeholder="5" label="Max Recommendations" max={20} min={1} />
                <NumberInput
                  placeholder="70"
                  rightSection="%"
                  label="Minimum Score"
                  max={100}
                  min={0}
                />
                <Select
                  data={engines.map((engine) => ({
                    label: engine.name,
                    value: engine.id,
                  }))}
                  label="Recommendation Engine"
                />
                <Checkbox defaultChecked label="Exclude out of stock products" />
                <Button fullWidth onClick={handleCreateRecommendation}>
                  Create Recommendation
                </Button>
              </Stack>
            </Card>
          </SimpleGrid>
        </Stack>
      )}
    </Stack>
  );
}
