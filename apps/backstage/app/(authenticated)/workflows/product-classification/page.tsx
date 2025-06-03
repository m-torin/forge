'use client';

import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Code,
  Container,
  FileInput,
  Grid,
  Group,
  NumberInput,
  Paper,
  Progress,
  Select,
  Stack,
  Tabs,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
// Import missing components
import { Checkbox, Textarea, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconAlertCircle,
  IconBrain,
  IconCheck,
  IconDownload,
  IconFileImport,
  IconHistory,
  IconPlayerPlay,
  IconUpload,
} from '@tabler/icons-react';
import { useState } from 'react';

interface ClassificationJob {
  completedAt?: string;
  id: string;
  processedItems: number;
  progress: number;
  results?: {
    successful: number;
    failed: number;
    avgConfidence: number;
  };
  startedAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalItems: number;
  type: 'single' | 'batch';
}

interface TrainingFeedback {
  appliedAt?: string;
  confidence: number;
  correctedCategory: string;
  feedback: string;
  id: string;
  originalCategory: string;
  productId: string;
  status: 'pending' | 'applied' | 'rejected';
}

export default function ProductClassificationPage() {
  const [activeTab, setActiveTab] = useState<string | null>('single');
  const [jobs, setJobs] = useState<ClassificationJob[]>([
    {
      id: 'job-1',
      type: 'batch',
      completedAt: new Date(Date.now() - 1800000).toISOString(),
      processedItems: 1000,
      progress: 100,
      results: {
        avgConfidence: 0.87,
        failed: 50,
        successful: 950,
      },
      startedAt: new Date(Date.now() - 3600000).toISOString(),
      status: 'completed',
      totalItems: 1000,
    },
    {
      id: 'job-2',
      type: 'single',
      processedItems: 0,
      progress: 65,
      startedAt: new Date(Date.now() - 300000).toISOString(),
      status: 'processing',
      totalItems: 1,
    },
  ]);

  const [trainingQueue, setTrainingQueue] = useState<TrainingFeedback[]>([
    {
      confidence: 0.72,
      id: 'feedback-1',
      correctedCategory: 'Electronics > Computer Accessories',
      feedback: 'More specific category needed',
      originalCategory: 'Electronics > Accessories',
      productId: 'prod-123',
      status: 'pending',
    },
  ]);

  const [singleProductForm, setSingleProductForm] = useState({
    brand: '',
    classificationMethod: 'hybrid',
    description: '',
    price: 0,
    title: '',
  });

  const [batchImportForm, setBatchImportForm] = useState({
    batchSize: 100,
    classificationMethod: 'hybrid',
    file: null as File | null,
    format: 'csv',
    skipExisting: false,
  });

  const handleSingleClassification = async () => {
    const newJob: ClassificationJob = {
      id: `job-${Date.now()}`,
      type: 'single',
      processedItems: 0,
      progress: 0,
      startedAt: new Date().toISOString(),
      status: 'processing',
      totalItems: 1,
    };

    setJobs([newJob, ...jobs]);

    notifications.show({
      color: 'blue',
      message: 'Product is being classified...',
      title: 'Classification Started',
    });
  };

  const handleBatchImport = async () => {
    if (!batchImportForm.file) {
      notifications.show({
        color: 'red',
        message: 'Please select a file to import',
        title: 'Error',
      });
      return;
    }

    const newJob: ClassificationJob = {
      id: `job-${Date.now()}`,
      type: 'batch',
      processedItems: 0,
      progress: 0,
      startedAt: new Date().toISOString(),
      status: 'processing',
      totalItems: 1000, // Would be calculated from file
    };

    setJobs([newJob, ...jobs]);

    notifications.show({
      color: 'blue',
      message: `Processing ${batchImportForm.file.name}...`,
      title: 'Batch Import Started',
    });
  };

  const applyTrainingFeedback = async (feedbackId: string) => {
    setTrainingQueue(
      trainingQueue.map((f) =>
        f.id === feedbackId ? { ...f, appliedAt: new Date().toISOString(), status: 'applied' } : f,
      ),
    );

    notifications.show({
      color: 'green',
      icon: <IconCheck />,
      message: 'Feedback has been applied to the model',
      title: 'Training Applied',
    });
  };

  return (
    <Container py="xl" size="xl">
      <Stack gap="xl">
        <div>
          <Title order={1}>Product Classification</Title>
          <Text c="dimmed" mt="md" size="lg">
            AI-powered product categorization with continuous learning
          </Text>
        </div>

        {/* Quick Stats */}
        <Grid>
          <Grid.Col span={3}>
            <Paper withBorder p="md">
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                    Total Classified
                  </Text>
                  <Text fw={700} size="xl">
                    12,450
                  </Text>
                </div>
                <ThemeIcon color="blue" size="xl" variant="light">
                  <IconBrain size={28} />
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
                    89.3%
                  </Text>
                </div>
                <Progress style={{ width: 60 }} radius="xl" size="xl" value={89.3} />
              </Group>
            </Paper>
          </Grid.Col>
          <Grid.Col span={3}>
            <Paper withBorder p="md">
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                    Pending Training
                  </Text>
                  <Text c="orange" fw={700} size="xl">
                    {trainingQueue.filter((t) => t.status === 'pending').length}
                  </Text>
                </div>
                <ThemeIcon color="orange" size="xl" variant="light">
                  <IconAlertCircle size={28} />
                </ThemeIcon>
              </Group>
            </Paper>
          </Grid.Col>
          <Grid.Col span={3}>
            <Paper withBorder p="md">
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                    Active Jobs
                  </Text>
                  <Text c="green" fw={700} size="xl">
                    {jobs.filter((j) => j.status === 'processing').length}
                  </Text>
                </div>
                <ThemeIcon color="green" size="xl" variant="light">
                  <IconPlayerPlay size={28} />
                </ThemeIcon>
              </Group>
            </Paper>
          </Grid.Col>
        </Grid>

        <Tabs onChange={setActiveTab} value={activeTab}>
          <Tabs.List>
            <Tabs.Tab leftSection={<IconBrain size={16} />} value="single">
              Single Product
            </Tabs.Tab>
            <Tabs.Tab leftSection={<IconFileImport size={16} />} value="batch">
              Batch Import
            </Tabs.Tab>
            <Tabs.Tab leftSection={<IconHistory size={16} />} value="jobs">
              Jobs History
            </Tabs.Tab>
            <Tabs.Tab leftSection={<IconBrain size={16} />} value="training">
              Training Queue
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel pt="md" value="single">
            <Card shadow="sm" withBorder p="lg">
              <Stack gap="md">
                <Title order={3}>Classify Single Product</Title>

                <Grid>
                  <Grid.Col span={6}>
                    <TextInput
                      onChange={(e) =>
                        setSingleProductForm({ ...singleProductForm, title: e.target.value })
                      }
                      placeholder="e.g., Apple MacBook Pro 16-inch"
                      label="Product Title"
                      required
                      value={singleProductForm.title}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput
                      onChange={(e) =>
                        setSingleProductForm({ ...singleProductForm, brand: e.target.value })
                      }
                      placeholder="e.g., Apple"
                      label="Brand"
                      value={singleProductForm.brand}
                    />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <Textarea
                      minRows={3}
                      onChange={(e) =>
                        setSingleProductForm({ ...singleProductForm, description: e.target.value })
                      }
                      placeholder="Product description..."
                      label="Description"
                      required
                      value={singleProductForm.description}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <NumberInput
                      prefix="$"
                      onChange={(value) =>
                        setSingleProductForm({
                          ...singleProductForm,
                          price: typeof value === 'number' ? value : 0,
                        })
                      }
                      placeholder="0.00"
                      decimalScale={2}
                      fixedDecimalScale
                      label="Price"
                      value={singleProductForm.price}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Select
                      onChange={(value) =>
                        setSingleProductForm({
                          ...singleProductForm,
                          classificationMethod: value || 'hybrid',
                        })
                      }
                      data={[
                        { label: 'Hybrid (AI + Vector)', value: 'hybrid' },
                        { label: 'AI Only', value: 'ai-only' },
                        { label: 'Vector Only', value: 'vector-only' },
                      ]}
                      label="Classification Method"
                      value={singleProductForm.classificationMethod}
                    />
                  </Grid.Col>
                </Grid>

                <Button
                  fullWidth
                  leftSection={<IconPlayerPlay size={16} />}
                  onClick={handleSingleClassification}
                  size="md"
                >
                  Classify Product
                </Button>
              </Stack>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel pt="md" value="batch">
            <Card shadow="sm" withBorder p="lg">
              <Stack gap="md">
                <Title order={3}>Batch Import Products</Title>

                <FileInput
                  description="CSV format: title, description, brand, price, sku"
                  leftSection={<IconUpload size={16} />}
                  onChange={(file) => setBatchImportForm({ ...batchImportForm, file })}
                  placeholder="Select CSV or JSON file"
                  accept=".csv,.json"
                  label="Upload File"
                  value={batchImportForm.file}
                />

                <Grid>
                  <Grid.Col span={4}>
                    <Select
                      onChange={(value) =>
                        setBatchImportForm({ ...batchImportForm, format: value || 'csv' })
                      }
                      data={[
                        { label: 'CSV', value: 'csv' },
                        { label: 'JSON', value: 'json' },
                      ]}
                      label="File Format"
                      value={batchImportForm.format}
                    />
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <NumberInput
                      onChange={(value) =>
                        setBatchImportForm({
                          ...batchImportForm,
                          batchSize: typeof value === 'number' ? value : 100,
                        })
                      }
                      label="Batch Size"
                      max={1000}
                      min={10}
                      step={10}
                      value={batchImportForm.batchSize}
                    />
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <Select
                      onChange={(value) =>
                        setBatchImportForm({
                          ...batchImportForm,
                          classificationMethod: value || 'hybrid',
                        })
                      }
                      data={[
                        { label: 'Hybrid', value: 'hybrid' },
                        { label: 'AI Only', value: 'ai-only' },
                        { label: 'Vector Only', value: 'vector-only' },
                      ]}
                      label="Classification Method"
                      value={batchImportForm.classificationMethod}
                    />
                  </Grid.Col>
                </Grid>

                <Checkbox
                  onChange={(e) =>
                    setBatchImportForm({
                      ...batchImportForm,
                      skipExisting: e.currentTarget.checked,
                    })
                  }
                  checked={batchImportForm.skipExisting}
                  label="Skip already classified products"
                />

                <Button
                  fullWidth
                  leftSection={<IconFileImport size={16} />}
                  onClick={handleBatchImport}
                  disabled={!batchImportForm.file}
                  size="md"
                >
                  Start Batch Import
                </Button>
              </Stack>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel pt="md" value="jobs">
            <Stack gap="md">
              {jobs.map((job) => (
                <Card key={job.id} shadow="sm" withBorder p="md">
                  <Group justify="space-between" mb="md">
                    <Group>
                      <Badge
                        color={
                          job.status === 'completed'
                            ? 'green'
                            : job.status === 'failed'
                              ? 'red'
                              : job.status === 'processing'
                                ? 'blue'
                                : 'gray'
                        }
                      >
                        {job.status}
                      </Badge>
                      <Text fw={500}>
                        {job.type === 'batch' ? 'Batch Import' : 'Single Product'} - {job.id}
                      </Text>
                    </Group>
                    <Text c="dimmed" size="sm">
                      Started {new Date(job.startedAt).toLocaleString()}
                    </Text>
                  </Group>

                  {job.status === 'processing' && (
                    <div>
                      <Group justify="space-between" mb="xs">
                        <Text size="sm">
                          Processing: {job.processedItems} / {job.totalItems}
                        </Text>
                        <Text fw={500} size="sm">
                          {Math.round(job.progress)}%
                        </Text>
                      </Group>
                      <Progress animated size="sm" striped value={job.progress} />
                    </div>
                  )}

                  {job.results && (
                    <Group gap="xl" mt="md">
                      <div>
                        <Text c="dimmed" size="xs">
                          Successful
                        </Text>
                        <Text c="green" fw={500}>
                          {job.results.successful}
                        </Text>
                      </div>
                      <div>
                        <Text c="dimmed" size="xs">
                          Failed
                        </Text>
                        <Text c="red" fw={500}>
                          {job.results.failed}
                        </Text>
                      </div>
                      <div>
                        <Text c="dimmed" size="xs">
                          Avg Confidence
                        </Text>
                        <Text fw={500}>{(job.results.avgConfidence * 100).toFixed(1)}%</Text>
                      </div>
                      <ActionIcon size="lg" variant="light">
                        <IconDownload size={18} />
                      </ActionIcon>
                    </Group>
                  )}
                </Card>
              ))}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel pt="md" value="training">
            <Stack gap="md">
              <Alert color="blue" icon={<IconBrain />}>
                Training feedback helps improve classification accuracy. Review and apply
                corrections from users.
              </Alert>

              {trainingQueue.map((feedback) => (
                <Card key={feedback.id} shadow="sm" withBorder p="md">
                  <Group justify="space-between" mb="sm">
                    <Text fw={500}>Product {feedback.productId}</Text>
                    <Badge
                      color={
                        feedback.status === 'applied'
                          ? 'green'
                          : feedback.status === 'rejected'
                            ? 'red'
                            : 'yellow'
                      }
                    >
                      {feedback.status}
                    </Badge>
                  </Group>

                  <Grid>
                    <Grid.Col span={6}>
                      <Text c="dimmed" size="sm">
                        Original Category
                      </Text>
                      <Code block mt={4}>
                        {feedback.originalCategory}
                      </Code>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Text c="dimmed" size="sm">
                        Corrected Category
                      </Text>
                      <Code block color="green" mt={4}>
                        {feedback.correctedCategory}
                      </Code>
                    </Grid.Col>
                  </Grid>

                  <Text c="dimmed" mt="sm" size="sm">
                    Feedback: {feedback.feedback}
                  </Text>

                  <Group justify="space-between" mt="md">
                    <Text c="dimmed" size="xs">
                      Confidence: {(feedback.confidence * 100).toFixed(1)}%
                    </Text>
                    {feedback.status === 'pending' && (
                      <Group gap="xs">
                        <Button
                          color="red"
                          onClick={() => {
                            setTrainingQueue(
                              trainingQueue.map((f) =>
                                f.id === feedback.id ? { ...f, status: 'rejected' } : f,
                              ),
                            );
                          }}
                          size="xs"
                          variant="light"
                        >
                          Reject
                        </Button>
                        <Button
                          leftSection={<IconCheck size={14} />}
                          onClick={() => applyTrainingFeedback(feedback.id)}
                          size="xs"
                        >
                          Apply Training
                        </Button>
                      </Group>
                    )}
                  </Group>
                </Card>
              ))}
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
