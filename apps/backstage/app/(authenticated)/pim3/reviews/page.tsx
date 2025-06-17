'use client';

import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Container,
  Drawer,
  Grid,
  Group,
  Image,
  LoadingOverlay,
  Menu,
  Modal,
  MultiSelect,
  Pagination,
  Paper,
  Rating,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Tabs,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconAlertTriangle,
  IconBan,
  IconBrandSpeedtest,
  IconCheck,
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconFilter,
  IconMessage,
  IconMessages,
  IconPlus,
  IconSearch,
  IconShield,
  IconShieldCheck,
  IconStar,
  IconThumbUp,
  IconTrash,
  IconTrendingUp,
  IconX,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import {
  approveReview,
  bulkDeleteReviews,
  bulkUpdateReviews,
  createReview,
  deleteReview,
  detectSuspiciousReviews,
  flagAsSpam,
  getReviewAnalytics,
  getReviewById,
  getReviews,
  rejectReview,
  updateReview,
} from './actions';

import type { ReviewAnalytics, ReviewFilters } from './actions';
import type { ContentStatus, ReviewType } from '@repo/database/prisma';

interface Review {
  _count?: { votes: number };
  content: string;
  createdAt: Date;
  helpfulCount: number;
  id: string;
  media?: { id: string; url: string; altText: string | null }[];
  product?: {
    name: string;
    sku: string;
    id?: string;
    media?: { url: string; altText: string | null }[];
  } | null;
  rating: number;
  source?: string | null;
  sourceId?: string | null;
  status: ContentStatus;
  title?: string | null;
  totalVotes: number;
  type: ReviewType;
  user?: { name: string | null; email: string; id?: string; createdAt?: Date } | null;
  verified: boolean;
  votes?: { voteType: string; userId: string }[];
}

interface ReviewFormData {
  content: string;
  productId: string;
  rating: number;
  source: string;
  sourceId: string;
  status: ContentStatus;
  title: string;
  type: ReviewType;
  userId: string;
  verified: boolean;
}

interface PaginationData {
  limit: number;
  page: number;
  total: number;
  totalPages: number;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    limit: 50,
    page: 1,
    total: 0,
    totalPages: 0,
  });
  const [analytics, setAnalytics] = useState<ReviewAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [suspiciousReviews, setSuspiciousReviews] = useState<Review[]>([]);

  // UI State
  const [drawerOpened, { close: closeDrawer, open: openDrawer }] = useDisclosure(false);
  const [detailOpened, { close: closeDetail, open: openDetail }] = useDisclosure(false);
  const [filtersOpened, { toggle: toggleFilters }] = useDisclosure(false);
  const [bulkOpened, { close: closeBulk, open: openBulk }] = useDisclosure(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('reviews');

  // Filters
  const [filters, setFilters] = useState<ReviewFilters>({
    type: [],
    dateFrom: undefined,
    dateTo: undefined,
    rating: [],
    search: '',
    status: [],
    verified: undefined,
  });
  const [debouncedSearch] = useDebouncedValue(filters.search || '', 300);

  const form = useForm<ReviewFormData>({
    validate: {
      content: (value) => (!value ? 'Content is required' : null),
      rating: (value) => (value < 1 || value > 5 ? 'Rating must be between 1 and 5' : null),
    },
    initialValues: {
      type: 'DEDICATED' as ReviewType,
      content: '',
      productId: '',
      rating: 5,
      source: '',
      sourceId: '',
      status: 'PUBLISHED' as ContentStatus,
      title: '',
      userId: '',
      verified: false,
    },
  });

  const bulkForm = useForm({
    initialValues: {
      action: '',
      status: 'PUBLISHED' as ContentStatus,
      verified: false,
    },
  });

  useEffect(() => {
    loadReviews();
    loadAnalytics();
  }, []);

  useEffect(() => {
    const newFilters = { ...filters, search: debouncedSearch };
    setFilters(newFilters);
    loadReviews(newFilters, 1);
  }, [debouncedSearch]);

  useEffect(() => {
    loadReviews(filters, pagination.page);
  }, [pagination.page]);

  const loadReviews = async (appliedFilters?: ReviewFilters, page = pagination.page) => {
    try {
      setLoading(true);
      const { pagination: paginationData, reviews: reviewsData } = await getReviews(
        appliedFilters || filters,
        page,
        pagination.limit,
      );
      setReviews(reviewsData);
      setPagination(paginationData);
    } catch (err) {
      notifications.show({ color: 'red', message: 'Failed to load reviews' });
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const analyticsData = await getReviewAnalytics();
      setAnalytics(analyticsData);
    } catch (err) {
      notifications.show({ color: 'red', message: 'Failed to load analytics' });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const loadSuspiciousReviews = async () => {
    try {
      const suspicious = await detectSuspiciousReviews();
      setSuspiciousReviews(suspicious as any);
    } catch (err) {
      notifications.show({ color: 'red', message: 'Failed to load suspicious reviews' });
    }
  };

  const handleEdit = (review: Review) => {
    setSelectedReview(review);
    setIsCreating(false);
    form.setValues({
      type: review.type,
      content: review.content,
      productId: review.product?.id || '',
      rating: review.rating,
      source: review.source || '',
      sourceId: review.sourceId || '',
      status: review.status,
      title: review.title || '',
      userId: review.user?.id || '',
      verified: review.verified,
    });
    openDrawer();
  };

  const handleViewDetails = async (review: Review) => {
    try {
      const detailedReview = await getReviewById(review.id);
      setSelectedReview(detailedReview);
      openDetail();
    } catch (err) {
      notifications.show({ color: 'red', message: 'Failed to load review details' });
    }
  };

  const handleCreate = () => {
    setSelectedReview(null);
    setIsCreating(true);
    form.reset();
    openDrawer();
  };

  const handleSubmit = async (values: ReviewFormData) => {
    setIsSaving(true);
    try {
      const data = {
        type: values.type,
        content: values.content,
        productId: values.productId || undefined,
        rating: values.rating,
        source: values.source || undefined,
        sourceId: values.sourceId || undefined,
        status: values.status,
        title: values.title || undefined,
        userId: values.userId,
        verified: values.verified,
      };

      if (isCreating) {
        await createReview(data);
      } else if (selectedReview) {
        await updateReview(selectedReview.id, data);
      }

      notifications.show({
        color: 'green',
        icon: <IconCheck size={16} />,
        message: isCreating ? 'Review created successfully' : 'Review updated successfully',
      });

      await loadReviews();
      await loadAnalytics();
      closeDrawer();
      form.reset();
    } catch (error) {
      notifications.show({
        color: 'red',
        icon: <IconX size={16} />,
        message: error instanceof Error ? error.message : 'Failed to save review',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Moderation actions
  const handleApprove = async (reviewId: string) => {
    try {
      await approveReview(reviewId);
      notifications.show({
        color: 'green',
        icon: <IconCheck size={16} />,
        message: 'Review approved successfully',
      });
      await loadReviews();
      await loadAnalytics();
    } catch (error) {
      notifications.show({
        color: 'red',
        icon: <IconX size={16} />,
        message: 'Failed to approve review',
      });
    }
  };

  const handleReject = async (reviewId: string) => {
    try {
      await rejectReview(reviewId);
      notifications.show({
        color: 'orange',
        icon: <IconBan size={16} />,
        message: 'Review rejected',
      });
      await loadReviews();
      await loadAnalytics();
    } catch (error) {
      notifications.show({
        color: 'red',
        icon: <IconX size={16} />,
        message: 'Failed to reject review',
      });
    }
  };

  const handleFlagSpam = async (reviewId: string) => {
    try {
      await flagAsSpam(reviewId);
      notifications.show({
        color: 'red',
        icon: <IconAlertTriangle size={16} />,
        message: 'Review flagged as spam',
      });
      await loadReviews();
      await loadAnalytics();
    } catch (error) {
      notifications.show({
        color: 'red',
        icon: <IconX size={16} />,
        message: 'Failed to flag review',
      });
    }
  };

  // Bulk operations
  const handleBulkAction = async (values: typeof bulkForm.values) => {
    if (selectedReviews.length === 0) {
      notifications.show({ color: 'orange', message: 'No reviews selected' });
      return;
    }

    try {
      if (values.action === 'delete') {
        await bulkDeleteReviews(selectedReviews);
        notifications.show({
          color: 'green',
          message: `${selectedReviews.length} reviews deleted`,
        });
      } else if (values.action === 'update') {
        const updates: any = {};
        if (values.status) updates.status = values.status;
        if (values.verified !== undefined) updates.verified = values.verified;

        await bulkUpdateReviews({
          reviewIds: selectedReviews,
          updates,
        });
        notifications.show({
          color: 'green',
          message: `${selectedReviews.length} reviews updated`,
        });
      }

      setSelectedReviews([]);
      await loadReviews();
      await loadAnalytics();
      closeBulk();
    } catch (error) {
      notifications.show({
        color: 'red',
        message: 'Failed to perform bulk action',
      });
    }
  };

  // Filter handlers
  const handleFilterChange = (key: keyof ReviewFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    loadReviews(newFilters, 1);
  };

  const clearFilters = () => {
    const clearedFilters: ReviewFilters = {
      type: [],
      dateFrom: undefined,
      dateTo: undefined,
      rating: [],
      search: '',
      status: [],
      verified: undefined,
    };
    setFilters(clearedFilters);
    loadReviews(clearedFilters, 1);
  };

  const getStatusColor = (status: ContentStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return 'green';
      case 'DRAFT':
        return 'yellow';
      case 'ARCHIVED':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getTypeColor = (type: ReviewType) => {
    switch (type) {
      case 'IMPORTED':
        return 'blue';
      case 'DEDICATED':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getHelfulnessPercentage = (helpfulCount: number, totalVotes: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((helpfulCount / totalVotes) * 100);
  };

  const isReviewSelected = (reviewId: string) => selectedReviews.includes(reviewId);

  const toggleReviewSelection = (reviewId: string) => {
    setSelectedReviews((prev) =>
      prev.includes(reviewId) ? prev.filter((id) => id !== reviewId) : [...prev, reviewId],
    );
  };

  const toggleAllReviews = () => {
    if (selectedReviews.length === reviews.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(reviews.map((r) => r.id));
    }
  };

  // Analytics component
  const AnalyticsCards = () => {
    if (analyticsLoading || !analytics) {
      return (
        <SimpleGrid cols={{ base: 1, lg: 4, sm: 2 }} spacing="md">
          {[...Array(4)].map((_, i) => (
            <Card key={i} withBorder p="md">
              <LoadingOverlay visible />
              <div style={{ height: 60 }} />
            </Card>
          ))}
        </SimpleGrid>
      );
    }

    return (
      <SimpleGrid cols={{ base: 1, lg: 4, sm: 2 }} spacing="md">
        <Card withBorder p="md">
          <Group justify="space-between">
            <div>
              <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                Total Reviews
              </Text>
              <Text fw={700} size="xl">
                {analytics.totalReviews.toLocaleString()}
              </Text>
            </div>
            <ThemeIcon color="blue" radius="md" size={38}>
              <IconMessages size={20} />
            </ThemeIcon>
          </Group>
          <Text c="dimmed" mt="md" size="sm">
            <Text
              component="span"
              c={
                analytics.recentTrends.totalThisMonth > analytics.recentTrends.totalLastMonth
                  ? 'teal'
                  : 'red'
              }
              fw={700}
            >
              {analytics.recentTrends.totalThisMonth > analytics.recentTrends.totalLastMonth
                ? '+'
                : ''}
              {analytics.recentTrends.totalThisMonth - analytics.recentTrends.totalLastMonth}
            </Text>{' '}
            this month
          </Text>
        </Card>

        <Card withBorder p="md">
          <Group justify="space-between">
            <div>
              <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                Average Rating
              </Text>
              <Group gap="xs">
                <Text fw={700} size="xl">
                  {analytics.averageRating}
                </Text>
                <Rating readOnly size="sm" value={analytics.averageRating} />
              </Group>
            </div>
            <ThemeIcon color="yellow" radius="md" size={38}>
              <IconStar size={20} />
            </ThemeIcon>
          </Group>
          <Text c="dimmed" mt="md" size="sm">
            <Text
              component="span"
              c={
                analytics.recentTrends.averageRatingThisMonth >
                analytics.recentTrends.averageRatingLastMonth
                  ? 'teal'
                  : 'red'
              }
              fw={700}
            >
              {analytics.recentTrends.averageRatingThisMonth >
              analytics.recentTrends.averageRatingLastMonth
                ? '+'
                : ''}
              {(
                analytics.recentTrends.averageRatingThisMonth -
                analytics.recentTrends.averageRatingLastMonth
              ).toFixed(1)}
            </Text>{' '}
            this month
          </Text>
        </Card>

        <Card withBorder p="md">
          <Group justify="space-between">
            <div>
              <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                Pending Moderation
              </Text>
              <Text c="orange" fw={700} size="xl">
                {analytics.pendingModerationCount}
              </Text>
            </div>
            <ThemeIcon color="orange" radius="md" size={38}>
              <IconAlertTriangle size={20} />
            </ThemeIcon>
          </Group>
          <Text c="dimmed" mt="md" size="sm">
            Requires immediate attention
          </Text>
        </Card>

        <Card withBorder p="md">
          <Group justify="space-between">
            <div>
              <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                Suspicious Reviews
              </Text>
              <Text c="red" fw={700} size="xl">
                {analytics.spamSuspiciousCount}
              </Text>
            </div>
            <ThemeIcon color="red" radius="md" size={38}>
              <IconShield size={20} />
            </ThemeIcon>
          </Group>
          <Text c="dimmed" mt="md" size="sm">
            Potential spam or fake reviews
          </Text>
        </Card>
      </SimpleGrid>
    );
  };

  return (
    <Container px={0} size="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={2}>Reviews Management</Title>
            <Text c="dimmed">Moderate customer reviews and analyze feedback patterns</Text>
          </div>
          <Group>
            <Button
              leftSection={<IconBrandSpeedtest size={18} />}
              onClick={loadSuspiciousReviews}
              variant="light"
            >
              Detect Spam
            </Button>
            <Button leftSection={<IconPlus size={18} />} onClick={handleCreate}>
              Add Review
            </Button>
          </Group>
        </Group>

        <Tabs onChange={(value) => setActiveTab(value || 'reviews')} value={activeTab}>
          <Tabs.List>
            <Tabs.Tab leftSection={<IconMessages size={16} />} value="reviews">
              Reviews ({pagination.total})
            </Tabs.Tab>
            <Tabs.Tab leftSection={<IconTrendingUp size={16} />} value="analytics">
              Analytics
            </Tabs.Tab>
            <Tabs.Tab leftSection={<IconShield size={16} />} value="moderation">
              Moderation Queue ({analytics?.pendingModerationCount || 0})
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel pt="md" value="analytics">
            <Stack gap="lg">
              <AnalyticsCards />

              {analytics && (
                <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
                  <Card withBorder p="md">
                    <Title order={4} mb="md">
                      Rating Distribution
                    </Title>
                    <Stack gap="xs">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const data = analytics.ratingDistribution.find(
                          (rd) => rd.rating === rating,
                        );
                        const count = data?.count || 0;
                        const percentage =
                          analytics.totalReviews > 0 ? (count / analytics.totalReviews) * 100 : 0;

                        return (
                          <Group key={rating} justify="space-between">
                            <Group gap="xs">
                              <Rating count={1} readOnly size="sm" value={rating} />
                              <Text size="sm">{rating} stars</Text>
                            </Group>
                            <Group gap="xs">
                              <Text size="sm" ta="right" w={40}>
                                {count}
                              </Text>
                              <div
                                style={{
                                  width: 100,
                                  backgroundColor: '#e9ecef',
                                  borderRadius: 4,
                                  height: 8,
                                }}
                              >
                                <div
                                  style={{
                                    width: `${percentage}%`,
                                    backgroundColor: '#228be6',
                                    borderRadius: 4,
                                    height: '100%',
                                  }}
                                />
                              </div>
                              <Text size="sm" ta="right" w={35}>
                                {percentage.toFixed(0)}%
                              </Text>
                            </Group>
                          </Group>
                        );
                      })}
                    </Stack>
                  </Card>

                  <Card withBorder p="md">
                    <Title order={4} mb="md">
                      Top Products by Reviews
                    </Title>
                    <Stack gap="sm">
                      {analytics.topProductsByReviews.slice(0, 5).map((product, index) => (
                        <Group key={product.productId} justify="space-between">
                          <Group gap="xs">
                            <Badge size="sm" variant="light">
                              {index + 1}
                            </Badge>
                            <div>
                              <Text fw={500} lineClamp={1} size="sm">
                                {product.productName}
                              </Text>
                              <Group gap="xs">
                                <Rating readOnly size="xs" value={product.averageRating} />
                                <Text c="dimmed" size="xs">
                                  ({product.averageRating})
                                </Text>
                              </Group>
                            </div>
                          </Group>
                          <Text fw={500} size="sm">
                            {product.reviewCount} reviews
                          </Text>
                        </Group>
                      ))}
                    </Stack>
                  </Card>
                </SimpleGrid>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel pt="md" value="moderation">
            <Stack gap="md">
              <Card withBorder p="md">
                <Group justify="space-between" mb="md">
                  <Title order={4}>Pending Reviews</Title>
                  <Badge color="orange">{analytics?.pendingModerationCount || 0} pending</Badge>
                </Group>
                <Text c="dimmed" mb="md" size="sm">
                  Reviews waiting for moderation approval
                </Text>
                <Button onClick={() => handleFilterChange('status', ['DRAFT'])} variant="light">
                  View Pending Reviews
                </Button>
              </Card>

              <Card withBorder p="md">
                <Group justify="space-between" mb="md">
                  <Title order={4}>Suspicious Activity</Title>
                  <Badge color="red">{suspiciousReviews.length} detected</Badge>
                </Group>
                <Text c="dimmed" mb="md" size="sm">
                  Reviews flagged by automated spam detection
                </Text>
                <Group>
                  <Button color="red" onClick={loadSuspiciousReviews} variant="light">
                    Refresh Detection
                  </Button>
                  {suspiciousReviews.length > 0 && (
                    <Button onClick={() => setActiveTab('reviews')} variant="outline">
                      Review {suspiciousReviews.length} Flagged
                    </Button>
                  )}
                </Group>
              </Card>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel pt="md" value="reviews">
            <Stack gap="md">
              {/* Search and Filters */}
              <Card withBorder p="md">
                <Group gap="md">
                  <TextInput
                    leftSection={<IconSearch size={16} />}
                    onChange={(e) => handleFilterChange('search', e.currentTarget.value)}
                    placeholder="Search reviews, products, or users..."
                    flex={1}
                    value={filters.search}
                  />
                  <Button
                    leftSection={<IconFilter size={16} />}
                    onClick={toggleFilters}
                    variant={filtersOpened ? 'filled' : 'light'}
                  >
                    Filters
                  </Button>
                  {selectedReviews.length > 0 && (
                    <Button color="red" onClick={openBulk} variant="light">
                      Bulk Actions ({selectedReviews.length})
                    </Button>
                  )}
                </Group>

                {filtersOpened && (
                  <Grid gutter="md" mt="md">
                    <Grid.Col span={{ base: 12, md: 3, sm: 6 }}>
                      <MultiSelect
                        onChange={(value) => handleFilterChange('status', value)}
                        clearable
                        data={[
                          { label: 'Draft', value: 'DRAFT' },
                          { label: 'Published', value: 'PUBLISHED' },
                          { label: 'Archived', value: 'ARCHIVED' },
                        ]}
                        label="Status"
                        value={filters.status || []}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3, sm: 6 }}>
                      <MultiSelect
                        onChange={(value) => handleFilterChange('rating', value.map(Number))}
                        clearable
                        data={[
                          { label: '5 stars', value: '5' },
                          { label: '4 stars', value: '4' },
                          { label: '3 stars', value: '3' },
                          { label: '2 stars', value: '2' },
                          { label: '1 star', value: '1' },
                        ]}
                        label="Rating"
                        value={(filters.rating || []).map(String)}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3, sm: 6 }}>
                      <Select
                        onChange={(value) =>
                          handleFilterChange('verified', value ? value === 'true' : undefined)
                        }
                        clearable
                        data={[
                          { label: 'Verified only', value: 'true' },
                          { label: 'Unverified only', value: 'false' },
                        ]}
                        label="Verified"
                        value={filters.verified?.toString()}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3, sm: 6 }}>
                      <MultiSelect
                        onChange={(value) => handleFilterChange('type', value)}
                        clearable
                        data={[
                          { label: 'Imported', value: 'IMPORTED' },
                          { label: 'Dedicated', value: 'DEDICATED' },
                        ]}
                        label="Type"
                        value={filters.type || []}
                      />
                    </Grid.Col>
                    <Grid.Col span={12}>
                      <Group>
                        <DatePickerInput
                          onChange={(value) => handleFilterChange('dateFrom', value)}
                          clearable
                          label="Date From"
                          value={filters.dateFrom}
                        />
                        <DatePickerInput
                          onChange={(value) => handleFilterChange('dateTo', value)}
                          clearable
                          label="Date To"
                          value={filters.dateTo}
                        />
                        <Button onClick={clearFilters} mt={24} variant="light">
                          Clear All
                        </Button>
                      </Group>
                    </Grid.Col>
                  </Grid>
                )}
              </Card>

              {/* Reviews Table */}
              <Card withBorder p={0}>
                <LoadingOverlay visible={loading} />
                <ScrollArea>
                  <Table highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th w={40}>
                          <Checkbox
                            onChange={toggleAllReviews}
                            checked={
                              selectedReviews.length === reviews.length && reviews.length > 0
                            }
                            indeterminate={
                              selectedReviews.length > 0 && selectedReviews.length < reviews.length
                            }
                          />
                        </Table.Th>
                        <Table.Th>Review</Table.Th>
                        <Table.Th>Product</Table.Th>
                        <Table.Th>Rating</Table.Th>
                        <Table.Th>Type</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Author</Table.Th>
                        <Table.Th>Helpfulness</Table.Th>
                        <Table.Th>Date</Table.Th>
                        <Table.Th>Actions</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {reviews.length === 0 ? (
                        <Table.Tr>
                          <Table.Td colSpan={10}>
                            <Stack align="center" py="xl">
                              <ThemeIcon color="gray" size="xl" variant="light">
                                <IconMessage size={30} />
                              </ThemeIcon>
                              <Text fw={500} ta="center">
                                No reviews found
                              </Text>
                              <Text c="dimmed" ta="center">
                                Try adjusting your filters or search terms
                              </Text>
                            </Stack>
                          </Table.Td>
                        </Table.Tr>
                      ) : (
                        reviews.map((review) => (
                          <Table.Tr
                            key={review.id}
                            bg={isReviewSelected(review.id) ? 'blue.0' : undefined}
                          >
                            <Table.Td>
                              <Checkbox
                                onChange={() => toggleReviewSelection(review.id)}
                                checked={isReviewSelected(review.id)}
                              />
                            </Table.Td>
                            <Table.Td>
                              <div style={{ maxWidth: 250 }}>
                                <Group gap="xs" mb={2}>
                                  <Text fw={500} lineClamp={1}>
                                    {review.title || 'Untitled Review'}
                                  </Text>
                                  {review.verified && (
                                    <Tooltip label="Verified purchase">
                                      <Badge color="blue" size="xs" variant="light">
                                        <IconShieldCheck size={10} />
                                      </Badge>
                                    </Tooltip>
                                  )}
                                </Group>
                                <Text c="dimmed" lineClamp={2} size="sm">
                                  {review.content}
                                </Text>
                                {review.media && review.media.length > 0 && (
                                  <Badge color="gray" mt={4} size="xs" variant="light">
                                    {review.media.length} media
                                  </Badge>
                                )}
                              </div>
                            </Table.Td>
                            <Table.Td>
                              {review.product ? (
                                <div style={{ maxWidth: 150 }}>
                                  <Text fw={500} lineClamp={1} size="sm">
                                    {review.product.name}
                                  </Text>
                                  <Text c="dimmed" lineClamp={1} size="xs">
                                    SKU: {review.product.sku}
                                  </Text>
                                </div>
                              ) : (
                                <Text c="dimmed" size="sm">
                                  No product
                                </Text>
                              )}
                            </Table.Td>
                            <Table.Td>
                              <Group gap="xs">
                                <Rating readOnly size="sm" value={review.rating} />
                                <Text size="sm">({review.rating})</Text>
                              </Group>
                            </Table.Td>
                            <Table.Td>
                              <Badge color={getTypeColor(review.type)} variant="light">
                                {review.type}
                              </Badge>
                            </Table.Td>
                            <Table.Td>
                              <Badge color={getStatusColor(review.status)} variant="light">
                                {review.status}
                              </Badge>
                            </Table.Td>
                            <Table.Td>
                              <Group gap="xs">
                                <Avatar name={review.user?.name || 'Anonymous'} size={24} />
                                <div>
                                  <Text lineClamp={1} size="sm">
                                    {review.user?.name || 'Anonymous'}
                                  </Text>
                                  <Text c="dimmed" lineClamp={1} size="xs">
                                    {review.user?.email}
                                  </Text>
                                </div>
                              </Group>
                            </Table.Td>
                            <Table.Td>
                              <Group gap="xs">
                                <Group gap={2}>
                                  <IconThumbUp color="green" size={12} />
                                  <Text size="sm">{review.helpfulCount}</Text>
                                </Group>
                                <Text c="dimmed" size="sm">
                                  /
                                </Text>
                                <Text size="sm">{review.totalVotes}</Text>
                                {review.totalVotes > 0 && (
                                  <Badge
                                    color={
                                      getHelfulnessPercentage(
                                        review.helpfulCount,
                                        review.totalVotes,
                                      ) > 70
                                        ? 'green'
                                        : 'orange'
                                    }
                                    size="xs"
                                  >
                                    {getHelfulnessPercentage(
                                      review.helpfulCount,
                                      review.totalVotes,
                                    )}
                                    %
                                  </Badge>
                                )}
                              </Group>
                            </Table.Td>
                            <Table.Td>
                              <Text size="sm">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </Text>
                            </Table.Td>
                            <Table.Td>
                              <Group gap="xs" justify="flex-end">
                                <Tooltip label="View details">
                                  <ActionIcon
                                    onClick={() => handleViewDetails(review)}
                                    variant="subtle"
                                  >
                                    <IconEye size={16} />
                                  </ActionIcon>
                                </Tooltip>
                                <Tooltip label="Edit">
                                  <ActionIcon onClick={() => handleEdit(review)} variant="subtle">
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
                                    {review.status === 'DRAFT' && (
                                      <>
                                        <Menu.Item
                                          color="green"
                                          leftSection={<IconCheck size={16} />}
                                          onClick={() => handleApprove(review.id)}
                                        >
                                          Approve
                                        </Menu.Item>
                                        <Menu.Item
                                          color="orange"
                                          leftSection={<IconBan size={16} />}
                                          onClick={() => handleReject(review.id)}
                                        >
                                          Reject
                                        </Menu.Item>
                                      </>
                                    )}
                                    <Menu.Item
                                      color="red"
                                      leftSection={<IconAlertTriangle size={16} />}
                                      onClick={() => handleFlagSpam(review.id)}
                                    >
                                      Flag as Spam
                                    </Menu.Item>
                                    <Menu.Divider />
                                    <Menu.Item
                                      color="red"
                                      leftSection={<IconTrash size={16} />}
                                      onClick={async () => {
                                        try {
                                          await deleteReview(review.id);
                                          notifications.show({
                                            color: 'green',
                                            message: 'Review deleted successfully',
                                          });
                                          await loadReviews();
                                          await loadAnalytics();
                                        } catch {
                                          notifications.show({
                                            color: 'red',
                                            message: 'Failed to delete review',
                                          });
                                        }
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

                {pagination.totalPages > 1 && (
                  <Group justify="center" p="md">
                    <Pagination
                      onChange={(page) => setPagination((prev) => ({ ...prev, page }))}
                      total={pagination.totalPages}
                      size="sm"
                      value={pagination.page}
                    />
                    <Text c="dimmed" size="sm">
                      Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                      {pagination.total} reviews
                    </Text>
                  </Group>
                )}
              </Card>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>

      {/* Review Form Drawer */}
      <Drawer
        onClose={closeDrawer}
        opened={drawerOpened}
        position="right"
        size="lg"
        title={isCreating ? 'Add Review' : 'Edit Review'}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <LoadingOverlay visible={isSaving} />

          <Tabs defaultValue="basic">
            <Tabs.List>
              <Tabs.Tab value="basic">Basic Info</Tabs.Tab>
              <Tabs.Tab value="settings">Settings</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel pt="md" value="basic">
              <Stack gap="md">
                <TextInput
                  {...form.getInputProps('title')}
                  placeholder="Review title (optional)"
                  label="Title"
                />

                <Textarea
                  {...form.getInputProps('content')}
                  placeholder="Review content"
                  rows={6}
                  label="Content"
                  withAsterisk
                />

                <Group grow>
                  <div>
                    <Text fw={500} mb="xs" size="sm">
                      Rating *
                    </Text>
                    <Rating
                      onChange={(value) => form.setFieldValue('rating', value)}
                      size="lg"
                      value={form.values.rating}
                    />
                  </div>
                </Group>

                <TextInput
                  {...form.getInputProps('userId')}
                  placeholder="user@example.com or user ID"
                  label="User ID/Email"
                  withAsterisk
                />

                <TextInput
                  {...form.getInputProps('productId')}
                  placeholder="Product ID (optional)"
                  label="Product ID"
                />
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel pt="md" value="settings">
              <Stack gap="md">
                <Select
                  {...form.getInputProps('status')}
                  data={[
                    { label: 'Draft (Pending Moderation)', value: 'DRAFT' },
                    { label: 'Published', value: 'PUBLISHED' },
                    { label: 'Archived', value: 'ARCHIVED' },
                  ]}
                  label="Status"
                />

                <Select
                  {...form.getInputProps('type')}
                  data={[
                    { label: 'Imported from External Source', value: 'IMPORTED' },
                    { label: 'Created Directly', value: 'DEDICATED' },
                  ]}
                  label="Type"
                />

                <Select
                  {...form.getInputProps('verified')}
                  onChange={(value) => form.setFieldValue('verified', value === 'true')}
                  data={[
                    { label: 'Not Verified', value: 'false' },
                    { label: 'Verified Purchase', value: 'true' },
                  ]}
                  label="Verification Status"
                  value={form.values.verified.toString()}
                />

                <Group grow>
                  <TextInput
                    {...form.getInputProps('source')}
                    placeholder="e.g., Amazon, Google Reviews"
                    label="Source (for imported reviews)"
                  />
                  <TextInput
                    {...form.getInputProps('sourceId')}
                    placeholder="External review ID"
                    label="Source ID"
                  />
                </Group>
              </Stack>
            </Tabs.Panel>
          </Tabs>

          <Group justify="space-between" mt="md">
            <Button onClick={closeDrawer} disabled={isSaving} variant="subtle">
              Cancel
            </Button>
            <Button loading={isSaving} type="submit">
              {isCreating ? 'Create Review' : 'Save Changes'}
            </Button>
          </Group>
        </form>
      </Drawer>

      {/* Review Detail Modal */}
      <Modal onClose={closeDetail} opened={detailOpened} size="xl" title="Review Details">
        {selectedReview && (
          <Stack gap="md">
            <Group justify="space-between">
              <Group gap="xs">
                <Rating readOnly value={selectedReview.rating} />
                <Text fw={500}>{selectedReview.rating}/5</Text>
                {selectedReview.verified && (
                  <Badge color="blue" leftSection={<IconShieldCheck size={12} />}>
                    Verified Purchase
                  </Badge>
                )}
              </Group>
              <Group gap="xs">
                <Badge color={getStatusColor(selectedReview.status)}>{selectedReview.status}</Badge>
                <Badge color={getTypeColor(selectedReview.type)}>{selectedReview.type}</Badge>
              </Group>
            </Group>

            {selectedReview.title && (
              <div>
                <Text c="dimmed" mb={4} size="sm">
                  Title
                </Text>
                <Text fw={500}>{selectedReview.title}</Text>
              </div>
            )}

            <div>
              <Text c="dimmed" mb={4} size="sm">
                Review Content
              </Text>
              <Paper withBorder p="md">
                <Text style={{ whiteSpace: 'pre-wrap' }}>{selectedReview.content}</Text>
              </Paper>
            </div>

            {selectedReview.product && (
              <div>
                <Text c="dimmed" mb={4} size="sm">
                  Product
                </Text>
                <Group gap="md">
                  {selectedReview.product.media?.[0] && (
                    <Image
                      alt={selectedReview.product.media[0].altText || 'Product'}
                      h={60}
                      radius="sm"
                      src={selectedReview.product.media[0].url}
                      w={60}
                    />
                  )}
                  <div>
                    <Text fw={500}>{selectedReview.product.name}</Text>
                    <Text c="dimmed" size="sm">
                      SKU: {selectedReview.product.sku}
                    </Text>
                  </div>
                </Group>
              </div>
            )}

            <Grid>
              <Grid.Col span={6}>
                <Text c="dimmed" mb={4} size="sm">
                  Author
                </Text>
                <Group gap="xs">
                  <Avatar name={selectedReview.user?.name || 'Anonymous'} size={32} />
                  <div>
                    <Text fw={500} size="sm">
                      {selectedReview.user?.name || 'Anonymous'}
                    </Text>
                    <Text c="dimmed" size="xs">
                      {selectedReview.user?.email}
                    </Text>
                  </div>
                </Group>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text c="dimmed" mb={4} size="sm">
                  Helpfulness
                </Text>
                <Group gap="xs">
                  <Group gap={4}>
                    <IconThumbUp color="green" size={16} />
                    <Text size="sm">{selectedReview.helpfulCount}</Text>
                  </Group>
                  <Text c="dimmed" size="sm">
                    /
                  </Text>
                  <Text size="sm">{selectedReview.totalVotes} total votes</Text>
                  {selectedReview.totalVotes > 0 && (
                    <Text c="dimmed" size="sm">
                      (
                      {getHelfulnessPercentage(
                        selectedReview.helpfulCount,
                        selectedReview.totalVotes,
                      )}
                      % helpful)
                    </Text>
                  )}
                </Group>
              </Grid.Col>
            </Grid>

            {selectedReview.media && selectedReview.media.length > 0 && (
              <div>
                <Text c="dimmed" mb={4} size="sm">
                  Media Attachments
                </Text>
                <SimpleGrid cols={3} spacing="sm">
                  {selectedReview.media.map((media) => (
                    <Image
                      key={media.id}
                      alt={media.altText || 'Review media'}
                      h={100}
                      radius="sm"
                      src={media.url}
                    />
                  ))}
                </SimpleGrid>
              </div>
            )}

            <Group grow>
              <Text c="dimmed" size="sm">
                Created: {new Date(selectedReview.createdAt).toLocaleString()}
              </Text>
              {selectedReview.source && (
                <Text c="dimmed" size="sm">
                  Source: {selectedReview.source}
                  {selectedReview.sourceId && ` (${selectedReview.sourceId})`}
                </Text>
              )}
            </Group>

            <Group justify="space-between" pt="md">
              <Group>
                <Button onClick={() => handleEdit(selectedReview)} variant="light">
                  Edit Review
                </Button>
                {selectedReview.status === 'DRAFT' && (
                  <>
                    <Button color="green" onClick={() => handleApprove(selectedReview.id)}>
                      Approve
                    </Button>
                    <Button color="orange" onClick={() => handleReject(selectedReview.id)}>
                      Reject
                    </Button>
                  </>
                )}
              </Group>
              <Button color="red" onClick={() => handleFlagSpam(selectedReview.id)} variant="light">
                Flag as Spam
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Bulk Actions Modal */}
      <Modal
        onClose={closeBulk}
        opened={bulkOpened}
        title={`Bulk Actions (${selectedReviews.length} reviews selected)`}
      >
        <form onSubmit={bulkForm.onSubmit(handleBulkAction)}>
          <Stack gap="md">
            <Select
              {...bulkForm.getInputProps('action')}
              placeholder="Select an action"
              data={[
                { label: 'Update Status/Settings', value: 'update' },
                { label: 'Delete Reviews', value: 'delete' },
              ]}
              label="Action"
              withAsterisk
            />

            {bulkForm.values.action === 'update' && (
              <>
                <Select
                  {...bulkForm.getInputProps('status')}
                  data={[
                    { label: 'Draft', value: 'DRAFT' },
                    { label: 'Published', value: 'PUBLISHED' },
                    { label: 'Archived', value: 'ARCHIVED' },
                  ]}
                  label="New Status"
                />
                <Select
                  {...bulkForm.getInputProps('verified')}
                  onChange={(value) => bulkForm.setFieldValue('verified', value === 'true')}
                  data={[
                    { label: 'Not Verified', value: 'false' },
                    { label: 'Verified', value: 'true' },
                  ]}
                  label="Verification Status"
                  value={bulkForm.values.verified.toString()}
                />
              </>
            )}

            {bulkForm.values.action === 'delete' && (
              <Text c="red" size="sm">
                This action will permanently delete {selectedReviews.length} reviews. This cannot be
                undone.
              </Text>
            )}

            <Group justify="space-between">
              <Button onClick={closeBulk} variant="subtle">
                Cancel
              </Button>
              <Button
                color={bulkForm.values.action === 'delete' ? 'red' : 'blue'}
                disabled={!bulkForm.values.action}
                type="submit"
              >
                {bulkForm.values.action === 'delete' ? 'Delete' : 'Update'} {selectedReviews.length}{' '}
                Reviews
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}
