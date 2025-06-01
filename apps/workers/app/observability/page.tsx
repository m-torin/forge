'use client';

import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Group,
  JsonInput,
  LoadingOverlay,
  Paper,
  Progress,
  Stack,
  Table,
  Tabs,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useInterval } from '@mantine/hooks';
import {
  IconActivity,
  IconAlertTriangle,
  IconChartBar,
  IconCheck,
  IconDatabase,
  IconExclamationMark,
  IconSearch,
  IconServer,
  IconX,
} from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';

interface SystemHealth {
  metrics: Record<string, any>;
  services: Record<string, any>;
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
}

interface SystemMetrics {
  system: {
    timestamp: string;
    environment: any;
    nodeVersion: string;
    platform: string;
    uptime: number;
    memoryUsage: {
      rss: number;
      heapUsed: number;
      heapTotal: number;
      external: number;
    };
  };
  workflows: {
    total: number;
    active: number;
    completed: number;
    failed: number;
    canceled: number;
    successRate: string;
  };
}

interface ErrorAnalysis {
  classification: Record<
    string,
    {
      count: number;
      percentage: number;
      retryable: boolean;
      examples: string[];
    }
  >;
  recommendations: string[];
  timestamp: string;
}

export default function ObservabilityPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [errorAnalysis, setErrorAnalysis] = useState<ErrorAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [errorToAnalyze, setErrorToAnalyze] = useState('');
  const [analyzedError, setAnalyzedError] = useState<any>(null);

  // Auto-refresh interval
  const interval = useInterval(() => {
    if (autoRefresh) {
      fetchAllData();
    }
  }, 5000);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([fetchHealth(), fetchMetrics(), fetchErrorAnalysis()]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHealth = async () => {
    try {
      const response = await fetch('/api/observability?action=health');
      const data = await response.json();
      setHealth(data);
    } catch (error) {
      console.error('Failed to fetch health:', error);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/observability?action=metrics&count=100');
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  const fetchErrorAnalysis = async () => {
    try {
      const response = await fetch('/api/observability?action=errors');
      const data = await response.json();
      setErrorAnalysis(data);
    } catch (error) {
      console.error('Failed to fetch error analysis:', error);
    }
  };

  useEffect(() => {
    fetchAllData();
    interval.start();
    return interval.stop;
  }, [fetchAllData, interval]);

  const analyzeError = async () => {
    if (!errorToAnalyze.trim()) return;

    try {
      const response = await fetch('/api/observability', {
        body: JSON.stringify({
          action: 'analyze-error',
          error: errorToAnalyze,
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const data = await response.json();
      setAnalyzedError(data);
    } catch (error) {
      console.error('Failed to analyze error:', error);
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <IconCheck color="green" size={20} />;
      case 'degraded':
        return <IconAlertTriangle color="orange" size={20} />;
      case 'unhealthy':
        return <IconX color="red" size={20} />;
      default:
        return <IconExclamationMark color="gray" size={20} />;
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'green';
      case 'degraded':
        return 'orange';
      case 'unhealthy':
        return 'red';
      default:
        return 'gray';
    }
  };

  const formatBytes = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Container py="xl" size="xl">
      <LoadingOverlay visible={loading} />

      <Stack gap="xl">
        <Group justify="space-between">
          <div>
            <Title order={1}>System Observability</Title>
            <Text c="dimmed" size="lg">
              Comprehensive monitoring, metrics, and error analysis
            </Text>
          </div>
          <Group>
            <Button
              leftSection={<IconActivity size={16} />}
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant={autoRefresh ? 'filled' : 'outline'}
            >
              Auto Refresh: {autoRefresh ? 'ON' : 'OFF'}
            </Button>
            <Button leftSection={<IconDatabase size={16} />} onClick={fetchAllData}>
              Refresh Now
            </Button>
          </Group>
        </Group>

        {/* System Health Overview */}
        {health && (
          <Paper withBorder p="md">
            <Group justify="space-between" mb="md">
              <Title order={3}>System Health</Title>
              <Badge
                color={getHealthColor(health.status)}
                leftSection={getHealthIcon(health.status)}
                variant="light"
              >
                {health.status.toUpperCase()}
              </Badge>
            </Group>

            <Grid>
              {Object.entries(health.services).map(([service, data]) => (
                <Grid.Col key={service} span={{ base: 12, lg: 4, md: 6 }}>
                  <Card shadow="sm" withBorder>
                    <Group justify="space-between" mb="xs">
                      <Text fw={500} tt="capitalize">
                        {service}
                      </Text>
                      <Badge color={getHealthColor(data.status)} size="sm" variant="dot">
                        {data.status}
                      </Badge>
                    </Group>
                    {data.activeCount !== undefined && (
                      <Text c="dimmed" size="sm">
                        Active: {data.activeCount}
                      </Text>
                    )}
                    {data.error && (
                      <Alert color="red" mt="xs" p="xs">
                        <Text size="xs">{data.error}</Text>
                      </Alert>
                    )}
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          </Paper>
        )}

        <Tabs defaultValue="metrics">
          <Tabs.List>
            <Tabs.Tab leftSection={<IconChartBar size={16} />} value="metrics">
              System Metrics
            </Tabs.Tab>
            <Tabs.Tab leftSection={<IconExclamationMark size={16} />} value="errors">
              Error Analysis
            </Tabs.Tab>
            <Tabs.Tab leftSection={<IconSearch size={16} />} value="analyzer">
              Error Analyzer
            </Tabs.Tab>
            <Tabs.Tab leftSection={<IconServer size={16} />} value="environment">
              Environment
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel pt="md" value="metrics">
            {metrics && (
              <Grid>
                {/* Workflow Metrics */}
                <Grid.Col span={{ base: 12, lg: 6 }}>
                  <Card shadow="sm" withBorder h="100%">
                    <Title order={4} mb="md">
                      <Group>
                        <IconActivity size={20} />
                        Workflow Metrics
                      </Group>
                    </Title>
                    <Stack gap="sm">
                      <Group justify="space-between">
                        <Text>Total Workflows</Text>
                        <Badge variant="light">{metrics.workflows.total}</Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text>Active</Text>
                        <Badge color="blue">{metrics.workflows.active}</Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text>Completed</Text>
                        <Badge color="green">{metrics.workflows.completed}</Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text>Failed</Text>
                        <Badge color="red">{metrics.workflows.failed}</Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text>Success Rate</Text>
                        <Badge color="teal">{metrics.workflows.successRate}%</Badge>
                      </Group>
                    </Stack>
                  </Card>
                </Grid.Col>

                {/* System Metrics */}
                <Grid.Col span={{ base: 12, lg: 6 }}>
                  <Card shadow="sm" withBorder h="100%">
                    <Title order={4} mb="md">
                      <Group>
                        <IconServer size={20} />
                        System Resources
                      </Group>
                    </Title>
                    <Stack gap="sm">
                      <div>
                        <Group justify="space-between" mb="xs">
                          <Text size="sm">Memory Usage</Text>
                          <Text c="dimmed" size="sm">
                            {formatBytes(metrics.system.memoryUsage.heapUsed)} /{' '}
                            {formatBytes(metrics.system.memoryUsage.heapTotal)}
                          </Text>
                        </Group>
                        <Progress
                          color="blue"
                          size="sm"
                          value={
                            (metrics.system.memoryUsage.heapUsed /
                              metrics.system.memoryUsage.heapTotal) *
                            100
                          }
                        />
                      </div>
                      <Group justify="space-between">
                        <Text>Uptime</Text>
                        <Badge variant="light">{formatUptime(metrics.system.uptime)}</Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text>Node Version</Text>
                        <Badge variant="outline">{metrics.system.nodeVersion}</Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text>Platform</Text>
                        <Badge variant="outline">{metrics.system.platform}</Badge>
                      </Group>
                    </Stack>
                  </Card>
                </Grid.Col>
              </Grid>
            )}
          </Tabs.Panel>

          <Tabs.Panel pt="md" value="errors">
            {errorAnalysis && (
              <Stack gap="md">
                <Card shadow="sm" withBorder>
                  <Title order={4} mb="md">
                    Error Classification
                  </Title>
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Error Type</Table.Th>
                        <Table.Th>Count</Table.Th>
                        <Table.Th>Retryable</Table.Th>
                        <Table.Th>Examples</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {Object.entries(errorAnalysis.classification).map(([type, data]) => (
                        <Table.Tr key={type}>
                          <Table.Td>
                            <Badge size="sm" variant="outline">
                              {type.replace('_', ' ')}
                            </Badge>
                          </Table.Td>
                          <Table.Td>{data.count}</Table.Td>
                          <Table.Td>
                            <Badge color={data.retryable ? 'green' : 'red'} size="xs">
                              {data.retryable ? 'Yes' : 'No'}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text c="dimmed" size="xs">
                              {data.examples.slice(0, 2).join(', ')}
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Card>

                <Card shadow="sm" withBorder>
                  <Title order={4} mb="md">
                    Recommendations
                  </Title>
                  <Stack gap="xs">
                    {errorAnalysis.recommendations.map((rec) => (
                      <Alert key={rec} color="blue" p="xs" variant="light">
                        <Text size="sm">{rec}</Text>
                      </Alert>
                    ))}
                  </Stack>
                </Card>
              </Stack>
            )}
          </Tabs.Panel>

          <Tabs.Panel pt="md" value="analyzer">
            <Stack gap="md">
              <Card shadow="sm" withBorder>
                <Title order={4} mb="md">
                  Error Analyzer
                </Title>
                <Text c="dimmed" mb="md">
                  Paste an error message to get intelligent classification and recommendations
                </Text>

                <Stack gap="md">
                  <TextInput
                    onChange={(e) => setErrorToAnalyze(e.currentTarget.value)}
                    placeholder="Enter error message or exception..."
                    rightSection={
                      <Button onClick={analyzeError} disabled={!errorToAnalyze.trim()} size="xs">
                        Analyze
                      </Button>
                    }
                    value={errorToAnalyze}
                  />

                  {analyzedError && (
                    <Card withBorder p="md">
                      <Stack gap="sm">
                        <Group justify="space-between">
                          <Text fw={500}>Error Classification</Text>
                          <Badge color="blue">{analyzedError.classification.type}</Badge>
                        </Group>

                        <Group justify="space-between">
                          <Text>Category</Text>
                          <Badge variant="outline">{analyzedError.classification.category}</Badge>
                        </Group>

                        <Group justify="space-between">
                          <Text>Retryable</Text>
                          <Badge color={analyzedError.classification.retryable ? 'green' : 'red'}>
                            {analyzedError.classification.retryable ? 'Yes' : 'No'}
                          </Badge>
                        </Group>

                        <div>
                          <Text fw={500} mb="xs">
                            Recommendations
                          </Text>
                          <Stack gap="xs">
                            {analyzedError.recommendations.map((rec: string) => (
                              <Alert key={rec} color="blue" p="xs" variant="light">
                                <Text size="sm">{rec}</Text>
                              </Alert>
                            ))}
                          </Stack>
                        </div>
                      </Stack>
                    </Card>
                  )}
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel pt="md" value="environment">
            {metrics && (
              <Card shadow="sm" withBorder>
                <Title order={4} mb="md">
                  Environment Information
                </Title>
                <JsonInput
                  autosize
                  maxRows={20}
                  minRows={10}
                  readOnly
                  value={JSON.stringify(metrics.system.environment, null, 2)}
                />
              </Card>
            )}
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
