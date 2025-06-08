"use client";

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Modal,
  NumberInput,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
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
} from "@tabler/icons-react";
import { useState } from "react";

// Price history and promotional pricing data structures (UI only)
interface PriceHistoryEntry {
  id: string;
  price: number;
  currency: string;
  changeType: "increase" | "decrease" | "promotional" | "regular" | "manual";
  changeAmount: number;
  changePercentage: number;
  effectiveDate: Date;
  endDate?: Date;
  reason: string;
  createdBy: string;
  isActive: boolean;
  metadata?: {
    promotionCode?: string;
    promotionType?: string;
    originalPrice?: number;
    discount?: number;
  };
}

interface PromotionalPricing {
  id: string;
  name: string;
  type: "percentage" | "fixed_amount" | "buy_x_get_y" | "tiered" | "flash_sale";
  status: "active" | "scheduled" | "ended" | "cancelled";
  startDate: Date;
  endDate: Date;
  originalPrice: number;
  discountedPrice?: number;
  discountAmount?: number;
  discountPercentage?: number;
  rules?: {
    minimumQuantity?: number;
    maximumQuantity?: number;
    applicableVariants?: string[];
    couponCode?: string;
    usageLimit?: number;
    usageCount?: number;
  };
  performance?: {
    views: number;
    clicks: number;
    conversions: number;
    revenue: number;
  };
  createdBy: string;
  createdAt: Date;
}

interface CompetitorPricing {
  id: string;
  competitorName: string;
  price: number;
  currency: string;
  url: string;
  lastChecked: Date;
  priceChange: number;
  priceChangePercentage: number;
  availability: "in_stock" | "out_of_stock" | "limited" | "unknown";
  shippingCost?: number;
  totalCost: number;
}

interface PriceHistoryModalProps {
  opened: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  currentPrice: number;
  onUpdate?: () => void;
}

export function PriceHistoryModal({
  opened,
  onClose,
  productId,
  productName,
  currentPrice,
  onUpdate,
}: PriceHistoryModalProps) {
  // Demo data
  const [priceHistory] = useState<PriceHistoryEntry[]>([
    {
      id: "ph-1",
      price: 299.99,
      currency: "USD",
      changeType: "regular",
      changeAmount: 0,
      changePercentage: 0,
      effectiveDate: new Date("2024-01-01"),
      reason: "Initial product pricing",
      createdBy: "system",
      isActive: false,
    },
    {
      id: "ph-2",
      price: 319.99,
      currency: "USD",
      changeType: "increase",
      changeAmount: 20.00,
      changePercentage: 6.67,
      effectiveDate: new Date("2024-06-15"),
      reason: "Cost increase from supplier",
      createdBy: "john.doe",
      isActive: false,
    },
    {
      id: "ph-3",
      price: 249.99,
      currency: "USD",
      changeType: "promotional",
      changeAmount: -70.00,
      changePercentage: -21.88,
      effectiveDate: new Date("2024-11-25"),
      endDate: new Date("2024-12-02"),
      reason: "Black Friday promotion",
      createdBy: "marketing.team",
      isActive: false,
      metadata: {
        promotionCode: "BLACKFRIDAY2024",
        promotionType: "flash_sale",
        originalPrice: 319.99,
        discount: 70.00,
      },
    },
    {
      id: "ph-4",
      price: 319.99,
      currency: "USD",
      changeType: "regular",
      changeAmount: 70.00,
      changePercentage: 28.00,
      effectiveDate: new Date("2024-12-02"),
      reason: "End of promotional pricing",
      createdBy: "system",
      isActive: false,
    },
    {
      id: "ph-5",
      price: 289.99,
      currency: "USD",
      changeType: "decrease",
      changeAmount: -30.00,
      changePercentage: -9.38,
      effectiveDate: new Date("2025-01-15"),
      reason: "Market positioning adjustment",
      createdBy: "pricing.team",
      isActive: true,
    },
  ]);

  const [promotions] = useState<PromotionalPricing[]>([
    {
      id: "promo-1",
      name: "New Year Sale",
      type: "percentage",
      status: "active",
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-01-31"),
      originalPrice: 289.99,
      discountedPrice: 231.99,
      discountPercentage: 20,
      discountAmount: 58.00,
      rules: {
        minimumQuantity: 1,
        couponCode: "NEWYEAR20",
        usageLimit: 1000,
        usageCount: 234,
      },
      performance: {
        views: 5420,
        clicks: 892,
        conversions: 67,
        revenue: 15543.33,
      },
      createdBy: "marketing.team",
      createdAt: new Date("2024-12-20"),
    },
    {
      id: "promo-2",
      name: "Valentine's Flash Sale",
      type: "fixed_amount",
      status: "scheduled",
      startDate: new Date("2025-02-14"),
      endDate: new Date("2025-02-14"),
      originalPrice: 289.99,
      discountedPrice: 239.99,
      discountAmount: 50.00,
      rules: {
        minimumQuantity: 1,
        usageLimit: 100,
        usageCount: 0,
      },
      performance: {
        views: 0,
        clicks: 0,
        conversions: 0,
        revenue: 0,
      },
      createdBy: "marketing.team",
      createdAt: new Date("2025-01-10"),
    },
    {
      id: "promo-3",
      name: "Black Friday 2024",
      type: "percentage",
      status: "ended",
      startDate: new Date("2024-11-25"),
      endDate: new Date("2024-12-02"),
      originalPrice: 319.99,
      discountedPrice: 249.99,
      discountPercentage: 21.88,
      discountAmount: 70.00,
      rules: {
        minimumQuantity: 1,
        couponCode: "BLACKFRIDAY2024",
        usageLimit: 5000,
        usageCount: 4892,
      },
      performance: {
        views: 45230,
        clicks: 8942,
        conversions: 1203,
        revenue: 300747.03,
      },
      createdBy: "marketing.team",
      createdAt: new Date("2024-11-01"),
    },
  ]);

  const [competitorPrices] = useState<CompetitorPricing[]>([
    {
      id: "comp-1",
      competitorName: "Amazon",
      price: 279.99,
      currency: "USD",
      url: "https://amazon.com/similar-product",
      lastChecked: new Date("2025-01-16"),
      priceChange: -5.00,
      priceChangePercentage: -1.75,
      availability: "in_stock",
      shippingCost: 8.99,
      totalCost: 288.98,
    },
    {
      id: "comp-2",
      competitorName: "Best Buy",
      price: 299.99,
      currency: "USD",
      url: "https://bestbuy.com/similar-product",
      lastChecked: new Date("2025-01-16"),
      priceChange: 0,
      priceChangePercentage: 0,
      availability: "in_stock",
      shippingCost: 0,
      totalCost: 299.99,
    },
    {
      id: "comp-3",
      competitorName: "Target",
      price: 319.99,
      currency: "USD",
      url: "https://target.com/similar-product",
      lastChecked: new Date("2025-01-15"),
      priceChange: 10.00,
      priceChangePercentage: 3.23,
      availability: "limited",
      shippingCost: 5.99,
      totalCost: 325.98,
    },
    {
      id: "comp-4",
      competitorName: "Walmart",
      price: 0,
      currency: "USD",
      url: "https://walmart.com/similar-product",
      lastChecked: new Date("2025-01-14"),
      priceChange: 0,
      priceChangePercentage: 0,
      availability: "out_of_stock",
      totalCost: 0,
    },
  ]);

  const [activeTab, setActiveTab] = useState<"history" | "promotions" | "competitors" | "create">("history");

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case "increase": return "red";
      case "decrease": return "green";
      case "promotional": return "orange";
      case "regular": return "blue";
      case "manual": return "gray";
      default: return "gray";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "green";
      case "scheduled": return "blue";
      case "ended": return "gray";
      case "cancelled": return "red";
      default: return "gray";
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "in_stock": return "green";
      case "limited": return "yellow";
      case "out_of_stock": return "red";
      case "unknown": return "gray";
      default: return "gray";
    }
  };

  const formatCurrency = (amount: number, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const getCurrentPromotion = () => {
    return promotions.find(p => p.status === "active");
  };

  const getAverageCompetitorPrice = () => {
    const inStockCompetitors = competitorPrices.filter(c => c.availability === "in_stock" && c.price > 0);
    if (inStockCompetitors.length === 0) return 0;
    return inStockCompetitors.reduce((sum, c) => sum + c.totalCost, 0) / inStockCompetitors.length;
  };

  const handleCreatePromotion = () => {
    notifications.show({
      color: "green",
      message: "Promotional pricing created successfully",
      title: "Success",
    });
  };

  const handleUpdatePrice = () => {
    notifications.show({
      color: "green",
      message: "Price updated successfully",
      title: "Success",
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title={`Price History & Promotions - ${productName}`}
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <Stack>
        {/* Tab Navigation */}
        <Group>
          <Button
            variant={activeTab === "history" ? "filled" : "light"}
            onClick={() => setActiveTab("history")}
            leftSection={<IconCurrency size={16} />}
          >
            Price History
          </Button>
          <Button
            variant={activeTab === "promotions" ? "filled" : "light"}
            onClick={() => setActiveTab("promotions")}
            leftSection={<IconTag size={16} />}
          >
            Promotions ({promotions.filter(p => p.status === "active").length})
          </Button>
          <Button
            variant={activeTab === "competitors" ? "filled" : "light"}
            onClick={() => setActiveTab("competitors")}
            leftSection={<IconTrendingUp size={16} />}
          >
            Competitor Pricing
          </Button>
          <Button
            variant={activeTab === "create" ? "filled" : "light"}
            onClick={() => setActiveTab("create")}
            leftSection={<IconPlus size={16} />}
          >
            Create
          </Button>
        </Group>

        {/* Current Price Overview */}
        <Card withBorder style={{ backgroundColor: "var(--mantine-color-blue-0)" }}>
          <Group justify="space-between">
            <div>
              <Text fw={600} size="lg">Current Price</Text>
              <Text c="dimmed" size="sm">
                {getCurrentPromotion() ? "Promotional pricing active" : "Regular pricing"}
              </Text>
            </div>
            <div style={{ textAlign: "right" }}>
              <Text fw={700} size="xl">{formatCurrency(currentPrice)}</Text>
              {getCurrentPromotion() && (
                <Group gap="xs" justify="flex-end">
                  <Text c="dimmed" size="sm" style={{ textDecoration: "line-through" }}>
                    {formatCurrency(getCurrentPromotion()!.originalPrice)}
                  </Text>
                  <Badge color="red" variant="filled" size="sm">
                    -{getCurrentPromotion()!.discountPercentage}%
                  </Badge>
                </Group>
              )}
            </div>
          </Group>
        </Card>

        {/* Price History Tab */}
        {activeTab === "history" && (
          <Stack>
            <Group justify="space-between">
              <Text fw={600} size="lg">Price History</Text>
              <Button leftSection={<IconPlus size={16} />} size="sm">
                Add Price Change
              </Button>
            </Group>

            <Table striped highlightOnHover>
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
                {priceHistory.slice().reverse().map((entry) => (
                  <Table.Tr key={entry.id}>
                    <Table.Td>{formatDate(entry.effectiveDate)}</Table.Td>
                    <Table.Td>
                      <Text fw={500}>{formatCurrency(entry.price, entry.currency)}</Text>
                    </Table.Td>
                    <Table.Td>
                      {entry.changeAmount !== 0 && (
                        <Group gap="xs">
                          <Text
                            c={entry.changeAmount > 0 ? "red" : "green"}
                            fw={500}
                            size="sm"
                          >
                            {entry.changeAmount > 0 ? "+" : ""}{formatCurrency(entry.changeAmount)}
                          </Text>
                          <Text c="dimmed" size="xs">
                            ({entry.changePercentage > 0 ? "+" : ""}{entry.changePercentage.toFixed(1)}%)
                          </Text>
                        </Group>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={getChangeTypeColor(entry.changeType)}
                        variant="light"
                        size="sm"
                        leftSection={
                          entry.changeType === "increase" ? <IconTrendingUp size={12} /> :
                          entry.changeType === "decrease" ? <IconTrendingDown size={12} /> :
                          entry.changeType === "promotional" ? <IconTag size={12} /> : undefined
                        }
                      >
                        {entry.changeType.toUpperCase().replace("_", " ")}
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
                      <Badge
                        color={entry.isActive ? "green" : "gray"}
                        variant="light"
                        size="sm"
                      >
                        {entry.isActive ? "ACTIVE" : "INACTIVE"}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Stack>
        )}

        {/* Promotions Tab */}
        {activeTab === "promotions" && (
          <Stack>
            <Group justify="space-between">
              <Text fw={600} size="lg">Promotional Pricing</Text>
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
                        <Badge color={getStatusColor(promotion.status)} variant="light" size="sm">
                          {promotion.status.toUpperCase()}
                        </Badge>
                        <Badge color="blue" variant="outline" size="sm">
                          {promotion.type.replace("_", " ").toUpperCase()}
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
                      {promotion.status === "active" && (
                        <ActionIcon variant="subtle" color="red">
                          <IconX size={16} />
                        </ActionIcon>
                      )}
                    </Group>
                  </Group>

                  <SimpleGrid cols={3} spacing="md">
                    <div>
                      <Text c="dimmed" size="xs">Original Price</Text>
                      <Text fw={500}>{formatCurrency(promotion.originalPrice)}</Text>
                    </div>
                    <div>
                      <Text c="dimmed" size="xs">Discounted Price</Text>
                      <Text fw={500} c="green">
                        {promotion.discountedPrice ? formatCurrency(promotion.discountedPrice) : "N/A"}
                      </Text>
                    </div>
                    <div>
                      <Text c="dimmed" size="xs">Discount</Text>
                      <Group gap="xs">
                        {promotion.discountAmount && (
                          <Text fw={500} c="red">
                            -{formatCurrency(promotion.discountAmount)}
                          </Text>
                        )}
                        {promotion.discountPercentage && (
                          <Text fw={500} c="red">
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
                          <Text c="dimmed" span>Code:</Text> {promotion.rules.couponCode}
                        </Text>
                      )}
                      {promotion.rules.usageLimit && (
                        <Text size="sm">
                          <Text c="dimmed" span>Usage:</Text> {promotion.rules.usageCount}/{promotion.rules.usageLimit}
                        </Text>
                      )}
                      {promotion.rules.minimumQuantity && (
                        <Text size="sm">
                          <Text c="dimmed" span>Min Qty:</Text> {promotion.rules.minimumQuantity}
                        </Text>
                      )}
                    </Group>
                  )}

                  {promotion.performance && (
                    <Card withBorder mt="md">
                      <Text fw={500} mb="sm" size="sm">Performance</Text>
                      <SimpleGrid cols={4} spacing="md">
                        <div>
                          <Text c="dimmed" size="xs">Views</Text>
                          <Text fw={500}>{promotion.performance.views.toLocaleString()}</Text>
                        </div>
                        <div>
                          <Text c="dimmed" size="xs">Clicks</Text>
                          <Text fw={500}>{promotion.performance.clicks.toLocaleString()}</Text>
                        </div>
                        <div>
                          <Text c="dimmed" size="xs">Conversions</Text>
                          <Text fw={500}>{promotion.performance.conversions.toLocaleString()}</Text>
                        </div>
                        <div>
                          <Text c="dimmed" size="xs">Revenue</Text>
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
        {activeTab === "competitors" && (
          <Stack>
            <Group justify="space-between">
              <Text fw={600} size="lg">Competitor Pricing</Text>
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
                          variant="light"
                          size="sm"
                        >
                          {competitor.availability.replace("_", " ").toUpperCase()}
                        </Badge>
                        {competitor.priceChange !== 0 && (
                          <Badge
                            color={competitor.priceChange > 0 ? "red" : "green"}
                            variant="outline"
                            size="sm"
                          >
                            {competitor.priceChange > 0 ? "+" : ""}{formatCurrency(competitor.priceChange)}
                          </Badge>
                        )}
                      </Group>
                      <Text c="dimmed" size="sm">
                        Last checked: {formatDateTime(competitor.lastChecked)}
                      </Text>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {competitor.price > 0 ? (
                        <>
                          <Text fw={600} size="lg">{formatCurrency(competitor.price)}</Text>
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
            <Card withBorder style={{ backgroundColor: "var(--mantine-color-orange-0)" }}>
              <Group justify="space-between">
                <div>
                  <Text fw={500}>Price Position</Text>
                  <Text c="dimmed" size="sm">Your price vs. competitor average</Text>
                </div>
                <div style={{ textAlign: "right" }}>
                  <Text fw={600} size="lg">
                    {currentPrice > getAverageCompetitorPrice() ? "ABOVE" : "BELOW"} Average
                  </Text>
                  <Text c={currentPrice > getAverageCompetitorPrice() ? "red" : "green"} fw={500}>
                    {formatCurrency(Math.abs(currentPrice - getAverageCompetitorPrice()))} difference
                  </Text>
                </div>
              </Group>
            </Card>
          </Stack>
        )}

        {/* Create Tab */}
        {activeTab === "create" && (
          <Stack>
            <Text fw={600} size="lg">Create Price Change or Promotion</Text>

            <SimpleGrid cols={2} spacing="xl">
              {/* Manual Price Update */}
              <Card withBorder>
                <Stack>
                  <Text fw={500}>Manual Price Update</Text>
                  <NumberInput
                    label="New Price"
                    placeholder="Enter new price"
                    leftSection={<IconCurrency size={16} />}
                    decimalScale={2}
                    step={0.01}
                    min={0}
                  />
                  <Select
                    label="Change Type"
                    data={[
                      { value: "regular", label: "Regular Price Change" },
                      { value: "manual", label: "Manual Adjustment" },
                      { value: "increase", label: "Price Increase" },
                      { value: "decrease", label: "Price Decrease" },
                    ]}
                  />
                  <TextInput
                    label="Reason"
                    placeholder="Reason for price change"
                  />
                  <DatePickerInput
                    label="Effective Date"
                    placeholder="Select effective date"
                    leftSection={<IconCalendar size={16} />}
                  />
                  <Button onClick={handleUpdatePrice} fullWidth>
                    Update Price
                  </Button>
                </Stack>
              </Card>

              {/* Create Promotion */}
              <Card withBorder>
                <Stack>
                  <Text fw={500}>Create Promotion</Text>
                  <TextInput
                    label="Promotion Name"
                    placeholder="e.g., Spring Sale 2025"
                  />
                  <Select
                    label="Promotion Type"
                    data={[
                      { value: "percentage", label: "Percentage Discount" },
                      { value: "fixed_amount", label: "Fixed Amount Off" },
                      { value: "flash_sale", label: "Flash Sale" },
                      { value: "buy_x_get_y", label: "Buy X Get Y" },
                    ]}
                  />
                  <NumberInput
                    label="Discount"
                    placeholder="Discount amount or percentage"
                    leftSection={<IconPercentage size={16} />}
                    min={0}
                  />
                  <Group grow>
                    <DatePickerInput
                      label="Start Date"
                      placeholder="Promotion start"
                      leftSection={<IconCalendar size={16} />}
                    />
                    <DatePickerInput
                      label="End Date"
                      placeholder="Promotion end"
                      leftSection={<IconCalendar size={16} />}
                    />
                  </Group>
                  <TextInput
                    label="Coupon Code (Optional)"
                    placeholder="e.g., SPRING25"
                  />
                  <Button onClick={handleCreatePromotion} fullWidth>
                    Create Promotion
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