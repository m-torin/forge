'use client';

import {
  Avatar,
  Badge,
  Card,
  Group,
  Modal,
  ScrollArea,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { IconCalendar, IconGift, IconHeart, IconLock, IconWorld } from '@tabler/icons-react';
import { useState } from 'react';

import {
  formatCurrency,
  showDeleteConfirmModal,
  showErrorNotification,
  showSuccessNotification,
} from '../../utils/pim-helpers';
import { markItemPurchased, removeRegistryItem } from '../actions';

import { RegistryItemManagement } from './RegistryItemManagement';
import { RegistryUserAssignments } from './RegistryUserAssignments';
import { WishlistFunctionality } from './WishlistFunctionality';

import type { RegistryWithRelations } from '../actions';

interface RegistryDetailsModalProps {
  onClose: () => void;
  onRefresh?: () => void;
  opened: boolean;
  registry?: RegistryWithRelations | null;
}

const REGISTRY_TYPE_LABELS: Record<string, string> = {
  BABY: 'Baby Registry',
  BIRTHDAY: 'Birthday',
  GIFT: 'Gift Registry',
  HOLIDAY: 'Holiday',
  OTHER: 'Other',
  WEDDING: 'Wedding',
  WISHLIST: 'Wishlist',
};

const REGISTRY_TYPE_COLORS: Record<string, string> = {
  BABY: 'cyan',
  BIRTHDAY: 'orange',
  GIFT: 'blue',
  HOLIDAY: 'green',
  OTHER: 'gray',
  WEDDING: 'grape',
  WISHLIST: 'pink',
};

/**
 * RegistryDetailsModal component for viewing registry details and managing items
 */
export function RegistryDetailsModal({
  onClose,
  onRefresh,
  opened,
  registry,
}: RegistryDetailsModalProps) {
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});

  if (!registry) return null;

  const handleRemoveItem = async (itemId: string) => {
    showDeleteConfirmModal('registry item', async () => {
      setLoadingActions((prev) => ({ ...prev, [itemId]: true }));
      try {
        const result = await removeRegistryItem(itemId);
        if (result.success) {
          showSuccessNotification('Item removed from registry');
          onRefresh?.();
        } else {
          showErrorNotification(result.error || 'Failed to remove item');
        }
      } finally {
        setLoadingActions((prev) => ({ ...prev, [itemId]: false }));
      }
    });
  };

  const handleTogglePurchased = async (itemId: string, purchased: boolean) => {
    setLoadingActions((prev) => ({ ...prev, [itemId]: true }));
    try {
      const result = await markItemPurchased(itemId, !purchased);
      if (result.success) {
        showSuccessNotification(
          purchased ? 'Item marked as not purchased' : 'Item marked as purchased',
        );
        onRefresh?.();
      } else {
        showErrorNotification(result.error || 'Failed to update purchase status');
      }
    } finally {
      setLoadingActions((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const totalValue = registry.items
    .filter((item) => item.product?.price)
    .reduce((sum, item) => sum + item.product?.price! * item.quantity, 0);

  const purchasedValue = registry.items
    .filter((item) => item.purchased && item.product?.price)
    .reduce((sum, item) => sum + item.product?.price! * item.quantity, 0);

  const conversionRate =
    registry.items.length > 0
      ? (registry.items.filter((item) => item.purchased).length / registry.items.length) * 100
      : 0;

  return (
    <Modal
      onClose={onClose}
      opened={opened}
      scrollAreaComponent={ScrollArea.Autosize}
      size="xl"
      title={
        <Group gap="sm">
          <Badge
            color={REGISTRY_TYPE_COLORS[registry.type]}
            leftSection={
              registry.type === 'WISHLIST' ? <IconHeart size={14} /> : <IconGift size={14} />
            }
          >
            {REGISTRY_TYPE_LABELS[registry.type]}
          </Badge>
          <Text fw={600} size="lg">
            {registry.title}
          </Text>
        </Group>
      }
    >
      <Stack gap="lg">
        {/* Registry Info */}
        <Card shadow="sm" withBorder radius="md">
          <Stack gap="md">
            <Group justify="space-between">
              <div>
                <Title order={4}>{registry.title}</Title>
                {registry.description && (
                  <Text c="dimmed" mt={4}>
                    {registry.description}
                  </Text>
                )}
              </div>
              <Group gap="xs">
                <Badge
                  color={registry.isPublic ? 'green' : 'gray'}
                  leftSection={registry.isPublic ? <IconWorld size={14} /> : <IconLock size={14} />}
                >
                  {registry.isPublic ? 'Public' : 'Private'}
                </Badge>
              </Group>
            </Group>

            <Group>
              {registry.createdByUser && (
                <Group gap="sm">
                  <Avatar
                    alt={registry.createdByUser.name}
                    radius="xl"
                    size="sm"
                    src={registry.createdByUser.image}
                  >
                    {registry.createdByUser.name.charAt(0)}
                  </Avatar>
                  <div>
                    <Text fw={500} size="sm">
                      {registry.createdByUser.name}
                    </Text>
                    <Text c="dimmed" size="xs">
                      Creator
                    </Text>
                  </div>
                </Group>
              )}

              {registry.eventDate && (
                <Group gap="xs">
                  <IconCalendar size={16} />
                  <div>
                    <Text fw={500} size="sm">
                      {new Date(registry.eventDate).toLocaleDateString()}
                    </Text>
                    <Text c="dimmed" size="xs">
                      Event Date
                    </Text>
                  </div>
                </Group>
              )}

              <div>
                <Text fw={500} size="sm">
                  {new Date(registry.createdAt).toLocaleDateString()}
                </Text>
                <Text c="dimmed" size="xs">
                  Created
                </Text>
              </div>
            </Group>
          </Stack>
        </Card>

        {/* Statistics */}
        <Card shadow="sm" withBorder radius="md">
          <Title order={5} mb="md">
            Registry Statistics
          </Title>
          <Group grow>
            <div>
              <Text c="blue" fw={700} size="xl">
                {registry.items.length}
              </Text>
              <Text c="dimmed" size="xs">
                Total Items
              </Text>
            </div>
            <div>
              <Text c="green" fw={700} size="xl">
                {registry.items.filter((item) => item.purchased).length}
              </Text>
              <Text c="dimmed" size="xs">
                Purchased
              </Text>
            </div>
            <div>
              <Text c="orange" fw={700} size="xl">
                {conversionRate.toFixed(1)}%
              </Text>
              <Text c="dimmed" size="xs">
                Conversion Rate
              </Text>
            </div>
            {totalValue > 0 && (
              <div>
                <Text c="violet" fw={700} size="xl">
                  {formatCurrency(totalValue)}
                </Text>
                <Text c="dimmed" size="xs">
                  Total Value
                </Text>
              </div>
            )}
          </Group>
        </Card>

        {/* Registry Users */}
        <RegistryUserAssignments
          onRefresh={onRefresh}
          editable={true}
          registryId={registry.id}
          users={registry.users || []}
        />

        {/* Registry Item Management */}
        <RegistryItemManagement showAddButton={true} editable={true} registryId={registry.id} />

        {/* Wishlist Functionality */}
        <WishlistFunctionality onRefresh={onRefresh} registry={registry} />

        {/* Purchase History */}
        {registry.items.some((item) => item.purchases.length > 0) && (
          <Card shadow="sm" withBorder radius="md">
            <Title order={5} mb="md">
              Purchase History
            </Title>
            <Table striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Item</Table.Th>
                  <Table.Th>Purchaser</Table.Th>
                  <Table.Th>Quantity</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Date</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {registry.items
                  .flatMap((item) => item.purchases.map((purchase) => ({ ...purchase, item })))
                  .sort(
                    (a, b) =>
                      new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime(),
                  )
                  .map((purchase) => (
                    <Table.Tr key={purchase.id}>
                      <Table.Td>
                        <Text fw={500} size="sm">
                          {purchase.item.product?.name ||
                            purchase.item.collection?.name ||
                            'Unknown item'}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="sm">
                          <Avatar radius="xl" size="xs">
                            {purchase.purchaser.name.charAt(0)}
                          </Avatar>
                          <Text size="sm">{purchase.purchaser.name}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="light">{purchase.quantity}</Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={
                            purchase.status === 'DELIVERED'
                              ? 'green'
                              : purchase.status === 'SHIPPED'
                                ? 'blue'
                                : purchase.status === 'CONFIRMED'
                                  ? 'orange'
                                  : purchase.status === 'CANCELLED'
                                    ? 'red'
                                    : 'gray'
                          }
                        >
                          {purchase.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">
                          {new Date(purchase.purchaseDate).toLocaleDateString()}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
              </Table.Tbody>
            </Table>
          </Card>
        )}
      </Stack>
    </Modal>
  );
}
