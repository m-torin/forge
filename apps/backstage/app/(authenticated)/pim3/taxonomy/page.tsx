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
import { useDebouncedValue, useDisclosure, useMediaQuery, useToggle } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
  IconAlertCircle,
  IconCheck,
  IconCode,
  IconCopy,
  IconDotsVertical,
  IconEdit,
  IconInfoCircle,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconSettings,
  IconTag,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { useEffect, useState, useTransition } from 'react';

import {
  createTaxonomy,
  deleteTaxonomy,
  duplicateTaxonomy,
  getTaxonomyList,
  updateTaxonomy,
} from './actions';

import type { ContentStatus, TaxonomyType } from '@repo/database/prisma';

interface Taxonomy {
  _count?: {
    products: number;
    collections: number;
  };
  copy?: any;
  createdAt: Date;
  deletedAt?: Date | null;
  deletedById?: string | null;
  id: string;
  name: string;
  slug: string;
  status: ContentStatus;
  type: TaxonomyType;
  updatedAt: Date;
}

interface TaxonomyFormData {
  copy: string;
  name: string;
  slug: string;
  status: ContentStatus;
  type: TaxonomyType;
}

export default function TaxonomyPage() {
  const [taxonomies, setTaxonomies] = useState<Taxonomy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedTaxonomy, setSelectedTaxonomy] = useState<Taxonomy | null>(null);
  const [drawerOpened, { close: closeDrawer, open: openDrawer }] = useDisclosure(false);
  const [isCreating, setIsCreating] = useState(false);
  const [debouncedSearch] = useDebouncedValue(search, 200);
  const [activeTab, setActiveTab] = useState<string | null>('basic');
  const [isSaving, setIsSaving] = useState(false);
  const [showJsonEditor, toggleJsonEditor] = useToggle([false, true]);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isPending, startTransition] = useTransition();

  // Load taxonomies from database
  useEffect(() => {
    loadTaxonomies();
  }, []);

  const loadTaxonomies = async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await getTaxonomyList();
      setTaxonomies(list);
    } catch (err) {
      console.error('Failed to load taxonomies:', err);
      setError('Failed to load taxonomies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Form for taxonomy editing/creation
  const form = useForm<TaxonomyFormData>({
    validate: {
      name: (value) => (!value ? 'Taxonomy name is required' : null),
      slug: (value) => {
        if (!value) return 'Slug is required';
        if (!/^[a-z0-9-]+$/.test(value))
          return 'Slug must contain only lowercase letters, numbers, and hyphens';
        return null;
      },
    },
    initialValues: {
      name: '',
      type: 'CATEGORY' as TaxonomyType,
      copy: '{}',
      slug: '',
      status: 'DRAFT' as ContentStatus,
    },
  });

  // Open drawer for editing
  const handleEdit = (taxonomy: Taxonomy) => {
    setSelectedTaxonomy(taxonomy);
    setIsCreating(false);
    form.setValues({
      name: taxonomy.name,
      type: taxonomy.type,
      copy: JSON.stringify(taxonomy.copy || {}, null, 2),
      slug: taxonomy.slug,
      status: taxonomy.status,
    });
    openDrawer();
  };

  // Open drawer for creating
  const handleCreate = () => {
    setSelectedTaxonomy(null);
    setIsCreating(true);
    form.reset();
    form.setFieldValue('status', 'DRAFT');
    form.setFieldValue('type', 'CATEGORY');
    openDrawer();
  };

  // Handle form submission with loading state
  const handleSubmit = async (values: TaxonomyFormData) => {
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
        slug: values.slug,
        status: values.status,
      };

      if (isCreating) {
        await createTaxonomy(data);
      } else if (selectedTaxonomy) {
        await updateTaxonomy(selectedTaxonomy.id, data);
      }

      notifications.show({
        id: 'taxonomy-save',
        autoClose: 3000,
        color: 'green',
        icon: <IconCheck size={16} />,
        message: isCreating ? 'Taxonomy created successfully' : 'Taxonomy updated successfully',
      });

      // Reload taxonomies
      await loadTaxonomies();

      closeDrawer();
      form.reset();
    } catch (error) {
      notifications.show({
        id: 'taxonomy-error',
        color: 'red',
        icon: <IconX size={16} />,
        message: error instanceof Error ? error.message : 'Failed to save taxonomy',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Get status color
  const getStatusColor = (status: ContentStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return 'green';
      case 'DRAFT':
        return 'gray';
      case 'ARCHIVED':
        return 'red';
      default:
        return 'gray';
    }
  };

  // Get type color
  const getTypeColor = (type: TaxonomyType) => {
    switch (type) {
      case 'CATEGORY':
        return 'blue';
      case 'TAG':
        return 'green';
      case 'ATTRIBUTE':
        return 'purple';
      case 'DEPARTMENT':
        return 'orange';
      case 'COLLECTION':
        return 'teal';
      default:
        return 'gray';
    }
  };

  // Filter taxonomies based on search
  const filteredTaxonomies = taxonomies.filter((taxonomy) => {
    if (!debouncedSearch) return true;

    const searchLower = debouncedSearch.toLowerCase();
    return (
      taxonomy.name.toLowerCase().includes(searchLower) ||
      taxonomy.slug.toLowerCase().includes(searchLower) ||
      taxonomy.type.toLowerCase().includes(searchLower)
    );
  });

  return (
    <>
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Title order={2}>Taxonomy Management</Title>
            <Text c="dimmed">Manage categories, tags, and other taxonomies</Text>
          </div>
          <Button leftSection={<IconPlus size={18} />} onClick={() => handleCreate()}>
            Add Taxonomy
          </Button>
        </Group>

        {/* Search */}
        <Card withBorder>
          <TextInput
            leftSection={<IconSearch size={16} />}
            onChange={(e) => setSearch(e.currentTarget.value)}
            placeholder="Search taxonomies..."
            value={search}
          />
        </Card>

        {/* Taxonomies Table */}
        <Card withBorder p={0}>
          <LoadingOverlay visible={loading} zIndex={100} />
          {error ? (
            <Alert
              color="red"
              icon={<IconAlertCircle size={16} />}
              m="md"
              title="Error loading taxonomies"
            >
              {error}
              <Button
                color="red"
                onClick={() => loadTaxonomies()}
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
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Type</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Products</Table.Th>
                    <Table.Th>Collections</Table.Th>
                    <Table.Th />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {!loading && filteredTaxonomies.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={6}>
                        <Stack align="center" gap="md" py="xl">
                          <ThemeIcon color="gray" size="xl" variant="light">
                            <IconTag size={30} />
                          </ThemeIcon>
                          <div>
                            <Text fw={500} ta="center">
                              {search ? 'No taxonomies match your search' : 'No taxonomies yet'}
                            </Text>
                            <Text c="dimmed" mt="xs" size="sm" ta="center">
                              {search
                                ? 'Try a different search term'
                                : 'Create your first taxonomy to get started'}
                            </Text>
                          </div>
                          {!search && (
                            <Button
                              leftSection={<IconPlus size={16} />}
                              onClick={() => handleCreate()}
                              variant="light"
                            >
                              Create Taxonomy
                            </Button>
                          )}
                        </Stack>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    filteredTaxonomies.map((taxonomy) => (
                      <Table.Tr key={taxonomy.id}>
                        <Table.Td>
                          <div>
                            <Text fw={500}>{taxonomy.name}</Text>
                            <Text c="dimmed" size="xs">
                              /{taxonomy.slug}
                            </Text>
                          </div>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={getTypeColor(taxonomy.type)} variant="light">
                            {taxonomy.type}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={getStatusColor(taxonomy.status)} variant="light">
                            {taxonomy.status}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge variant="light">{taxonomy._count?.products || 0}</Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge variant="light">{taxonomy._count?.collections || 0}</Badge>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs" justify="flex-end">
                            <Tooltip label="Edit Taxonomy">
                              <ActionIcon onClick={() => handleEdit(taxonomy)} variant="subtle">
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
                                      await duplicateTaxonomy(taxonomy.id);
                                      notifications.show({
                                        color: 'green',
                                        icon: <IconCheck size={16} />,
                                        message: 'Taxonomy duplicated successfully',
                                      });
                                      await loadTaxonomies();
                                    } catch (error) {
                                      notifications.show({
                                        color: 'red',
                                        icon: <IconX size={16} />,
                                        message: 'Failed to duplicate taxonomy',
                                      });
                                    }
                                  }}
                                >
                                  Duplicate
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
                                            <strong>{taxonomy.name}</strong>?
                                          </Text>
                                          {taxonomy._count?.products &&
                                            taxonomy._count.products > 0 && (
                                              <Alert color="red" variant="light">
                                                <Text size="xs">
                                                  {taxonomy._count.products} products are using this
                                                  taxonomy.
                                                </Text>
                                              </Alert>
                                            )}
                                          {taxonomy._count?.collections &&
                                            taxonomy._count.collections > 0 && (
                                              <Alert color="orange" variant="light">
                                                <Text size="xs">
                                                  {taxonomy._count.collections} collections are
                                                  using this taxonomy.
                                                </Text>
                                              </Alert>
                                            )}
                                        </Stack>
                                      ),
                                      confirmProps: { color: 'red' },
                                      labels: { cancel: 'Cancel', confirm: 'Delete' },
                                      onConfirm: async () => {
                                        try {
                                          await deleteTaxonomy(taxonomy.id);
                                          notifications.show({
                                            color: 'red',
                                            icon: <IconTrash size={16} />,
                                            message: 'Taxonomy deleted successfully',
                                          });
                                          await loadTaxonomies();
                                        } catch (error) {
                                          notifications.show({
                                            color: 'red',
                                            icon: <IconX size={16} />,
                                            message: 'Failed to delete taxonomy',
                                          });
                                        }
                                      },
                                      title: 'Delete Taxonomy',
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

      {/* Taxonomy Edit/Create Drawer */}
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
              <IconTag size={20} />
            </ThemeIcon>
            <div>
              <Text fw={600}>{isCreating ? 'Create Taxonomy' : 'Edit Taxonomy'}</Text>
              {selectedTaxonomy && (
                <Text c="dimmed" size="xs">
                  ID: {selectedTaxonomy.id}
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
                  placeholder="e.g., Electronics"
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
                          Click to auto-generate URL slug from the taxonomy name
                        </Text>
                      </HoverCard.Dropdown>
                    </HoverCard>
                  }
                  label="Taxonomy Name"
                  withAsterisk
                />

                <TextInput
                  {...form.getInputProps('slug')}
                  description="Used in URLs and breadcrumbs"
                  placeholder="e.g., electronics"
                  label="URL Slug"
                  withAsterisk
                />

                <Group grow>
                  <Select
                    {...form.getInputProps('type')}
                    leftSection={<IconTag size={16} />}
                    data={[
                      { label: 'Category', value: 'CATEGORY' },
                      { label: 'Tag', value: 'TAG' },
                      { label: 'Attribute', value: 'ATTRIBUTE' },
                      { label: 'Department', value: 'DEPARTMENT' },
                      { label: 'Collection', value: 'COLLECTION' },
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
                  description="Store additional taxonomy data in JSON format"
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
                    Use this field to store custom attributes, metadata, or any additional
                    structured data for this taxonomy.
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
              {isCreating ? 'Create Taxonomy' : 'Save Changes'}
            </Button>
          </Group>
        </form>
      </Drawer>
    </>
  );
}
