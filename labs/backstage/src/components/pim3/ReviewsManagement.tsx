'use client';

import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Card,
  Drawer,
  Group,
  Menu,
  Pagination,
  Rating,
  Select,
  Stack,
  Text,
  Textarea,
  ThemeIcon,
  UnstyledButton,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import {
  IconCheck,
  IconDots,
  IconFlag,
  IconMessage,
  IconStar,
  IconThumbDown,
  IconThumbUp,
  IconTrash,
  IconUser,
  IconX,
} from '@tabler/icons-react';
import { useState } from 'react';

import {
  formatDate,
  showDeleteConfirmation,
  showSuccessNotification,
} from '@/utils/pim3/pim-helpers';

interface Review {
  comment: string;
  createdAt: Date;
  helpful: number;
  id: string;
  notHelpful: number;
  rating: number;
  response?: {
    id: string;
    message: string;
    createdAt: Date;
    createdBy: {
      name: string;
      role: string;
    };
  };
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  title: string;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  verifiedPurchase: boolean;
}

interface ReviewsManagementProps {
  onUpdate?: () => void;
  productId: string;
  productName: string;
}

/**
 * Component for managing product reviews
 * Allows viewing, moderating, and responding to customer reviews
 */
export function ReviewsManagement({ onUpdate, productId, productName }: ReviewsManagementProps) {
  // Mock data for demonstration
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 'review-1',
      comment:
        'This laptop exceeded all my expectations. The performance is incredible, and it handles all my games at max settings without breaking a sweat. The cooling system is also very efficient.',
      createdAt: new Date('2025-01-15'),
      helpful: 45,
      notHelpful: 3,
      rating: 5,
      response: {
        id: 'response-1',
        createdAt: new Date('2025-01-16'),
        createdBy: {
          name: 'Support Team',
          role: 'Customer Service',
        },
        message:
          "Thank you for your positive feedback! We're thrilled to hear that our gaming laptop is meeting your expectations. Happy gaming!",
      },
      status: 'approved',
      title: 'Amazing laptop for gaming!',
      updatedAt: new Date('2025-01-15'),
      user: {
        id: 'user-1',
        name: 'John Doe',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
        email: 'john.doe@example.com',
      },
      verifiedPurchase: true,
    },
    {
      id: 'review-2',
      comment:
        'Overall a great laptop. Performance is excellent but the battery life could be better when gaming. Also, the keyboard backlight is a bit dim.',
      createdAt: new Date('2025-01-10'),
      helpful: 23,
      notHelpful: 5,
      rating: 4,
      status: 'approved',
      title: 'Great performance, minor issues',
      updatedAt: new Date('2025-01-10'),
      user: {
        id: 'user-2',
        name: 'Jane Smith',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
        email: 'jane.smith@example.com',
      },
      verifiedPurchase: true,
    },
    {
      id: 'review-3',
      comment:
        'The laptop started having issues after just 2 months. Screen flickering and random shutdowns. Customer service has been unhelpful.',
      createdAt: new Date('2025-01-05'),
      helpful: 12,
      notHelpful: 8,
      rating: 2,
      status: 'flagged',
      title: 'Disappointed with the quality',
      updatedAt: new Date('2025-01-06'),
      user: {
        id: 'user-3',
        name: 'Mike Johnson',
        email: 'mike.j@example.com',
      },
      verifiedPurchase: true,
    },
    {
      id: 'review-4',
      comment: 'Love it! Fast shipping and exactly as described.',
      createdAt: new Date('2025-01-20'),
      helpful: 5,
      notHelpful: 15,
      rating: 5,
      status: 'pending',
      title: 'Best purchase ever!',
      updatedAt: new Date('2025-01-20'),
      user: {
        id: 'user-4',
        name: 'Sarah Williams',
        email: 'sarah.w@example.com',
      },
      verifiedPurchase: false,
    },
  ]);

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [responseDrawerOpened, { close: closeResponseDrawer, open: openResponseDrawer }] =
    useDisclosure(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const responseForm = useForm({
    validate: {
      message: (value) => (!value ? 'Response message is required' : null),
    },
    initialValues: {
      message: '',
    },
  });

  // Calculate review statistics
  const reviewStats = {
    average: reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length || 0,
    distribution: [1, 2, 3, 4, 5].map((rating) => ({
      count: reviews.filter((r) => r.rating === rating).length,
      percentage: (reviews.filter((r) => r.rating === rating).length / reviews.length) * 100 || 0,
      rating,
    })),
    flagged: reviews.filter((r) => r.status === 'flagged').length,
    pending: reviews.filter((r) => r.status === 'pending').length,
    total: reviews.length,
  };

  const getStatusColor = (status: Review['status']) => {
    switch (status) {
      case 'approved':
        return 'green';
      case 'rejected':
        return 'red';
      case 'pending':
        return 'yellow';
      case 'flagged':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const handleStatusChange = (reviewId: string, newStatus: Review['status']) => {
    setReviews((prevReviews) =>
      prevReviews.map((review) =>
        review.id === reviewId ? { ...review, status: newStatus, updatedAt: new Date() } : review,
      ),
    );
    showSuccessNotification(`Review ${newStatus} successfully`);
    onUpdate?.();
  };

  const handleDeleteReview = (reviewId: string) => {
    showDeleteConfirmation('this review', () => {
      setReviews((prevReviews) => prevReviews.filter((review) => review.id !== reviewId));
      showSuccessNotification('Review deleted successfully');
      onUpdate?.();
    });
  };

  const handleResponseSubmit = () => {
    if (!selectedReview) return;

    const newResponse = {
      id: `response-${Date.now()}`,
      createdAt: new Date(),
      createdBy: {
        name: 'Support Team',
        role: 'Customer Service',
      },
      message: responseForm.values.message,
    };

    setReviews((prevReviews) =>
      prevReviews.map((review) =>
        review.id === selectedReview.id ? { ...review, response: newResponse } : review,
      ),
    );

    showSuccessNotification('Response added successfully');
    closeResponseDrawer();
    responseForm.reset();
    setSelectedReview(null);
    onUpdate?.();
  };

  const handleHelpfulClick = (reviewId: string, isHelpful: boolean) => {
    setReviews((prevReviews) =>
      prevReviews.map((review) =>
        review.id === reviewId
          ? {
              ...review,
              helpful: isHelpful ? review.helpful + 1 : review.helpful,
              notHelpful: !isHelpful ? review.notHelpful + 1 : review.notHelpful,
            }
          : review,
      ),
    );
  };

  // Filter reviews
  const filteredReviews = reviews.filter((review) => {
    if (statusFilter !== 'all' && review.status !== statusFilter) return false;
    if (ratingFilter !== 'all' && review.rating !== parseInt(ratingFilter)) return false;
    return true;
  });

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const paginatedReviews = filteredReviews.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <>
      <Stack>
        {/* Review Statistics */}
        <Card withBorder>
          <Stack>
            <Text fw={600} size="lg">
              Review Summary
            </Text>

            <Group>
              <div>
                <Group gap="xs">
                  <Rating fractions={2} readOnly size="xl" value={reviewStats.average} />
                  <Text fw={600} size="xl">
                    {reviewStats.average.toFixed(1)}
                  </Text>
                </Group>
                <Text c="dimmed" size="sm">
                  Based on {reviewStats.total} reviews
                </Text>
              </div>

              {/* Rating Distribution */}
              <Stack style={{ flex: 1 }} gap="xs">
                {reviewStats.distribution.reverse().map(({ count, percentage, rating }) => (
                  <Group key={rating} gap="xs">
                    <Text size="sm" w={20}>
                      {rating}
                    </Text>
                    <IconStar fill="currentColor" size={14} />
                    <div
                      style={{
                        backgroundColor: 'var(--mantine-color-gray-2)',
                        borderRadius: 4,
                        flex: 1,
                        height: 8,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: 'var(--mantine-color-yellow-6)',
                          height: '100%',
                        }}
                      />
                    </div>
                    <Text c="dimmed" size="sm" w={30}>
                      {count}
                    </Text>
                  </Group>
                ))}
              </Stack>

              {/* Quick Stats */}
              <Stack gap="xs">
                {reviewStats.pending > 0 && (
                  <Badge color="yellow" variant="light">
                    {reviewStats.pending} pending
                  </Badge>
                )}
                {reviewStats.flagged > 0 && (
                  <Badge color="orange" variant="light">
                    {reviewStats.flagged} flagged
                  </Badge>
                )}
                <Badge color="green" variant="light">
                  {reviews.filter((r) => r.verifiedPurchase).length} verified
                </Badge>
              </Stack>
            </Group>
          </Stack>
        </Card>

        {/* Filters */}
        <Group>
          <Select
            onChange={(value) => {
              setStatusFilter(value || 'all');
              setPage(1);
            }}
            placeholder="All statuses"
            data={[
              { label: 'All Statuses', value: 'all' },
              { label: 'Pending', value: 'pending' },
              { label: 'Approved', value: 'approved' },
              { label: 'Rejected', value: 'rejected' },
              { label: 'Flagged', value: 'flagged' },
            ]}
            label="Status"
            value={statusFilter}
            w={150}
          />
          <Select
            onChange={(value) => {
              setRatingFilter(value || 'all');
              setPage(1);
            }}
            placeholder="All ratings"
            data={[
              { label: 'All Ratings', value: 'all' },
              { label: '5 Stars', value: '5' },
              { label: '4 Stars', value: '4' },
              { label: '3 Stars', value: '3' },
              { label: '2 Stars', value: '2' },
              { label: '1 Star', value: '1' },
            ]}
            label="Rating"
            value={ratingFilter}
            w={150}
          />
        </Group>

        {/* Reviews List */}
        <Stack>
          {paginatedReviews.length > 0 ? (
            paginatedReviews.map((review) => (
              <Card key={review.id} withBorder>
                <Stack>
                  {/* Review Header */}
                  <Group justify="space-between">
                    <Group>
                      <Avatar alt={review.user.name} radius="xl" size="md" src={review.user.avatar}>
                        <IconUser size={20} />
                      </Avatar>
                      <div>
                        <Group gap="xs">
                          <Text fw={500}>{review.user.name}</Text>
                          {review.verifiedPurchase && (
                            <Badge color="green" size="xs" variant="light">
                              Verified Purchase
                            </Badge>
                          )}
                          <Badge color={getStatusColor(review.status)} size="xs" variant="light">
                            {review.status}
                          </Badge>
                        </Group>
                        <Text c="dimmed" size="xs">
                          {formatDate(review.createdAt)}
                        </Text>
                      </div>
                    </Group>

                    <Menu position="bottom-end">
                      <Menu.Target>
                        <ActionIcon variant="subtle">
                          <IconDots size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        {review.status !== 'approved' && (
                          <Menu.Item
                            leftSection={<IconCheck size={14} />}
                            onClick={() => handleStatusChange(review.id, 'approved')}
                          >
                            Approve
                          </Menu.Item>
                        )}
                        {review.status !== 'rejected' && (
                          <Menu.Item
                            leftSection={<IconX size={14} />}
                            onClick={() => handleStatusChange(review.id, 'rejected')}
                          >
                            Reject
                          </Menu.Item>
                        )}
                        {review.status !== 'flagged' && (
                          <Menu.Item
                            color="orange"
                            leftSection={<IconFlag size={14} />}
                            onClick={() => handleStatusChange(review.id, 'flagged')}
                          >
                            Flag for Review
                          </Menu.Item>
                        )}
                        {!review.response && (
                          <Menu.Item
                            leftSection={<IconMessage size={14} />}
                            onClick={() => {
                              setSelectedReview(review);
                              openResponseDrawer();
                            }}
                          >
                            Add Response
                          </Menu.Item>
                        )}
                        <Menu.Divider />
                        <Menu.Item
                          color="red"
                          leftSection={<IconTrash size={14} />}
                          onClick={() => handleDeleteReview(review.id)}
                        >
                          Delete Review
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>

                  {/* Rating and Title */}
                  <Group gap="xs">
                    <Rating readOnly size="sm" value={review.rating} />
                    <Text fw={600}>{review.title}</Text>
                  </Group>

                  {/* Review Content */}
                  <Text>{review.comment}</Text>

                  {/* Admin Response */}
                  {review.response && (
                    <Card withBorder bg="gray.0">
                      <Stack gap="xs">
                        <Group gap="xs">
                          <ThemeIcon size="sm" variant="light">
                            <IconMessage size={14} />
                          </ThemeIcon>
                          <Text fw={500} size="sm">
                            Response from {review.response.createdBy.name}
                          </Text>
                          <Text c="dimmed" size="xs">
                            {formatDate(review.response.createdAt)}
                          </Text>
                        </Group>
                        <Text size="sm">{review.response.message}</Text>
                      </Stack>
                    </Card>
                  )}

                  {/* Helpful Votes */}
                  <Group gap="xs">
                    <Text c="dimmed" size="sm">
                      Was this review helpful?
                    </Text>
                    <Group gap="xs">
                      <UnstyledButton
                        onClick={() => handleHelpfulClick(review.id, true)}
                        style={{ alignItems: 'center', display: 'flex', gap: 4 }}
                      >
                        <IconThumbUp size={16} />
                        <Text size="sm">{review.helpful}</Text>
                      </UnstyledButton>
                      <UnstyledButton
                        onClick={() => handleHelpfulClick(review.id, false)}
                        style={{ alignItems: 'center', display: 'flex', gap: 4 }}
                      >
                        <IconThumbDown size={16} />
                        <Text size="sm">{review.notHelpful}</Text>
                      </UnstyledButton>
                    </Group>
                  </Group>
                </Stack>
              </Card>
            ))
          ) : (
            <Text c="dimmed" py="xl" ta="center">
              No reviews found matching your filters
            </Text>
          )}
        </Stack>

        {/* Pagination */}
        {totalPages > 1 && (
          <Group justify="center">
            <Pagination onChange={setPage} total={totalPages} value={page} />
          </Group>
        )}
      </Stack>

      {/* Response Drawer */}
      <Drawer
        onClose={() => {
          closeResponseDrawer();
          responseForm.reset();
          setSelectedReview(null);
        }}
        opened={responseDrawerOpened}
        position="right"
        size="md"
        title="Add Response"
      >
        <form onSubmit={responseForm.onSubmit(handleResponseSubmit)}>
          <Stack>
            {selectedReview && (
              <Card withBorder>
                <Stack gap="sm">
                  <Group>
                    <Avatar size="sm" src={selectedReview.user.avatar}>
                      <IconUser size={16} />
                    </Avatar>
                    <div>
                      <Text fw={500} size="sm">
                        {selectedReview.user.name}
                      </Text>
                      <Rating readOnly size="xs" value={selectedReview.rating} />
                    </div>
                  </Group>
                  <Text fw={500} size="sm">
                    {selectedReview.title}
                  </Text>
                  <Text c="dimmed" size="sm">
                    {selectedReview.comment}
                  </Text>
                </Stack>
              </Card>
            )}

            <Textarea
              placeholder="Thank you for your feedback..."
              rows={6}
              label="Your Response"
              {...responseForm.getInputProps('message')}
              required
            />

            <Group justify="flex-end">
              <Button
                onClick={() => {
                  closeResponseDrawer();
                  responseForm.reset();
                  setSelectedReview(null);
                }}
                variant="outline"
              >
                Cancel
              </Button>
              <Button type="submit">Send Response</Button>
            </Group>
          </Stack>
        </form>
      </Drawer>
    </>
  );
}
