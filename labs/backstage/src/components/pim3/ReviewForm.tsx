'use client';

import {
  Modal,
  Stack,
  Group,
  Button,
  TextInput,
  Select,
  Text,
  LoadingOverlay,
  Textarea,
  Rating,
  Switch,
  Alert,
  Divider,
  Badge,
} from '@mantine/core';
import {
  IconStar,
  IconMessage,
  IconUser,
  IconPackage,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconFlag,
} from '@tabler/icons-react';
import { useForm, zodResolver } from '@mantine/form';
import { useState, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { z } from 'zod';

import {
  getReviewById,
  createReview,
  updateReview,
  approveReview,
  rejectReview,
  flagAsSpam,
} from '@/actions/pim3/actions';
import { ContentStatus, ReviewType } from '@repo/database/prisma';

const reviewSchema = z.object({
  userId: z.string().min(1, 'User is required'),
  productId: z.string().optional(),
  title: z.string().optional(),
  content: z.string().min(1, 'Review content is required'),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  status: z.nativeEnum(ContentStatus, {
    required_error: 'Status is required',
  }),
  type: z.nativeEnum(ReviewType, {
    required_error: 'Review type is required',
  }),
  verified: z.boolean().default(false),
  source: z.string().optional(),
  sourceId: z.string().optional(),
});

interface ReviewFormProps {
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  reviewId?: string | null;
  mode?: 'create' | 'edit' | 'view' | 'moderate';
  userId?: string;
  productId?: string;
}

export function ReviewForm({
  opened,
  onClose,
  onSuccess,
  reviewId,
  mode = 'create',
  userId,
  productId,
}: ReviewFormProps) {
  const [loading, setLoading] = useState(false);
  const [reviewData, setReviewData] = useState<any>(null);
  const [moderating, setModerating] = useState(false);

  const form = useForm({
    validate: zodResolver(reviewSchema),
    initialValues: {
      userId: userId || '',
      productId: productId || '',
      title: '',
      content: '',
      rating: 5,
      status: ContentStatus.PUBLISHED,
      type: ReviewType.DEDICATED,
      verified: false,
      source: '',
      sourceId: '',
    },
  });

  // Load review data when editing
  useEffect(() => {
    if (opened && reviewId) {
      loadReview();
    } else if (opened && !reviewId) {
      form.reset();
      form.setValues({
        userId: userId || '',
        productId: productId || '',
        title: '',
        content: '',
        rating: 5,
        status: ContentStatus.PUBLISHED,
        type: ReviewType.DEDICATED,
        verified: false,
        source: '',
        sourceId: '',
      });
    }
  }, [opened, reviewId, userId, productId]);

  const loadReview = async () => {
    if (!reviewId) return;

    try {
      setLoading(true);
      const result = await getReviewById(reviewId);

      if (result.success && result.data) {
        setReviewData(result.data);
        form.setValues({
          userId: result.data.userId,
          productId: result.data.productId || '',
          title: result.data.title || '',
          content: result.data.content,
          rating: result.data.rating,
          status: result.data.status,
          type: result.data.type,
          verified: result.data.verified,
          source: result.data.source || '',
          sourceId: result.data.sourceId || '',
        });
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to load review',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load review',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);

      let result;
      if (reviewId && mode === 'edit') {
        result = await updateReview(reviewId, values);
      } else {
        result = await createReview(values);
      }

      if (result.success) {
        notifications.show({
          title: 'Success',
          message: reviewId ? 'Review updated successfully' : 'Review created successfully',
          color: 'green',
        });
        onSuccess?.();
        onClose();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to save review',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save review',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModerateAction = async (action: 'approve' | 'reject' | 'spam') => {
    if (!reviewId) return;

    try {
      setModerating(true);
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
        onSuccess?.();
        if (action !== 'approve') onClose();
        else loadReview(); // Reload to show updated status
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
    } finally {
      setModerating(false);
    }
  };

  const getModalTitle = () => {
    if (mode === 'view') return 'View Review';
    if (mode === 'moderate') return 'Moderate Review';
    if (reviewId) return 'Edit Review';
    return 'Create Review';
  };

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

  const reviewTypes = [
    { value: 'DEDICATED', label: 'Dedicated Review' },
    { value: 'EMBEDDED', label: 'Embedded Review' },
    { value: 'IMPORTED', label: 'Imported Review' },
  ];

  const statusOptions = [
    { value: 'DRAFT', label: 'Draft' },
    { value: 'PUBLISHED', label: 'Published' },
    { value: 'ARCHIVED', label: 'Archived' },
  ];

  return (
    <Modal opened={opened} onClose={onClose} title={getModalTitle()} size="lg">
      <LoadingOverlay visible={loading} />

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          {mode === 'moderate' && reviewData && (
            <Alert icon={<IconAlertCircle size={16} />} color="blue" title="Review Moderation">
              <Stack gap="xs">
                <Text size="sm">
                  <strong>Current Status:</strong>
                  <Badge color={getStatusColor(reviewData.status)} ml="xs">
                    {reviewData.status}
                  </Badge>
                </Text>
                <Text size="sm">
                  <strong>Verified:</strong> {reviewData.verified ? 'Yes' : 'No'}
                </Text>
                <Text size="sm">
                  <strong>Helpful Votes:</strong> {reviewData.helpfulCount || 0}
                </Text>
                <Text size="sm">
                  <strong>Total Votes:</strong> {reviewData.totalVotes || 0}
                </Text>
              </Stack>
            </Alert>
          )}

          <Group grow>
            <TextInput
              label="User ID"
              placeholder="Enter user ID"
              required
              leftSection={<IconUser size={16} />}
              {...form.getInputProps('userId')}
              disabled={!!userId || mode === 'view' || mode === 'moderate'}
            />
            <TextInput
              label="Product ID"
              placeholder="Enter product ID (optional)"
              leftSection={<IconPackage size={16} />}
              {...form.getInputProps('productId')}
              disabled={!!productId || mode === 'view' || mode === 'moderate'}
            />
          </Group>

          <TextInput
            label="Review Title"
            placeholder="Enter review title (optional)"
            leftSection={<IconMessage size={16} />}
            {...form.getInputProps('title')}
            disabled={mode === 'view' || mode === 'moderate'}
          />

          <Textarea
            label="Review Content"
            placeholder="Enter review content"
            required
            autosize
            minRows={3}
            maxRows={8}
            {...form.getInputProps('content')}
            disabled={mode === 'view' || mode === 'moderate'}
          />

          <Group grow>
            <div>
              <Text size="sm" fw={500} mb="xs">
                Rating
              </Text>
              <Rating
                value={form.values.rating}
                onChange={(value) => form.setFieldValue('rating', value)}
                readOnly={mode === 'view' || mode === 'moderate'}
                size="lg"
              />
            </div>
            <Select
              label="Review Type"
              placeholder="Select review type"
              required
              data={reviewTypes}
              {...form.getInputProps('type')}
              disabled={mode === 'view' || mode === 'moderate'}
            />
          </Group>

          <Group grow>
            <Select
              label="Status"
              placeholder="Select status"
              required
              data={statusOptions}
              {...form.getInputProps('status')}
              disabled={mode === 'view' || mode === 'moderate'}
            />
            <div>
              <Text size="sm" fw={500} mb="xs">
                Verification
              </Text>
              <Switch
                label="Verified Review"
                description="Mark this review as verified"
                {...form.getInputProps('verified', { type: 'checkbox' })}
                disabled={mode === 'view'}
              />
            </div>
          </Group>

          {(form.values.type === 'IMPORTED' || (reviewData && reviewData.source)) && (
            <>
              <Divider label="Import Information" labelPosition="left" />
              <Group grow>
                <TextInput
                  label="Source"
                  placeholder="e.g., Amazon, Google"
                  {...form.getInputProps('source')}
                  disabled={mode === 'view' || mode === 'moderate'}
                />
                <TextInput
                  label="Source ID"
                  placeholder="Original review ID from source"
                  {...form.getInputProps('sourceId')}
                  disabled={mode === 'view' || mode === 'moderate'}
                />
              </Group>
            </>
          )}

          {mode === 'view' && reviewData && (
            <Alert color="blue" icon={<IconMessage size={16} />}>
              <Stack gap="xs">
                <Text size="sm">
                  <strong>Created:</strong> {new Date(reviewData.createdAt).toLocaleString()}
                </Text>
                <Text size="sm">
                  <strong>Updated:</strong> {new Date(reviewData.updatedAt).toLocaleString()}
                </Text>
                {reviewData.user && (
                  <Text size="sm">
                    <strong>Author:</strong> {reviewData.user.name} ({reviewData.user.email})
                  </Text>
                )}
                {reviewData.product && (
                  <Text size="sm">
                    <strong>Product:</strong> {reviewData.product.name} (SKU:{' '}
                    {reviewData.product.sku})
                  </Text>
                )}
              </Stack>
            </Alert>
          )}

          <Group justify="flex-end">
            <Button variant="subtle" onClick={onClose} disabled={loading || moderating}>
              {mode === 'view' || mode === 'moderate' ? 'Close' : 'Cancel'}
            </Button>

            {mode === 'moderate' && reviewId && (
              <Group>
                <Button
                  color="red"
                  leftSection={<IconFlag size={16} />}
                  loading={moderating}
                  onClick={() => handleModerateAction('spam')}
                >
                  Mark as Spam
                </Button>
                <Button
                  color="orange"
                  leftSection={<IconX size={16} />}
                  loading={moderating}
                  onClick={() => handleModerateAction('reject')}
                >
                  Reject
                </Button>
                <Button
                  color="green"
                  leftSection={<IconCheck size={16} />}
                  loading={moderating}
                  onClick={() => handleModerateAction('approve')}
                >
                  Approve
                </Button>
              </Group>
            )}

            {mode !== 'view' && mode !== 'moderate' && (
              <Button
                type="submit"
                loading={loading}
                leftSection={reviewId ? <IconCheck size={16} /> : <IconStar size={16} />}
              >
                {reviewId ? 'Update Review' : 'Create Review'}
              </Button>
            )}
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
