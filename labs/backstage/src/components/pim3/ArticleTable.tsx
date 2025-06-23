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
  ThemeIcon,
} from '@mantine/core';
import {
  IconArticle,
  IconDots,
  IconEdit,
  IconTrash,
  IconEye,
  IconPlus,
  IconSearch,
  IconRefresh,
  IconCopy,
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useDisclosure, useDebouncedValue } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

import { ArticleForm } from './ArticleForm';
import { getArticles, deleteArticle, duplicateArticle } from '@/actions/pim3/actions';

interface ArticleTableProps {
  initialData?: any[];
}

export function ArticleTable({ initialData = [] }: ArticleTableProps) {
  // State management
  const [articles, setArticles] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [articleFormOpened, { open: openArticleForm, close: closeArticleForm }] =
    useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] =
    useDisclosure(false);

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    page: 1,
    limit: 50,
  });

  const [debouncedSearch] = useDebouncedValue(filters.search, 200);

  // Load articles data
  const loadArticles = async () => {
    try {
      setLoading(true);
      const result = await getArticles();
      setArticles(result || []);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load articles',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadArticles();
  }, []);

  // Handle article operations
  const handleViewArticle = (article: any) => {
    setSelectedArticle(article);
    setFormMode('view');
    openArticleForm();
  };

  const handleEditArticle = (article: any) => {
    setSelectedArticle(article);
    setFormMode('edit');
    openArticleForm();
  };

  const handleDeleteArticle = (article: any) => {
    setSelectedArticle(article);
    openDeleteModal();
  };

  const handleDuplicateArticle = async (articleId: string) => {
    try {
      const result = await duplicateArticle(articleId);
      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'Article duplicated successfully',
          color: 'green',
        });
        loadArticles();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to duplicate article',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to duplicate article',
        color: 'red',
      });
    }
  };

  const confirmDeleteArticle = async () => {
    if (!selectedArticle) return;

    try {
      const result = await deleteArticle(selectedArticle.id);

      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'Article deleted successfully',
          color: 'green',
        });
        loadArticles();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to delete article',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete article',
        color: 'red',
      });
    } finally {
      closeDeleteModal();
      setSelectedArticle(null);
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
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

  // Filter articles
  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      article.slug.toLowerCase().includes(debouncedSearch.toLowerCase());

    const matchesStatus = !filters.status || article.status === filters.status;

    return matchesSearch && matchesStatus;
  });

  return (
    <Stack>
      {/* Header and Controls */}
      <Group justify="space-between">
        <div>
          <Title order={3}>Articles & Content</Title>
          <Text c="dimmed">Manage blog posts, guides, and documentation</Text>
        </div>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            setSelectedArticle(null);
            setFormMode('create');
            openArticleForm();
          }}
        >
          Add Article
        </Button>
      </Group>

      {/* Filters */}
      <Group>
        <TextInput
          placeholder="Search articles..."
          leftSection={<IconSearch size={16} />}
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          style={{ flex: 1 }}
        />
        <Select
          placeholder="Filter by status"
          data={[
            { value: '', label: 'All Statuses' },
            { value: 'DRAFT', label: 'Draft' },
            { value: 'PUBLISHED', label: 'Published' },
            { value: 'ARCHIVED', label: 'Archived' },
          ]}
          value={filters.status}
          onChange={(value) => setFilters((prev) => ({ ...prev, status: value || '' }))}
        />
        <Button variant="light" leftSection={<IconRefresh size={16} />} onClick={loadArticles}>
          Refresh
        </Button>
      </Group>

      {/* Table */}
      <Card withBorder p={0}>
        <LoadingOverlay visible={loading} />

        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Article</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Author</Table.Th>
              <Table.Th>Updated</Table.Th>
              <Table.Th style={{ width: 120 }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredArticles.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Stack align="center" py="xl">
                    <ThemeIcon color="gray" size="xl" variant="light">
                      <IconArticle size={30} />
                    </ThemeIcon>
                    <Text fw={500} ta="center">
                      {loading ? 'Loading articles...' : 'No articles found'}
                    </Text>
                    {!loading && filters.search && (
                      <Text size="sm" c="dimmed" ta="center">
                        Try adjusting your search terms or filters
                      </Text>
                    )}
                  </Stack>
                </Table.Td>
              </Table.Tr>
            ) : (
              filteredArticles.map((article) => (
                <Table.Tr key={article.id}>
                  <Table.Td>
                    <Stack gap={4}>
                      <Text fw={500}>{article.title}</Text>
                      <Text size="xs" c="dimmed">
                        /{article.slug}
                      </Text>
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={getStatusColor(article.status)} variant="light">
                      {article.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Stack gap={4}>
                      <Text size="sm">{article.user?.name || 'System'}</Text>
                      {article.user?.email && (
                        <Text size="xs" c="dimmed">
                          {article.user.email}
                        </Text>
                      )}
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Stack gap={4}>
                      <Text size="sm" c="dimmed">
                        {new Date(article.updatedAt).toLocaleDateString()}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {new Date(article.updatedAt).toLocaleTimeString()}
                      </Text>
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4}>
                      <Tooltip label="View article">
                        <ActionIcon variant="light" onClick={() => handleViewArticle(article)}>
                          <IconEye size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Edit article">
                        <ActionIcon variant="light" onClick={() => handleEditArticle(article)}>
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Menu position="bottom-end">
                        <Menu.Target>
                          <ActionIcon variant="subtle">
                            <IconDots size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<IconCopy size={16} />}
                            onClick={() => handleDuplicateArticle(article.id)}
                          >
                            Duplicate
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<IconTrash size={16} />}
                            color="red"
                            onClick={() => handleDeleteArticle(article)}
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
      </Card>

      {/* Pagination */}
      {filteredArticles.length > filters.limit && (
        <Group justify="center">
          <Pagination
            value={filters.page}
            onChange={(page) => setFilters((prev) => ({ ...prev, page }))}
            total={Math.ceil(filteredArticles.length / filters.limit)}
          />
        </Group>
      )}

      {/* Article Form Modal */}
      <ArticleForm
        opened={articleFormOpened}
        onClose={closeArticleForm}
        onSuccess={() => {
          closeArticleForm();
          loadArticles();
        }}
        articleId={selectedArticle?.id}
        mode={formMode}
        initialData={selectedArticle}
      />

      {/* Delete Confirmation Modal */}
      <Modal opened={deleteModalOpened} onClose={closeDeleteModal} title="Delete Article" size="sm">
        <Stack>
          <Text>
            Are you sure you want to delete "{selectedArticle?.title}"? This action cannot be
            undone.
          </Text>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button color="red" onClick={confirmDeleteArticle}>
              Delete Article
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
