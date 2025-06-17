'use client';

import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Divider,
  Drawer,
  Group,
  HoverCard,
  JsonInput,
  LoadingOverlay,
  Menu,
  NumberInput,
  ScrollArea,
  Select,
  Stack,
  Table,
  Tabs,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDebouncedValue, useDisclosure, useMediaQuery } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
  IconAlertCircle,
  IconArrowDown,
  IconBuilding,
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconCode,
  IconCopy,
  IconDotsVertical,
  IconEdit,
  IconFolder,
  IconFolderOpen,
  IconInfoCircle,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconSettings,
  IconTrash,
  IconWorld,
  IconX,
} from '@tabler/icons-react';
import { useEffect, useState, useTransition } from 'react';

import {
  generateSlug,
  getBrandTypeColor,
  getStatusColor,
  validateJson,
  validateSlug,
  validateUrl,
} from '../utils/pim-helpers';

import { createBrand, deleteBrand, duplicateBrand, getBrandTree, updateBrand } from './actions';

import type { BrandType, ContentStatus } from '@repo/database/prisma';

interface Brand {
  _count?: {
    products: number;
    children: number;
  };
  baseUrl?: string | null;
  children: Brand[];
  copy?: any;
  createdAt: Date;
  deletedAt?: Date | null;
  deletedById?: string | null;
  displayOrder: number;
  id: string;
  name: string;
  parentId: string | null;
  slug: string;
  status: ContentStatus;
  type: BrandType;
  updatedAt: Date;
}

interface BrandFormData {
  baseUrl: string;
  copy: string;
  displayOrder: number;
  name: string;
  parentId: string | null;
  slug: string;
  status: ContentStatus;
  type: BrandType;
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expandedBrands, setExpandedBrands] = useState<Set<string>>(new Set());
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [drawerOpened, { close: closeDrawer, open: openDrawer }] = useDisclosure(false);
  const [isCreating, setIsCreating] = useState(false);
  const [debouncedSearch] = useDebouncedValue(search, 200);
  const [activeTab, setActiveTab] = useState<string | null>('basic');
  const [isSaving, setIsSaving] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isPending, startTransition] = useTransition();

  // Load brands from database
  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      setLoading(true);
      setError(null);
      const tree = await getBrandTree();
      setBrands(tree);
    } catch (err) {
      console.error('Failed to load brands:', err);
      setError('Failed to load brands. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Form for brand editing/creation
  const form = useForm<BrandFormData>({
    validate: {
      name: (value) => (!value ? 'Brand name is required' : null),
      baseUrl: validateUrl,
      copy: validateJson,
      displayOrder: (value) => {
        if (value < 0) return 'Display order must be positive';
        return null;
      },
      slug: validateSlug,
    },
    initialValues: {
      name: '',
      type: 'OTHER' as BrandType,
      baseUrl: '',
      copy: '{}',
      displayOrder: 0,
      parentId: null,
      slug: '',
      status: 'DRAFT' as ContentStatus,
    },
  });

  // Toggle brand expansion
  const toggleExpanded = (brandId: string) => {
    const newExpanded = new Set(expandedBrands);
    if (newExpanded.has(brandId)) {
      newExpanded.delete(brandId);
    } else {
      newExpanded.add(brandId);
    }
    setExpandedBrands(newExpanded);
  };

  // Open drawer for editing
  const handleEdit = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsCreating(false);
    form.setValues({
      name: brand.name,
      type: brand.type,
      baseUrl: brand.baseUrl || '',
      copy: JSON.stringify(brand.copy || {}, null, 2),
      displayOrder: brand.displayOrder,
      parentId: brand.parentId,
      slug: brand.slug,
      status: brand.status,
    });
    openDrawer();
  };

  // Open drawer for creating
  const handleCreate = (parentId: string | null = null) => {
    setSelectedBrand(null);
    setIsCreating(true);
    form.reset();
    form.setFieldValue('parentId', parentId);
    form.setFieldValue('status', 'DRAFT');
    form.setFieldValue('type', 'OTHER');
    openDrawer();
  };

  // Handle form submission with loading state
  const handleSubmit = async (values: BrandFormData) => {
    setIsSaving(true);

    try {
      // Parse and validate copy field
      let parsedCopy = {};
      try {
        parsedCopy = JSON.parse(values.copy || '{}');
      } catch {
        parsedCopy = {};
      }

      const data = {
        name: values.name,
        type: values.type,
        baseUrl: values.baseUrl || undefined,
        copy: parsedCopy,
        displayOrder: values.displayOrder,
        parentId: values.parentId || undefined,
        slug: values.slug,
        status: values.status,
      };

      if (isCreating) {
        await createBrand(data);
      } else if (selectedBrand) {
        await updateBrand(selectedBrand.id, data);
      }

      notifications.show({
        id: 'brand-save',
        autoClose: 3000,
        color: 'green',
        icon: <IconCheck size={16} />,
        message: isCreating ? 'Brand created successfully' : 'Brand updated successfully',
      });

      // Reload brands
      await loadBrands();

      closeDrawer();
      form.reset();
    } catch (error) {
      notifications.show({
        id: 'brand-error',
        color: 'red',
        icon: <IconX size={16} />,
        message: error instanceof Error ? error.message : 'Failed to save brand',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Get all parent brands for select
  const getAllParentBrands = (
    brands: Brand[],
    excludeId?: string,
  ): { value: string; label: string }[] => {
    const result: { value: string; label: string }[] = [
      { label: 'No Parent (Top Level)', value: '' },
    ];

    const addBrands = (brds: Brand[], prefix = '') => {
      brds.forEach((brand) => {
        if (brand.id !== excludeId) {
          result.push({ label: `${prefix}${brand.name}`, value: brand.id });
          if (brand.children.length > 0) {
            addBrands(brand.children, `${prefix}${brand.name} > `);
          }
        }
      });
    };

    addBrands(brands);
    return result;
  };

  // Filter brands based on search
  const filterBrands = (brands: Brand[], searchTerm: string): Brand[] => {
    if (!searchTerm) return brands;

    return brands.reduce((acc: Brand[], brand) => {
      const matchesSearch =
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.type.toLowerCase().includes(searchTerm.toLowerCase());

      const filteredChildren = filterBrands(brand.children, searchTerm);

      if (matchesSearch || filteredChildren.length > 0) {
        acc.push({
          ...brand,
          children: filteredChildren,
        });
        // Auto-expand if children match
        if (filteredChildren.length > 0) {
          setExpandedBrands((prev) => new Set([...prev, brand.id]));
        }
      }

      return acc;
    }, []);
  };

  // Render brand row
  const renderBrandRow = (brand: Brand, level = 0): React.ReactNode => {
    const isExpanded = expandedBrands.has(brand.id);
    const hasChildren = brand.children.length > 0;

    return (
      <>
        <Table.Tr key={brand.id}>
          <Table.Td>
            <Group style={{ paddingLeft: level * 24 }} gap="xs">
              {hasChildren && (
                <ActionIcon onClick={() => toggleExpanded(brand.id)} size="sm" variant="subtle">
                  {isExpanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                </ActionIcon>
              )}
              {!hasChildren && <div style={{ width: 28 }} />}
              <Group gap="xs">
                {isExpanded || !hasChildren ? (
                  <IconFolderOpen style={{ color: 'var(--mantine-color-blue-6)' }} size={20} />
                ) : (
                  <IconFolder style={{ color: 'var(--mantine-color-blue-6)' }} size={20} />
                )}
                <div>
                  <Text fw={500}>{brand.name}</Text>
                  <Text c="dimmed" size="xs">
                    /{brand.slug}
                  </Text>
                </div>
              </Group>
            </Group>
          </Table.Td>
          <Table.Td>
            <Badge color={getBrandTypeColor(brand.type)} variant="light">
              {brand.type}
            </Badge>
          </Table.Td>
          <Table.Td>
            <Badge color={getStatusColor(brand.status)} variant="light">
              {brand.status}
            </Badge>
          </Table.Td>
          <Table.Td>
            <Badge variant="light">{brand._count?.products || 0}</Badge>
          </Table.Td>
          <Table.Td>{brand.displayOrder}</Table.Td>
          <Table.Td>
            <Group gap="xs" justify="flex-end">
              <Tooltip label="Add Sub-brand">
                <ActionIcon onClick={() => handleCreate(brand.id)} variant="subtle">
                  <IconPlus size={16} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Edit Brand">
                <ActionIcon onClick={() => handleEdit(brand)} variant="subtle">
                  <IconEdit size={16} />
                </ActionIcon>
              </Tooltip>
              <Menu position="bottom-end">
                <Menu.Target>
                  <ActionIcon variant="subtle">
                    <IconDotsVertical size={16} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<IconCopy size={16} />}
                    onClick={async () => {
                      try {
                        await duplicateBrand(brand.id);
                        notifications.show({
                          color: 'green',
                          icon: <IconCheck size={16} />,
                          message: 'Brand duplicated successfully',
                        });
                        await loadBrands();
                      } catch (error) {
                        notifications.show({
                          color: 'red',
                          icon: <IconX size={16} />,
                          message: 'Failed to duplicate brand',
                        });
                      }
                    }}
                  >
                    Duplicate
                  </Menu.Item>
                  {brand.baseUrl && (
                    <Menu.Item
                      leftSection={<IconWorld size={16} />}
                      onClick={() => window.open(brand.baseUrl!, '_blank')}
                    >
                      Visit Website
                    </Menu.Item>
                  )}
                  <Menu.Divider />
                  <Menu.Item
                    color="red"
                    leftSection={<IconTrash size={16} />}
                    onClick={() => {
                      modals.openConfirmModal({
                        centered: true,
                        children: (
                          <Stack gap="sm">
                            <Text size="sm">
                              Are you sure you want to delete <strong>{brand.name}</strong>?
                            </Text>
                            {brand.children && brand.children.length > 0 && (
                              <Alert color="yellow" variant="light">
                                <Text size="xs">
                                  This brand has {brand.children.length} sub-brands.
                                </Text>
                              </Alert>
                            )}
                            {brand._count?.products && brand._count.products > 0 && (
                              <Alert color="red" variant="light">
                                <Text size="xs">
                                  {brand._count.products} products are assigned to this brand.
                                </Text>
                              </Alert>
                            )}
                          </Stack>
                        ),
                        confirmProps: { color: 'red' },
                        labels: { cancel: 'Cancel', confirm: 'Delete' },
                        onConfirm: async () => {
                          try {
                            await deleteBrand(brand.id);
                            notifications.show({
                              color: 'red',
                              icon: <IconTrash size={16} />,
                              message: 'Brand deleted successfully',
                            });
                            await loadBrands();
                          } catch (error) {
                            notifications.show({
                              color: 'red',
                              icon: <IconX size={16} />,
                              message: 'Failed to delete brand',
                            });
                          }
                        },
                        title: 'Delete Brand',
                      });
                    }}
                  >
                    Delete
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Table.Td>
        </Table.Tr>
        {isExpanded &&
          hasChildren &&
          brand.children.map((child) => renderBrandRow(child, level + 1))}
      </>
    );
  };

  const filteredBrands = filterBrands(brands, debouncedSearch);

  return (
    <>
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Title order={2}>Brand Management</Title>
            <Text c="dimmed">Manage your brand hierarchy and relationships</Text>
          </div>
          <Button leftSection={<IconPlus size={18} />} onClick={() => handleCreate()}>
            Add Brand
          </Button>
        </Group>

        {/* Search and Filters */}
        <Card withBorder>
          <Group>
            <TextInput
              leftSection={<IconSearch size={16} />}
              onChange={(e) => setSearch(e.currentTarget.value)}
              placeholder="Search brands..."
              style={{ flex: 1 }}
              value={search}
            />
            <Button
              onClick={() => {
                if (expandedBrands.size === 0) {
                  // Expand all
                  const allIds = new Set<string>();
                  const collectIds = (brds: Brand[]) => {
                    brds.forEach((brand) => {
                      if (brand.children.length > 0) {
                        allIds.add(brand.id);
                        collectIds(brand.children);
                      }
                    });
                  };
                  collectIds(brands);
                  setExpandedBrands(allIds);
                } else {
                  // Collapse all
                  setExpandedBrands(new Set());
                }
              }}
              variant="subtle"
            >
              {expandedBrands.size === 0 ? 'Expand All' : 'Collapse All'}
            </Button>
          </Group>
        </Card>

        {/* Brands Table */}
        <Card withBorder p={0}>
          <LoadingOverlay visible={loading} zIndex={100} />
          {error ? (
            <Alert
              color="red"
              icon={<IconAlertCircle size={16} />}
              m="md"
              title="Error loading brands"
            >
              {error}
              <Button color="red" onClick={() => loadBrands()} mt="xs" size="xs" variant="light">
                Try Again
              </Button>
            </Alert>
          ) : (
            <ScrollArea>
              <Table highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Brand</Table.Th>
                    <Table.Th>Type</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Products</Table.Th>
                    <Table.Th>Order</Table.Th>
                    <Table.Th />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {!loading && filteredBrands.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={6}>
                        <Stack align="center" gap="md" py="xl">
                          <ThemeIcon color="gray" size="xl" variant="light">
                            <IconBuilding size={30} />
                          </ThemeIcon>
                          <div>
                            <Text fw={500} ta="center">
                              {search ? 'No brands match your search' : 'No brands yet'}
                            </Text>
                            <Text c="dimmed" mt="xs" size="sm" ta="center">
                              {search
                                ? 'Try a different search term'
                                : 'Create your first brand to get started'}
                            </Text>
                          </div>
                          {!search && (
                            <Button
                              leftSection={<IconPlus size={16} />}
                              onClick={() => handleCreate()}
                              variant="light"
                            >
                              Create Brand
                            </Button>
                          )}
                        </Stack>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    filteredBrands.map((brand) => renderBrandRow(brand))
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          )}
        </Card>
      </Stack>

      {/* Brand Edit/Create Drawer */}
      <Drawer
        closeButtonProps={{ 'aria-label': 'Close drawer' }}
        lockScroll
        onClose={() => {
          if (form.isDirty() && !isSaving) {
            modals.openConfirmModal({
              children: (
                <Text size="sm">
                  You have unsaved changes. Are you sure you want to close without saving?
                </Text>
              ),
              confirmProps: { color: 'red' },
              labels: { cancel: 'Keep Editing', confirm: 'Discard Changes' },
              onConfirm: () => {
                closeDrawer();
                form.reset();
              },
              title: 'Unsaved Changes',
            });
          } else {
            closeDrawer();
            form.reset();
          }
        }}
        opened={drawerOpened}
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
        position="right"
        returnFocus
        transitionProps={{ duration: 250, transition: 'slide-left' }}
        trapFocus
        withCloseButton={!isSaving}
        padding="lg"
        size={isMobile ? '100%' : 'xl'}
        title={
          <Group gap="xs">
            <ThemeIcon color="blue" variant="light">
              <IconBuilding size={20} />
            </ThemeIcon>
            <div>
              <Text fw={600}>{isCreating ? 'Create Brand' : 'Edit Brand'}</Text>
              {selectedBrand && (
                <Text c="dimmed" size="xs">
                  ID: {selectedBrand.id}
                </Text>
              )}
            </div>
          </Group>
        }
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <LoadingOverlay
            overlayProps={{ blur: 2, radius: 'sm' }}
            visible={isSaving}
            zIndex={1000}
          />

          <Tabs onChange={setActiveTab} value={activeTab} variant="pills">
            <Tabs.List grow>
              <Tabs.Tab leftSection={<IconEdit size={16} />} value="basic">
                Basic Info
              </Tabs.Tab>
              <Tabs.Tab leftSection={<IconCode size={16} />} value="advanced">
                Advanced
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel pt="md" value="basic">
              <Stack gap="md">
                <TextInput
                  {...form.getInputProps('name')}
                  autoComplete="off"
                  data-autofocus
                  description="This will be displayed throughout the site"
                  placeholder="e.g., Apple Inc."
                  rightSection={
                    <HoverCard width={200} shadow="md">
                      <HoverCard.Target>
                        <ActionIcon
                          onClick={() => {
                            const slug = generateSlug(form.values.name);
                            form.setFieldValue('slug', slug);
                          }}
                          variant="subtle"
                        >
                          <IconRefresh size={16} />
                        </ActionIcon>
                      </HoverCard.Target>
                      <HoverCard.Dropdown>
                        <Text size="sm">Click to auto-generate URL slug from the brand name</Text>
                      </HoverCard.Dropdown>
                    </HoverCard>
                  }
                  label="Brand Name"
                  withAsterisk
                />

                <TextInput
                  {...form.getInputProps('slug')}
                  description="Used in URLs and breadcrumbs"
                  placeholder="e.g., apple-inc"
                  label="URL Slug"
                  withAsterisk
                />

                <Select
                  {...form.getInputProps('parentId')}
                  description="Leave empty for top-level brand"
                  leftSection={<IconFolder size={16} />}
                  nothingFoundMessage="No brands found"
                  onChange={(value) => form.setFieldValue('parentId', value || null)}
                  placeholder="Select parent brand"
                  clearable
                  data={getAllParentBrands(brands, selectedBrand?.id)}
                  label="Parent Brand"
                  searchable
                  value={form.values.parentId || ''}
                />

                <Group grow>
                  <Select
                    {...form.getInputProps('type')}
                    leftSection={<IconBuilding size={16} />}
                    data={[
                      { label: 'Manufacturer', value: 'MANUFACTURER' },
                      { label: 'Retailer', value: 'RETAILER' },
                      { label: 'Marketplace', value: 'MARKETPLACE' },
                      { label: 'Service', value: 'SERVICE' },
                      { label: 'Other', value: 'OTHER' },
                    ]}
                    label="Type"
                    withAsterisk
                  />

                  <Select
                    {...form.getInputProps('status')}
                    leftSection={<IconSettings size={16} />}
                    data={[
                      { label: 'Draft', value: 'DRAFT' },
                      { label: 'Published', value: 'PUBLISHED' },
                      { label: 'Archived', value: 'ARCHIVED' },
                    ]}
                    label="Status"
                  />
                </Group>

                <Group grow>
                  <TextInput
                    {...form.getInputProps('baseUrl')}
                    description="Official brand website"
                    leftSection={<IconWorld size={16} />}
                    placeholder="https://example.com"
                    label="Website URL"
                  />

                  <NumberInput
                    {...form.getInputProps('displayOrder')}
                    hideControls={false}
                    clampBehavior="strict"
                    description="Lower numbers appear first"
                    leftSection={<IconArrowDown size={16} />}
                    placeholder="0"
                    stepHoldDelay={500}
                    stepHoldInterval={100}
                    label="Display Order"
                    max={9999}
                    min={0}
                  />
                </Group>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel pt="md" value="advanced">
              <Stack gap="sm">
                <Group justify="space-between" mb="xs">
                  <Text fw={500}>Additional Content (JSON)</Text>
                </Group>

                <JsonInput
                  {...form.getInputProps('copy')}
                  autosize
                  description="Store additional brand data in JSON format"
                  formatOnBlur
                  maxRows={15}
                  minRows={6}
                  placeholder='{ "key": "value" }'
                  styles={{
                    input: {
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace',
                      fontSize: '13px',
                    },
                  }}
                  label="Custom Content"
                />

                <Alert color="gray" icon={<IconInfoCircle size={16} />} variant="light">
                  <Text size="xs">
                    Use this field to store custom attributes, brand guidelines, or any additional
                    structured data for this brand.
                  </Text>
                </Alert>
              </Stack>
            </Tabs.Panel>
          </Tabs>

          {/* Actions */}
          <Divider my="md" />
          <Group justify="space-between">
            <Button
              onClick={() => {
                if (form.isDirty()) {
                  modals.openConfirmModal({
                    children: 'You have unsaved changes that will be lost.',
                    confirmProps: { color: 'red' },
                    labels: { cancel: 'Keep editing', confirm: 'Discard' },
                    onConfirm: () => {
                      closeDrawer();
                      form.reset();
                    },
                    title: 'Discard changes?',
                  });
                } else {
                  closeDrawer();
                }
              }}
              disabled={isSaving}
              variant="subtle"
            >
              Cancel
            </Button>
            <Button
              leftSection={isSaving ? null : <IconCheck size={16} />}
              loading={isSaving}
              disabled={!form.isValid() || isSaving}
              type="submit"
            >
              {isCreating ? 'Create Brand' : 'Save Changes'}
            </Button>
          </Group>
        </form>
      </Drawer>
    </>
  );
}
