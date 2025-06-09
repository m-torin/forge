'use client';

import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Modal,
  Paper,
  Progress,
  ScrollArea,
  Stack,
  Tabs,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconAlertTriangle,
  IconChartBar,
  IconCheck,
  IconClock,
  IconEye,
  IconHistory,
  IconRefresh,
  IconSend,
  IconSettings,
  IconShieldCheck,
} from '@tabler/icons-react';
import { useState } from 'react';

import { ApprovalWorkflow } from './ApprovalWorkflow';
import { DataQualityValidator } from './DataQualityValidator';

import type { ModelConfig } from '../lib/model-config';

interface ValidationResult {
  errors: any[];
  isValid: boolean;
  recordId: string;
  score: number;
  warnings: any[];
}

interface WorkflowStatus {
  currentStep: number;
  hasActiveWorkflow: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  totalSteps: number;
}

interface DataValidationAndWorkflowProps {
  mode?: 'single' | 'bulk';
  modelConfig: ModelConfig;
  modelName: string;
  onValidationPass?: (validatedRecords: any[]) => void;
  onWorkflowComplete?: (approved: boolean) => void;
  operationType?: 'create' | 'update' | 'delete' | 'publish';
  records: any[];
  selectedRecords?: any[];
  showValidation?: boolean;
  showWorkflow?: boolean;
}

export function DataValidationAndWorkflow({
  onValidationPass,
  showValidation = true,
  mode = 'bulk',
  modelConfig,
  modelName,
  onWorkflowComplete,
  operationType = 'update',
  records,
  selectedRecords = [],
  showWorkflow = true,
}: DataValidationAndWorkflowProps) {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [activeTab, setActiveTab] = useState('validation');

  // Modal states
  const [previewOpened, { close: closePreview, open: openPreview }] = useDisclosure(false);
  const [workflowOpened, { close: closeWorkflow, open: openWorkflow }] = useDisclosure(false);

  // Get records to process
  const recordsToProcess =
    mode === 'single'
      ? records.slice(0, 1)
      : selectedRecords.length > 0
        ? selectedRecords
        : records;

  // Validation completion handler
  const handleValidationComplete = (results: ValidationResult[]) => {
    setValidationResults(results);

    // Check if validation passed
    const validRecords = results.filter((r) => r.isValid);
    const hasErrors = results.some((r) => r.errors.length > 0);

    if (!hasErrors) {
      notifications.show({
        color: 'green',
        message: `All ${results.length} records passed validation`,
        title: 'Validation Passed',
      });

      // If validation passes and workflow is not required, auto-proceed
      if (!requiresWorkflow()) {
        onValidationPass?.(recordsToProcess);
      }
    } else {
      notifications.show({
        color: 'orange',
        message: `${results.filter((r) => !r.isValid).length} records have validation issues`,
        title: 'Validation Issues Found',
      });
    }
  };

  // Check if workflow is required
  const requiresWorkflow = (): boolean => {
    if (!showWorkflow) return false;

    // Workflow required for:
    // - Delete operations
    // - High-value updates
    // - Sensitive model changes
    // - Bulk operations on critical data

    const sensitiveModels = ['user', 'organization', 'apiKey', 'payment'];
    const isSensitiveModel = sensitiveModels.includes(modelName.toLowerCase());
    const isBulkOperation = recordsToProcess.length > 10;
    const isDeleteOperation = operationType === 'delete';
    const isHighValueUpdate = recordsToProcess.some(
      (record) => record.value && Number(record.value) > 1000,
    );

    return isDeleteOperation || isSensitiveModel || isBulkOperation || isHighValueUpdate;
  };

  // Workflow completion handler
  const handleWorkflowComplete = (approved: boolean) => {
    if (approved) {
      notifications.show({
        color: 'green',
        message: 'Operation has been approved and will proceed',
        title: 'Workflow Approved',
      });
      onValidationPass?.(recordsToProcess);
    } else {
      notifications.show({
        color: 'red',
        message: 'Operation has been rejected',
        title: 'Workflow Rejected',
      });
    }

    onWorkflowComplete?.(approved);
  };

  // Get validation summary
  const getValidationSummary = () => {
    if (validationResults.length === 0) {
      return { valid: 0, avgScore: 0, errors: 0, total: 0, warnings: 0 };
    }

    const total = validationResults.length;
    const valid = validationResults.filter((r) => r.isValid).length;
    const errors = validationResults.filter((r) => r.errors.length > 0).length;
    const warnings = validationResults.filter((r) => r.warnings.length > 0).length;
    const avgScore = Math.round(validationResults.reduce((sum, r) => sum + r.score, 0) / total);

    return { valid, avgScore, errors, total, warnings };
  };

  // Proceed with operation
  const proceedWithOperation = () => {
    const summary = getValidationSummary();

    if (summary.errors > 0) {
      notifications.show({
        color: 'red',
        message: 'Please fix all validation errors before proceeding',
        title: 'Cannot Proceed',
      });
      return;
    }

    if (requiresWorkflow()) {
      setActiveTab('workflow');
      openWorkflow();
    } else {
      onValidationPass?.(recordsToProcess);
    }
  };

  const summary = getValidationSummary();
  const canProceed = summary.errors === 0 && summary.total > 0;
  const needsWorkflow = requiresWorkflow();

  return (
    <Card withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="xs">
            <ThemeIcon color="blue" size="sm" variant="light">
              <IconShieldCheck size={16} />
            </ThemeIcon>
            <Text fw={600}>Data Validation & Workflow</Text>
            <Badge size="sm" variant="light">
              {recordsToProcess.length} records
            </Badge>
          </Group>

          <Group gap="xs">
            <ActionIcon onClick={openPreview} size="sm" title="Preview records" variant="subtle">
              <IconEye size={14} />
            </ActionIcon>

            <ActionIcon
              onClick={() => window.location.reload()}
              size="sm"
              title="Refresh"
              variant="subtle"
            >
              <IconRefresh size={14} />
            </ActionIcon>
          </Group>
        </Group>

        {/* Operation Summary */}
        <Paper withBorder p="sm">
          <Group justify="space-between">
            <Stack gap="xs">
              <Text fw={500} size="sm">
                Operation Summary
              </Text>
              <Group gap="md">
                <Text size="sm">
                  <Text component="span" fw={500}>
                    Type:
                  </Text>{' '}
                  {operationType}
                </Text>
                <Text size="sm">
                  <Text component="span" fw={500}>
                    Model:
                  </Text>{' '}
                  {modelName}
                </Text>
                <Text size="sm">
                  <Text component="span" fw={500}>
                    Records:
                  </Text>{' '}
                  {recordsToProcess.length}
                </Text>
              </Group>
            </Stack>

            {needsWorkflow && (
              <Alert color="orange" icon={<IconClock size={12} />} size="xs">
                Approval required
              </Alert>
            )}
          </Group>
        </Paper>

        {/* Progress Indicators */}
        <Stack gap="sm">
          <Group gap="xl">
            {showValidation && (
              <Stack style={{ flex: 1 }} gap="xs">
                <Group justify="space-between">
                  <Text fw={500} size="sm">
                    Data Validation
                  </Text>
                  {summary.total > 0 && (
                    <Badge color={summary.errors === 0 ? 'green' : 'red'} size="xs" variant="light">
                      {summary.errors === 0 ? 'Passed' : `${summary.errors} errors`}
                    </Badge>
                  )}
                </Group>
                <Progress
                  color={summary.errors === 0 ? 'green' : 'red'}
                  value={summary.total > 0 ? (summary.valid / summary.total) * 100 : 0}
                />
              </Stack>
            )}

            {needsWorkflow && (
              <Stack style={{ flex: 1 }} gap="xs">
                <Group justify="space-between">
                  <Text fw={500} size="sm">
                    Approval Workflow
                  </Text>
                  <Badge color="orange" size="xs" variant="light">
                    Pending
                  </Badge>
                </Group>
                <Progress color="orange" value={0} />
              </Stack>
            )}
          </Group>
        </Stack>

        {/* Main Content Tabs */}
        <Tabs onChange={setActiveTab} value={activeTab}>
          <Tabs.List>
            {showValidation && (
              <Tabs.Tab leftSection={<IconChartBar size={16} />} value="validation">
                Validation ({summary.total})
              </Tabs.Tab>
            )}

            {needsWorkflow && (
              <Tabs.Tab leftSection={<IconHistory size={16} />} value="workflow">
                Workflow
              </Tabs.Tab>
            )}

            <Tabs.Tab leftSection={<IconSettings size={16} />} value="settings">
              Settings
            </Tabs.Tab>
          </Tabs.List>

          {showValidation && (
            <Tabs.Panel pt="md" value="validation">
              <DataQualityValidator
                onValidationComplete={handleValidationComplete}
                modelConfig={modelConfig}
                modelName={modelName}
                records={recordsToProcess}
                showDetails={true}
              />
            </Tabs.Panel>
          )}

          {needsWorkflow && (
            <Tabs.Panel pt="md" value="workflow">
              <ApprovalWorkflow
                modelName={modelName}
                onWorkflowCancel={() => {
                  closeWorkflow();
                  setActiveTab('validation');
                }}
                onWorkflowComplete={handleWorkflowComplete}
                record={
                  mode === 'single'
                    ? recordsToProcess[0]
                    : {
                        count: recordsToProcess.length,
                        operation: operationType,
                        records: recordsToProcess,
                      }
                }
                recordId={mode === 'single' ? recordsToProcess[0]?.id : 'bulk-operation'}
                workflowType={operationType}
              />
            </Tabs.Panel>
          )}

          <Tabs.Panel pt="md" value="settings">
            <Stack gap="md">
              <Text fw={500} size="sm">
                Validation & Workflow Settings
              </Text>

              <Paper withBorder p="sm">
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text size="sm">Enable data validation</Text>
                    <Badge color={showValidation ? 'green' : 'gray'} variant="light">
                      {showValidation ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </Group>

                  <Group justify="space-between">
                    <Text size="sm">Require approval workflow</Text>
                    <Badge color={needsWorkflow ? 'orange' : 'gray'} variant="light">
                      {needsWorkflow ? 'Required' : 'Not Required'}
                    </Badge>
                  </Group>

                  <Group justify="space-between">
                    <Text size="sm">Operation type</Text>
                    <Badge variant="light">{operationType}</Badge>
                  </Group>
                </Stack>
              </Paper>

              <Alert color="blue" icon={<IconAlertTriangle size={16} />}>
                <Text fw={500} mb="xs" size="sm">
                  Workflow Triggers
                </Text>
                <Text size="xs">Approval workflow is automatically triggered for:</Text>
                <ul style={{ fontSize: '12px', margin: '4px 0 0 16px' }}>
                  <li>Delete operations</li>
                  <li>Sensitive model changes (users, API keys, etc.)</li>
                  <li>Bulk operations (&gt; 10 records)</li>
                  <li>High-value updates (&gt; $1,000)</li>
                </ul>
              </Alert>
            </Stack>
          </Tabs.Panel>
        </Tabs>

        {/* Action Buttons */}
        <Divider />
        <Group justify="space-between">
          <Group gap="sm">
            {summary.total > 0 && (
              <Text c="dimmed" size="sm">
                Quality Score: {summary.avgScore}% •{summary.valid} valid •{summary.errors} errors •
                {summary.warnings} warnings
              </Text>
            )}
          </Group>

          <Group gap="sm">
            <Button
              onClick={() => {
                setValidationResults([]);
                setWorkflowStatus(null);
              }}
              size="sm"
              variant="light"
            >
              Reset
            </Button>

            <Button
              leftSection={needsWorkflow ? <IconSend size={14} /> : <IconCheck size={14} />}
              loading={isValidating}
              onClick={proceedWithOperation}
              disabled={!canProceed}
              size="sm"
            >
              {needsWorkflow ? 'Submit for Approval' : 'Proceed with Operation'}
            </Button>
          </Group>
        </Group>
      </Stack>

      {/* Preview Modal */}
      <Modal
        onClose={closePreview}
        opened={previewOpened}
        scrollAreaComponent={ScrollArea.Autosize}
        size="lg"
        title="Records Preview"
      >
        <Stack gap="md">
          <Text c="dimmed" size="sm">
            {recordsToProcess.length} records will be processed
          </Text>

          <ScrollArea h={400}>
            <Stack gap="xs">
              {recordsToProcess.slice(0, 20).map((record, index) => (
                <Paper key={record.id || index} withBorder p="sm">
                  <Group justify="space-between">
                    <Text fw={500} size="sm">
                      {record.name || record.title || record.email || `Record ${index + 1}`}
                    </Text>
                    <Badge size="xs" variant="light">
                      {record.id || 'No ID'}
                    </Badge>
                  </Group>
                  {record.description && (
                    <Text c="dimmed" mt="xs" size="xs">
                      {record.description}
                    </Text>
                  )}
                </Paper>
              ))}

              {recordsToProcess.length > 20 && (
                <Text c="dimmed" size="sm" ta="center">
                  ... and {recordsToProcess.length - 20} more records
                </Text>
              )}
            </Stack>
          </ScrollArea>
        </Stack>
      </Modal>
    </Card>
  );
}
