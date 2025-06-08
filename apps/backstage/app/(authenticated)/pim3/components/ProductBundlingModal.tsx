"use client";

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Checkbox,
  Group,
  Modal,
  NumberInput,
  Progress,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconBox,
  IconBulb,
  IconChartBar,
  IconEdit,
  IconEye,
  IconGift,
  IconPlus,
  IconStar,
  IconTags,
  IconTrash,
  IconTrendingUp,
} from "@tabler/icons-react";
import { useState } from "react";

// Product bundling and recommendations data structures (UI only)
interface ProductBundle {
  id: string;
  name: string;
  description: string;
  type: "fixed" | "flexible" | "upsell" | "cross_sell" | "seasonal";
  status: "active" | "inactive" | "draft" | "archived";
  products: Array<{
    productId: string;
    productName: string;
    productSku: string;
    quantity: number;
    isRequired: boolean;
    discount?: number;
    position: number;
  }>;
  pricing: {
    bundlePrice?: number;
    totalRegularPrice: number;
    savings: number;
    savingsPercentage: number;
    discountType: "percentage" | "fixed_amount" | "tiered";
  };
  rules: {
    minimumQuantity?: number;
    maximumQuantity?: number;
    eligibleCategories?: string[];
    exclusionList?: string[];
    validFrom: Date;
    validUntil?: Date;
  };
  performance: {
    views: number;
    purchases: number;
    conversionRate: number;
    revenue: number;
    averageOrderValue: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface ProductRecommendation {
  id: string;
  type: "frequently_bought_together" | "similar_products" | "upsell" | "cross_sell" | "trending" | "personalized";
  targetProductId: string;
  recommendedProducts: Array<{
    productId: string;
    productName: string;
    productSku: string;
    score: number; // 0-100
    reason: string;
    price: number;
    category: string;
  }>;
  rules: {
    maxRecommendations: number;
    minimumScore: number;
    categories?: string[];
    priceRange?: { min: number; max: number };
    excludeOutOfStock: boolean;
  };
  performance: {
    impressions: number;
    clicks: number;
    conversions: number;
    clickThroughRate: number;
    conversionRate: number;
    revenue: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface RecommendationEngine {
  id: string;
  name: string;
  type: "collaborative_filtering" | "content_based" | "hybrid" | "rule_based" | "ai_powered";
  status: "active" | "inactive" | "training" | "error";
  description: string;
  configuration: {
    dataSource: string[];
    updateFrequency: "real_time" | "hourly" | "daily" | "weekly";
    minDataPoints: number;
    confidenceThreshold: number;
  };
  performance: {
    accuracy: number;
    precision: number;
    recall: number;
    coverage: number;
    lastTrainingDate: Date;
    totalRecommendations: number;
  };
}

interface ProductBundlingModalProps {
  opened: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  onUpdate?: () => void;
}

export function ProductBundlingModal({
  opened,
  onClose,
  productId,
  productName,
  onUpdate,
}: ProductBundlingModalProps) {
  // Demo data
  const [bundles] = useState<ProductBundle[]>([
    {
      id: "bundle-1",
      name: "Complete Gaming Setup",
      description: "Everything you need for the ultimate gaming experience",
      type: "fixed",
      status: "active",
      products: [
        {
          productId: productId,
          productName: "Gaming Laptop",
          productSku: "LAPTOP-001",
          quantity: 1,
          isRequired: true,
          position: 1,
        },
        {
          productId: "mouse-001",
          productName: "Gaming Mouse",
          productSku: "MOUSE-001",
          quantity: 1,
          isRequired: true,
          discount: 15,
          position: 2,
        },
        {
          productId: "keyboard-001",
          productName: "Mechanical Keyboard",
          productSku: "KB-001",
          quantity: 1,
          isRequired: false,
          discount: 10,
          position: 3,
        },
        {
          productId: "headset-001",
          productName: "Gaming Headset",
          productSku: "HS-001",
          quantity: 1,
          isRequired: false,
          discount: 20,
          position: 4,
        },
      ],
      pricing: {
        bundlePrice: 1899.99,
        totalRegularPrice: 2199.99,
        savings: 300.00,
        savingsPercentage: 13.6,
        discountType: "fixed_amount",
      },
      rules: {
        minimumQuantity: 2,
        maximumQuantity: 5,
        eligibleCategories: ["Electronics", "Gaming"],
        validFrom: new Date("2025-01-01"),
        validUntil: new Date("2025-03-31"),
      },
      performance: {
        views: 5420,
        purchases: 234,
        conversionRate: 4.3,
        revenue: 444666.00,
        averageOrderValue: 1899.99,
      },
      createdAt: new Date("2024-12-01"),
      updatedAt: new Date("2025-01-15"),
    },
    {
      id: "bundle-2",
      name: "Productivity Essentials",
      description: "Boost your productivity with this carefully curated bundle",
      type: "flexible",
      status: "active",
      products: [
        {
          productId: productId,
          productName: "Business Laptop",
          productSku: "LAPTOP-BIZ-001",
          quantity: 1,
          isRequired: true,
          position: 1,
        },
        {
          productId: "dock-001",
          productName: "USB-C Dock",
          productSku: "DOCK-001",
          quantity: 1,
          isRequired: false,
          discount: 25,
          position: 2,
        },
        {
          productId: "monitor-001",
          productName: "4K Monitor",
          productSku: "MON-001",
          quantity: 1,
          isRequired: false,
          discount: 15,
          position: 3,
        },
      ],
      pricing: {
        bundlePrice: 1599.99,
        totalRegularPrice: 1849.99,
        savings: 250.00,
        savingsPercentage: 13.5,
        discountType: "percentage",
      },
      rules: {
        minimumQuantity: 2,
        eligibleCategories: ["Electronics", "Business"],
        validFrom: new Date("2025-01-01"),
      },
      performance: {
        views: 3210,
        purchases: 156,
        conversionRate: 4.9,
        revenue: 249599.44,
        averageOrderValue: 1599.99,
      },
      createdAt: new Date("2024-11-15"),
      updatedAt: new Date("2025-01-12"),
    },
    {
      id: "bundle-3",
      name: "Student Special",
      description: "Special bundle for students with educational discount",
      type: "seasonal",
      status: "inactive",
      products: [
        {
          productId: productId,
          productName: "Student Laptop",
          productSku: "LAPTOP-STU-001",
          quantity: 1,
          isRequired: true,
          position: 1,
        },
        {
          productId: "bag-001",
          productName: "Laptop Bag",
          productSku: "BAG-001",
          quantity: 1,
          isRequired: true,
          discount: 30,
          position: 2,
        },
        {
          productId: "mouse-basic",
          productName: "Basic Mouse",
          productSku: "MOUSE-BASIC",
          quantity: 1,
          isRequired: false,
          discount: 50,
          position: 3,
        },
      ],
      pricing: {
        bundlePrice: 899.99,
        totalRegularPrice: 1149.99,
        savings: 250.00,
        savingsPercentage: 21.7,
        discountType: "percentage",
      },
      rules: {
        minimumQuantity: 2,
        eligibleCategories: ["Electronics", "Education"],
        validFrom: new Date("2024-08-01"),
        validUntil: new Date("2024-09-30"),
      },
      performance: {
        views: 8901,
        purchases: 445,
        conversionRate: 5.0,
        revenue: 400495.55,
        averageOrderValue: 899.99,
      },
      createdAt: new Date("2024-07-01"),
      updatedAt: new Date("2024-09-30"),
    },
  ]);

  const [recommendations] = useState<ProductRecommendation[]>([
    {
      id: "rec-1",
      type: "frequently_bought_together",
      targetProductId: productId,
      recommendedProducts: [
        {
          productId: "mouse-001",
          productName: "Gaming Mouse",
          productSku: "MOUSE-001",
          score: 95,
          reason: "Bought together 78% of the time",
          price: 89.99,
          category: "Accessories",
        },
        {
          productId: "keyboard-001",
          productName: "Mechanical Keyboard",
          productSku: "KB-001",
          score: 87,
          reason: "Highly correlated purchase",
          price: 149.99,
          category: "Accessories",
        },
        {
          productId: "cooling-pad",
          productName: "Laptop Cooling Pad",
          productSku: "COOL-001",
          score: 82,
          reason: "Popular accessory for this category",
          price: 49.99,
          category: "Accessories",
        },
      ],
      rules: {
        maxRecommendations: 5,
        minimumScore: 70,
        categories: ["Accessories", "Gaming"],
        excludeOutOfStock: true,
      },
      performance: {
        impressions: 15420,
        clicks: 1234,
        conversions: 156,
        clickThroughRate: 8.0,
        conversionRate: 12.6,
        revenue: 23456.78,
      },
      isActive: true,
      createdAt: new Date("2024-11-01"),
      updatedAt: new Date("2025-01-15"),
    },
    {
      id: "rec-2",
      type: "upsell",
      targetProductId: productId,
      recommendedProducts: [
        {
          productId: "laptop-pro",
          productName: "Gaming Laptop Pro",
          productSku: "LAPTOP-PRO-001",
          score: 91,
          reason: "Higher-end model with RTX 4080",
          price: 2499.99,
          category: "Laptops",
        },
        {
          productId: "laptop-ultra",
          productName: "Gaming Laptop Ultra",
          productSku: "LAPTOP-ULTRA-001",
          score: 85,
          reason: "Premium model with 32GB RAM",
          price: 2999.99,
          category: "Laptops",
        },
      ],
      rules: {
        maxRecommendations: 3,
        minimumScore: 80,
        priceRange: { min: 2000, max: 5000 },
        excludeOutOfStock: true,
      },
      performance: {
        impressions: 8901,
        clicks: 445,
        conversions: 34,
        clickThroughRate: 5.0,
        conversionRate: 7.6,
        revenue: 89997.66,
      },
      isActive: true,
      createdAt: new Date("2024-12-01"),
      updatedAt: new Date("2025-01-10"),
    },
    {
      id: "rec-3",
      type: "similar_products",
      targetProductId: productId,
      recommendedProducts: [
        {
          productId: "laptop-competitor",
          productName: "Competitor Gaming Laptop",
          productSku: "COMP-LAP-001",
          score: 88,
          reason: "Similar specs and price range",
          price: 1899.99,
          category: "Laptops",
        },
        {
          productId: "laptop-budget",
          productName: "Budget Gaming Laptop",
          productSku: "BUDGET-LAP-001",
          score: 75,
          reason: "Entry-level alternative",
          price: 1299.99,
          category: "Laptops",
        },
      ],
      rules: {
        maxRecommendations: 4,
        minimumScore: 70,
        categories: ["Laptops"],
        priceRange: { min: 1000, max: 3000 },
        excludeOutOfStock: true,
      },
      performance: {
        impressions: 6543,
        clicks: 327,
        conversions: 21,
        clickThroughRate: 5.0,
        conversionRate: 6.4,
        revenue: 29399.79,
      },
      isActive: true,
      createdAt: new Date("2024-10-15"),
      updatedAt: new Date("2025-01-08"),
    },
  ]);

  const [engines] = useState<RecommendationEngine[]>([
    {
      id: "engine-1",
      name: "Collaborative Filtering Engine",
      type: "collaborative_filtering",
      status: "active",
      description: "User-based collaborative filtering for personalized recommendations",
      configuration: {
        dataSource: ["purchase_history", "view_history", "ratings"],
        updateFrequency: "daily",
        minDataPoints: 100,
        confidenceThreshold: 0.75,
      },
      performance: {
        accuracy: 87.5,
        precision: 82.3,
        recall: 76.8,
        coverage: 89.2,
        lastTrainingDate: new Date("2025-01-15"),
        totalRecommendations: 45678,
      },
    },
    {
      id: "engine-2",
      name: "AI-Powered Recommendations",
      type: "ai_powered",
      status: "active",
      description: "Deep learning model for advanced product recommendations",
      configuration: {
        dataSource: ["purchase_history", "view_history", "product_attributes", "user_behavior"],
        updateFrequency: "real_time",
        minDataPoints: 500,
        confidenceThreshold: 0.80,
      },
      performance: {
        accuracy: 92.1,
        precision: 88.7,
        recall: 85.4,
        coverage: 94.6,
        lastTrainingDate: new Date("2025-01-16"),
        totalRecommendations: 123456,
      },
    },
    {
      id: "engine-3",
      name: "Rule-Based Engine",
      type: "rule_based",
      status: "active",
      description: "Business rule-driven recommendations for specific scenarios",
      configuration: {
        dataSource: ["product_categories", "pricing", "inventory"],
        updateFrequency: "hourly",
        minDataPoints: 50,
        confidenceThreshold: 0.70,
      },
      performance: {
        accuracy: 79.3,
        precision: 84.1,
        recall: 71.2,
        coverage: 78.9,
        lastTrainingDate: new Date("2025-01-16"),
        totalRecommendations: 23456,
      },
    },
  ]);

  const [activeTab, setActiveTab] = useState<"bundles" | "recommendations" | "engines" | "analytics" | "create">("bundles");

  const getBundleTypeColor = (type: string) => {
    switch (type) {
      case "fixed": return "blue";
      case "flexible": return "green";
      case "upsell": return "purple";
      case "cross_sell": return "orange";
      case "seasonal": return "yellow";
      default: return "gray";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "green";
      case "inactive": return "gray";
      case "draft": return "blue";
      case "archived": return "red";
      case "training": return "yellow";
      case "error": return "red";
      default: return "gray";
    }
  };

  const getRecommendationTypeColor = (type: string) => {
    switch (type) {
      case "frequently_bought_together": return "blue";
      case "similar_products": return "green";
      case "upsell": return "purple";
      case "cross_sell": return "orange";
      case "trending": return "red";
      case "personalized": return "pink";
      default: return "gray";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const getTotalBundleRevenue = () => {
    return bundles.reduce((total, bundle) => total + bundle.performance.revenue, 0);
  };

  const getAverageBundleConversion = () => {
    const total = bundles.reduce((sum, bundle) => sum + bundle.performance.conversionRate, 0);
    return total / bundles.length;
  };

  const getTotalRecommendationRevenue = () => {
    return recommendations.reduce((total, rec) => total + rec.performance.revenue, 0);
  };

  const handleCreateBundle = () => {
    notifications.show({
      color: "green",
      message: "Product bundle created successfully",
      title: "Success",
    });
  };

  const handleCreateRecommendation = () => {
    notifications.show({
      color: "green",
      message: "Recommendation rule created successfully",
      title: "Success",
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title={`Product Bundling & Recommendations - ${productName}`}
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <Stack>
        {/* Tab Navigation */}
        <Group>
          <Button
            variant={activeTab === "bundles" ? "filled" : "light"}
            onClick={() => setActiveTab("bundles")}
            leftSection={<IconBox size={16} />}
          >
            Bundles ({bundles.length})
          </Button>
          <Button
            variant={activeTab === "recommendations" ? "filled" : "light"}
            onClick={() => setActiveTab("recommendations")}
            leftSection={<IconBulb size={16} />}
          >
            Recommendations ({recommendations.length})
          </Button>
          <Button
            variant={activeTab === "engines" ? "filled" : "light"}
            onClick={() => setActiveTab("engines")}
            leftSection={<IconStar size={16} />}
          >
            Engines ({engines.length})
          </Button>
          <Button
            variant={activeTab === "analytics" ? "filled" : "light"}
            onClick={() => setActiveTab("analytics")}
            leftSection={<IconChartBar size={16} />}
          >
            Analytics
          </Button>
          <Button
            variant={activeTab === "create" ? "filled" : "light"}
            onClick={() => setActiveTab("create")}
            leftSection={<IconPlus size={16} />}
          >
            Create
          </Button>
        </Group>

        {/* Bundles Tab */}
        {activeTab === "bundles" && (
          <Stack>
            <Group justify="space-between">
              <Text fw={600} size="lg">Product Bundles</Text>
              <Button leftSection={<IconPlus size={16} />} size="sm">
                Create Bundle
              </Button>
            </Group>

            <Stack>
              {bundles.map((bundle) => (
                <Card key={bundle.id} withBorder>
                  <Group justify="space-between" mb="sm">
                    <div>
                      <Group gap="sm">
                        <Text fw={600}>{bundle.name}</Text>
                        <Badge color={getBundleTypeColor(bundle.type)} variant="light" size="sm">
                          {bundle.type.toUpperCase().replace("_", " ")}
                        </Badge>
                        <Badge color={getStatusColor(bundle.status)} variant="light" size="sm">
                          {bundle.status.toUpperCase()}
                        </Badge>
                      </Group>
                      <Text c="dimmed" size="sm">{bundle.description}</Text>
                    </div>
                    <Group gap="xs">
                      <ActionIcon variant="subtle">
                        <IconEye size={16} />
                      </ActionIcon>
                      <ActionIcon variant="subtle">
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" color="red">
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>

                  <SimpleGrid cols={4} spacing="md" mb="md">
                    <div>
                      <Text c="dimmed" size="xs">Bundle Price</Text>
                      <Text fw={600}>{formatCurrency(bundle.pricing.bundlePrice || 0)}</Text>
                    </div>
                    <div>
                      <Text c="dimmed" size="xs">Total Savings</Text>
                      <Text fw={600} c="green">
                        {formatCurrency(bundle.pricing.savings)} ({formatPercentage(bundle.pricing.savingsPercentage)})
                      </Text>
                    </div>
                    <div>
                      <Text c="dimmed" size="xs">Conversion Rate</Text>
                      <Text fw={600}>{formatPercentage(bundle.performance.conversionRate)}</Text>
                    </div>
                    <div>
                      <Text c="dimmed" size="xs">Revenue</Text>
                      <Text fw={600}>{formatCurrency(bundle.performance.revenue)}</Text>
                    </div>
                  </SimpleGrid>

                  {/* Bundle Products */}
                  <Card withBorder>
                    <Text fw={500} mb="sm" size="sm">Bundle Products ({bundle.products.length})</Text>
                    <Stack gap="xs">
                      {bundle.products.map((product, index) => (
                        <Group key={index} justify="space-between">
                          <div>
                            <Group gap="sm">
                              <Text fw={500} size="sm">{product.productName}</Text>
                              <Text c="dimmed" size="xs">SKU: {product.productSku}</Text>
                              {product.isRequired && (
                                <Badge color="red" variant="light" size="xs">REQUIRED</Badge>
                              )}
                              {product.discount && (
                                <Badge color="green" variant="light" size="xs">
                                  -{product.discount}%
                                </Badge>
                              )}
                            </Group>
                          </div>
                          <Text size="sm">Qty: {product.quantity}</Text>
                        </Group>
                      ))}
                    </Stack>
                  </Card>

                  {/* Performance Metrics */}
                  <SimpleGrid cols={3} spacing="md" mt="md">
                    <div>
                      <Text c="dimmed" size="xs">Views</Text>
                      <Text fw={500}>{bundle.performance.views.toLocaleString()}</Text>
                    </div>
                    <div>
                      <Text c="dimmed" size="xs">Purchases</Text>
                      <Text fw={500}>{bundle.performance.purchases.toLocaleString()}</Text>
                    </div>
                    <div>
                      <Text c="dimmed" size="xs">AOV</Text>
                      <Text fw={500}>{formatCurrency(bundle.performance.averageOrderValue)}</Text>
                    </div>
                  </SimpleGrid>
                </Card>
              ))}
            </Stack>
          </Stack>
        )}

        {/* Recommendations Tab */}
        {activeTab === "recommendations" && (
          <Stack>
            <Group justify="space-between">
              <Text fw={600} size="lg">Product Recommendations</Text>
              <Button leftSection={<IconPlus size={16} />} size="sm">
                Create Recommendation
              </Button>
            </Group>

            <Stack>
              {recommendations.map((rec) => (
                <Card key={rec.id} withBorder>
                  <Group justify="space-between" mb="sm">
                    <div>
                      <Group gap="sm">
                        <Text fw={600}>{rec.type.replace(/_/g, " ").toUpperCase()}</Text>
                        <Badge color={getRecommendationTypeColor(rec.type)} variant="light" size="sm">
                          {rec.recommendedProducts.length} Products
                        </Badge>
                        <Badge color={rec.isActive ? "green" : "gray"} variant="light" size="sm">
                          {rec.isActive ? "ACTIVE" : "INACTIVE"}
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

                  <SimpleGrid cols={4} spacing="md" mb="md">
                    <div>
                      <Text c="dimmed" size="xs">Click Through Rate</Text>
                      <Text fw={600}>{formatPercentage(rec.performance.clickThroughRate)}</Text>
                    </div>
                    <div>
                      <Text c="dimmed" size="xs">Conversion Rate</Text>
                      <Text fw={600}>{formatPercentage(rec.performance.conversionRate)}</Text>
                    </div>
                    <div>
                      <Text c="dimmed" size="xs">Revenue</Text>
                      <Text fw={600}>{formatCurrency(rec.performance.revenue)}</Text>
                    </div>
                    <div>
                      <Text c="dimmed" size="xs">Impressions</Text>
                      <Text fw={600}>{rec.performance.impressions.toLocaleString()}</Text>
                    </div>
                  </SimpleGrid>

                  {/* Recommended Products */}
                  <Card withBorder>
                    <Text fw={500} mb="sm" size="sm">Recommended Products</Text>
                    <Stack gap="xs">
                      {rec.recommendedProducts.map((product, index) => (
                        <Group key={index} justify="space-between">
                          <div>
                            <Group gap="sm">
                              <Text fw={500} size="sm">{product.productName}</Text>
                              <Badge color="blue" variant="outline" size="xs">
                                Score: {product.score}
                              </Badge>
                              <Text c="dimmed" size="xs">{product.reason}</Text>
                            </Group>
                          </div>
                          <Group gap="xs">
                            <Text size="sm">{formatCurrency(product.price)}</Text>
                            <Progress value={product.score} size="sm" w={60} />
                          </Group>
                        </Group>
                      ))}
                    </Stack>
                  </Card>
                </Card>
              ))}
            </Stack>
          </Stack>
        )}

        {/* Engines Tab */}
        {activeTab === "engines" && (
          <Stack>
            <Group justify="space-between">
              <Text fw={600} size="lg">Recommendation Engines</Text>
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
                        <Badge color={getStatusColor(engine.status)} variant="light" size="sm">
                          {engine.status.toUpperCase()}
                        </Badge>
                        <Badge color="blue" variant="outline" size="sm">
                          {engine.type.replace(/_/g, " ").toUpperCase()}
                        </Badge>
                      </Group>
                      <Text c="dimmed" size="sm">{engine.description}</Text>
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

                  <SimpleGrid cols={4} spacing="md" mb="md">
                    <div>
                      <Text c="dimmed" size="xs">Accuracy</Text>
                      <Group gap="xs">
                        <Text fw={600}>{formatPercentage(engine.performance.accuracy)}</Text>
                        <Progress value={engine.performance.accuracy} size="sm" style={{ flex: 1 }} />
                      </Group>
                    </div>
                    <div>
                      <Text c="dimmed" size="xs">Precision</Text>
                      <Group gap="xs">
                        <Text fw={600}>{formatPercentage(engine.performance.precision)}</Text>
                        <Progress value={engine.performance.precision} size="sm" style={{ flex: 1 }} />
                      </Group>
                    </div>
                    <div>
                      <Text c="dimmed" size="xs">Coverage</Text>
                      <Group gap="xs">
                        <Text fw={600}>{formatPercentage(engine.performance.coverage)}</Text>
                        <Progress value={engine.performance.coverage} size="sm" style={{ flex: 1 }} />
                      </Group>
                    </div>
                    <div>
                      <Text c="dimmed" size="xs">Total Recs</Text>
                      <Text fw={600}>{engine.performance.totalRecommendations.toLocaleString()}</Text>
                    </div>
                  </SimpleGrid>

                  <Group gap="md">
                    <Text size="sm">
                      <Text c="dimmed" span>Update Frequency:</Text> {engine.configuration.updateFrequency.replace("_", " ")}
                    </Text>
                    <Text size="sm">
                      <Text c="dimmed" span>Last Training:</Text> {formatDate(engine.performance.lastTrainingDate)}
                    </Text>
                    <Text size="sm">
                      <Text c="dimmed" span>Confidence:</Text> {formatPercentage(engine.configuration.confidenceThreshold * 100)}
                    </Text>
                  </Group>
                </Card>
              ))}
            </Stack>
          </Stack>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <Stack>
            <Text fw={600} size="lg">Bundling & Recommendations Analytics</Text>

            <SimpleGrid cols={3} spacing="md">
              <Card withBorder>
                <Text c="dimmed" size="sm">Total Bundle Revenue</Text>
                <Text fw={700} size="xl">{formatCurrency(getTotalBundleRevenue())}</Text>
                <Text c="dimmed" size="xs">From {bundles.length} active bundles</Text>
              </Card>
              <Card withBorder>
                <Text c="dimmed" size="sm">Avg Bundle Conversion</Text>
                <Text fw={700} size="xl">{formatPercentage(getAverageBundleConversion())}</Text>
                <Text c="dimmed" size="xs">Across all bundles</Text>
              </Card>
              <Card withBorder>
                <Text c="dimmed" size="sm">Recommendation Revenue</Text>
                <Text fw={700} size="xl">{formatCurrency(getTotalRecommendationRevenue())}</Text>
                <Text c="dimmed" size="xs">From recommendation clicks</Text>
              </Card>
            </SimpleGrid>

            {/* Bundle Performance */}
            <Card withBorder>
              <Text fw={500} mb="md">Bundle Performance Comparison</Text>
              <Stack gap="md">
                {bundles.map((bundle) => (
                  <div key={bundle.id}>
                    <Group justify="space-between" mb="xs">
                      <Text fw={500} size="sm">{bundle.name}</Text>
                      <Text size="sm">{formatCurrency(bundle.performance.revenue)}</Text>
                    </Group>
                    <SimpleGrid cols={3} spacing="md">
                      <div>
                        <Text c="dimmed" size="xs">Conversion Rate</Text>
                        <Progress value={bundle.performance.conversionRate * 10} color="green" size="sm" />
                        <Text size="xs">{formatPercentage(bundle.performance.conversionRate)}</Text>
                      </div>
                      <div>
                        <Text c="dimmed" size="xs">Views</Text>
                        <Text size="sm" fw={500}>{bundle.performance.views.toLocaleString()}</Text>
                      </div>
                      <div>
                        <Text c="dimmed" size="xs">Purchases</Text>
                        <Text size="sm" fw={500}>{bundle.performance.purchases.toLocaleString()}</Text>
                      </div>
                    </SimpleGrid>
                  </div>
                ))}
              </Stack>
            </Card>

            {/* Recommendation Performance */}
            <Card withBorder>
              <Text fw={500} mb="md">Recommendation Performance</Text>
              <Stack gap="md">
                {recommendations.map((rec) => (
                  <div key={rec.id}>
                    <Group justify="space-between" mb="xs">
                      <Text fw={500} size="sm">{rec.type.replace(/_/g, " ").toUpperCase()}</Text>
                      <Text size="sm">{formatCurrency(rec.performance.revenue)}</Text>
                    </Group>
                    <SimpleGrid cols={3} spacing="md">
                      <div>
                        <Text c="dimmed" size="xs">CTR</Text>
                        <Progress value={rec.performance.clickThroughRate * 10} color="blue" size="sm" />
                        <Text size="xs">{formatPercentage(rec.performance.clickThroughRate)}</Text>
                      </div>
                      <div>
                        <Text c="dimmed" size="xs">Conversion Rate</Text>
                        <Progress value={rec.performance.conversionRate * 10} color="green" size="sm" />
                        <Text size="xs">{formatPercentage(rec.performance.conversionRate)}</Text>
                      </div>
                      <div>
                        <Text c="dimmed" size="xs">Impressions</Text>
                        <Text size="sm" fw={500}>{rec.performance.impressions.toLocaleString()}</Text>
                      </div>
                    </SimpleGrid>
                  </div>
                ))}
              </Stack>
            </Card>
          </Stack>
        )}

        {/* Create Tab */}
        {activeTab === "create" && (
          <Stack>
            <Text fw={600} size="lg">Create Bundle or Recommendation</Text>

            <SimpleGrid cols={2} spacing="xl">
              {/* Create Bundle */}
              <Card withBorder>
                <Stack>
                  <Text fw={500}>Create Product Bundle</Text>
                  <TextInput
                    label="Bundle Name"
                    placeholder="e.g., Gaming Starter Kit"
                    required
                  />
                  <Textarea
                    label="Description"
                    placeholder="Describe the bundle"
                    rows={3}
                  />
                  <Select
                    label="Bundle Type"
                    data={[
                      { value: "fixed", label: "Fixed Bundle" },
                      { value: "flexible", label: "Flexible Bundle" },
                      { value: "upsell", label: "Upsell Bundle" },
                      { value: "cross_sell", label: "Cross-sell Bundle" },
                      { value: "seasonal", label: "Seasonal Bundle" },
                    ]}
                    required
                  />
                  <NumberInput
                    label="Bundle Price"
                    placeholder="0.00"
                    leftSection={<IconCurrency size={16} />}
                    decimalScale={2}
                  />
                  <NumberInput
                    label="Discount Percentage"
                    placeholder="0"
                    rightSection="%"
                    min={0}
                    max={100}
                  />
                  <Button onClick={handleCreateBundle} fullWidth>
                    Create Bundle
                  </Button>
                </Stack>
              </Card>

              {/* Create Recommendation */}
              <Card withBorder>
                <Stack>
                  <Text fw={500}>Create Recommendation Rule</Text>
                  <Select
                    label="Recommendation Type"
                    data={[
                      { value: "frequently_bought_together", label: "Frequently Bought Together" },
                      { value: "similar_products", label: "Similar Products" },
                      { value: "upsell", label: "Upsell Recommendations" },
                      { value: "cross_sell", label: "Cross-sell Recommendations" },
                      { value: "trending", label: "Trending Products" },
                      { value: "personalized", label: "Personalized Recommendations" },
                    ]}
                    required
                  />
                  <NumberInput
                    label="Max Recommendations"
                    placeholder="5"
                    min={1}
                    max={20}
                  />
                  <NumberInput
                    label="Minimum Score"
                    placeholder="70"
                    min={0}
                    max={100}
                    rightSection="%"
                  />
                  <Select
                    label="Recommendation Engine"
                    data={engines.map(engine => ({
                      value: engine.id,
                      label: engine.name,
                    }))}
                  />
                  <Checkbox
                    label="Exclude out of stock products"
                    defaultChecked
                  />
                  <Button onClick={handleCreateRecommendation} fullWidth>
                    Create Recommendation
                  </Button>
                </Stack>
              </Card>
            </SimpleGrid>
          </Stack>
        )}
      </Stack>
    </Modal>
  );
}