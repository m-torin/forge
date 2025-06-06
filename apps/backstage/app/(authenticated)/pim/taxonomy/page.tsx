'use client';

import {
  ActionIcon,
  Anchor,
  Badge,
  Breadcrumbs,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Modal,
  Paper,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Title,
  Tree,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconChevronRight,
  IconEdit,
  IconFolder,
  IconPlus,
  IconTag,
  IconTags,
  IconTrash,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';

interface TaxonomyNode {
  children?: TaxonomyNode[];
  description: string;
  hasChildren: boolean;
  id: string;
  level: number;
  name: string;
  parentId?: string;
  productCount: number;
}

const mockTaxonomy: TaxonomyNode[] = [
  {
    id: 'electronics',
    name: 'Electronics',
    children: [
      {
        id: 'smartphones',
        name: 'Smartphones',
        children: [
          {
            id: 'android',
            name: 'Android Phones',
            description: 'Android-based smartphones',
            hasChildren: false,
            level: 3,
            parentId: 'smartphones',
            productCount: 189,
          },
          {
            id: 'iphones',
            name: 'iPhones',
            description: 'Apple iPhone devices',
            hasChildren: false,
            level: 3,
            parentId: 'smartphones',
            productCount: 153,
          },
        ],
        description: 'Mobile phones and accessories',
        hasChildren: true,
        level: 2,
        parentId: 'electronics',
        productCount: 342,
      },
      {
        id: 'laptops',
        name: 'Laptops',
        description: 'Portable computers',
        hasChildren: false,
        level: 2,
        parentId: 'electronics',
        productCount: 287,
      },
    ],
    description: 'Electronic devices and components',
    hasChildren: true,
    level: 1,
    productCount: 1247,
  },
  {
    id: 'clothing',
    name: 'Clothing',
    children: [
      {
        id: 'mens',
        name: "Men's Clothing",
        description: 'Clothing items for men',
        hasChildren: false,
        level: 2,
        parentId: 'clothing',
        productCount: 445,
      },
      {
        id: 'womens',
        name: "Women's Clothing",
        description: 'Clothing items for women',
        hasChildren: false,
        level: 2,
        parentId: 'clothing',
        productCount: 447,
      },
    ],
    description: 'Apparel and fashion items',
    hasChildren: true,
    level: 1,
    productCount: 892,
  },
];

function TaxonomyForm({
  editingNode,
  onClose,
  onSubmit,
  opened,
}: {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  editingNode?: TaxonomyNode | null;
}) {
  const form = useForm({
    validate: {
      name: (value) => (value.length < 2 ? 'Name must be at least 2 characters' : null),
      description: (value) =>
        value.length < 10 ? 'Description must be at least 10 characters' : null,
    },
    initialValues: {
      name: editingNode?.name || '',
      description: editingNode?.description || '',
      parentId: editingNode?.parentId || '',
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    onSubmit(values);
    form.reset();
    onClose();
  };

  return (
    <Modal
      onClose={onClose}
      opened={opened}
      size="lg"
      title={editingNode ? 'Edit Category' : 'Create Category'}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            placeholder="e.g., Electronics"
            label="Category Name"
            required
            {...form.getInputProps('name')}
          />

          <Select
            placeholder="Select parent category (optional)"
            data={[
              { label: 'Root Level', value: '' },
              { label: 'Electronics', value: 'electronics' },
              { label: 'Clothing', value: 'clothing' },
            ]}
            label="Parent Category"
            {...form.getInputProps('parentId')}
          />

          <Textarea
            minRows={3}
            placeholder="Describe this category and what products it contains"
            label="Description"
            required
            {...form.getInputProps('description')}
          />

          <Group justify="flex-end">
            <Button onClick={onClose} variant="light">
              Cancel
            </Button>
            <Button type="submit">{editingNode ? 'Update' : 'Create'} Category</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

function TaxonomyTree({
  nodes,
  onDelete,
  onEdit,
}: {
  nodes: TaxonomyNode[];
  onEdit: (node: TaxonomyNode) => void;
  onDelete: (nodeId: string) => void;
}) {
  const renderNode = (node: TaxonomyNode): any => ({
    children: node.children ? node.children.map(renderNode) : undefined,
    label: (
      <Group style={{ width: '100%' }} justify="space-between">
        <Group gap="xs">
          <ThemeIcon color="blue" size="sm" variant="light">
            {node.hasChildren ? <IconFolder size={14} /> : <IconTag size={14} />}
          </ThemeIcon>
          <div>
            <Text fw={500} size="sm">
              {node.name}
            </Text>
            <Text c="dimmed" size="xs">
              {node.description}
            </Text>
          </div>
        </Group>
        <Group gap="xs">
          <Badge size="sm" variant="light">
            {node.productCount}
          </Badge>
          <ActionIcon
            onClick={(e) => {
              e.stopPropagation();
              onEdit(node);
              console.log('Taxonomy Node Edited', { nodeId: node.id });
            }}
            size="sm"
            variant="subtle"
          >
            <IconEdit size={14} />
          </ActionIcon>
          <ActionIcon
            color="red"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node.id);
              console.log('Taxonomy Node Deleted', { nodeId: node.id });
            }}
            size="sm"
            variant="subtle"
          >
            <IconTrash size={14} />
          </ActionIcon>
        </Group>
      </Group>
    ),
    value: node.id,
  });

  return <Tree data={nodes.map(renderNode)} levelOffset={23} />;
}

export default function TaxonomyManagementPage() {
  const [taxonomy, _setTaxonomy] = useState<TaxonomyNode[]>(mockTaxonomy);
  const [modalOpened, { close: closeModal, open: openModal }] = useDisclosure(false);
  const [editingNode, setEditingNode] = useState<TaxonomyNode | null>(null);

  useEffect(() => {
    console.log('Page Viewed', { page: 'pim_taxonomy_management' });
    console.log('Component Viewed', { component: 'taxonomy_tree' });
    console.log('Track Event', {
      action: 'view',
      category: 'pim',
      label: 'taxonomy_management',
      metadata: { totalCategories: taxonomy.length },
    });
  }, [taxonomy.length]);

  const handleCreateCategory = () => {
    setEditingNode(null);
    openModal();
    console.log('Create Category Button Clicked');
  };

  const handleEditCategory = (node: TaxonomyNode) => {
    setEditingNode(node);
    openModal();
  };

  const handleDeleteCategory = (nodeId: string) => {
    // In a real app, this would call an API
    console.log('Delete category:', nodeId);
    notifications.show({
      color: 'red',
      message: 'The category has been removed from the taxonomy',
      title: 'Category deleted',
    });
  };

  const handleSubmitCategory = (values: any) => {
    if (editingNode) {
      // Update existing category
      console.log('Update category:', editingNode.id, values);
      notifications.show({
        color: 'blue',
        message: 'The category has been successfully updated',
        title: 'Category updated',
      });
    } else {
      // Create new category
      console.log('Create category:', values);
      notifications.show({
        color: 'green',
        message: 'New category has been added to the taxonomy',
        title: 'Category created',
      });
    }
  };

  const totalCategories = taxonomy.reduce((count, node) => {
    const childCount = node.children ? node.children.length : 0;
    return count + 1 + childCount;
  }, 0);

  const totalProducts = taxonomy.reduce((count, node) => count + node.productCount, 0);

  return (
    <Container py="xl" size="xl">
      <Stack gap="xl">
        {/* Breadcrumbs */}
        <Breadcrumbs>
          <Anchor href="/pim">PIM</Anchor>
          <Text>Taxonomy Management</Text>
        </Breadcrumbs>

        {/* Header */}
        <div>
          <Group align="center" justify="space-between">
            <div>
              <Title order={1}>Taxonomy Management</Title>
              <Text c="dimmed" mt="sm" size="lg">
                Organize products into hierarchical categories and manage taxonomy structure
              </Text>
            </div>
            <Button leftSection={<IconPlus size={16} />} onClick={handleCreateCategory}>
              Create Category
            </Button>
          </Group>
        </div>

        {/* Stats */}
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Paper withBorder p="md">
              <Group gap="sm">
                <ThemeIcon color="blue" size="lg" variant="light">
                  <IconTags size={24} />
                </ThemeIcon>
                <div>
                  <Text fw={700} size="xl">
                    {totalCategories}
                  </Text>
                  <Text c="dimmed" size="sm">
                    Total Categories
                  </Text>
                </div>
              </Group>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Paper withBorder p="md">
              <Group gap="sm">
                <ThemeIcon color="green" size="lg" variant="light">
                  <IconFolder size={24} />
                </ThemeIcon>
                <div>
                  <Text fw={700} size="xl">
                    {totalProducts}
                  </Text>
                  <Text c="dimmed" size="sm">
                    Classified Products
                  </Text>
                </div>
              </Group>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Paper withBorder p="md">
              <Group gap="sm">
                <ThemeIcon color="orange" size="lg" variant="light">
                  <IconChevronRight size={24} />
                </ThemeIcon>
                <div>
                  <Text fw={700} size="xl">
                    4
                  </Text>
                  <Text c="dimmed" size="sm">
                    Max Depth Levels
                  </Text>
                </div>
              </Group>
            </Paper>
          </Grid.Col>
        </Grid>

        {/* Taxonomy Tree */}
        <Card shadow="sm" withBorder padding="lg">
          <Stack gap="md">
            <Group justify="between">
              <Title order={3}>Category Hierarchy</Title>
              <Badge variant="light">{totalCategories} categories</Badge>
            </Group>

            <TaxonomyTree
              nodes={taxonomy}
              onDelete={handleDeleteCategory}
              onEdit={handleEditCategory}
            />
          </Stack>
        </Card>
      </Stack>

      <TaxonomyForm
        editingNode={editingNode}
        onClose={closeModal}
        onSubmit={handleSubmitCategory}
        opened={modalOpened}
      />
    </Container>
  );
}
