'use client';

import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Modal,
  Progress,
  SimpleGrid,
  Stack,
  Table,
  Tabs,
  Text,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconAlertTriangle,
  IconCheck,
  IconFile,
  IconInfoCircle,
  IconPhoto,
  IconRefresh,
  IconSettings,
  IconTrendingUp,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { getAssetOptimizationRecommendations } from '../actions';

interface OptimizationRecommendation {
  action: string;
  assets: {
    id: string;
    filename: string;
    type: string;
    size?: number;
    product: {
      id: string;
      name: string;
      sku: string;
    };
  }[];
  count: number;
  description: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  type: string;
}

interface OptimizationStats {
  highPriority: number;
  lowPriority: number;
  mediumPriority: number;
  overallScore: number;
  totalIssues: number;
}

function RecommendationCard({
  onApplyFix,
  onViewDetails,
  recommendation,
}: {
  recommendation: OptimizationRecommendation;
  onViewDetails: (rec: OptimizationRecommendation) => void;
  onApplyFix: (rec: OptimizationRecommendation) => void;
}) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'red';
      case 'medium':
        return 'yellow';
      case 'low':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <IconAlertTriangle size={16} />;
      case 'medium':
        return <IconInfoCircle size={16} />;
      case 'low':
        return <IconTrendingUp size={16} />;
      default:
        return <IconInfoCircle size={16} />;
    }
  };

  return (
    <Card withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="sm">
            <Badge
              color={getPriorityColor(recommendation.priority)}
              leftSection={getPriorityIcon(recommendation.priority)}
              variant="light"
            >
              {recommendation.priority.toUpperCase()}
            </Badge>
            <Text fw={500}>{recommendation.title}</Text>
          </Group>
          <Badge color={getPriorityColor(recommendation.priority)} size="lg" variant="filled">
            {recommendation.count}
          </Badge>
        </Group>

        <Text c="dimmed" size="sm">
          {recommendation.description}
        </Text>

        <Text fw={500} size="sm">
          Recommended Action: {recommendation.action}
        </Text>

        <Group justify="flex-end">
          <Button onClick={() => onViewDetails(recommendation)} size="xs" variant="light">
            View Details
          </Button>
          <Button
            onClick={() => onApplyFix(recommendation)}
            disabled={recommendation.count === 0}
            size="xs"
          >
            Apply Fix
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}

function OptimizationDetailModal({
  onApplyFix,
  onClose,
  opened,
  recommendation,
}: {
  recommendation: OptimizationRecommendation | null;
  opened: boolean;
  onClose: () => void;
  onApplyFix: (rec: OptimizationRecommendation) => void;
}) {
  if (!recommendation) return null;

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Modal onClose={onClose} opened={opened} size="xl" title={recommendation.title}>
      <Stack gap="md">
        <Alert color="blue" icon={<IconInfoCircle size={16} />} title="Optimization Recommendation">
          {recommendation.description}
        </Alert>

        <div>
          <Text fw={500} mb="sm">
            Recommended Action
          </Text>
          <Text style={{ borderRadius: 4 }} bg="gray.0" p="sm" size="sm">
            {recommendation.action}
          </Text>
        </div>

        {recommendation.assets.length > 0 && (
          <div>
            <Text fw={500} mb="sm">
              Affected Assets ({recommendation.assets.length})
            </Text>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Asset</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Size</Table.Th>
                  <Table.Th>Product</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {recommendation.assets.slice(0, 10).map((asset) => (
                  <Table.Tr key={asset.id}>
                    <Table.Td>
                      <Group gap="xs">
                        {asset.type === 'IMAGE' ? <IconPhoto size={16} /> : <IconFile size={16} />}
                        <Text fw={500} size="sm">
                          {asset.filename}
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge size="sm" variant="light">
                        {asset.type}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{formatFileSize(asset.size)}</Table.Td>
                    <Table.Td>
                      <Text size="sm">{asset.product.name}</Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
            {recommendation.assets.length > 10 && (
              <Text c="dimmed" mt="sm" size="sm" ta="center">
                ... and {recommendation.assets.length - 10} more assets
              </Text>
            )}
          </div>
        )}

        <Group justify="flex-end" mt="md">
          <Button onClick={onClose} variant="light">
            Close
          </Button>
          <Button onClick={() => onApplyFix(recommendation)}>Apply Optimization</Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export function ProductAssetOptimization() {
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [stats, setStats] = useState<OptimizationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<OptimizationRecommendation | null>(null);
  const [detailOpened, { close: closeDetail, open: openDetail }] = useDisclosure();
  const [activeTab, setActiveTab] = useState<string | null>('recommendations');

  useEffect(() => {
    loadOptimizationData();
  }, []);

  const loadOptimizationData = async () => {
    setLoading(true);
    try {
      const result = await getAssetOptimizationRecommendations();
      if (result.success && result.data) {
        // Transform the data to match OptimizationRecommendation interface
        const transformedData = result.data.map((rec: any) => ({
          ...rec,
          assets: rec.assets.map((asset: any) => ({
            id: asset.id,
            filename: asset.filename,
            type: asset.type,
            size: asset.size ?? undefined, // Convert null to undefined
            product: asset.product,
          })),
        }));
        setRecommendations(transformedData);

        // Calculate stats
        const totalIssues = result.data.reduce((sum, rec) => sum + rec.count, 0);
        const highPriority = result.data
          .filter((rec) => rec.priority === 'high')
          .reduce((sum, rec) => sum + rec.count, 0);
        const mediumPriority = result.data
          .filter((rec) => rec.priority === 'medium')
          .reduce((sum, rec) => sum + rec.count, 0);
        const lowPriority = result.data
          .filter((rec) => rec.priority === 'low')
          .reduce((sum, rec) => sum + rec.count, 0);

        // Calculate overall score (100 - weighted issues percentage)
        const maxScore = 100;
        const highWeight = 3;
        const mediumWeight = 2;
        const lowWeight = 1;
        const weightedIssues =
          highPriority * highWeight + mediumPriority * mediumWeight + lowPriority * lowWeight;
        const maxPossibleIssues = 50; // Estimate based on typical asset collections
        const overallScore = Math.max(
          0,
          maxScore - Math.round((weightedIssues / maxPossibleIssues) * maxScore),
        );

        setStats({
          highPriority,
          lowPriority,
          mediumPriority,
          overallScore,
          totalIssues,
        });
      }
    } catch (error) {
      notifications.show({
        color: 'red',
        message: 'Failed to load optimization recommendations',
        title: 'Error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (recommendation: OptimizationRecommendation) => {
    setSelectedRecommendation(recommendation);
    openDetail();
  };

  const handleApplyFix = async (recommendation: OptimizationRecommendation) => {
    // In a real implementation, this would:
    // 1. Apply the specific optimization based on the recommendation type
    // 2. For file-size: Compress images
    // 3. For missing-alt: Open bulk edit modal for alt text
    // 4. For missing-description: Open bulk edit modal for descriptions
    // 5. For duplicate-names: Suggest and apply name changes

    notifications.show({
      color: 'blue',
      message: `Applying ${recommendation.title} optimization to ${recommendation.count} assets...`,
      title: 'Optimization Started',
    });

    // Simulate optimization process
    setTimeout(() => {
      notifications.show({
        color: 'green',
        message: `Successfully optimized ${recommendation.count} assets`,
        title: 'Optimization Complete',
      });

      // Remove the recommendation or reduce its count
      setRecommendations((prev) =>
        prev
          .map((rec) => (rec.type === recommendation.type ? { ...rec, assets: [], count: 0 } : rec))
          .filter((rec) => rec.count > 0),
      );

      // Update stats
      if (stats) {
        const newStats = { ...stats };
        newStats.totalIssues -= recommendation.count;
        if (recommendation.priority === 'high') {
          newStats.highPriority -= recommendation.count;
        } else if (recommendation.priority === 'medium') {
          newStats.mediumPriority -= recommendation.count;
        } else {
          newStats.lowPriority -= recommendation.count;
        }

        // Recalculate overall score
        const highWeight = 3;
        const mediumWeight = 2;
        const lowWeight = 1;
        const weightedIssues =
          newStats.highPriority * highWeight +
          newStats.mediumPriority * mediumWeight +
          newStats.lowPriority * lowWeight;
        const maxPossibleIssues = 50;
        newStats.overallScore = Math.max(
          0,
          100 - Math.round((weightedIssues / maxPossibleIssues) * 100),
        );

        setStats(newStats);
      }
    }, 2000);
  };

  if (loading) {
    return (
      <Stack gap="lg">
        <Card withBorder>
          <div style={{ height: 100 }} />
        </Card>
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <Card withBorder>
            <div style={{ height: 150 }} />
          </Card>
          <Card withBorder>
            <div style={{ height: 150 }} />
          </Card>
        </SimpleGrid>
      </Stack>
    );
  }

  return (
    <>
      <Stack gap="lg">
        {/* Optimization Score */}
        {stats && (
          <Card withBorder>
            <Stack gap="md">
              <Group justify="space-between">
                <Title order={4}>Optimization Score</Title>
                <ActionIcon onClick={loadOptimizationData} variant="light">
                  <IconRefresh size={16} />
                </ActionIcon>
              </Group>

              <Group align="center">
                <div style={{ flex: 1 }}>
                  <Progress
                    color={
                      stats.overallScore > 80 ? 'green' : stats.overallScore > 60 ? 'yellow' : 'red'
                    }
                    size="xl"
                    value={stats.overallScore}
                  />
                </div>
                <Text fw={700} size="xl">
                  {stats.overallScore}%
                </Text>
              </Group>

              <SimpleGrid cols={4}>
                <div>
                  <Text c="dimmed" fw={500} size="xs">
                    Total Issues
                  </Text>
                  <Text fw={600} size="lg">
                    {stats.totalIssues}
                  </Text>
                </div>
                <div>
                  <Text c="red" fw={500} size="xs">
                    High Priority
                  </Text>
                  <Text c="red" fw={600} size="lg">
                    {stats.highPriority}
                  </Text>
                </div>
                <div>
                  <Text c="yellow" fw={500} size="xs">
                    Medium Priority
                  </Text>
                  <Text c="yellow" fw={600} size="lg">
                    {stats.mediumPriority}
                  </Text>
                </div>
                <div>
                  <Text c="blue" fw={500} size="xs">
                    Low Priority
                  </Text>
                  <Text c="blue" fw={600} size="lg">
                    {stats.lowPriority}
                  </Text>
                </div>
              </SimpleGrid>
            </Stack>
          </Card>
        )}

        <Tabs onChange={setActiveTab} value={activeTab}>
          <Tabs.List>
            <Tabs.Tab leftSection={<IconSettings size={16} />} value="recommendations">
              Recommendations ({recommendations.length})
            </Tabs.Tab>
            <Tabs.Tab leftSection={<IconCheck size={16} />} value="automated">
              Automated Fixes
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel pt="lg" value="recommendations">
            {recommendations.length > 0 ? (
              <SimpleGrid cols={{ base: 1, md: 2 }}>
                {recommendations.map((recommendation) => (
                  <RecommendationCard
                    key={recommendation.type}
                    onApplyFix={handleApplyFix}
                    onViewDetails={handleViewDetails}
                    recommendation={recommendation}
                  />
                ))}
              </SimpleGrid>
            ) : (
              <Card withBorder>
                <Stack align="center" gap="md" py="xl">
                  <IconCheck color="green" size={48} />
                  <div style={{ textAlign: 'center' }}>
                    <Text c="green" fw={500}>
                      All assets are optimized!
                    </Text>
                    <Text c="dimmed" size="sm">
                      No optimization recommendations at this time.
                    </Text>
                  </div>
                </Stack>
              </Card>
            )}
          </Tabs.Panel>

          <Tabs.Panel pt="lg" value="automated">
            <Stack gap="md">
              <Alert
                color="blue"
                icon={<IconInfoCircle size={16} />}
                title="Automated Optimization"
              >
                Enable automated optimization to fix common issues automatically when assets are
                uploaded.
              </Alert>

              <SimpleGrid cols={{ base: 1, md: 2 }}>
                <Card withBorder>
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <Text fw={500}>Auto-compress Images</Text>
                      <Badge color="green">Enabled</Badge>
                    </Group>
                    <Text c="dimmed" size="sm">
                      Automatically compress images larger than 2MB while maintaining quality
                    </Text>
                  </Stack>
                </Card>

                <Card withBorder>
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <Text fw={500}>Format Conversion</Text>
                      <Badge color="yellow">Partial</Badge>
                    </Group>
                    <Text c="dimmed" size="sm">
                      Convert images to WebP format when supported by browsers
                    </Text>
                  </Stack>
                </Card>

                <Card withBorder>
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <Text fw={500}>Alt Text Validation</Text>
                      <Badge color="red">Disabled</Badge>
                    </Group>
                    <Text c="dimmed" size="sm">
                      Require alt text for all image uploads for better accessibility
                    </Text>
                  </Stack>
                </Card>

                <Card withBorder>
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <Text fw={500}>Filename Sanitization</Text>
                      <Badge color="green">Enabled</Badge>
                    </Group>
                    <Text c="dimmed" size="sm">
                      Automatically clean and standardize uploaded filenames
                    </Text>
                  </Stack>
                </Card>
              </SimpleGrid>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>

      <OptimizationDetailModal
        onApplyFix={handleApplyFix}
        onClose={closeDetail}
        opened={detailOpened}
        recommendation={selectedRecommendation}
      />
    </>
  );
}
