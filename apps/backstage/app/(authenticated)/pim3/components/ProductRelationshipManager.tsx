'use client';

import { Button, Card, Checkbox, Group, MultiSelect, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import {
  getProductRelationshipsAction,
  setProductCollectionsAction,
  setProductTaxonomiesAction,
  getCollectionsAction,
  getTaxonomiesAction,
  getBrandsAction,
  createProductBrandAssociationAction,
  removeProductBrandAssociationAction,
} from '@repo/database/prisma';

interface ProductRelationshipManagerProps {
  productId: string;
  productName: string;
}

export function ProductRelationshipManager({
  productId,
  productName,
}: ProductRelationshipManagerProps) {
  const [loading, setLoading] = useState(false);
  const [relationships, setRelationships] = useState<{
    collections: any[];
    taxonomies: any[];
    brands: any[];
  }>({
    collections: [],
    taxonomies: [],
    brands: [],
  });

  // Available options
  const [availableCollections, setAvailableCollections] = useState<any[]>([]);
  const [availableTaxonomies, setAvailableTaxonomies] = useState<any[]>([]);
  const [availableBrands, setAvailableBrands] = useState<any[]>([]);

  // Selected values
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedTaxonomies, setSelectedTaxonomies] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  // Load initial data
  useEffect(() => {
    loadData();
  }, [productId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load current relationships
      const relResult = await getProductRelationshipsAction(productId);
      if (relResult.success && relResult.data) {
        setRelationships(relResult.data);
        setSelectedCollections(relResult.data.collections.map((c) => c.id));
        setSelectedTaxonomies(relResult.data.taxonomies.map((t) => t.id));
        setSelectedBrands(relResult.data.brands.map((b) => b.id));
      }

      // Load available options
      const [collections, taxonomies, brands] = await Promise.all([
        getCollectionsAction({}),
        getTaxonomiesAction({}),
        getBrandsAction({}),
      ]);

      setAvailableCollections(collections.data || []);
      setAvailableTaxonomies(taxonomies.data || []);
      setAvailableBrands(brands.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load relationship data',
        color: 'red',
        icon: <IconX />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCollections = async () => {
    setLoading(true);
    try {
      const result = await setProductCollectionsAction(productId, selectedCollections);
      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'Collections updated successfully',
          color: 'green',
          icon: <IconCheck />,
        });
        loadData(); // Reload to get updated data
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to update collections',
        color: 'red',
        icon: <IconX />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTaxonomies = async () => {
    setLoading(true);
    try {
      const result = await setProductTaxonomiesAction(productId, selectedTaxonomies);
      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'Taxonomies updated successfully',
          color: 'green',
          icon: <IconCheck />,
        });
        loadData();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to update taxonomies',
        color: 'red',
        icon: <IconX />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBrandToggle = async (brandId: string, checked: boolean) => {
    setLoading(true);
    try {
      if (checked) {
        await createProductBrandAssociationAction(productId, brandId);
      } else {
        await removeProductBrandAssociationAction(productId, brandId);
      }

      notifications.show({
        title: 'Success',
        message: `Brand ${checked ? 'added' : 'removed'} successfully`,
        color: 'green',
        icon: <IconCheck />,
      });

      // Update local state
      if (checked) {
        setSelectedBrands([...selectedBrands, brandId]);
      } else {
        setSelectedBrands(selectedBrands.filter((id) => id !== brandId));
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to update brand association',
        color: 'red',
        icon: <IconX />,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="md">
      <Title order={3}>Manage Relationships for {productName}</Title>

      {/* Collections */}
      <Card>
        <Stack gap="sm">
          <Title order={4}>Collections</Title>
          <MultiSelect
            data={availableCollections.map((c) => ({
              value: c.id,
              label: c.name,
            }))}
            value={selectedCollections}
            onChange={setSelectedCollections}
            placeholder="Select collections"
            searchable
            clearable
            disabled={loading}
          />
          <Button
            onClick={handleSaveCollections}
            loading={loading}
            disabled={
              JSON.stringify(selectedCollections.sort()) ===
              JSON.stringify(relationships.collections.map((c) => c.id).sort())
            }
          >
            Save Collections
          </Button>
        </Stack>
      </Card>

      {/* Taxonomies */}
      <Card>
        <Stack gap="sm">
          <Title order={4}>Taxonomies</Title>
          <MultiSelect
            data={availableTaxonomies.map((t) => ({
              value: t.id,
              label: `${t.name} (${t.type})`,
            }))}
            value={selectedTaxonomies}
            onChange={setSelectedTaxonomies}
            placeholder="Select taxonomies"
            searchable
            clearable
            disabled={loading}
          />
          <Button
            onClick={handleSaveTaxonomies}
            loading={loading}
            disabled={
              JSON.stringify(selectedTaxonomies.sort()) ===
              JSON.stringify(relationships.taxonomies.map((t) => t.id).sort())
            }
          >
            Save Taxonomies
          </Button>
        </Stack>
      </Card>

      {/* Brands (Sellers) */}
      <Card>
        <Stack gap="sm">
          <Title order={4}>Brands/Sellers</Title>
          <Text size="sm" c="dimmed">
            Check brands that sell this product
          </Text>
          {availableBrands.map((brand) => (
            <Checkbox
              key={brand.id}
              label={`${brand.name} (${brand.type})`}
              checked={selectedBrands.includes(brand.id)}
              onChange={(e) => handleBrandToggle(brand.id, e.currentTarget.checked)}
              disabled={loading}
            />
          ))}
        </Stack>
      </Card>

      {/* Current Relationships Summary */}
      <Card>
        <Stack gap="sm">
          <Title order={4}>Current Relationships</Title>
          <Group>
            <Text size="sm">
              <strong>Collections:</strong> {relationships.collections.length}
            </Text>
            <Text size="sm">
              <strong>Taxonomies:</strong> {relationships.taxonomies.length}
            </Text>
            <Text size="sm">
              <strong>Brands:</strong> {relationships.brands.length}
            </Text>
          </Group>
        </Stack>
      </Card>
    </Stack>
  );
}
