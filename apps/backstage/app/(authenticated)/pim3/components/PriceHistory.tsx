'use client';

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconCalendar,
  IconCurrency,
  IconEdit,
  IconPercentage,
  IconPlus,
  IconTag,
  IconTrendingDown,
  IconTrendingUp,
  IconX,
} from '@tabler/icons-react';
import { useState } from 'react';

// Price history and promotional pricing data structures (UI only)
interface PriceHistoryEntry {
  changeAmount: number;
  changePercentage: number;
  changeType: 'increase' | 'decrease' | 'promotional' | 'regular' | 'manual';
  createdBy: string;
  currency: string;
  effectiveDate: Date;
  endDate?: Date;
  id: string;
  isActive: boolean;
  metadata?: {
    promotionCode?: string;
    promotionType?: string;
    originalPrice?: number;
    discount?: number;
  };
  price: number;
  reason: string;
}

interface PromotionalPricing {
  createdAt: Date;
  createdBy: string;
  discountAmount?: number;
  discountedPrice?: number;
  discountPercentage?: number;
  endDate: Date;
  id: string;
  name: string;
  originalPrice: number;
  performance?: {
    views: number;
    clicks: number;
    conversions: number;
    revenue: number;
  };
  rules?: {
    minimumQuantity?: number;
    maximumQuantity?: number;
    applicableVariants?: string[];
    couponCode?: string;
    usageLimit?: number;
    usageCount?: number;
  };
  startDate: Date;
  status: 'active' | 'scheduled' | 'ended' | 'cancelled';
  type: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'tiered' | 'flash_sale';
}

interface CompetitorPricing {
  availability: 'in_stock' | 'out_of_stock' | 'limited' | 'unknown';
  competitorName: string;
  currency: string;
  id: string;
  lastChecked: Date;
  price: number;
  priceChange: number;
  priceChangePercentage: number;
  shippingCost?: number;
  totalCost: number;
  url: string;
}

interface PriceHistoryProps {
  currentPrice: number;
  onUpdate?: () => void;
  productId: string;
  productName: string;
}

export function PriceHistory({
  currentPrice,
  onUpdate,
  productId,
  productName,
}: PriceHistoryProps) {
  // Create local form for price history
  const form = useForm({
    initialValues: {
      priceHistory: [] as PriceEntry[],
      promotions: [] as PromotionEntry[],
    },
  });

  // Get data from form
  const priceHistory = form.values.priceHistory || [];
  const promotions = form.values.promotions || [];
  // Local state for competitor prices (not in form context)
  const [competitorPrices] = useState<CompetitorPricing[]>([
    {
      id: 'comp-1',
      url: 'https://amazon.com/similar-product',
      availability: 'in_stock',
      competitorName: 'Amazon',
      currency: 'USD',
      lastChecked: new Date('2025-01-16'),
      price: 279.99,
      priceChange: -5.0,
      priceChangePercentage: -1.75,
      shippingCost: 8.99,
      totalCost: 288.98,
    },
    {
      id: 'comp-2',
      url: 'https://bestbuy.com/similar-product',
      availability: 'in_stock',
      competitorName: 'Best Buy',
      currency: 'USD',
      lastChecked: new Date('2025-01-16'),
      price: 299.99,
      priceChange: 0,
      priceChangePercentage: 0,
      shippingCost: 0,
      totalCost: 299.99,
    },
    {
      id: 'comp-3',
      url: 'https://target.com/similar-product',
      availability: 'limited',
      competitorName: 'Target',
      currency: 'USD',
      lastChecked: new Date('2025-01-15'),
      price: 319.99,
      priceChange: 10.0,
      priceChangePercentage: 3.23,
      shippingCost: 5.99,
      totalCost: 325.98,
    },
    {
      id: 'comp-4',
      url: 'https://walmart.com/similar-product',
      availability: 'out_of_stock',
      competitorName: 'Walmart',
      currency: 'USD',
      lastChecked: new Date('2025-01-14'),
      price: 0,
      priceChange: 0,
      priceChangePercentage: 0,
      totalCost: 0,
    },
  ]);

  const [activeTab, setActiveTab] = useState<'history' | 'promotions' | 'competitors' | 'create'>(
    'history',
  );

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'increase':
        return 'red';
      case 'decrease':
        return 'green';
      case 'promotional':
        return 'orange';
      case 'regular':
        return 'blue';
      case 'manual':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'scheduled':
        return 'blue';
      case 'ended':
        return 'gray';
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'in_stock':
        return 'green';
      case 'limited':
        return 'yellow';
      case 'out_of_stock':
        return 'red';
      case 'unknown':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      currency,
      style: 'currency',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const getCurrentPromotion = () => {
    return promotions.find((p) => p.status === 'active');
  };

  const getAverageCompetitorPrice = () => {
    const inStockCompetitors = competitorPrices.filter(
      (c) => c.availability === 'in_stock' && c.price > 0,
    );
    if (inStockCompetitors.length === 0) return 0;
    return inStockCompetitors.reduce((sum, c) => sum + c.totalCost, 0) / inStockCompetitors.length;
  };

  const handleCreatePromotion = () => {
    const promotionalForm = form.values.promotionalForm;
    if (!promotionalForm?.name || !promotionalForm?.startDate || !promotionalForm?.endDate) {
      notifications.show({
        color: 'red',
        message: 'Please fill in all required fields',
        title: 'Error',
      });
      return;
    }

    const newPromotion = {
      id: `promo-${Date.now()}`,
      name: promotionalForm.name,
      type: promotionalForm.type,
      createdAt: new Date(),
      createdBy: 'current.user',
      discountAmount: promotionalForm.discountAmount,
      discountedPrice:
        promotionalForm.type === 'percentage'
          ? currentPrice * (1 - promotionalForm.discountPercentage / 100)
          : currentPrice - promotionalForm.discountAmount,
      discountPercentage: promotionalForm.discountPercentage,
      endDate: promotionalForm.endDate,
      originalPrice: currentPrice,
      performance: {
        clicks: 0,
        conversions: 0,
        revenue: 0,
        views: 0,
      },
      rules: {},
      startDate: promotionalForm.startDate,
      status: 'scheduled',
    };

    form.setFieldValue('promotions', [...promotions, newPromotion]);

    // Reset form
    form.setFieldValue('promotionalForm', {
      name: '',
      type: 'percentage',
      discountAmount: 0,
      discountPercentage: 0,
      endDate: null,
      startDate: null,
    });

    notifications.show({
      color: 'green',
      message: 'Promotional pricing created successfully',
      title: 'Success',
    });
  };

  const handleUpdatePrice = () => {
    const newPrice = form.values.priceUpdateForm?.newPrice;
    if (!newPrice || newPrice <= 0) {
      notifications.show({
        color: 'red',
        message: 'Please enter a valid price',
        title: 'Error',
      });
      return;
    }

    const changeAmount = newPrice - currentPrice;
    const changePercentage = (changeAmount / currentPrice) * 100;

    const newEntry = {
      id: `ph-${Date.now()}`,
      changeAmount,
      changePercentage,
      changeType: form.values.priceUpdateForm?.changeType || 'manual',
      createdBy: 'current.user',
      currency: 'USD',
      effectiveDate: form.values.priceUpdateForm?.effectiveDate || new Date(),
      isActive: true,
      price: newPrice,
      reason: form.values.priceUpdateForm?.reason || 'Manual price update',
    };

    // Mark all previous entries as inactive
    const updatedHistory = priceHistory.map((entry) => ({ ...entry, isActive: false }));
    form.setFieldValue('priceHistory', [...updatedHistory, newEntry]);

    notifications.show({
      color: 'green',
      message: 'Price updated successfully',
      title: 'Success',
    });
  };

  return (
    <Stack>
      {/* Tab Navigation */}
      <Group>
        <Button
          leftSection={<IconCurrency size={16} />}
          onClick={() => setActiveTab('history')}
          variant={activeTab === 'history' ? 'filled' : 'light'}
        >
          Price History
        </Button>
        <Button
          leftSection={<IconTag size={16} />}
          onClick={() => setActiveTab('promotions')}
          variant={activeTab === 'promotions' ? 'filled' : 'light'}
        >
          Promotions ({promotions.filter((p) => p.status === 'active').length})
        </Button>
        <Button
          leftSection={<IconTrendingUp size={16} />}
          onClick={() => setActiveTab('competitors')}
          variant={activeTab === 'competitors' ? 'filled' : 'light'}
        >
          Competitor Pricing
        </Button>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => setActiveTab('create')}
          variant={activeTab === 'create' ? 'filled' : 'light'}
        >
          Create
        </Button>
      </Group>

      {/* Current Price Overview */}
      <Card withBorder style={{ backgroundColor: 'var(--mantine-color-blue-0)' }}>
        <Group justify="space-between">
          <div>
            <Text fw={600} size="lg">
              Current Price
            </Text>
            <Text c="dimmed" size="sm">
              {getCurrentPromotion() ? 'Promotional pricing active' : 'Regular pricing'}
            </Text>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Text fw={700} size="xl">
              {formatCurrency(currentPrice)}
            </Text>
            {getCurrentPromotion() && (
              <Group gap="xs" justify="flex-end">
                <Text style={{ textDecoration: 'line-through' }} c="dimmed" size="sm">
                  {formatCurrency(getCurrentPromotion()!.originalPrice)}
                </Text>
                <Badge color="red" size="sm" variant="filled">
                  -{getCurrentPromotion()!.discountPercentage}%
                </Badge>
              </Group>
            )}
          </div>
        </Group>
      </Card>

      {/* Price History Tab */}
      {activeTab === 'history' && (
        <Stack>
          <Group justify="space-between">
            <Text fw={600} size="lg">
              Price History
            </Text>
            <Button leftSection={<IconPlus size={16} />} size="sm">
              Add Price Change
            </Button>
          </Group>

          <Table highlightOnHover striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Price</Table.Th>
                <Table.Th>Change</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Reason</Table.Th>
                <Table.Th>Created By</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {priceHistory
                .slice()
                .reverse()
                .map((entry) => (
                  <Table.Tr key={entry.id}>
                    <Table.Td>{formatDate(entry.effectiveDate)}</Table.Td>
                    <Table.Td>
                      <Text fw={500}>{formatCurrency(entry.price, entry.currency)}</Text>
                    </Table.Td>
                    <Table.Td>
                      {entry.changeAmount !== 0 && (
                        <Group gap="xs">
                          <Text c={entry.changeAmount > 0 ? 'red' : 'green'} fw={500} size="sm">
                            {entry.changeAmount > 0 ? '+' : ''}
                            {formatCurrency(entry.changeAmount)}
                          </Text>
                          <Text c="dimmed" size="xs">
                            ({entry.changePercentage > 0 ? '+' : ''}
                            {entry.changePercentage.toFixed(1)}%)
                          </Text>
                        </Group>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={getChangeTypeColor(entry.changeType)}
                        leftSection={
                          entry.changeType === 'increase' ? (
                            <IconTrendingUp size={12} />
                          ) : entry.changeType === 'decrease' ? (
                            <IconTrendingDown size={12} />
                          ) : entry.changeType === 'promotional' ? (
                            <IconTag size={12} />
                          ) : undefined
                        }
                        size="sm"
                        variant="light"
                      >
                        {entry.changeType.toUpperCase().replace('_', ' ')}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{entry.reason}</Text>
                      {entry.endDate && (
                        <Text c="dimmed" size="xs">
                          Until {formatDate(entry.endDate)}
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>{entry.createdBy}</Table.Td>
                    <Table.Td>
                      <Badge color={entry.isActive ? 'green' : 'gray'} size="sm" variant="light">
                        {entry.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
            </Table.Tbody>
          </Table>
        </Stack>
      )}

      {/* Promotions Tab */}
      {activeTab === 'promotions' && (
        <Stack>
          <Group justify="space-between">
            <Text fw={600} size="lg">
              Promotional Pricing
            </Text>
            <Button leftSection={<IconPlus size={16} />} size="sm">
              Create Promotion
            </Button>
          </Group>

          <Stack>
            {promotions.map((promotion) => (
              <Card key={promotion.id} withBorder>
                <Group justify="space-between" mb="sm">
                  <div>
                    <Group gap="sm">
                      <Text fw={600}>{promotion.name}</Text>
                      <Badge color={getStatusColor(promotion.status)} size="sm" variant="light">
                        {promotion.status.toUpperCase()}
                      </Badge>
                      <Badge color="blue" size="sm" variant="outline">
                        {promotion.type.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </Group>
                    <Text c="dimmed" size="sm">
                      {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                    </Text>
                  </div>
                  <Group gap="xs">
                    <ActionIcon variant="subtle">
                      <IconEdit size={16} />
                    </ActionIcon>
                    {promotion.status === 'active' && (
                      <ActionIcon color="red" variant="subtle">
                        <IconX size={16} />
                      </ActionIcon>
                    )}
                  </Group>
                </Group>

                <SimpleGrid cols={3} spacing="md">
                  <div>
                    <Text c="dimmed" size="xs">
                      Original Price
                    </Text>
                    <Text fw={500}>{formatCurrency(promotion.originalPrice)}</Text>
                  </div>
                  <div>
                    <Text c="dimmed" size="xs">
                      Discounted Price
                    </Text>
                    <Text c="green" fw={500}>
                      {promotion.discountedPrice
                        ? formatCurrency(promotion.discountedPrice)
                        : 'N/A'}
                    </Text>
                  </div>
                  <div>
                    <Text c="dimmed" size="xs">
                      Discount
                    </Text>
                    <Group gap="xs">
                      {promotion.discountAmount && (
                        <Text c="red" fw={500}>
                          -{formatCurrency(promotion.discountAmount)}
                        </Text>
                      )}
                      {promotion.discountPercentage && (
                        <Text c="red" fw={500}>
                          ({promotion.discountPercentage}%)
                        </Text>
                      )}
                    </Group>
                  </div>
                </SimpleGrid>

                {promotion.rules && (
                  <Group gap="md" mt="sm">
                    {promotion.rules.couponCode && (
                      <Text size="sm">
                        <Text c="dimmed" span>
                          Code:
                        </Text>{' '}
                        {promotion.rules.couponCode}
                      </Text>
                    )}
                    {promotion.rules.usageLimit && (
                      <Text size="sm">
                        <Text c="dimmed" span>
                          Usage:
                        </Text>{' '}
                        {promotion.rules.usageCount}/{promotion.rules.usageLimit}
                      </Text>
                    )}
                    {promotion.rules.minimumQuantity && (
                      <Text size="sm">
                        <Text c="dimmed" span>
                          Min Qty:
                        </Text>{' '}
                        {promotion.rules.minimumQuantity}
                      </Text>
                    )}
                  </Group>
                )}

                {promotion.performance && (
                  <Card withBorder mt="md">
                    <Text fw={500} mb="sm" size="sm">
                      Performance
                    </Text>
                    <SimpleGrid cols={4} spacing="md">
                      <div>
                        <Text c="dimmed" size="xs">
                          Views
                        </Text>
                        <Text fw={500}>{promotion.performance.views.toLocaleString()}</Text>
                      </div>
                      <div>
                        <Text c="dimmed" size="xs">
                          Clicks
                        </Text>
                        <Text fw={500}>{promotion.performance.clicks.toLocaleString()}</Text>
                      </div>
                      <div>
                        <Text c="dimmed" size="xs">
                          Conversions
                        </Text>
                        <Text fw={500}>{promotion.performance.conversions.toLocaleString()}</Text>
                      </div>
                      <div>
                        <Text c="dimmed" size="xs">
                          Revenue
                        </Text>
                        <Text fw={500}>{formatCurrency(promotion.performance.revenue)}</Text>
                      </div>
                    </SimpleGrid>
                  </Card>
                )}
              </Card>
            ))}
          </Stack>
        </Stack>
      )}

      {/* Competitors Tab */}
      {activeTab === 'competitors' && (
        <Stack>
          <Group justify="space-between">
            <Text fw={600} size="lg">
              Competitor Pricing
            </Text>
            <Text c="dimmed" size="sm">
              Avg. competitor price: {formatCurrency(getAverageCompetitorPrice())}
            </Text>
          </Group>

          <Stack>
            {competitorPrices.map((competitor) => (
              <Card key={competitor.id} withBorder>
                <Group justify="space-between">
                  <div>
                    <Group gap="sm">
                      <Text fw={600}>{competitor.competitorName}</Text>
                      <Badge
                        color={getAvailabilityColor(competitor.availability)}
                        size="sm"
                        variant="light"
                      >
                        {competitor.availability.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {competitor.priceChange !== 0 && (
                        <Badge
                          color={competitor.priceChange > 0 ? 'red' : 'green'}
                          size="sm"
                          variant="outline"
                        >
                          {competitor.priceChange > 0 ? '+' : ''}
                          {formatCurrency(competitor.priceChange)}
                        </Badge>
                      )}
                    </Group>
                    <Text c="dimmed" size="sm">
                      Last checked: {formatDateTime(competitor.lastChecked)}
                    </Text>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {competitor.price > 0 ? (
                      <>
                        <Text fw={600} size="lg">
                          {formatCurrency(competitor.price)}
                        </Text>
                        {competitor.shippingCost && competitor.shippingCost > 0 && (
                          <Text c="dimmed" size="sm">
                            + {formatCurrency(competitor.shippingCost)} shipping
                          </Text>
                        )}
                        <Text fw={500} size="sm">
                          Total: {formatCurrency(competitor.totalCost)}
                        </Text>
                      </>
                    ) : (
                      <Text c="red" fw={500}>
                        Out of Stock
                      </Text>
                    )}
                  </div>
                </Group>
              </Card>
            ))}
          </Stack>

          {/* Price Comparison */}
          <Card withBorder style={{ backgroundColor: 'var(--mantine-color-orange-0)' }}>
            <Group justify="space-between">
              <div>
                <Text fw={500}>Price Position</Text>
                <Text c="dimmed" size="sm">
                  Your price vs. competitor average
                </Text>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Text fw={600} size="lg">
                  {currentPrice > getAverageCompetitorPrice() ? 'ABOVE' : 'BELOW'} Average
                </Text>
                <Text c={currentPrice > getAverageCompetitorPrice() ? 'red' : 'green'} fw={500}>
                  {formatCurrency(Math.abs(currentPrice - getAverageCompetitorPrice()))} difference
                </Text>
              </div>
            </Group>
          </Card>
        </Stack>
      )}

      {/* Create Tab */}
      {activeTab === 'create' && (
        <Stack>
          <Text fw={600} size="lg">
            Create Price Change or Promotion
          </Text>

          <SimpleGrid cols={2} spacing="xl">
            {/* Manual Price Update */}
            <Card withBorder>
              <Stack>
                <Text fw={500}>Manual Price Update</Text>
                <NumberInput
                  leftSection={<IconCurrency size={16} />}
                  placeholder="Enter new price"
                  decimalScale={2}
                  label="New Price"
                  min={0}
                  step={0.01}
                  {...form.getInputProps('priceUpdateForm.newPrice')}
                />
                <Select
                  label="Change Type"
                  {...form.getInputProps('priceUpdateForm.changeType')}
                  data={[
                    { label: 'Regular Price Change', value: 'regular' },
                    { label: 'Manual Adjustment', value: 'manual' },
                    { label: 'Price Increase', value: 'increase' },
                    { label: 'Price Decrease', value: 'decrease' },
                  ]}
                />
                <TextInput
                  placeholder="Reason for price change"
                  label="Reason"
                  {...form.getInputProps('priceUpdateForm.reason')}
                />
                <DatePickerInput
                  leftSection={<IconCalendar size={16} />}
                  placeholder="Select effective date"
                  label="Effective Date"
                  {...form.getInputProps('priceUpdateForm.effectiveDate')}
                />
                <Button fullWidth onClick={handleUpdatePrice}>
                  Update Price
                </Button>
              </Stack>
            </Card>

            {/* Create Promotion */}
            <Card withBorder>
              <Stack>
                <Text fw={500}>Create Promotion</Text>
                <TextInput
                  placeholder="e.g., Spring Sale 2025"
                  label="Promotion Name"
                  {...form.getInputProps('promotionalForm.name')}
                />
                <Select
                  label="Promotion Type"
                  {...form.getInputProps('promotionalForm.type')}
                  data={[
                    { label: 'Percentage Discount', value: 'percentage' },
                    { label: 'Fixed Amount Off', value: 'fixed_amount' },
                    { label: 'Flash Sale', value: 'flash_sale' },
                    { label: 'Buy X Get Y', value: 'buy_x_get_y' },
                  ]}
                />
                <NumberInput
                  leftSection={<IconPercentage size={16} />}
                  placeholder="Discount amount or percentage"
                  label="Discount"
                  min={0}
                  {...form.getInputProps(
                    form.values.promotionalForm?.type === 'percentage'
                      ? 'promotionalForm.discountPercentage'
                      : 'promotionalForm.discountAmount',
                  )}
                />
                <Group grow>
                  <DatePickerInput
                    leftSection={<IconCalendar size={16} />}
                    placeholder="Promotion start"
                    label="Start Date"
                    {...form.getInputProps('promotionalForm.startDate')}
                  />
                  <DatePickerInput
                    leftSection={<IconCalendar size={16} />}
                    placeholder="Promotion end"
                    label="End Date"
                    {...form.getInputProps('promotionalForm.endDate')}
                  />
                </Group>
                <TextInput
                  placeholder="e.g., SPRING25"
                  label="Coupon Code (Optional)"
                  {...form.getInputProps('promotionalForm.couponCode')}
                />
                <Button fullWidth onClick={handleCreatePromotion}>
                  Create Promotion
                </Button>
              </Stack>
            </Card>
          </SimpleGrid>
        </Stack>
      )}
    </Stack>
  );
}
