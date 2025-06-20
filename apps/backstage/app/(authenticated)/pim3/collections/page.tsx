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
  Paper,
  ScrollArea,
  Select,
  SimpleGrid,
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
import {
  IconAlertCircle,
  IconBuildingStore,
  IconCategory,
  IconCheck,
  IconCode,
  IconCopy,
  IconDotsVertical,
  IconEdit,
  IconFolder,
  IconHeart,
  IconInfoCircle,
  IconPackage,
  IconPhoto,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconSettings,
  IconStar,
  IconTag,
  IconTrash,
  IconUsers,
} from '@tabler/icons-react';
import { useEffect, useState, useTransition } from 'react';

import {
  formatDate,
  generateSlug,
  getCollectionTypeColor,
  getStatusColor,
  showErrorNotification,
  showSuccessNotification,
} from '@/utils/pim3/pim-helpers';

import {
  createCollection,
  deleteCollection,
  duplicateCollection,
  getAvailableParentCollections,
  getCollections,
  updateCollection,
} from './actions';

import type { CollectionType, ContentStatus } from '@repo/database/prisma';

interface Collection {
  _count?: {
    products: number;
    brands: number;
    taxonomies: number;
    categories: number;
    media: number;
    favorites: number;
    registries: number;
    children: number;
  };
  copy?: any;
  createdAt: Date;
  deletedAt?: Date | null;
  deletedById?: string | null;
  id: string;
  name: string;
  parent?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  parentId?: string | null;
  slug: string;
  status: ContentStatus;
  type: CollectionType;
  updatedAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
  userId?: string | null;
}

interface CollectionFormData {
  copy: string;
  name: string;
  parentId: string | null;
  slug: string;
  status: ContentStatus;
  type: CollectionType;
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [drawerOpened, { close: closeDrawer, open: openDrawer }] = useDisclosure(false);
  const [isCreating, setIsCreating] = useState(false);
  const [debouncedSearch] = useDebouncedValue(search, 200);
  const [activeTab, setActiveTab] = useState<string | null>('basic');
  const [isSaving, setIsSaving] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isPending, startTransition] = useTransition();

  // Product management state
  const [collectionProducts, setCollectionProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [availableParents, setAvailableParents] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingParents, setLoadingParents] = useState(false);

  // Load collections from database
  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      setLoading(true);
      setError(null);
      const collectionsData = await getCollections();
      setCollections(collectionsData);
    } catch (err) {
      console.error('Failed to load collections:', err);
      setError('Failed to load collections. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Form for collection editing/creation
  const form = useForm<CollectionFormData>({
    validate: {
      name: (value) => (!value ? 'Collection name is required' : null),
      slug: (value) => {
        if (!value) return 'Slug is required';
        if (!/^[a-z0-9-]+$/.test(value))
          return 'Slug must contain only lowercase letters, numbers, and hyphens';
        return null;
      },
    },
    initialValues: {
      name: '',
      type: 'OTHER' as CollectionType,
      copy: '{}',
      parentId: null,
      slug: '',
      status: 'DRAFT' as ContentStatus,
    },
  });

  // Load parent collections when editing
  useEffect(() => {
    if (drawerOpened && !isCreating && selectedCollection) {
      loadParentCollections(selectedCollection.id);
    } else if (drawerOpened && isCreating) {
      loadParentCollections();
    }
  }, [drawerOpened, isCreating, selectedCollection]);

  const loadParentCollections = async (excludeId?: string) => {
    try {
      setLoadingParents(true);
      const parents = await getAvailableParentCollections(excludeId);
      setAvailableParents(parents);
    } catch (error) {
      console.error('Failed to load parent collections:', error);
    } finally {
      setLoadingParents(false);
    }
  };

  // Open drawer for editing
  const handleEdit = (collection: Collection) => {
    setSelectedCollection(collection);
    setIsCreating(false);
    form.setValues({
      name: collection.name,
      type: collection.type,
      copy: JSON.stringify(collection.copy || {}, null, 2),
      parentId: collection.parentId,
      slug: collection.slug,
      status: collection.status,
    });
    setActiveTab('basic');
    openDrawer();
  };

  // Open drawer for creating
  const handleCreate = () => {
    setSelectedCollection(null);
    setIsCreating(true);
    form.reset();
    form.setFieldValue('status', 'DRAFT');
    form.setFieldValue('type', 'OTHER');
    form.setFieldValue('parentId', null);
    setActiveTab('basic');
    openDrawer();
  };

  // Handle form submission with loading state
  const handleSubmit = async (values: CollectionFormData) => {
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
        copy: parsedCopy,
        parentId: values.parentId,
        slug: values.slug,
        status: values.status,
      };

      if (isCreating) {
        await createCollection(data);
      } else if (selectedCollection) {
        await updateCollection(selectedCollection.id, data);
      }

      showSuccessNotification(
        isCreating ? 'Collection created successfully' : 'Collection updated successfully',
      );

      // Reload collections
      await loadCollections();

      closeDrawer();
      form.reset();
    } catch (error) {
      showErrorNotification(error instanceof Error ? error.message : 'Failed to save collection');
    } finally {
      setIsSaving(false);
    }
  };

  // Get type icon
  const getTypeIcon = (type: CollectionType) => {
    switch (type) {
      case 'SEASONAL':
        return <IconStar size={16} />;
      case 'THEMATIC':
        return <IconCategory size={16} />;
      case 'PRODUCT_LINE':
        return <IconPackage size={16} />;
      case 'FEATURED':
        return <IconHeart size={16} />;
      case 'PROMOTIONAL':
        return <IconTag size={16} />;
      default:
        return <IconFolder size={16} />;
    }
  };

  // Filter collections based on search
  const filterCollections = (collections: Collection[], searchTerm: string): Collection[] => {
    if (!searchTerm) return collections;

    return collections.filter(
      (collection) =>
        collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collection.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collection.type.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  };

  const filteredCollections = filterCollections(collections, debouncedSearch);

  return (
    <>
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Title order={2}>Collections</Title>
            <Text c="dimmed">Manage product collections and curated sets</Text>
          </div>
          <Button leftSection={<IconPlus size={18} />} onClick={() => handleCreate()}>
            Add Collection
          </Button>
        </Group>

        {/* Stats Cards */}
        <SimpleGrid cols={{ base: 2, lg: 6, md: 4 }} spacing="md">
          {(
            [
              'SEASONAL',
              'THEMATIC',
              'PRODUCT_LINE',
              'BRAND_LINE',
              'PROMOTIONAL',
              'CURATED',
              'TRENDING',
              'FEATURED',
              'NEW_ARRIVALS',
              'BEST_SELLERS',
              'CLEARANCE',
              'LIMITED_EDITION',
              'COLLABORATION',
              'EXCLUSIVE',
              'BUNDLE',
              'SET',
              'OTHER',
            ] as CollectionType[]
          ).map((type) => {
            const count = collections.filter((c) => c.type === type).length;
            return (
              <Paper key={type} withBorder p="md" radius="md">
                <Group gap="xs">
                  <ThemeIcon color={getCollectionTypeColor(type)} size="sm" variant="light">
                    {getTypeIcon(type)}
                  </ThemeIcon>
                  <div>
                    <Text fw={600} size="lg">
                      {count}
                    </Text>
                    <Text c="dimmed" size="xs" tt="capitalize">
                      {type.replace('_', ' ').toLowerCase()}
                    </Text>
                  </div>
                </Group>
              </Paper>
            );
          })}
        </SimpleGrid>

        {/* Search and Filters */}
        <Card withBorder>
          <Group>
            <TextInput
              leftSection={<IconSearch size={16} />}
              onChange={(e) => setSearch(e.currentTarget.value)}
              placeholder="Search collections..."
              style={{ flex: 1 }}
              value={search}
            />
            <Button
              leftSection={<IconRefresh size={16} />}
              onClick={() => loadCollections()}
              variant="subtle"
            >
              Refresh
            </Button>
          </Group>
        </Card>

        {/* Collections Table */}
        <Card withBorder p={0}>
          <LoadingOverlay visible={loading} zIndex={100} />
          {error ? (
            <Alert
              color="red"
              icon={<IconAlertCircle size={16} />}
              m="md"
              title="Error loading collections"
            >
              {error}
              <Button
                color="red"
                onClick={() => loadCollections()}
                mt="xs"
                size="xs"
                variant="light"
              >
                Try Again
              </Button>
            </Alert>
          ) : (
            <ScrollArea>
              <Table highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Collection</Table.Th>
                    <Table.Th>Type</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Parent</Table.Th>
                    <Table.Th>Items</Table.Th>
                    <Table.Th>Owner</Table.Th>
                    <Table.Th>Last Updated</Table.Th>
                    <Table.Th />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {!loading && filteredCollections.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={8}>
                        <Stack align="center" gap="md" py="xl">
                          <ThemeIcon color="gray" size="xl" variant="light">
                            <IconFolder size={30} />
                          </ThemeIcon>
                          <div>
                            <Text fw={500} ta="center">
                              {search ? 'No collections match your search' : 'No collections yet'}
                            </Text>
                            <Text c="dimmed" mt="xs" size="sm" ta="center">
                              {search
                                ? 'Try a different search term'
                                : 'Create your first collection to get started'}
                            </Text>
                          </div>
                          {!search && (
                            <Button
                              leftSection={<IconPlus size={16} />}
                              onClick={() => handleCreate()}
                              variant="light"
                            >
                              Create Collection
                            </Button>
                          )}
                        </Stack>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    filteredCollections.map((collection) => (
                      <Table.Tr key={collection.id}>
                        <Table.Td>
                          <Group gap="xs">
                            <ThemeIcon
                              color={getCollectionTypeColor(collection.type)}
                              size="sm"
                              variant="light"
                            >
                              {getTypeIcon(collection.type)}
                            </ThemeIcon>
                            <div>
                              <Text fw={500}>{collection.name}</Text>
                              <Text c="dimmed" size="xs">
                                /{collection.slug}
                              </Text>
                            </div>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={getCollectionTypeColor(collection.type)} variant="light">
                            {collection.type.replace('_', ' ')}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={getStatusColor(collection.status)} variant="light">
                            {collection.status}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          {collection.parent ? (
                            <Group gap="xs">
                              <ThemeIcon color="blue" size="xs" variant="light">
                                <IconFolder size={12} />
                              </ThemeIcon>
                              <Text size="sm">{collection.parent.name}</Text>
                            </Group>
                          ) : (
                            <Text c="dimmed" size="sm">
                              Root Collection
                            </Text>
                          )}
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <Tooltip label={`${collection._count?.products || 0} products`}>
                              <Badge leftSection={<IconPackage size={12} />} variant="light">
                                {collection._count?.products || 0}
                              </Badge>
                            </Tooltip>
                            <Tooltip
                              label={`${collection._count?.children || 0} child collections`}
                            >
                              <Badge leftSection={<IconFolder size={12} />} variant="light">
                                {collection._count?.children || 0}
                              </Badge>
                            </Tooltip>
                            <Tooltip label={`${collection._count?.brands || 0} brands`}>
                              <Badge leftSection={<IconBuildingStore size={12} />} variant="light">
                                {collection._count?.brands || 0}
                              </Badge>
                            </Tooltip>
                            <Tooltip label={`${collection._count?.media || 0} media files`}>
                              <Badge leftSection={<IconPhoto size={12} />} variant="light">
                                {collection._count?.media || 0}
                              </Badge>
                            </Tooltip>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          {collection.user ? (
                            <Tooltip label={collection.user.email}>
                              <Text lineClamp={1} size="sm">
                                {collection.user.name}
                              </Text>
                            </Tooltip>
                          ) : (
                            <Text c="dimmed" size="sm">
                              System
                            </Text>
                          )}
                        </Table.Td>
                        <Table.Td>
                          <Text c="dimmed" size="sm">
                            {formatDate(collection.updatedAt)}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs" justify="flex-end">
                            <Tooltip label="Edit Collection">
                              <ActionIcon onClick={() => handleEdit(collection)} variant="subtle">
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
                                      await duplicateCollection(collection.id);
                                      showSuccessNotification('Collection duplicated successfully');
                                      await loadCollections();
                                    } catch (error) {
                                      showErrorNotification('Failed to duplicate collection');
                                    }
                                  }}
                                >
                                  Duplicate
                                </Menu.Item>
                                <Menu.Item
                                  leftSection={<IconUsers size={16} />}
                                  onClick={() => {
                                    setSelectedCollection(collection);
                                    setActiveTab('products');
                                    openDrawer();
                                  }}
                                >
                                  Manage Products
                                </Menu.Item>
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
                                            Are you sure you want to delete{' '}
                                            <strong>{collection.name}</strong>?
                                          </Text>
                                          {collection._count && (
                                            <Alert color="yellow" variant="light">
                                              <Text size="xs">
                                                This collection contains{' '}
                                                {collection._count.products} products,{' '}
                                                {collection._count.brands} brands, and{' '}
                                                {collection._count.media} media files.
                                              </Text>
                                            </Alert>
                                          )}
                                        </Stack>
                                      ),
                                      confirmProps: { color: 'red' },
                                      labels: { cancel: 'Cancel', confirm: 'Delete' },
                                      onConfirm: async () => {
                                        try {
                                          await deleteCollection(collection.id);
                                          showSuccessNotification(
                                            'Collection deleted successfully',
                                          );
                                          await loadCollections();
                                        } catch (error) {
                                          showErrorNotification('Failed to delete collection');
                                        }
                                      },
                                      title: 'Delete Collection',
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
                    ))
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          )}
        </Card>
      </Stack>

      {/* Collection Edit/Create Drawer */}
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
              <IconFolder size={20} />
            </ThemeIcon>
            <div>
              <Text fw={600}>{isCreating ? 'Create Collection' : 'Edit Collection'}</Text>
              {selectedCollection && (
                <Text c="dimmed" size="xs">
                  ID: {selectedCollection.id}
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
              <Tabs.Tab leftSection={<IconPackage size={16} />} value="products">
                Products
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
                  placeholder="e.g., Summer Sale 2024"
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
                        <Text size="sm">
                          Click to auto-generate URL slug from the collection name
                        </Text>
                      </HoverCard.Dropdown>
                    </HoverCard>
                  }
                  label="Collection Name"
                  withAsterisk
                />

                <TextInput
                  {...form.getInputProps('slug')}
                  description="Used in URLs and breadcrumbs"
                  placeholder="e.g., summer-sale-2024"
                  label="URL Slug"
                  withAsterisk
                />

                <Select
                  {...form.getInputProps('type')}
                  leftSection={<IconTag size={16} />}
                  data={[
                    { label: 'Seasonal', value: 'SEASONAL' },
                    { label: 'Thematic', value: 'THEMATIC' },
                    { label: 'Product Line', value: 'PRODUCT_LINE' },
                    { label: 'Brand Line', value: 'BRAND_LINE' },
                    { label: 'Promotional', value: 'PROMOTIONAL' },
                    { label: 'Curated', value: 'CURATED' },
                    { label: 'Trending', value: 'TRENDING' },
                    { label: 'Featured', value: 'FEATURED' },
                    { label: 'New Arrivals', value: 'NEW_ARRIVALS' },
                    { label: 'Best Sellers', value: 'BEST_SELLERS' },
                    { label: 'Clearance', value: 'CLEARANCE' },
                    { label: 'Limited Edition', value: 'LIMITED_EDITION' },
                    { label: 'Collaboration', value: 'COLLABORATION' },
                    { label: 'Exclusive', value: 'EXCLUSIVE' },
                    { label: 'Bundle', value: 'BUNDLE' },
                    { label: 'Set', value: 'SET' },
                    { label: 'Other', value: 'OTHER' },
                  ]}
                  label="Collection Type"
                  withAsterisk
                />

                <Group grow>
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

                  <Select
                    {...form.getInputProps('parentId')}
                    allowDeselect
                    description="Choose a parent collection for hierarchical organization"
                    leftSection={<IconFolder size={16} />}
                    placeholder="Select parent collection"
                    clearable
                    data={[
                      { label: 'None (Root Collection)', value: '' },
                      ...availableParents.map((parent) => ({
                        label: `${parent.name} (${parent.type.replace('_', ' ')})`,
                        value: parent.id,
                      })),
                    ]}
                    label="Parent Collection"
                  />
                </Group>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel pt="md" value="products">
              {!isCreating && selectedCollection ? (
                <Stack gap="md">
                  <Text fw={500}>Manage Products in Collection</Text>
                  <Text c="dimmed" size="sm">
                    Add or remove products from this collection
                  </Text>

                  {/* Product management interface will be implemented here */}
                  <Alert icon={<IconInfoCircle size={16} />} variant="light">
                    <Text size="sm">
                      Product management for collections is available after the collection is
                      created. Save this collection first, then edit it to manage products.
                    </Text>
                  </Alert>
                </Stack>
              ) : (
                <Alert icon={<IconInfoCircle size={16} />} variant="light">
                  <Text size="sm">
                    Product management is available after creating the collection. Complete the
                    basic information first.
                  </Text>
                </Alert>
              )}
            </Tabs.Panel>

            <Tabs.Panel pt="md" value="advanced">
              <Stack gap="sm">
                <Group justify="space-between" mb="xs">
                  <Text fw={500}>Additional Content (JSON)</Text>
                </Group>

                <JsonInput
                  {...form.getInputProps('copy')}
                  autosize
                  description="Store additional collection data in JSON format"
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
                    Use this field to store custom attributes, collection settings, or any
                    additional structured data for this collection.
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
              {isCreating ? 'Create Collection' : 'Save Changes'}
            </Button>
          </Group>
        </form>
      </Drawer>
    </>
  );
}
