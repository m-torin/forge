'use client';

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Menu,
  Stack,
  Table,
  Text,
  Title,
  Tooltip,
  LoadingOverlay,
  Select,
  TextInput,
  Pagination,
  Modal,
} from '@mantine/core';
import {
  IconMapPin,
  IconEdit,
  IconTrash,
  IconEye,
  IconPlus,
  IconSearch,
  IconRefresh,
  IconUser,
  IconStar,
  IconStarFilled,
  IconBuilding,
  IconHome,
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

import { AddressForm } from './AddressForm';
import {
  getAddresses,
  deleteAddress,
  bulkDeleteAddresses,
  bulkUpdateAddressType,
  setDefaultAddress,
  getAddressAnalytics,
} from '@/actions/pim3/actions';

interface AddressTableProps {
  initialData?: any[];
}

export function AddressTable({ initialData = [] }: AddressTableProps) {
  // State management
  const [addresses, setAddresses] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [selectedAddresses, setSelectedAddresses] = useState<string[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [addressFormOpened, { open: openAddressForm, close: closeAddressForm }] =
    useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] =
    useDisclosure(false);
  const [analytics, setAnalytics] = useState<any>(null);

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    userId: '',
    type: '', // 'BILLING' | 'SHIPPING' | 'BOTH' | ''
    country: '',
    isDefault: '', // 'true' | 'false' | ''
    page: 1,
    limit: 50,
  });

  // Load addresses data
  const loadAddresses = async (newFilters = filters) => {
    try {
      setLoading(true);
      const result = await getAddresses({
        ...newFilters,
        isDefault:
          newFilters.isDefault === 'true'
            ? true
            : newFilters.isDefault === 'false'
              ? false
              : undefined,
      });

      if (result.success) {
        setAddresses(result.data);
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to load addresses',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load addresses',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Load analytics
  const loadAnalytics = async () => {
    try {
      const result = await getAddressAnalytics();
      if (result.success) {
        setAnalytics(result.data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  // Initial load
  useEffect(() => {
    loadAddresses();
    loadAnalytics();
  }, []);

  // Handle search and filter changes
  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    loadAddresses(newFilters);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    loadAddresses(newFilters);
  };

  // Handle address operations
  const handleViewAddress = (addressId: string) => {
    setSelectedAddress(addressId);
    setFormMode('view');
    openAddressForm();
  };

  const handleEditAddress = (addressId: string) => {
    setSelectedAddress(addressId);
    setFormMode('edit');
    openAddressForm();
  };

  const handleDeleteAddress = (addressId: string) => {
    setSelectedAddress(addressId);
    openDeleteModal();
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const result = await setDefaultAddress(addressId);

      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'Default address updated successfully',
          color: 'green',
        });
        loadAddresses();
        loadAnalytics();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to set default address',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to set default address',
        color: 'red',
      });
    }
  };

  const confirmDeleteAddress = async () => {
    if (!selectedAddress) return;

    try {
      const result = await deleteAddress(selectedAddress);

      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'Address deleted successfully',
          color: 'green',
        });
        loadAddresses();
        loadAnalytics();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to delete address',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete address',
        color: 'red',
      });
    } finally {
      closeDeleteModal();
      setSelectedAddress(null);
    }
  };

  // Handle bulk operations
  const handleBulkDelete = async () => {
    if (selectedAddresses.length === 0) return;

    try {
      const result = await bulkDeleteAddresses(selectedAddresses);

      if (result.success) {
        notifications.show({
          title: 'Success',
          message: `Deleted ${selectedAddresses.length} addresses`,
          color: 'green',
        });
        setSelectedAddresses([]);
        loadAddresses();
        loadAnalytics();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to delete addresses',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete addresses',
        color: 'red',
      });
    }
  };

  const handleBulkUpdateType = async (type: 'BILLING' | 'SHIPPING' | 'BOTH') => {
    if (selectedAddresses.length === 0) return;

    try {
      const result = await bulkUpdateAddressType(selectedAddresses, type);

      if (result.success) {
        notifications.show({
          title: 'Success',
          message: `Updated ${selectedAddresses.length} addresses to ${type}`,
          color: 'green',
        });
        setSelectedAddresses([]);
        loadAddresses();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to update address types',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update address types',
        color: 'red',
      });
    }
  };

  // Get type badge color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'BILLING':
        return 'blue';
      case 'SHIPPING':
        return 'green';
      case 'BOTH':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const formatAddress = (address: any) => {
    const parts = [
      address.street1,
      address.street2,
      address.city,
      address.state,
      address.postalCode,
      address.country,
    ].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <Stack>
      {/* Analytics Cards */}
      {analytics && (
        <Group>
          <Card withBorder p="sm" style={{ flex: 1 }}>
            <Text size="sm" c="dimmed">
              Total Addresses
            </Text>
            <Text size="xl" fw={700}>
              {analytics.totalAddresses}
            </Text>
          </Card>
          <Card withBorder p="sm" style={{ flex: 1 }}>
            <Text size="sm" c="dimmed">
              Billing Addresses
            </Text>
            <Text size="xl" fw={700} c="blue">
              {analytics.billingAddresses}
            </Text>
          </Card>
          <Card withBorder p="sm" style={{ flex: 1 }}>
            <Text size="sm" c="dimmed">
              Shipping Addresses
            </Text>
            <Text size="xl" fw={700} c="green">
              {analytics.shippingAddresses}
            </Text>
          </Card>
          <Card withBorder p="sm" style={{ flex: 1 }}>
            <Text size="sm" c="dimmed">
              Both Type
            </Text>
            <Text size="xl" fw={700} c="purple">
              {analytics.bothTypeAddresses}
            </Text>
          </Card>
          <Card withBorder p="sm" style={{ flex: 1 }}>
            <Text size="sm" c="dimmed">
              Unique Users
            </Text>
            <Text size="xl" fw={700} c="orange">
              {analytics.uniqueUsers}
            </Text>
          </Card>
          <Card withBorder p="sm" style={{ flex: 1 }}>
            <Text size="sm" c="dimmed">
              Avg per User
            </Text>
            <Text size="xl" fw={700} c="grape">
              {analytics.averageAddressesPerUser}
            </Text>
          </Card>
        </Group>
      )}

      {/* Header and Controls */}
      <Group justify="space-between">
        <Title order={3}>Address Management</Title>
        <Group>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => {
              setSelectedAddress(null);
              setSelectedUserId(null);
              setFormMode('create');
              openAddressForm();
            }}
          >
            Add Address
          </Button>

          {selectedAddresses.length > 0 && (
            <Menu>
              <Menu.Target>
                <Button variant="light">Bulk Actions ({selectedAddresses.length})</Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Update Type</Menu.Label>
                <Menu.Item
                  leftSection={<IconHome size={14} />}
                  onClick={() => handleBulkUpdateType('BILLING')}
                >
                  Set as Billing
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconBuilding size={14} />}
                  onClick={() => handleBulkUpdateType('SHIPPING')}
                >
                  Set as Shipping
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconMapPin size={14} />}
                  onClick={() => handleBulkUpdateType('BOTH')}
                >
                  Set as Both
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconTrash size={14} />}
                  color="red"
                  onClick={handleBulkDelete}
                >
                  Delete Selected
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>
      </Group>

      {/* Filters */}
      <Group>
        <TextInput
          placeholder="Search addresses..."
          leftSection={<IconSearch size={16} />}
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          style={{ flex: 1 }}
        />
        <TextInput
          placeholder="Filter by user ID"
          leftSection={<IconUser size={16} />}
          value={filters.userId}
          onChange={(e) => handleFilterChange('userId', e.target.value)}
        />
        <Select
          placeholder="Address type"
          data={[
            { value: '', label: 'All Types' },
            { value: 'BILLING', label: 'Billing' },
            { value: 'SHIPPING', label: 'Shipping' },
            { value: 'BOTH', label: 'Both' },
          ]}
          value={filters.type}
          onChange={(value) => handleFilterChange('type', value || '')}
        />
        <Select
          placeholder="Default status"
          data={[
            { value: '', label: 'All' },
            { value: 'true', label: 'Default Only' },
            { value: 'false', label: 'Non-Default' },
          ]}
          value={filters.isDefault}
          onChange={(value) => handleFilterChange('isDefault', value || '')}
        />
        <Button
          variant="light"
          leftSection={<IconRefresh size={16} />}
          onClick={() => loadAddresses()}
        >
          Refresh
        </Button>
      </Group>

      {/* Table */}
      <Card withBorder p={0}>
        <LoadingOverlay visible={loading} />

        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: 40 }}>
                <input
                  type="checkbox"
                  checked={selectedAddresses.length === addresses.length && addresses.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedAddresses(addresses.map((a) => a.id));
                    } else {
                      setSelectedAddresses([]);
                    }
                  }}
                />
              </Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Address</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>User</Table.Th>
              <Table.Th>Default</Table.Th>
              <Table.Th style={{ width: 120 }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {addresses.map((address) => (
              <Table.Tr key={address.id}>
                <Table.Td>
                  <input
                    type="checkbox"
                    checked={selectedAddresses.includes(address.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAddresses([...selectedAddresses, address.id]);
                      } else {
                        setSelectedAddresses(selectedAddresses.filter((id) => id !== address.id));
                      }
                    }}
                  />
                </Table.Td>
                <Table.Td>
                  <Stack gap={4}>
                    <Text size="sm" fw={500}>
                      {address.firstName} {address.lastName}
                    </Text>
                    {address.company && (
                      <Text size="xs" c="dimmed">
                        {address.company}
                      </Text>
                    )}
                  </Stack>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" style={{ maxWidth: 200 }} truncate>
                    {formatAddress(address)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge color={getTypeColor(address.type)} variant="light">
                    {address.type}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Stack gap={4}>
                    <Text size="sm" fw={500}>
                      {address.user?.name || 'Unknown User'}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {address.user?.email}
                    </Text>
                  </Stack>
                </Table.Td>
                <Table.Td>
                  <Tooltip label={address.isDefault ? 'Default address' : 'Set as default'}>
                    <ActionIcon
                      variant={address.isDefault ? 'filled' : 'subtle'}
                      color={address.isDefault ? 'yellow' : 'gray'}
                      onClick={() => !address.isDefault && handleSetDefault(address.id)}
                      disabled={address.isDefault}
                    >
                      {address.isDefault ? <IconStarFilled size={16} /> : <IconStar size={16} />}
                    </ActionIcon>
                  </Tooltip>
                </Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    <Tooltip label="View address">
                      <ActionIcon variant="light" onClick={() => handleViewAddress(address.id)}>
                        <IconEye size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Edit address">
                      <ActionIcon variant="light" onClick={() => handleEditAddress(address.id)}>
                        <IconEdit size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Delete address">
                      <ActionIcon
                        color="red"
                        variant="light"
                        onClick={() => handleDeleteAddress(address.id)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        {addresses.length === 0 && !loading && (
          <Text ta="center" py="xl" c="dimmed">
            No addresses found. Try adjusting your filters or add a new address.
          </Text>
        )}
      </Card>

      {/* Pagination */}
      <Group justify="center">
        <Pagination
          value={filters.page}
          onChange={handlePageChange}
          total={Math.ceil(addresses.length / filters.limit)}
        />
      </Group>

      {/* Address Form Modal */}
      <AddressForm
        opened={addressFormOpened}
        onClose={closeAddressForm}
        onSuccess={() => {
          closeAddressForm();
          loadAddresses();
          loadAnalytics();
        }}
        addressId={selectedAddress}
        userId={selectedUserId}
        mode={formMode}
      />

      {/* Delete Confirmation Modal */}
      <Modal opened={deleteModalOpened} onClose={closeDeleteModal} title="Delete Address" size="sm">
        <Stack>
          <Text>Are you sure you want to delete this address? This action cannot be undone.</Text>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button color="red" onClick={confirmDeleteAddress}>
              Delete Address
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
