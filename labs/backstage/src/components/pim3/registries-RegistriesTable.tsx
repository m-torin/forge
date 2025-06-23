'use client';

import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Card,
  Center,
  Checkbox,
  Group,
  Loader,
  Menu,
  Pagination,
  rem,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import {
  IconCalendar,
  IconDots,
  IconEdit,
  IconEye,
  IconEyeOff,
  IconGift,
  IconHeart,
  IconListDetails,
  IconLock,
  IconLockOpen,
  IconPlus,
  IconSearch,
  IconShoppingBag,
  IconTrash,
  IconUsers,
  IconWorld,
} from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';

import {
  showDeleteConfirmModal,
  showErrorNotification,
  showSuccessNotification,
  sortTableData,
} from '@/utils/pim3/pim-helpers';
import {
  getSelectAllCheckboxProps,
  setSorting,
  Th,
  toggleAllRows,
  toggleRowSelection,
  useTableForm,
} from '@/utils/pim3/table-helpers';
import {
  bulkDeleteRegistries,
  deleteRegistry,
  getRegistries,
  updateRegistryPrivacy,
} from '@/actions/pim3/actions';

import { RegistryAnalyticsDashboard } from './registries-RegistryAnalyticsDashboard';
import { RegistryDetailsModal } from './registries-RegistryDetailsModal';
import { RegistryFormModal } from './registries-RegistryFormModal';
import { RegistryItemAnalytics } from './registries-RegistryItemAnalytics';

import type { RegistryType, RegistryWithRelations } from '@/actions/pim3/actions';

interface RegistryTableFilters {
  hasItemsFilter: 'yes' | 'no' | '';
  page: number;
  privacyFilter: 'public' | 'private' | '';
  reverseSortDirection: boolean;
  search: string;
  selectedRows: string[];
  sortBy: string | null;
  typeFilter: RegistryType | '';
}

const REGISTRY_TYPE_LABELS: Record<RegistryType, string> = {
  BABY: 'Baby Registry',
  BIRTHDAY: 'Birthday',
  GIFT: 'Gift Registry',
  HOLIDAY: 'Holiday',
  OTHER: 'Other',
  WEDDING: 'Wedding',
  WISHLIST: 'Wishlist',
};

const REGISTRY_TYPE_COLORS: Record<RegistryType, string> = {
  BABY: 'cyan',
  BIRTHDAY: 'orange',
  GIFT: 'blue',
  HOLIDAY: 'green',
  OTHER: 'gray',
  WEDDING: 'grape',
  WISHLIST: 'pink',
};

const REGISTRY_TYPE_ICONS: Record<RegistryType, React.ReactNode> = {
  BABY: <IconHeart size={14} />,
  BIRTHDAY: <IconGift size={14} />,
  GIFT: <IconGift size={14} />,
  HOLIDAY: <IconGift size={14} />,
  OTHER: <IconListDetails size={14} />,
  WEDDING: <IconHeart size={14} />,
  WISHLIST: <IconHeart size={14} />,
};

/**
 * RegistriesTable component for managing customer registries
 * Provides search, filtering, sorting, and bulk operations on registries
 */
export function RegistriesTable() {
  const [registries, setRegistries] = useState<RegistryWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showItemAnalytics, setShowItemAnalytics] = useState(false);
  const [registryModalOpened, setRegistryModalOpened] = useState(false);
  const [detailsModalOpened, setDetailsModalOpened] = useState(false);
  const [editingRegistry, setEditingRegistry] = useState<RegistryWithRelations | null>(null);
  const [viewingRegistry, setViewingRegistry] = useState<RegistryWithRelations | null>(null);

  // Consolidate all filter and table state into a single form
  const form = useTableForm<RegistryTableFilters>({
    typeFilter: '',
    hasItemsFilter: '',
    privacyFilter: '',
  });

  const loadRegistries = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getRegistries({
        type: (form.values.typeFilter as RegistryType) || undefined,
        hasItems:
          form.values.hasItemsFilter === 'yes'
            ? true
            : form.values.hasItemsFilter === 'no'
              ? false
              : undefined,
        isPublic:
          form.values.privacyFilter === 'public'
            ? true
            : form.values.privacyFilter === 'private'
              ? false
              : undefined,
        limit: 25,
        page: form.values.page,
        search: form.values.search,
        sortBy: form.values.sortBy || 'createdAt',
        sortOrder: form.values.reverseSortDirection ? 'asc' : 'desc',
      });

      if (result.success && result.data) {
        setRegistries(result.data);
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages);
        }
      } else {
        showErrorNotification(result.error || 'Failed to load registries');
      }
    } catch (error) {
      showErrorNotification('Failed to load registries');
    } finally {
      setLoading(false);
    }
  }, [
    form.values.search,
    form.values.typeFilter,
    form.values.privacyFilter,
    form.values.hasItemsFilter,
    form.values.page,
    form.values.sortBy,
    form.values.reverseSortDirection,
  ]);

  useEffect(() => {
    loadRegistries();
  }, [loadRegistries]);

  const handleDelete = async (id: string) => {
    showDeleteConfirmModal('registry', async () => {
      const result = await deleteRegistry(id);
      if (result.success) {
        showSuccessNotification('Registry deleted successfully');
        loadRegistries();
      } else {
        showErrorNotification(result.error || 'Failed to delete registry');
      }
    });
  };

  const handleBulkDelete = async () => {
    if (form.values.selectedRows.length === 0) return;

    showDeleteConfirmModal(`${form.values.selectedRows.length} registries`, async () => {
      const result = await bulkDeleteRegistries(form.values.selectedRows);
      if (result.success) {
        showSuccessNotification('Registries deleted successfully');
        form.setFieldValue('selectedRows', []);
        loadRegistries();
      } else {
        showErrorNotification(result.error || 'Failed to delete registries');
      }
    });
  };

  const handleTogglePrivacy = async (id: string, currentPrivacy: boolean) => {
    const result = await updateRegistryPrivacy(id, !currentPrivacy);
    if (result.success) {
      showSuccessNotification(
        `Registry made ${!currentPrivacy ? 'public' : 'private'} successfully`,
      );
      loadRegistries();
    } else {
      showErrorNotification(result.error || 'Failed to update registry privacy');
    }
  };

  const handleEdit = (registry: RegistryWithRelations) => {
    setEditingRegistry(registry);
    setRegistryModalOpened(true);
  };

  const handleView = (registry: RegistryWithRelations) => {
    setViewingRegistry(registry);
    setDetailsModalOpened(true);
  };

  const handleFormSubmit = async () => {
    setRegistryModalOpened(false);
    setEditingRegistry(null);
    await loadRegistries();
  };

  const sortedData = sortTableData(
    registries,
    form.values.sortBy as keyof RegistryWithRelations,
    form.values.reverseSortDirection,
  );

  const rows = sortedData.map((registry) => (
    <Table.Tr
      key={registry.id}
      bg={
        form.values.selectedRows.includes(registry.id)
          ? 'var(--mantine-color-blue-light)'
          : undefined
      }
    >
      <Table.Td>
        <Checkbox
          onChange={(event) => toggleRowSelection(form, registry.id, event.currentTarget.checked)}
          aria-label={`Select registry ${registry.title}`}
          checked={form.values.selectedRows.includes(registry.id)}
        />
      </Table.Td>

      <Table.Td>
        <Group gap="sm">
          <div>
            <Group gap="xs">
              <Text fw={500} size="sm">
                {registry.title}
              </Text>
              <Badge
                color={REGISTRY_TYPE_COLORS[registry.type]}
                leftSection={REGISTRY_TYPE_ICONS[registry.type]}
                size="xs"
              >
                {REGISTRY_TYPE_LABELS[registry.type]}
              </Badge>
            </Group>
            {registry.description && (
              <Text c="dimmed" mt={2} size="xs">
                {registry.description.length > 60
                  ? `${registry.description.substring(0, 60)}...`
                  : registry.description}
              </Text>
            )}
          </div>
        </Group>
      </Table.Td>

      <Table.Td>
        {registry.createdByUser ? (
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
                {registry.createdByUser.email}
              </Text>
            </div>
          </Group>
        ) : (
          <Text c="dimmed" size="sm">
            Unknown user
          </Text>
        )}
      </Table.Td>

      <Table.Td>
        <Group gap="xs">
          <Badge
            color={registry.isPublic ? 'green' : 'gray'}
            leftSection={registry.isPublic ? <IconWorld size={14} /> : <IconLock size={14} />}
            size="sm"
          >
            {registry.isPublic ? 'Public' : 'Private'}
          </Badge>
        </Group>
      </Table.Td>

      <Table.Td>
        <Group gap="xs">
          <Badge color="blue" leftSection={<IconShoppingBag size={14} />} size="sm">
            {registry._count.items} items
          </Badge>
          <Badge color="cyan" leftSection={<IconUsers size={14} />} size="sm">
            {registry._count.users} users
          </Badge>
        </Group>
      </Table.Td>

      <Table.Td>
        {registry.eventDate && (
          <Group gap="xs">
            <IconCalendar size={14} />
            <Text size="sm">{new Date(registry.eventDate).toLocaleDateString()}</Text>
          </Group>
        )}
      </Table.Td>

      <Table.Td>
        <Text c="dimmed" size="xs">
          {new Date(registry.createdAt).toLocaleDateString()}
        </Text>
      </Table.Td>

      <Table.Td>
        <Group gap={0} justify="flex-end">
          <Tooltip label="View Details">
            <ActionIcon color="blue" onClick={() => handleView(registry)} variant="subtle">
              <IconEye size={16} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label={registry.isPublic ? 'Make Private' : 'Make Public'}>
            <ActionIcon
              color={registry.isPublic ? 'orange' : 'green'}
              onClick={() => handleTogglePrivacy(registry.id, registry.isPublic)}
              variant="subtle"
            >
              {registry.isPublic ? <IconEyeOff size={16} /> : <IconWorld size={16} />}
            </ActionIcon>
          </Tooltip>

          <Menu width={200} shadow="md">
            <Menu.Target>
              <ActionIcon color="gray" variant="subtle">
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => handleEdit(registry)}>
                Edit Registry
              </Menu.Item>

              <Menu.Item
                leftSection={
                  registry.isPublic ? <IconLockOpen size={14} /> : <IconLock size={14} />
                }
                onClick={() => handleTogglePrivacy(registry.id, registry.isPublic)}
              >
                {registry.isPublic ? 'Make Private' : 'Make Public'}
              </Menu.Item>

              <Menu.Divider />

              <Menu.Item
                color="red"
                leftSection={<IconTrash size={14} />}
                onClick={() => handleDelete(registry.id)}
              >
                Delete Registry
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  if (loading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Stack gap="lg">
      {/* Header */}
      <Group justify="space-between">
        <div>
          <Title order={2}>Registry Management</Title>
          <Text c="dimmed">Manage customer registries, wishlists, and gift lists</Text>
        </div>
        <Group>
          <Button
            leftSection={<IconListDetails size={16} />}
            onClick={() => setShowAnalytics(!showAnalytics)}
            variant="light"
          >
            {showAnalytics ? 'Hide Analytics' : 'Registry Analytics'}
          </Button>
          <Button
            color="orange"
            leftSection={<IconShoppingBag size={16} />}
            onClick={() => setShowItemAnalytics(!showItemAnalytics)}
            variant="light"
          >
            {showItemAnalytics ? 'Hide Item Analytics' : 'Item Analytics'}
          </Button>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => {
              setEditingRegistry(null);
              setRegistryModalOpened(true);
            }}
          >
            Create Registry
          </Button>
        </Group>
      </Group>

      {/* Analytics Dashboard */}
      {showAnalytics && (
        <Card shadow="sm" withBorder radius="md">
          <RegistryAnalyticsDashboard />
        </Card>
      )}

      {/* Item Analytics Dashboard */}
      {showItemAnalytics && (
        <Card shadow="sm" withBorder radius="md">
          <RegistryItemAnalytics />
        </Card>
      )}

      {/* Filters */}
      <Card shadow="sm" withBorder p="md" radius="md">
        <Group justify="space-between" mb="md">
          <Text fw={500}>Filters</Text>
          {form.values.selectedRows.length > 0 && (
            <Button
              color="red"
              leftSection={<IconTrash size={14} />}
              onClick={handleBulkDelete}
              size="sm"
              variant="light"
            >
              Delete Selected ({form.values.selectedRows.length})
            </Button>
          )}
        </Group>

        <Group>
          <TextInput
            leftSection={<IconSearch size={16} />}
            onChange={(event) => form.setFieldValue('search', event.currentTarget.value)}
            placeholder="Search registries..."
            style={{ flex: 1 }}
            value={form.values.search}
          />

          <Select
            onChange={(value) => form.setFieldValue('typeFilter', (value as RegistryType) || '')}
            placeholder="Registry Type"
            clearable
            data={[
              { label: 'All Types', value: '' },
              ...Object.entries(REGISTRY_TYPE_LABELS).map(([value, label]) => ({
                label,
                value,
              })),
            ]}
            value={form.values.typeFilter}
          />

          <Select
            onChange={(value) =>
              form.setFieldValue('privacyFilter', (value as 'public' | 'private' | '') || '')
            }
            placeholder="Privacy"
            clearable
            data={[
              { label: 'All', value: '' },
              { label: 'Public', value: 'public' },
              { label: 'Private', value: 'private' },
            ]}
            value={form.values.privacyFilter}
          />

          <Select
            onChange={(value) =>
              form.setFieldValue('hasItemsFilter', (value as 'yes' | 'no' | '') || '')
            }
            placeholder="Has Items"
            clearable
            data={[
              { label: 'All', value: '' },
              { label: 'Has Items', value: 'yes' },
              { label: 'Empty', value: 'no' },
            ]}
            value={form.values.hasItemsFilter}
          />
        </Group>
      </Card>

      {/* Table */}
      <Card shadow="sm" withBorder radius="md">
        <ScrollArea>
          <Table highlightOnHover striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: rem(40) }}>
                  <Checkbox
                    {...getSelectAllCheckboxProps(form.values, registries.length)}
                    onChange={(event) =>
                      toggleAllRows(
                        form,
                        registries.map((r) => r.id),
                        event.currentTarget.checked,
                      )
                    }
                  />
                </Table.Th>

                <Th
                  onSort={() => setSorting(form, 'title')}
                  sorted={form.values.sortBy === 'title'}
                  reversed={form.values.reverseSortDirection}
                >
                  Registry
                </Th>

                <Th
                  onSort={() => setSorting(form, 'createdByUser')}
                  sorted={form.values.sortBy === 'createdByUser'}
                  reversed={form.values.reverseSortDirection}
                >
                  Created By
                </Th>

                <Th
                  onSort={() => setSorting(form, 'isPublic')}
                  sorted={form.values.sortBy === 'isPublic'}
                  reversed={form.values.reverseSortDirection}
                >
                  Privacy
                </Th>

                <Table.Th>Stats</Table.Th>

                <Th
                  onSort={() => setSorting(form, 'eventDate')}
                  sorted={form.values.sortBy === 'eventDate'}
                  reversed={form.values.reverseSortDirection}
                >
                  Event Date
                </Th>

                <Th
                  onSort={() => setSorting(form, 'createdAt')}
                  sorted={form.values.sortBy === 'createdAt'}
                  reversed={form.values.reverseSortDirection}
                >
                  Created
                </Th>

                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.length > 0 ? (
                rows
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={8}>
                    <Center py="xl">
                      <Text c="dimmed">No registries found</Text>
                    </Center>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        {totalPages > 1 && (
          <Group justify="center" mt="md">
            <Pagination
              onChange={(page) => form.setFieldValue('page', page)}
              total={totalPages}
              value={form.values.page}
            />
          </Group>
        )}
      </Card>

      {/* Modals */}
      <RegistryFormModal
        onClose={() => {
          setRegistryModalOpened(false);
          setEditingRegistry(null);
        }}
        onSubmit={handleFormSubmit}
        opened={registryModalOpened}
        registry={editingRegistry}
      />

      <RegistryDetailsModal
        onClose={() => {
          setDetailsModalOpened(false);
          setViewingRegistry(null);
        }}
        onRefresh={loadRegistries}
        opened={detailsModalOpened}
        registry={viewingRegistry}
      />
    </Stack>
  );
}
