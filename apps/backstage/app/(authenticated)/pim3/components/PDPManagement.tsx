'use client';

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Checkbox,
  Collapse,
  Divider,
  Group,
  Modal,
  NumberInput,
  ScrollArea,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconChevronDown,
  IconChevronUp,
  IconExternalLink,
  IconPlus,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';

import { addProductSeller, getBrands, getProductSellers, removeProductSeller } from '../actions';
import {
  formatCurrency,
  formatDate,
  getAvailabilityColor,
  getBrandTypeColor,
} from '../utils/pim-helpers';

// Affiliate marketplace data structure (UI only)
interface AffiliateData {
  affiliateUrl?: string;
  // Product URLs
  productUrl?: string;
  sellerSku?: string;

  currency?: string;
  originalPrice?: number;
  // Pricing
  price?: number;
  salePrice?: number;

  availability?: string;
  // Availability
  inStock?: boolean;
  quantity?: number;

  affiliateNetwork?: string;
  commissionAmount?: number;
  // Affiliate Program
  commissionRate?: number;

  // Performance (demo data)
  clickCount?: number;
  conversionCount?: number;
  revenue?: number;

  // Seller Metadata
  rating?: number;
  reviewCount?: number;
  shippingCost?: number;
  shippingTime?: string;

  // Status
  isActive?: boolean;
  isPrimary?: boolean;
  priority?: number;
}

interface Brand {
  _count: {
    products: number;
  };
  baseUrl: string | null;
  id: string;
  name: string;
  slug: string;
  status: string;
  type: string;
}

interface ProductSeller {
  brand: {
    id: string;
    name: string;
    slug: string;
    type: string;
    baseUrl: string | null;
    status: string;
  };
  createdAt: Date;
  id: string;
}

interface PDPManagementModalProps {
  onClose: () => void;
  onUpdate?: () => void;
  opened: boolean;
  productId: string;
  productName: string;
}

export function PDPManagement({
  onClose,
  onUpdate,
  opened,
  productId,
  productName,
}: PDPManagementModalProps) {
  const [currentSellers, setCurrentSellers] = useState<ProductSeller[]>([]);
  const [availableBrands, setAvailableBrands] = useState<Brand[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  // Affiliate data management (UI demo state)
  const [affiliateData, setAffiliateData] = useState<Record<string, AffiliateData>>({});
  const [expandedSellers, setExpandedSellers] = useState<Set<string>>(new Set());
  const [editingAffiliate, setEditingAffiliate] = useState<string | null>(null);

  const loadCurrentSellers = useCallback(async () => {
    if (!productId) return;

    const result = await getProductSellers(productId);
    if (result.success) {
      setCurrentSellers(result.data);
    }
  }, [productId]);

  const loadAvailableBrands = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getBrands({
        limit: 100,
        search: searchQuery,
        status: 'PUBLISHED',
      });
      if (result.success) {
        // Filter out brands that are already sellers
        const currentSellerBrandIds = currentSellers.map((seller) => seller.brand.id);
        const filteredBrands = result.data.filter(
          (brand) => !currentSellerBrandIds.includes(brand.id),
        );
        setAvailableBrands(filteredBrands);
      }
    } catch (error) {
      console.error('Error loading brands:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, currentSellers]);

  useEffect(() => {
    if (opened) {
      loadCurrentSellers();
    }
  }, [opened, loadCurrentSellers]);

  useEffect(() => {
    if (opened) {
      loadAvailableBrands();
    }
  }, [opened, loadAvailableBrands]);

  const handleAddSellers = async () => {
    if (selectedBrands.length === 0) return;

    setLoading(true);
    try {
      const promises = selectedBrands.map((brandId) => addProductSeller(productId, brandId));

      const results = await Promise.all(promises);
      const failed = results.filter((result) => !result.success);

      if (failed.length === 0) {
        notifications.show({
          color: 'green',
          message: `Added ${selectedBrands.length} seller(s) to product`,
          title: 'Success',
        });
        setSelectedBrands([]);
        await loadCurrentSellers();
        onUpdate?.();
      } else {
        notifications.show({
          color: 'yellow',
          message: `Added ${results.length - failed.length}/${results.length} sellers. ${failed.length} failed.`,
          title: 'Partial Success',
        });
      }
    } catch (error) {
      notifications.show({
        color: 'red',
        message: 'Failed to add sellers',
        title: 'Error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSeller = async (brandId: string, brandName: string) => {
    setLoading(true);
    try {
      const result = await removeProductSeller(productId, brandId);
      if (result.success) {
        notifications.show({
          color: 'green',
          message: `Removed ${brandName} as seller`,
          title: 'Success',
        });
        await loadCurrentSellers();
        onUpdate?.();
      } else {
        notifications.show({
          color: 'red',
          message: result.error || 'Failed to remove seller',
          title: 'Error',
        });
      }
    } catch (error) {
      notifications.show({
        color: 'red',
        message: 'Failed to remove seller',
        title: 'Error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Affiliate data utilities
  const getAffiliateData = (brandId: string): AffiliateData => {
    return (
      affiliateData[brandId] || {
        availability: 'In Stock',
        clickCount: 0,
        conversionCount: 0,
        currency: 'USD',
        inStock: true,
        isActive: true,
        isPrimary: false,
        priority: 0,
        revenue: 0,
      }
    );
  };

  const updateAffiliateData = (brandId: string, data: Partial<AffiliateData>) => {
    setAffiliateData((prev) => ({
      ...prev,
      [brandId]: { ...getAffiliateData(brandId), ...data },
    }));
  };

  const toggleSellerExpansion = (sellerId: string) => {
    setExpandedSellers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sellerId)) {
        newSet.delete(sellerId);
      } else {
        newSet.add(sellerId);
      }
      return newSet;
    });
  };

  return (
    <Modal
      onClose={onClose}
      opened={opened}
      scrollAreaComponent={ScrollArea.Autosize}
      size="xl"
      title={`Manage PDPs/Sellers - ${productName}`}
    >
      <Stack>
        {/* Current Sellers */}
        <div>
          <Text fw={600} mb="md">
            Current Sellers ({currentSellers.length})
          </Text>
          {currentSellers.length > 0 ? (
            <Stack gap="xs">
              {currentSellers.map((seller) => {
                const affiliate = getAffiliateData(seller.brand.id);
                const isExpanded = expandedSellers.has(seller.id);

                return (
                  <Card key={seller.id} withBorder>
                    <Stack gap="sm">
                      <Group justify="space-between">
                        <div>
                          <Group gap="sm">
                            <Text fw={500}>{seller.brand.name}</Text>
                            <Badge
                              color={getBrandTypeColor(seller.brand.type)}
                              size="sm"
                              variant="light"
                            >
                              {seller.brand.type}
                            </Badge>
                            <Badge
                              color={seller.brand.status === 'PUBLISHED' ? 'green' : 'yellow'}
                              size="sm"
                              variant="outline"
                            >
                              {seller.brand.status}
                            </Badge>
                            {affiliate.isPrimary && (
                              <Badge color="blue" size="sm" variant="filled">
                                PRIMARY
                              </Badge>
                            )}
                          </Group>

                          {/* Affiliate Quick Info */}
                          <Group gap="sm" mt="xs">
                            {affiliate.price && (
                              <Text c="green" fw={500} size="sm">
                                {formatCurrency(affiliate.price, affiliate.currency)}
                              </Text>
                            )}
                            <Badge
                              color={getAvailabilityColor(affiliate.availability)}
                              size="xs"
                              variant="dot"
                            >
                              {affiliate.availability || 'In Stock'}
                            </Badge>
                            {affiliate.commissionRate && (
                              <Text c="dimmed" size="xs">
                                {affiliate.commissionRate}% commission
                              </Text>
                            )}
                          </Group>

                          <Text c="dimmed" size="sm">
                            Added {formatDate(seller.createdAt)}
                          </Text>

                          {seller.brand.baseUrl && (
                            <Group gap="xs" mt="xs">
                              <Text c="dimmed" size="xs">
                                {seller.brand.baseUrl}
                              </Text>
                              <ActionIcon
                                href={seller.brand.baseUrl}
                                component="a"
                                rel="noopener noreferrer"
                                size="xs"
                                target="_blank"
                                variant="subtle"
                              >
                                <IconExternalLink size={12} />
                              </ActionIcon>
                            </Group>
                          )}
                        </div>

                        <Group gap="xs">
                          <ActionIcon
                            onClick={() => toggleSellerExpansion(seller.id)}
                            title="Toggle affiliate details"
                            variant="subtle"
                          >
                            {isExpanded ? (
                              <IconChevronUp size={16} />
                            ) : (
                              <IconChevronDown size={16} />
                            )}
                          </ActionIcon>
                          <ActionIcon
                            color="red"
                            loading={loading}
                            onClick={() => handleRemoveSeller(seller.brand.id, seller.brand.name)}
                            variant="subtle"
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Group>

                      {/* Expandable Affiliate Management */}
                      <Collapse in={isExpanded}>
                        <Divider mb="md" />
                        <Text fw={500} mb="md" size="sm">
                          Affiliate Management
                        </Text>

                        <Stack gap="sm">
                          <Group grow>
                            <NumberInput
                              onChange={(value) =>
                                updateAffiliateData(seller.brand.id, {
                                  price: typeof value === 'number' ? value : undefined,
                                })
                              }
                              placeholder="0.00"
                              decimalScale={2}
                              label="Price"
                              min={0}
                              step={0.01}
                              value={affiliate.price || ''}
                            />
                            <Select
                              onChange={(value) =>
                                updateAffiliateData(seller.brand.id, {
                                  availability: value || 'In Stock',
                                })
                              }
                              data={['In Stock', 'Limited', 'Out of Stock', 'Backorder']}
                              label="Availability"
                              value={affiliate.availability || 'In Stock'}
                            />
                          </Group>

                          <Group grow>
                            <NumberInput
                              onChange={(value) =>
                                updateAffiliateData(seller.brand.id, {
                                  commissionRate: typeof value === 'number' ? value : undefined,
                                })
                              }
                              label="Commission Rate (%)"
                              max={100}
                              min={0}
                              step={0.1}
                              value={affiliate.commissionRate || ''}
                            />
                            <Select
                              onChange={(value) =>
                                updateAffiliateData(seller.brand.id, {
                                  affiliateNetwork: value || undefined,
                                })
                              }
                              clearable
                              data={[
                                'Amazon Associates',
                                'ShareASale',
                                'Commission Junction',
                                'Impact',
                              ]}
                              label="Affiliate Network"
                              value={affiliate.affiliateNetwork || ''}
                            />
                          </Group>

                          <TextInput
                            onChange={(e) =>
                              updateAffiliateData(seller.brand.id, {
                                affiliateUrl: e.currentTarget.value,
                              })
                            }
                            placeholder="https://affiliate.example.com/product"
                            label="Affiliate URL"
                            value={affiliate.affiliateUrl || ''}
                          />

                          <Group>
                            <Switch
                              onChange={(e) => {
                                if (e.currentTarget.checked) {
                                  // Clear other primary sellers
                                  Object.keys(affiliateData).forEach((brandId) => {
                                    if (brandId !== seller.brand.id) {
                                      updateAffiliateData(brandId, { isPrimary: false });
                                    }
                                  });
                                }
                                updateAffiliateData(seller.brand.id, {
                                  isPrimary: e.currentTarget.checked,
                                });
                              }}
                              checked={affiliate.isPrimary || false}
                              label="Primary Seller"
                            />
                            <Switch
                              onChange={(e) =>
                                updateAffiliateData(seller.brand.id, {
                                  isActive: e.currentTarget.checked,
                                })
                              }
                              checked={affiliate.isActive !== false}
                              label="Active"
                            />
                          </Group>

                          {/* Performance Demo Data */}
                          <Divider />
                          <Text fw={500} size="sm">
                            Performance (Demo Data)
                          </Text>
                          <Group gap="md">
                            <Text size="sm">
                              <Text c="dimmed" span>
                                Clicks:
                              </Text>{' '}
                              {affiliate.clickCount || 0}
                            </Text>
                            <Text size="sm">
                              <Text c="dimmed" span>
                                Conversions:
                              </Text>{' '}
                              {affiliate.conversionCount || 0}
                            </Text>
                            <Text size="sm">
                              <Text c="dimmed" span>
                                Revenue:
                              </Text>{' '}
                              ${affiliate.revenue || 0}
                            </Text>
                            <Text size="sm">
                              <Text c="dimmed" span>
                                CVR:
                              </Text>{' '}
                              {affiliate.clickCount && affiliate.clickCount > 0
                                ? (
                                    ((affiliate.conversionCount || 0) / affiliate.clickCount) *
                                    100
                                  ).toFixed(1)
                                : 0}
                              %
                            </Text>
                          </Group>
                        </Stack>
                      </Collapse>
                    </Stack>
                  </Card>
                );
              })}
            </Stack>
          ) : (
            <Text c="dimmed" py="xl" ta="center">
              No sellers configured for this product
            </Text>
          )}
        </div>

        {/* Add New Sellers */}
        <div>
          <Text fw={600} mb="md">
            Add New Sellers
          </Text>

          <TextInput
            leftSection={<IconSearch size={16} />}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            placeholder="Search brands/sellers..."
            mb="md"
            value={searchQuery}
          />

          {availableBrands.length > 0 ? (
            <Stack gap="xs" mb="md">
              {availableBrands.map((brand) => (
                <Card
                  key={brand.id}
                  withBorder
                  style={{
                    backgroundColor: selectedBrands.includes(brand.id)
                      ? 'var(--mantine-color-blue-0)'
                      : undefined,
                  }}
                >
                  <Group justify="space-between">
                    <div>
                      <Group gap="sm">
                        <Checkbox
                          onChange={(e) => {
                            if (e.currentTarget.checked) {
                              setSelectedBrands([...selectedBrands, brand.id]);
                            } else {
                              setSelectedBrands(selectedBrands.filter((id) => id !== brand.id));
                            }
                          }}
                          checked={selectedBrands.includes(brand.id)}
                        />
                        <div>
                          <Text fw={500}>{brand.name}</Text>
                          <Group gap="xs">
                            <Badge color={getBrandTypeColor(brand.type)} size="xs" variant="light">
                              {brand.type}
                            </Badge>
                            <Text c="dimmed" size="xs">
                              {brand._count.products} products
                            </Text>
                          </Group>
                        </div>
                      </Group>
                      {brand.baseUrl && (
                        <Group gap="xs" ml={30} mt="xs">
                          <Text c="dimmed" size="xs">
                            {brand.baseUrl}
                          </Text>
                          <ActionIcon
                            href={brand.baseUrl}
                            component="a"
                            rel="noopener noreferrer"
                            size="xs"
                            target="_blank"
                            variant="subtle"
                          >
                            <IconExternalLink size={12} />
                          </ActionIcon>
                        </Group>
                      )}
                    </div>
                  </Group>
                </Card>
              ))}
            </Stack>
          ) : (
            <Text c="dimmed" py="xl" ta="center">
              {searchQuery ? 'No brands found matching your search' : 'No available brands'}
            </Text>
          )}

          {selectedBrands.length > 0 && (
            <Group justify="space-between">
              <Text c="dimmed" size="sm">
                {selectedBrands.length} brand(s) selected
              </Text>
              <Group>
                <Button onClick={() => setSelectedBrands([])} variant="outline">
                  Clear Selection
                </Button>
                <Button
                  leftSection={<IconPlus size={16} />}
                  loading={loading}
                  onClick={handleAddSellers}
                >
                  Add {selectedBrands.length} Seller(s)
                </Button>
              </Group>
            </Group>
          )}
        </div>
      </Stack>
    </Modal>
  );
}
