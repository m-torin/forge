'use client';

import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Group,
  LoadingOverlay,
  Menu,
  ScrollArea,
  Stack,
  Table,
  Text,
  TextInput,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
  IconAlertCircle,
  IconBulb,
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconCopy,
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconEyeOff,
  IconFolder,
  IconFolderOpen,
  IconPlus,
  IconSearch,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';

import { ContentStatus } from '@repo/database/prisma';

interface Category {
  _count?: {
    products: number;
    children: number;
  };
  children: Category[];
  copy?: any;
  createdAt: Date;
  deletedAt?: Date | null;
  deletedById?: string | null;
  description?: string | null;
  displayOrder: number;
  id: string;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  metaTitle?: string | null;
  name: string;
  parentId: string | null;
  slug: string;
  status: ContentStatus;
  updatedAt: Date;
}

// Sample data for demonstration
const sampleCategories: Category[] = [
  {
    id: '1',
    name: 'Electronics',
    slug: 'electronics',
    status: 'PUBLISHED',
    description: 'Electronic devices and accessories',
    displayOrder: 1,
    parentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { products: 150, children: 2 },
    children: [
      {
        id: '1-1',
        name: 'Computers',
        slug: 'computers',
        status: 'PUBLISHED',
        description: 'Desktop and laptop computers',
        displayOrder: 1,
        parentId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { products: 50, children: 2 },
        children: [
          {
            id: '1-1-1',
            name: 'Laptops',
            slug: 'laptops',
            status: 'PUBLISHED',
            displayOrder: 1,
            parentId: '1-1',
            createdAt: new Date(),
            updatedAt: new Date(),
            _count: { products: 30, children: 0 },
            children: [],
          },
          {
            id: '1-1-2',
            name: 'Desktops',
            slug: 'desktops',
            status: 'PUBLISHED',
            displayOrder: 2,
            parentId: '1-1',
            createdAt: new Date(),
            updatedAt: new Date(),
            _count: { products: 20, children: 0 },
            children: [],
          },
        ],
      },
      {
        id: '1-2',
        name: 'Mobile Devices',
        slug: 'mobile-devices',
        status: 'PUBLISHED',
        displayOrder: 2,
        parentId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { products: 100, children: 0 },
        children: [],
      },
    ],
  },
  {
    id: '2',
    name: 'Clothing',
    slug: 'clothing',
    status: 'PUBLISHED',
    description: 'Apparel and fashion items',
    displayOrder: 2,
    parentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { products: 200, children: 2 },
    children: [
      {
        id: '2-1',
        name: "Men's Clothing",
        slug: 'mens-clothing',
        status: 'PUBLISHED',
        displayOrder: 1,
        parentId: '2',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { products: 100, children: 0 },
        children: [],
      },
      {
        id: '2-2',
        name: "Women's Clothing",
        slug: 'womens-clothing',
        status: 'DRAFT',
        displayOrder: 2,
        parentId: '2',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { products: 100, children: 0 },
        children: [],
      },
    ],
  },
];

export default function OriginalCategoriesTable() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [debouncedSearch] = useDebouncedValue(search, 200);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setCategories(sampleCategories);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Toggle category expansion
  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
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

  // Filter categories based on search
  const filterCategories = (categories: Category[], searchTerm: string): Category[] => {
    if (!categories || !Array.isArray(categories)) return [];
    if (!searchTerm) return categories;

    return categories.reduce((acc: Category[], category) => {
      const matchesSearch =
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const filteredChildren = filterCategories(category.children, searchTerm);

      if (matchesSearch || filteredChildren.length > 0) {
        acc.push({
          ...category,
          children: filteredChildren,
        });
        // Auto-expand if children match
        if (filteredChildren.length > 0) {
          setExpandedCategories((prev) => new Set([...prev, category.id]));
        }
      }

      return acc;
    }, []);
  };

  // Render category row
  const renderCategoryRow = (category: Category, level = 0) => {
    const isExpanded = expandedCategories.has(category.id);
    const hasChildren = category.children.length > 0;

    return (
      <>
        <Table.Tr key={category.id}>
          <Table.Td>
            <Group style={{ paddingLeft: level * 24 }} gap="xs">
              {hasChildren && (
                <ActionIcon onClick={() => toggleExpanded(category.id)} size="md" variant="subtle">
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
                  <Text fw={500}>{category.name}</Text>
                  <Text c="dimmed" size="xs">
                    /{category.slug}
                  </Text>
                </div>
              </Group>
            </Group>
          </Table.Td>
          <Table.Td>
            <Badge color={getStatusColor(category.status)} variant="light">
              {category.status}
            </Badge>
          </Table.Td>
          <Table.Td>
            <Badge variant="light">{category._count?.products || 0}</Badge>
          </Table.Td>
          <Table.Td>
            <Text c="dimmed" lineClamp={1} size="md">
              {category.description || 'No description'}
            </Text>
          </Table.Td>
          <Table.Td>{category.displayOrder}</Table.Td>
          <Table.Td>
            <Group gap="xs" justify="flex-end">
              <Tooltip label="Add Subcategory">
                <ActionIcon
                  onClick={() => {
                    notifications.show({
                      message: `Add subcategory to ${category.name}`,
                      color: 'blue',
                    });
                  }}
                  variant="subtle"
                >
                  <IconPlus size={16} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Edit Category">
                <ActionIcon
                  onClick={() => {
                    notifications.show({
                      message: `Edit ${category.name}`,
                      color: 'yellow',
                    });
                  }}
                  variant="subtle"
                >
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
                    onClick={() => {
                      notifications.show({
                        color: 'green',
                        icon: <IconCheck size={16} />,
                        message: 'Category duplicated successfully',
                      });
                    }}
                  >
                    Duplicate
                  </Menu.Item>
                  <Menu.Item leftSection={<IconEye size={16} />}>View Products</Menu.Item>
                  {category.status === 'PUBLISHED' ? (
                    <Menu.Item leftSection={<IconEyeOff size={16} />}>Unpublish</Menu.Item>
                  ) : (
                    <Menu.Item leftSection={<IconEye size={16} />}>Publish</Menu.Item>
                  )}
                  <Menu.Divider />
                  <Menu.Item
                    c="red"
                    leftSection={<IconTrash size={16} />}
                    onClick={() => {
                      modals.openConfirmModal({
                        centered: true,
                        children: (
                          <Stack gap="sm">
                            <Text size="md">
                              Are you sure you want to delete <strong>{category.name}</strong>?
                            </Text>
                            {category.children && category.children.length > 0 && (
                              <Alert c="yellow" variant="light">
                                <Text size="xs">
                                  This category has {category.children.length} subcategories.
                                </Text>
                              </Alert>
                            )}
                            {category._count?.products && category._count.products > 0 && (
                              <Alert c="red" variant="light">
                                <Text size="xs">
                                  {category._count.products} products are assigned to this category.
                                </Text>
                              </Alert>
                            )}
                          </Stack>
                        ),
                        confirmProps: { color: 'red' },
                        labels: { cancel: 'Cancel', confirm: 'Delete' },
                        onConfirm: () => {
                          notifications.show({
                            color: 'red',
                            icon: <IconTrash size={16} />,
                            message: 'Category deleted successfully',
                          });
                        },
                        title: 'Delete Category',
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
          category.children.map((child: any) => (
            <React.Fragment key={child.id}>{renderCategoryRow(child, level + 1)}</React.Fragment>
          ))}
      </>
    );
  };

  const filteredCategories = filterCategories(categories, debouncedSearch);

  return (
    <>
      {/* Search and Filters */}
      <Card withBorder={true} mb="md">
        <Group>
          <TextInput
            leftSection={<IconSearch size={16} />}
            onChange={(e) => setSearch(e.currentTarget.value)}
            placeholder="Search categories..."
            style={{ flex: 1 }}
            value={search}
          />
          <Button
            onClick={() => {
              if (expandedCategories.size === 0) {
                // Expand all
                const allIds = new Set<string>();
                const collectIds = (cats: Category[]) => {
                  cats.forEach((cat) => {
                    if (cat.children.length > 0) {
                      allIds.add(cat.id);
                      collectIds(cat.children);
                    }
                  });
                };
                collectIds(categories);
                setExpandedCategories(allIds);
              } else {
                // Collapse all
                setExpandedCategories(new Set());
              }
            }}
            variant="subtle"
          >
            {expandedCategories.size === 0 ? 'Expand All' : 'Collapse All'}
          </Button>
        </Group>
      </Card>

      {/* Categories Table */}
      <Card withBorder={true} p={0}>
        <LoadingOverlay visible={loading} zIndex={100} />
        {error ? (
          <Alert
            c="red"
            icon={<IconAlertCircle size={16} />}
            m="md"
            title="Error loading categories"
          >
            {error}
          </Alert>
        ) : (
          <ScrollArea>
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Category</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Products</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th>Order</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {!loading && filteredCategories.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={6}>
                      <Stack ta="center" gap="md" py="xl">
                        <ThemeIcon c="gray" size="xl" variant="light">
                          <IconFolder size={30} />
                        </ThemeIcon>
                        <div>
                          <Text fw={500} ta="center">
                            {search ? 'No categories match your search' : 'No categories yet'}
                          </Text>
                          <Text c="dimmed" mt="xs" size="md" ta="center">
                            {search
                              ? 'Try a different search term'
                              : 'Create your first category to get started'}
                          </Text>
                        </div>
                        {!search && (
                          <Group>
                            <Button
                              leftSection={<IconPlus size={16} />}
                              onClick={() => {
                                notifications.show({
                                  message: 'Create new category',
                                  color: 'blue',
                                });
                              }}
                              variant="light"
                            >
                              Create Category
                            </Button>
                            <Button
                              leftSection={<IconBulb size={16} />}
                              onClick={() => {
                                notifications.show({
                                  message: 'Creating sample categories...',
                                  color: 'yellow',
                                });
                              }}
                              variant="subtle"
                              c="yellow"
                            >
                              Create Sample Categories
                            </Button>
                          </Group>
                        )}
                      </Stack>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  filteredCategories.map((category: any) => (
                    <React.Fragment key={category.id}>
                      {renderCategoryRow(category, 0)}
                    </React.Fragment>
                  ))
                )}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        )}
      </Card>
    </>
  );
}
