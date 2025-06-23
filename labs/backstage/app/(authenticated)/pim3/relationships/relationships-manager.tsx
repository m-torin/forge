'use client';

import {
  ActionIcon,
  Button,
  Card,
  Group,
  Menu,
  Select,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconChartBar,
  IconFilter,
  IconGift,
  IconHeart,
  IconLink,
  IconSearch,
  IconShoppingCart,
  IconThumbUp,
} from '@tabler/icons-react';
import { useState } from 'react';

import { FavoriteRelationships } from './favorite-relationships';
// Import relationship-specific components
import { PdpRelationships } from './pdp-relationships';
import { PurchaseRelationships } from './purchase-relationships';
import { RegistryRelationships } from './registry-relationships';
import { RelationshipAnalytics } from './relationship-analytics';
import { ReviewVoteRelationships } from './review-vote-relationships';

type RelationshipTab =
  | 'pdp'
  | 'favorites'
  | 'reviews'
  | 'registry-users'
  | 'purchases'
  | 'analytics';

export function RelationshipsManager() {
  const [activeTab, setActiveTab] = useState<RelationshipTab>('pdp');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [analyticsModalOpened, { close: closeAnalytics, open: openAnalytics }] =
    useDisclosure(false);

  const relationshipStats = {
    favorites: { color: 'pink', icon: IconHeart, label: 'User Favorites', total: 5234 },
    pdp: { color: 'blue', icon: IconLink, label: 'Product-Seller Links', total: 1842 },
    purchases: { color: 'orange', icon: IconShoppingCart, label: 'Registry Purchases', total: 156 },
    'registry-users': { color: 'purple', icon: IconGift, label: 'Registry Access', total: 342 },
    reviews: { color: 'green', icon: IconThumbUp, label: 'Review Votes', total: 892 },
  };

  const handleExportData = () => {
    notifications.show({
      color: 'blue',
      message: 'Preparing relationship data export...',
      title: 'Export Started',
    });
  };

  const handleBulkOperation = (operation: string) => {
    notifications.show({
      color: 'yellow',
      message: `Starting bulk ${operation} operation...`,
      title: 'Bulk Operation',
    });
  };

  return (
    <Stack gap="lg">
      {/* Header */}
      <Group justify="space-between" wrap="nowrap">
        <div>
          <Title order={2}>Relationship Management</Title>
          <Text c="dimmed" size="sm">
            Manage connections between products, users, and other entities
          </Text>
        </div>
        <Group gap="sm">
          <Button leftSection={<IconChartBar size={16} />} onClick={openAnalytics} variant="light">
            Analytics
          </Button>
          <Menu width={200} shadow="md">
            <Menu.Target>
              <Button variant="default">Actions</Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Bulk Operations</Menu.Label>
              <Menu.Item onClick={() => handleBulkOperation('cleanup')}>
                Clean Orphaned Relations
              </Menu.Item>
              <Menu.Item onClick={() => handleBulkOperation('validate')}>
                Validate Relationships
              </Menu.Item>
              <Menu.Item onClick={() => handleBulkOperation('optimize')}>
                Optimize Indexes
              </Menu.Item>
              <Menu.Divider />
              <Menu.Label>Export</Menu.Label>
              <Menu.Item onClick={handleExportData}>Export All Data</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>

      {/* Search and Filter Bar */}
      <Card>
        <Group>
          <TextInput
            leftSection={<IconSearch size={16} />}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            placeholder="Search relationships..."
            style={{ flex: 1 }}
            value={searchQuery}
          />
          <Select
            leftSection={<IconFilter size={16} />}
            onChange={setFilterType}
            placeholder="Filter by type"
            clearable
            data={[
              { label: 'Active Only', value: 'active' },
              { label: 'Orphaned', value: 'orphaned' },
              { label: 'Recently Created', value: 'recent' },
              { label: 'High Volume', value: 'high-volume' },
            ]}
            value={filterType}
            w={200}
          />
        </Group>
      </Card>

      {/* Stats Overview */}
      <Group grow>
        {Object.entries(relationshipStats).map(([key, stat]) => {
          const Icon = stat.icon;
          return (
            <Card key={key} withBorder p="lg" radius="md">
              <Group align="flex-start" justify="space-between">
                <div>
                  <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                    {stat.label}
                  </Text>
                  <Text fw={700} size="xl">
                    {stat.total.toLocaleString()}
                  </Text>
                </div>
                <ActionIcon color={stat.color} radius="md" size="xl" variant="light">
                  <Icon size={24} />
                </ActionIcon>
              </Group>
            </Card>
          );
        })}
      </Group>

      {/* Relationship Tabs */}
      <Tabs onChange={(value) => setActiveTab(value as RelationshipTab)} value={activeTab}>
        <Tabs.List>
          <Tabs.Tab leftSection={<IconLink size={16} />} value="pdp">
            Product-Seller
          </Tabs.Tab>
          <Tabs.Tab leftSection={<IconHeart size={16} />} value="favorites">
            Favorites
          </Tabs.Tab>
          <Tabs.Tab leftSection={<IconThumbUp size={16} />} value="reviews">
            Review Votes
          </Tabs.Tab>
          <Tabs.Tab leftSection={<IconGift size={16} />} value="registry-users">
            Registry Access
          </Tabs.Tab>
          <Tabs.Tab leftSection={<IconShoppingCart size={16} />} value="purchases">
            Purchases
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel pt="xl" value="pdp">
          <PdpRelationships />
        </Tabs.Panel>

        <Tabs.Panel pt="xl" value="favorites">
          <FavoriteRelationships />
        </Tabs.Panel>

        <Tabs.Panel pt="xl" value="reviews">
          <ReviewVoteRelationships />
        </Tabs.Panel>

        <Tabs.Panel pt="xl" value="registry-users">
          <RegistryRelationships />
        </Tabs.Panel>

        <Tabs.Panel pt="xl" value="purchases">
          <PurchaseRelationships />
        </Tabs.Panel>
      </Tabs>

      {/* Analytics Modal */}
      <RelationshipAnalytics />
    </Stack>
  );
}
