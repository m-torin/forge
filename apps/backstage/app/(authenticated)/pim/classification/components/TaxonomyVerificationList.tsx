'use client';

import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Code,
  Divider,
  Grid,
  Group,
  Loader,
  Modal,
  Paper,
  Progress,
  Select,
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
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconAlertCircle,
  IconCheck,
  IconClock,
  IconEye,
  IconFilter,
  IconHistory,
  IconRefresh,
  IconRobot,
  IconSearch,
  IconThumbUp,
  IconVector,
} from '@tabler/icons-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

import { ClassificationCard, type ProductClassification } from './ClassificationCard';

interface ClassificationHistory {
  confidence: number;
  feedback?: string;
  id: string;
  newCategory: string;
  oldCategory: string;
  productId: string;
  reviewedBy: string;
  timestamp: string;
}

interface ClassificationStats {
  approved: number;
  avgConfidence: number;
  pending: number;
  rejected: number;
  total: number;
}

export function TaxonomyVerificationList() {
  const [classifications, setClassifications] = useState<ProductClassification[]>([]);
  const [_history, _setHistory] = useState<ClassificationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassification, setSelectedClassification] =
    useState<ProductClassification | null>(null);
  const [feedbackModal, { close: closeFeedback, open: openFeedback }] = useDisclosure(false);
  const [detailsModal, { close: closeDetails, open: openDetails }] = useDisclosure(false);
  const [isRerunning, setIsRerunning] = useState<string | null>(null);
  const [stats, setStats] = useState<ClassificationStats>({
    avgConfidence: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    total: 0,
  });

  // Form for feedback
  const feedbackForm = useForm({
    validate: {
      feedback: (value) =>
        value.length < 10 ? 'Please provide at least 10 characters of feedback' : null,
    },
    initialValues: {
      feedback: '',
      suggestedCategory: '',
    },
  });

  // Form for filters
  const filterForm = useForm({
    initialValues: {
      searchQuery: '',
      status: 'all',
    },
  });

  // Fetch classifications from API
  const fetchClassifications = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterForm.values.status !== 'all') {
        params.append('status', filterForm.values.status);
      }
      if (filterForm.values.searchQuery) {
        params.append('search', filterForm.values.searchQuery);
      }

      const workersUrl = process.env.NEXT_PUBLIC_WORKERS_URL || 'http://localhost:3400';
      const response = await fetch(`${workersUrl}/api/classifications?${params}`);
      const data = await response.json();

      setClassifications(data.data);
      setStats(data.stats);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching classifications:', error);
      notifications.show({
        color: 'red',
        message: 'Failed to load classifications',
        title: 'Error',
      });
      setLoading(false);
    }
  }, [filterForm.values.status, filterForm.values.searchQuery]);

  useEffect(() => {
    fetchClassifications();
  }, [filterForm.values.status, filterForm.values.searchQuery, fetchClassifications]);

  const updateClassificationStatus = async (
    classificationId: string,
    status: 'approved' | 'rejected',
    feedback?: string,
  ) => {
    try {
      const workersUrl = process.env.NEXT_PUBLIC_WORKERS_URL || 'http://localhost:3400';
      const response = await fetch(`${workersUrl}/api/classifications`, {
        body: JSON.stringify({
          id: classificationId,
          feedback,
          reviewedBy: 'current-user@example.com', // Would come from auth context
          status,
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to update classification');
      }

      await fetchClassifications();
    } catch (error) {
      console.error('Error updating classification:', error);
      notifications.show({
        color: 'red',
        message: 'Failed to update classification',
        title: 'Error',
      });
    }
  };

  const handleApprove = async (classification: ProductClassification) => {
    await updateClassificationStatus(classification.id, 'approved');

    notifications.show({
      color: 'green',
      icon: <IconCheck />,
      message: `Product "${classification.product.title}" classification approved`,
      title: 'Classification Approved',
    });
  };

  const handleReject = async (values: typeof feedbackForm.values) => {
    if (!selectedClassification) return;

    await updateClassificationStatus(selectedClassification.id, 'rejected', values.feedback);

    notifications.show({
      color: 'orange',
      icon: <IconAlertCircle />,
      message: 'Product classification rejected and feedback recorded',
      title: 'Classification Rejected',
    });

    closeFeedback();
    feedbackForm.reset();
  };

  const handleRerun = async (classification: ProductClassification) => {
    setIsRerunning(classification.id);

    try {
      // Trigger re-classification workflow
      const workersUrl = process.env.NEXT_PUBLIC_WORKERS_URL || 'http://localhost:3400';
      const response = await fetch(`${workersUrl}/api/workflows/trigger`, {
        body: JSON.stringify({
          payload: {
            options: {
              classificationMethod: 'hybrid',
              includeReasoning: true,
            },
            product: {
              id: classification.productId,
              ...classification.product,
            },
          },
          workflowId: 'product-classification',
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to trigger re-classification');
      }

      notifications.show({
        color: 'blue',
        icon: <IconRefresh />,
        message: 'Product has been queued for re-classification',
        title: 'Classification Rerun',
      });

      // Refresh after a delay
      setTimeout(() => {
        fetchClassifications();
        setIsRerunning(null);
      }, 2000);
    } catch (error) {
      console.error('Error rerunning classification:', error);
      notifications.show({
        color: 'red',
        message: 'Failed to trigger re-classification',
        title: 'Error',
      });
      setIsRerunning(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'green';
      case 'rejected':
        return 'red';
      default:
        return 'yellow';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'hybrid':
        return <IconRobot size={16} />;
      case 'ai-only':
        return <IconRobot size={16} />;
      case 'vector-only':
        return <IconVector size={16} />;
      default:
        return null;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'green';
    if (confidence >= 0.7) return 'yellow';
    return 'red';
  };

  if (loading) {
    return (
      <Stack style={{ minHeight: 400 }} align="center" justify="center">
        <Loader size="xl" />
        <Text>Loading classifications...</Text>
      </Stack>
    );
  }

  return (
    <>
      {/* Stats Overview */}
      <Grid mb="lg">
        <Grid.Col span={3}>
          <Paper withBorder p="md">
            <Group justify="space-between">
              <div>
                <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                  Total Classifications
                </Text>
                <Text fw={700} size="xl">
                  {stats.total}
                </Text>
              </div>
              <ThemeIcon radius="md" size="xl" variant="light">
                <IconHistory size={28} />
              </ThemeIcon>
            </Group>
          </Paper>
        </Grid.Col>
        <Grid.Col span={3}>
          <Paper withBorder p="md">
            <Group justify="space-between">
              <div>
                <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                  Pending Review
                </Text>
                <Text c="yellow" fw={700} size="xl">
                  {stats.pending}
                </Text>
              </div>
              <ThemeIcon color="yellow" radius="md" size="xl" variant="light">
                <IconClock size={28} />
              </ThemeIcon>
            </Group>
          </Paper>
        </Grid.Col>
        <Grid.Col span={3}>
          <Paper withBorder p="md">
            <Group justify="space-between">
              <div>
                <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                  Approved
                </Text>
                <Text c="green" fw={700} size="xl">
                  {stats.approved}
                </Text>
              </div>
              <ThemeIcon color="green" radius="md" size="xl" variant="light">
                <IconThumbUp size={28} />
              </ThemeIcon>
            </Group>
          </Paper>
        </Grid.Col>
        <Grid.Col span={3}>
          <Paper withBorder p="md">
            <Group justify="space-between">
              <div>
                <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                  Avg Confidence
                </Text>
                <Text fw={700} size="xl">
                  {(stats.avgConfidence * 100).toFixed(1)}%
                </Text>
              </div>
              <Progress
                color={getConfidenceColor(stats.avgConfidence)}
                style={{ width: 60 }}
                radius="xl"
                size="xl"
                value={stats.avgConfidence * 100}
              />
            </Group>
          </Paper>
        </Grid.Col>
      </Grid>

      <Tabs defaultValue="pending">
        <Tabs.List>
          <Tabs.Tab leftSection={<IconClock size={16} />} value="pending">
            Pending Review ({stats.pending})
          </Tabs.Tab>
          <Tabs.Tab leftSection={<IconHistory size={16} />} value="all">
            All Classifications
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel pt="md" value="pending">
          <Stack gap="md">
            {classifications
              .filter((c) => c.status === 'pending')
              .map((classification) => (
                <ClassificationCard
                  key={classification.id}
                  classification={classification}
                  onApprove={handleApprove}
                  onReject={() => {
                    setSelectedClassification(classification);
                    openFeedback();
                  }}
                  onRerun={handleRerun}
                  isRerunning={isRerunning === classification.id}
                />
              ))}

            {classifications.filter((c) => c.status === 'pending').length === 0 && (
              <Alert color="green" icon={<IconCheck />}>
                All classifications have been reviewed!
              </Alert>
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel pt="md" value="all">
          <Stack gap="md">
            <Group>
              <TextInput
                leftSection={<IconSearch size={16} />}
                placeholder="Search products or categories..."
                {...filterForm.getInputProps('searchQuery')}
                style={{ flex: 1 }}
              />
              <Select
                leftSection={<IconFilter size={16} />}
                placeholder="Filter by status"
                {...filterForm.getInputProps('status')}
                style={{ width: 200 }}
                data={[
                  { label: 'All Status', value: 'all' },
                  { label: 'Pending', value: 'pending' },
                  { label: 'Approved', value: 'approved' },
                  { label: 'Rejected', value: 'rejected' },
                ]}
              />
            </Group>

            <Table highlightOnHover striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Product</Table.Th>
                  <Table.Th>Category</Table.Th>
                  <Table.Th>Confidence</Table.Th>
                  <Table.Th>Method</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Reviewed</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {classifications.map((classification) => (
                  <Table.Tr key={classification.id}>
                    <Table.Td>
                      <div>
                        <Text fw={500}>{classification.product.title}</Text>
                        <Text c="dimmed" size="xs">
                          {classification.product.brand}
                        </Text>
                      </div>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">
                        {classification.classification.categoryPath.join(' > ')}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={getConfidenceColor(classification.classification.confidence)}
                        variant="filled"
                      >
                        {(classification.classification.confidence * 100).toFixed(1)}%
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        leftSection={getMethodIcon(classification.classification.method)}
                        variant="light"
                      >
                        {classification.classification.method}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={getStatusColor(classification.status)} variant="filled">
                        {classification.status}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      {classification.reviewedBy ? (
                        <div>
                          <Text size="xs">{classification.reviewedBy}</Text>
                          <Text c="dimmed" size="xs">
                            {new Date(classification.reviewedAt!).toLocaleDateString()}
                          </Text>
                        </div>
                      ) : (
                        <Text c="dimmed" size="xs">
                          Not reviewed
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Tooltip label="View Details">
                          <ActionIcon
                            onClick={() => {
                              setSelectedClassification(classification);
                              openDetails();
                            }}
                            variant="light"
                          >
                            <IconEye size={16} />
                          </ActionIcon>
                        </Tooltip>
                        {classification.status === 'pending' && (
                          <Tooltip label="Re-run Classification">
                            <ActionIcon
                              color="blue"
                              loading={isRerunning === classification.id}
                              onClick={() => handleRerun(classification)}
                              variant="light"
                            >
                              <IconRefresh size={16} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Stack>
        </Tabs.Panel>
      </Tabs>

      {/* Rejection Feedback Modal */}
      <Modal
        onClose={() => {
          closeFeedback();
          feedbackForm.reset();
        }}
        opened={feedbackModal}
        size="lg"
        title="Reject Classification"
      >
        <form onSubmit={feedbackForm.onSubmit(handleReject)}>
          <Stack>
            <Alert color="orange" icon={<IconAlertCircle />}>
              Please provide feedback to help improve the classification model
            </Alert>

            {selectedClassification && (
              <div>
                <Text fw={500}>{selectedClassification.product.title}</Text>
                <Text c="dimmed" size="sm">
                  Current: {selectedClassification.classification.categoryPath.join(' > ')}
                </Text>
              </div>
            )}

            <Textarea
              minRows={3}
              placeholder="e.g., This product is athletic footwear, not general clothing..."
              label="Why is this classification incorrect?"
              required
              {...feedbackForm.getInputProps('feedback')}
            />

            <TextInput
              placeholder="e.g., Sports & Outdoors > Athletic Gear > Running Shoes"
              label="Suggested correct category (optional)"
              {...feedbackForm.getInputProps('suggestedCategory')}
            />

            <Group justify="flex-end">
              <Button
                onClick={() => {
                  closeFeedback();
                  feedbackForm.reset();
                }}
                variant="light"
              >
                Cancel
              </Button>
              <Button color="red" type="submit">
                Reject with Feedback
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Details Modal */}
      <Modal onClose={closeDetails} opened={detailsModal} size="xl" title="Classification Details">
        {selectedClassification && (
          <Stack>
            <Grid>
              <Grid.Col span={8}>
                <Stack gap="md">
                  <div>
                    <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                      Product Information
                    </Text>
                    <Title order={3} mt="xs">
                      {selectedClassification.product.title}
                    </Title>
                    <Text mt="xs">{selectedClassification.product.description}</Text>
                    <Group mt="xs">
                      {selectedClassification.product.brand && (
                        <Badge variant="outline">{selectedClassification.product.brand}</Badge>
                      )}
                      {selectedClassification.product.price && (
                        <Badge color="blue" variant="filled">
                          ${selectedClassification.product.price}
                        </Badge>
                      )}
                    </Group>
                  </div>

                  <Divider />

                  <div>
                    <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                      Classification Result
                    </Text>
                    <Code block mt="xs">
                      {selectedClassification.classification.categoryPath.join(' > ')}
                    </Code>
                    <Group mt="xs">
                      <Badge
                        color={getConfidenceColor(selectedClassification.classification.confidence)}
                        variant="filled"
                      >
                        {(selectedClassification.classification.confidence * 100).toFixed(1)}%
                        confidence
                      </Badge>
                      <Badge
                        leftSection={getMethodIcon(selectedClassification.classification.method)}
                        variant="light"
                      >
                        {selectedClassification.classification.method}
                      </Badge>
                      <Badge color={getStatusColor(selectedClassification.status)} variant="filled">
                        {selectedClassification.status}
                      </Badge>
                    </Group>
                  </div>

                  <div>
                    <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                      AI Reasoning
                    </Text>
                    <Paper withBorder mt="xs" p="sm">
                      <Text size="sm">{selectedClassification.classification.reasoning}</Text>
                    </Paper>
                  </div>

                  {selectedClassification.feedback && (
                    <div>
                      <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                        Review Feedback
                      </Text>
                      <Alert color="red" mt="xs">
                        {selectedClassification.feedback}
                      </Alert>
                    </div>
                  )}

                  <div>
                    <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                      Metadata
                    </Text>
                    <Stack gap="xs" mt="xs">
                      <Text size="sm">
                        <strong>Classification ID:</strong> {selectedClassification.id}
                      </Text>
                      <Text size="sm">
                        <strong>Product ID:</strong> {selectedClassification.productId}
                      </Text>
                      <Text size="sm">
                        <strong>Classified at:</strong>{' '}
                        {new Date(selectedClassification.timestamp).toLocaleString()}
                      </Text>
                      {selectedClassification.reviewedBy && (
                        <>
                          <Text size="sm">
                            <strong>Reviewed by:</strong> {selectedClassification.reviewedBy}
                          </Text>
                          <Text size="sm">
                            <strong>Reviewed at:</strong>{' '}
                            {new Date(selectedClassification.reviewedAt!).toLocaleString()}
                          </Text>
                        </>
                      )}
                    </Stack>
                  </div>
                </Stack>
              </Grid.Col>
              <Grid.Col span={4}>
                {selectedClassification.product.image && (
                  <Image
                    width={300}
                    style={{
                      width: '100%',
                      borderRadius: 8,
                      height: 'auto',
                    }}
                    alt={selectedClassification.product.title}
                    height={300}
                    src={selectedClassification.product.image}
                  />
                )}
              </Grid.Col>
            </Grid>
          </Stack>
        )}
      </Modal>
    </>
  );
}
