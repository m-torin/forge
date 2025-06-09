'use client';

import { Button, Card, Container, Grid, Group, Stack, Tabs, Text, Title } from '@mantine/core';
import {
  IconAsset,
  IconChartBar,
  IconCertificate,
  IconDownload,
  IconFileText,
  IconPhoto,
  IconSettings,
  IconTemplate,
  IconUpload,
  IconVideo,
} from '@tabler/icons-react';
import { useState } from 'react';

import { ProductAssetAnalytics } from './components/ProductAssetAnalytics';
import { ProductAssetBulkOperations } from './components/ProductAssetBulkOperations';
import { ProductAssetFilters } from './components/ProductAssetFilters';
import { ProductAssetGrid } from './components/ProductAssetGrid';
import { ProductAssetOptimization } from './components/ProductAssetOptimization';
import { ProductAssetStats } from './components/ProductAssetStats';
import { ProductAssetTemplates } from './components/ProductAssetTemplates';
import { ProductAssetTypeManager } from './components/ProductAssetTypeManager';
import { ProductAssetUploader } from './components/ProductAssetUploader';

import type { AssetType } from '@repo/database/prisma';

export default function ProductAssetsPage() {
  const [activeTab, setActiveTab] = useState<string | null>('overview');
  const [selectedAssetType, setSelectedAssetType] = useState<AssetType | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Container fluid px="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Title order={2}>Product Assets</Title>
            <Text c="dimmed" size="sm">
              Manage product-specific digital assets, images, videos, documents, and certificates
            </Text>
          </div>
          <Group>
            <Button leftSection={<IconUpload size={16} />} variant="light">
              Bulk Upload
            </Button>
            <Button leftSection={<IconDownload size={16} />} variant="outline">
              Export Assets
            </Button>
            <ProductAssetUploader />
          </Group>
        </Group>

        {/* Quick Stats */}
        <ProductAssetStats />

        {/* Tabs */}
        <Tabs onChange={setActiveTab} value={activeTab}>
          <Tabs.List>
            <Tabs.Tab leftSection={<IconAsset size={16} />} value="overview">
              Overview
            </Tabs.Tab>
            <Tabs.Tab leftSection={<IconPhoto size={16} />} value="images">
              Images
            </Tabs.Tab>
            <Tabs.Tab leftSection={<IconVideo size={16} />} value="videos">
              Videos
            </Tabs.Tab>
            <Tabs.Tab leftSection={<IconFileText size={16} />} value="documents">
              Documents
            </Tabs.Tab>
            <Tabs.Tab leftSection={<IconCertificate size={16} />} value="certificates">
              Certificates
            </Tabs.Tab>
            <Tabs.Tab leftSection={<IconChartBar size={16} />} value="analytics">
              Analytics
            </Tabs.Tab>
            <Tabs.Tab leftSection={<IconTemplate size={16} />} value="templates">
              Templates
            </Tabs.Tab>
            <Tabs.Tab leftSection={<IconSettings size={16} />} value="settings">
              Settings
            </Tabs.Tab>
          </Tabs.List>

          {/* Overview Tab */}
          <Tabs.Panel pt="lg" value="overview">
            <Grid>
              <Grid.Col span={{ base: 12, md: 3 }}>
                <Stack gap="md">
                  <ProductAssetFilters
                    onProductFilter={setSelectedProducts}
                    onSearchChange={setSearchQuery}
                    onTypeFilter={setSelectedAssetType}
                    selectedProducts={selectedProducts}
                    searchQuery={searchQuery}
                    selectedType={selectedAssetType}
                  />

                  <ProductAssetTypeManager />
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 9 }}>
                <Stack gap="md">
                  <ProductAssetBulkOperations onSelectionChange={() => {}} selectedAssets={[]} />

                  <ProductAssetGrid
                    selectedProducts={selectedProducts}
                    assetType={selectedAssetType}
                    searchQuery={searchQuery}
                  />
                </Stack>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          {/* Asset Type Specific Tabs */}
          <Tabs.Panel pt="lg" value="images">
            <ProductAssetGrid
              selectedProducts={selectedProducts}
              viewMode="grid"
              assetType="IMAGE"
              searchQuery={searchQuery}
            />
          </Tabs.Panel>

          <Tabs.Panel pt="lg" value="videos">
            <ProductAssetGrid
              selectedProducts={selectedProducts}
              viewMode="list"
              assetType="VIDEO"
              searchQuery={searchQuery}
            />
          </Tabs.Panel>

          <Tabs.Panel pt="lg" value="documents">
            <ProductAssetGrid
              selectedProducts={selectedProducts}
              viewMode="list"
              assetType="DOCUMENT"
              searchQuery={searchQuery}
            />
          </Tabs.Panel>

          <Tabs.Panel pt="lg" value="certificates">
            <ProductAssetGrid
              selectedProducts={selectedProducts}
              viewMode="list"
              assetType="CERTIFICATE"
              searchQuery={searchQuery}
            />
          </Tabs.Panel>

          {/* Analytics Tab */}
          <Tabs.Panel pt="lg" value="analytics">
            <ProductAssetAnalytics />
          </Tabs.Panel>

          {/* Templates Tab */}
          <Tabs.Panel pt="lg" value="templates">
            <ProductAssetTemplates />
          </Tabs.Panel>

          {/* Settings Tab */}
          <Tabs.Panel pt="lg" value="settings">
            <Stack gap="lg">
              <Card withBorder>
                <Stack gap="md">
                  <Title order={4}>Asset Validation & Optimization</Title>
                  <Text c="dimmed" size="sm">
                    Configure validation rules and optimization settings for product assets
                  </Text>
                  <ProductAssetOptimization />
                </Stack>
              </Card>

              <Card withBorder>
                <Stack gap="md">
                  <Title order={4}>Asset Type Configuration</Title>
                  <Text c="dimmed" size="sm">
                    Manage asset types, validation rules, and organizational settings
                  </Text>
                  <ProductAssetTypeManager detailed />
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
