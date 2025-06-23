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
  Rating,
  MultiSelect,
  ThemeIcon,
} from '@mantine/core';
import {
  IconDots,
  IconEdit,
  IconTrash,
  IconEye,
  IconPlus,
  IconSearch,
  IconRefresh,
  IconFlag,
  IconCheck,
  IconX,
  IconMessage,
  IconShield,
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

import { ReviewForm } from './ReviewForm';
import {
  getReviews,
  deleteReview,
  bulkUpdateReviews,
  bulkDeleteReviews,
  getReviewAnalytics,
  approveReview,
  rejectReview,
  flagAsSpam,
} from '@/actions/pim3/actions';

interface ReviewTableProps {
  initialData?: any;
}

export function ReviewTable({ initialData }: ReviewTableProps) {
  // State management
  const [reviews, setReviews] = useState(initialData?.reviews || []);
  const [pagination, setPagination] = useState(
    initialData?.pagination || { page: 1, limit: 50, total: 0, totalPages: 0 },
  );
  const [loading, setLoading] = useState(false);
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [selectedReview, setSelectedReview] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | 'moderate'>('create');
  const [reviewFormOpened, { open: openReviewForm, close: closeReviewForm }] = useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] =
    useDisclosure(false);
  const [analytics, setAnalytics] = useState<any>(null);

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    status: [] as string[],
    rating: [] as number[],
    type: [] as string[],
    verified: '',
    userId: '',
    productId: '',
    page: 1,
    limit: 50,
  });

  // Load reviews data
  const loadReviews = async (newFilters = filters) => {
    try {
      setLoading(true);
      const result = await getReviews(
        {
          search: newFilters.search || undefined,
          status: newFilters.status.length > 0 ? (newFilters.status as any[]) : undefined,
          rating: newFilters.rating.length > 0 ? newFilters.rating : undefined,
          type: newFilters.type.length > 0 ? (newFilters.type as any[]) : undefined,
          verified:
            newFilters.verified === 'true'
              ? true
              : newFilters.verified === 'false'
                ? false
                : undefined,
          userId: newFilters.userId || undefined,
          productId: newFilters.productId || undefined,
        },
        newFilters.page,
        newFilters.limit,
      );

      if (result.success) {
        setReviews(result.reviews);
        setPagination(result.pagination);
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to load reviews',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load reviews',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Load analytics
  const loadAnalytics = async () => {
    try {
      const result = await getReviewAnalytics();
      if (result.success) {
        setAnalytics(result.data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  // Initial load
  useEffect(() => {
    if (!initialData) {
      loadReviews();
    }
    loadAnalytics();
  }, []);

  // Handle search and filter changes
  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    loadReviews(newFilters);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    loadReviews(newFilters);
  };

  // Handle review operations
  const handleViewReview = (reviewId: string) => {
    setSelectedReview(reviewId);
    setFormMode('view');
    openReviewForm();
  };

  const handleEditReview = (reviewId: string) => {
    setSelectedReview(reviewId);
    setFormMode('edit');
    openReviewForm();
  };

  const handleModerateReview = (reviewId: string) => {
    setSelectedReview(reviewId);
    setFormMode('moderate');
    openReviewForm();
  };

  const handleDeleteReview = (reviewId: string) => {
    setSelectedReview(reviewId);
    openDeleteModal();
  };

  const handleQuickAction = async (reviewId: string, action: 'approve' | 'reject' | 'spam') => {
    try {
      let result;
      switch (action) {
        case 'approve':
          result = await approveReview(reviewId);
          break;
        case 'reject':
          result = await rejectReview(reviewId);
          break;
        case 'spam':
          result = await flagAsSpam(reviewId);
          break;
      }

      if (result.success) {
        notifications.show({
          title: 'Success',
          message: `Review ${action}d successfully`,
          color: 'green',
        });
        loadReviews();
        loadAnalytics();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || `Failed to ${action} review`,
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: `Failed to ${action} review`,
        color: 'red',
      });
    }
  };

  const confirmDeleteReview = async () => {
    if (!selectedReview) return;

    try {
      const result = await deleteReview(selectedReview);

      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'Review deleted successfully',
          color: 'green',
        });
        loadReviews();
        loadAnalytics();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to delete review',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete review',
        color: 'red',
      });
    } finally {
      closeDeleteModal();
      setSelectedReview(null);
    }
  };

  // Handle bulk operations
  const handleBulkAction = async (action: 'approve' | 'reject' | 'delete', status?: string) => {
    if (selectedReviews.length === 0) return;

    try {
      let result;
      if (action === 'delete') {
        result = await bulkDeleteReviews(selectedReviews);
      } else {
        result = await bulkUpdateReviews({
          reviewIds: selectedReviews,
          updates: {
            status: action === 'approve' ? 'PUBLISHED' : 'ARCHIVED',
          },
        });
      }

      if (result.success) {
        notifications.show({
          title: 'Success',
          message: `${action === 'delete' ? 'Deleted' : 'Updated'} ${selectedReviews.length} reviews`,
          color: 'green',
        });
        setSelectedReviews([]);
        loadReviews();
        loadAnalytics();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || `Failed to ${action} reviews`,
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: `Failed to ${action} reviews`,
        color: 'red',
      });
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'DEDICATED':
        return 'blue';
      case 'EMBEDDED':
        return 'cyan';
      case 'IMPORTED':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const statusOptions = [
    { value: 'DRAFT', label: 'Draft' },
    { value: 'PUBLISHED', label: 'Published' },
    { value: 'ARCHIVED', label: 'Archived' },
  ];

  const typeOptions = [
    { value: 'DEDICATED', label: 'Dedicated' },
    { value: 'EMBEDDED', label: 'Embedded' },
    { value: 'IMPORTED', label: 'Imported' },
  ];

  const ratingOptions = [
    { value: '1', label: '1 Star' },
    { value: '2', label: '2 Stars' },
    { value: '3', label: '3 Stars' },
    { value: '4', label: '4 Stars' },
    { value: '5', label: '5 Stars' },
  ];

  return (
    <Stack>
      {/* Analytics Cards */}
      {analytics && (
        <Group>
          <Card withBorder p="sm" style={{ flex: 1 }}>
            <Text size="sm" c="dimmed">
              Total Reviews
            </Text>
            <Text size="xl" fw={700}>
              {analytics.totalReviews}
            </Text>
          </Card>
          <Card withBorder p="sm" style={{ flex: 1 }}>
            <Text size="sm" c="dimmed">
              Average Rating
            </Text>
            <Group gap="xs">
              <Text size="xl" fw={700} c="yellow">
                {analytics.averageRating.toFixed(1)}
              </Text>
              <Rating value={analytics.averageRating} readOnly size="sm" />
            </Group>
          </Card>
          <Card withBorder p="sm" style={{ flex: 1 }}>
            <Text size="sm" c="dimmed">
              Pending Moderation
            </Text>
            <Text size="xl" fw={700} c="orange">
              {analytics.pendingModerationCount}
            </Text>
          </Card>
          <Card withBorder p="sm" style={{ flex: 1 }}>
            <Text size="sm" c="dimmed">
              Suspicious Reviews
            </Text>
            <Text size="xl" fw={700} c="red">
              {analytics.spamSuspiciousCount}
            </Text>
          </Card>
        </Group>
      )}

      {/* Header and Controls */}
      <Group justify="space-between">
        <Title order={3}>Review Management</Title>
        <Group>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => {
              setSelectedReview(null);
              setFormMode('create');
              openReviewForm();
            }}
          >
            Add Review
          </Button>

          {selectedReviews.length > 0 && (
            <Menu>
              <Menu.Target>
                <Button variant="light">Bulk Actions ({selectedReviews.length})</Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Moderation</Menu.Label>
                <Menu.Item
                  leftSection={<IconCheck size={14} />}
                  onClick={() => handleBulkAction('approve')}
                >
                  Approve Selected
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconX size={14} />}
                  onClick={() => handleBulkAction('reject')}
                >
                  Reject Selected
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconTrash size={14} />}
                  color="red"
                  onClick={() => handleBulkAction('delete')}
                >
                  Delete Selected
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>
      </Group>

      {/* Filters */}
      <Group wrap="wrap">
        <TextInput
          placeholder="Search reviews..."
          leftSection={<IconSearch size={16} />}
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          style={{ minWidth: 250 }}
        />
        <MultiSelect
          placeholder="Status"
          data={statusOptions}
          value={filters.status}
          onChange={(value) => handleFilterChange('status', value)}
          clearable
        />
        <MultiSelect
          placeholder="Type"
          data={typeOptions}
          value={filters.type}
          onChange={(value) => handleFilterChange('type', value)}
          clearable
        />
        <MultiSelect
          placeholder="Rating"
          data={ratingOptions}
          value={filters.rating.map(String)}
          onChange={(value) => handleFilterChange('rating', value.map(Number))}
          clearable
        />
        <Select
          placeholder="Verified"
          data={[
            { value: '', label: 'All' },
            { value: 'true', label: 'Verified Only' },
            { value: 'false', label: 'Unverified Only' },
          ]}
          value={filters.verified}
          onChange={(value) => handleFilterChange('verified', value || '')}
          clearable
        />
        <Button
          variant="light"
          leftSection={<IconRefresh size={16} />}
          onClick={() => loadReviews()}
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
                  checked={selectedReviews.length === reviews.length && reviews.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedReviews(reviews.map((r) => r.id));
                    } else {
                      setSelectedReviews([]);
                    }
                  }}
                />
              </Table.Th>
              <Table.Th>Review</Table.Th>
              <Table.Th>Rating</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Author</Table.Th>
              <Table.Th>Product</Table.Th>
              <Table.Th>Date</Table.Th>
              <Table.Th style={{ width: 120 }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {reviews.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={9}>
                  <Stack align="center" py="xl">
                    <ThemeIcon color="gray" size="xl" variant="light">
                      <IconMessage size={30} />
                    </ThemeIcon>
                    <Text fw={500} ta="center">
                      {loading ? 'Loading reviews...' : 'No reviews found'}
                    </Text>
                  </Stack>
                </Table.Td>
              </Table.Tr>
            ) : (
              reviews.map((review) => (
                <Table.Tr key={review.id}>
                  <Table.Td>
                    <input
                      type="checkbox"
                      checked={selectedReviews.includes(review.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedReviews([...selectedReviews, review.id]);
                        } else {
                          setSelectedReviews(selectedReviews.filter((id) => id !== review.id));
                        }
                      }}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Stack gap={4} style={{ maxWidth: 200 }}>
                      {review.title && (
                        <Text size="sm" fw={500} lineClamp={1}>
                          {review.title}
                        </Text>
                      )}
                      <Text size="xs" c="dimmed" lineClamp={2}>
                        {review.content}
                      </Text>
                      {review.verified && (
                        <Badge size="xs" color="blue" leftSection={<IconShield size={10} />}>
                          Verified
                        </Badge>
                      )}
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Rating value={review.rating} readOnly size="sm" />
                  </Table.Td>
                  <Table.Td>
                    <Badge color={getStatusColor(review.status)} variant="light">
                      {review.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={getTypeColor(review.type)} variant="light">
                      {review.type}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Stack gap={4}>
                      <Text size="sm" fw={500}>
                        {review.user?.name || 'Unknown'}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {review.user?.email}
                      </Text>
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    {review.product ? (
                      <Stack gap={4}>
                        <Text size="sm" fw={500} lineClamp={1}>
                          {review.product.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          SKU: {review.product.sku}
                        </Text>
                      </Stack>
                    ) : (
                      <Text size="sm" c="dimmed">
                        No product
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4}>
                      <Tooltip label="View review">
                        <ActionIcon variant="light" onClick={() => handleViewReview(review.id)}>
                          <IconEye size={16} />
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
                            leftSection={<IconShield size={16} />}
                            onClick={() => handleModerateReview(review.id)}
                          >
                            Moderate
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<IconEdit size={16} />}
                            onClick={() => handleEditReview(review.id)}
                          >
                            Edit
                          </Menu.Item>
                          <Menu.Divider />
                          <Menu.Item
                            leftSection={<IconCheck size={16} />}
                            color="green"
                            onClick={() => handleQuickAction(review.id, 'approve')}
                          >
                            Quick Approve
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<IconX size={16} />}
                            color="orange"
                            onClick={() => handleQuickAction(review.id, 'reject')}
                          >
                            Quick Reject
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<IconFlag size={16} />}
                            color="red"
                            onClick={() => handleQuickAction(review.id, 'spam')}
                          >
                            Mark as Spam
                          </Menu.Item>
                          <Menu.Divider />
                          <Menu.Item
                            leftSection={<IconTrash size={16} />}
                            color="red"
                            onClick={() => handleDeleteReview(review.id)}
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
      <Group justify="center">
        <Pagination
          value={pagination.page}
          onChange={handlePageChange}
          total={pagination.totalPages}
        />
      </Group>

      {/* Review Form Modal */}
      <ReviewForm
        opened={reviewFormOpened}
        onClose={closeReviewForm}
        onSuccess={() => {
          closeReviewForm();
          loadReviews();
          loadAnalytics();
        }}
        reviewId={selectedReview}
        mode={formMode}
      />

      {/* Delete Confirmation Modal */}
      <Modal opened={deleteModalOpened} onClose={closeDeleteModal} title="Delete Review" size="sm">
        <Stack>
          <Text>Are you sure you want to delete this review? This action cannot be undone.</Text>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button color="red" onClick={confirmDeleteReview}>
              Delete Review
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
