'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Stack,
  Group,
  Text,
  Button,
  Tabs,
  Alert,
  Badge,
  Progress,
  ActionIcon,
  Modal,
  Textarea,
  Select,
  Divider,
  Box,
  Paper,
  ThemeIcon,
  ScrollArea,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconShieldCheck,
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconClock,
  IconEye,
  IconSend,
  IconRefresh,
  IconChartBar,
  IconHistory,
  IconBulk,
  IconSettings,
} from '@tabler/icons-react';
import { DataQualityValidator } from './DataQualityValidator';
import { ApprovalWorkflow } from './ApprovalWorkflow';
import type { ModelConfig } from '../lib/model-config';

interface ValidationResult {
  recordId: string;
  isValid: boolean;
  errors: any[];
  warnings: any[];
  score: number;
}

interface WorkflowStatus {
  hasActiveWorkflow: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  currentStep: number;
  totalSteps: number;
}

interface DataValidationAndWorkflowProps {
  modelName: string;
  modelConfig: ModelConfig;
  records: any[];
  selectedRecords?: any[];
  mode?: 'single' | 'bulk';
  operationType?: 'create' | 'update' | 'delete' | 'publish';
  onValidationPass?: (validatedRecords: any[]) => void;
  onWorkflowComplete?: (approved: boolean) => void;
  showWorkflow?: boolean;
  showValidation?: boolean;
}

export function DataValidationAndWorkflow({
  modelName,
  modelConfig,
  records,
  selectedRecords = [],
  mode = 'bulk',
  operationType = 'update',
  onValidationPass,
  onWorkflowComplete,
  showWorkflow = true,
  showValidation = true,
}: DataValidationAndWorkflowProps) {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [activeTab, setActiveTab] = useState('validation');
  
  // Modal states
  const [previewOpened, { open: openPreview, close: closePreview }] = useDisclosure(false);
  const [workflowOpened, { open: openWorkflow, close: closeWorkflow }] = useDisclosure(false);
  
  // Get records to process
  const recordsToProcess = mode === 'single' 
    ? records.slice(0, 1) 
    : selectedRecords.length > 0 
      ? selectedRecords 
      : records;

  // Validation completion handler
  const handleValidationComplete = (results: ValidationResult[]) => {
    setValidationResults(results);
    
    // Check if validation passed
    const validRecords = results.filter(r => r.isValid);
    const hasErrors = results.some(r => r.errors.length > 0);
    
    if (!hasErrors) {
      notifications.show({
        title: 'Validation Passed',
        message: `All ${results.length} records passed validation`,
        color: 'green',
      });
      
      // If validation passes and workflow is not required, auto-proceed
      if (!requiresWorkflow()) {
        onValidationPass?.(recordsToProcess);
      }
    } else {
      notifications.show({
        title: 'Validation Issues Found',
        message: `${results.filter(r => !r.isValid).length} records have validation issues`,
        color: 'orange',
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
    const isHighValueUpdate = recordsToProcess.some(record => 
      record.value && Number(record.value) > 1000
    );
    
    return isDeleteOperation || isSensitiveModel || isBulkOperation || isHighValueUpdate;
  };

  // Workflow completion handler
  const handleWorkflowComplete = (approved: boolean) => {
    if (approved) {
      notifications.show({
        title: 'Workflow Approved',
        message: 'Operation has been approved and will proceed',
        color: 'green',
      });
      onValidationPass?.(recordsToProcess);
    } else {
      notifications.show({
        title: 'Workflow Rejected',
        message: 'Operation has been rejected',
        color: 'red',
      });
    }
    
    onWorkflowComplete?.(approved);
  };

  // Get validation summary
  const getValidationSummary = () => {
    if (validationResults.length === 0) {
      return { total: 0, valid: 0, errors: 0, warnings: 0, avgScore: 0 };
    }
    
    const total = validationResults.length;
    const valid = validationResults.filter(r => r.isValid).length;
    const errors = validationResults.filter(r => r.errors.length > 0).length;
    const warnings = validationResults.filter(r => r.warnings.length > 0).length;
    const avgScore = Math.round(
      validationResults.reduce((sum, r) => sum + r.score, 0) / total
    );
    
    return { total, valid, errors, warnings, avgScore };
  };

  // Proceed with operation
  const proceedWithOperation = () => {
    const summary = getValidationSummary();
    
    if (summary.errors > 0) {
      notifications.show({
        title: 'Cannot Proceed',
        message: 'Please fix all validation errors before proceeding',
        color: 'red',
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
            <ThemeIcon size="sm" variant="light" color="blue">
              <IconShieldCheck size={16} />
            </ThemeIcon>
            <Text fw={600}>Data Validation & Workflow</Text>
            <Badge size="sm" variant="light">
              {recordsToProcess.length} records
            </Badge>
          </Group>
          
          <Group gap="xs">
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={openPreview}
              title="Preview records"
            >
              <IconEye size={14} />
            </ActionIcon>
            
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={() => window.location.reload()}
              title="Refresh"
            >
              <IconRefresh size={14} />
            </ActionIcon>
          </Group>
        </Group>

        {/* Operation Summary */}
        <Paper p="sm" withBorder>
          <Group justify="space-between">
            <Stack gap="xs">
              <Text size="sm" fw={500}>Operation Summary</Text>
              <Group gap="md">
                <Text size="sm">
                  <Text component="span" fw={500}>Type:</Text> {operationType}
                </Text>
                <Text size="sm">
                  <Text component="span" fw={500}>Model:</Text> {modelName}
                </Text>
                <Text size="sm">
                  <Text component="span" fw={500}>Records:</Text> {recordsToProcess.length}
                </Text>
              </Group>
            </Stack>
            
            {needsWorkflow && (
              <Alert color="orange" size="xs" icon={<IconClock size={12} />}>
                Approval required
              </Alert>
            )}
          </Group>
        </Paper>

        {/* Progress Indicators */}
        <Stack gap="sm">
          <Group gap="xl">
            {showValidation && (
              <Stack gap="xs" style={{ flex: 1 }}>
                <Group justify="space-between">
                  <Text size="sm" fw={500}>Data Validation</Text>
                  {summary.total > 0 && (
                    <Badge 
                      size="xs" 
                      color={summary.errors === 0 ? 'green' : 'red'}
                      variant="light"
                    >
                      {summary.errors === 0 ? 'Passed' : `${summary.errors} errors`}
                    </Badge>
                  )}
                </Group>
                <Progress 
                  value={summary.total > 0 ? (summary.valid / summary.total) * 100 : 0}
                  color={summary.errors === 0 ? 'green' : 'red'}
                />
              </Stack>
            )}
            
            {needsWorkflow && (
              <Stack gap="xs" style={{ flex: 1 }}>
                <Group justify="space-between">
                  <Text size="sm" fw={500}>Approval Workflow</Text>
                  <Badge size="xs" color="orange" variant="light">
                    Pending
                  </Badge>
                </Group>
                <Progress value={0} color="orange" />
              </Stack>
            )}
          </Group>
        </Stack>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            {showValidation && (
              <Tabs.Tab
                value="validation"
                leftSection={<IconChartBar size={16} />}
              >
                Validation ({summary.total})
              </Tabs.Tab>
            )}
            
            {needsWorkflow && (
              <Tabs.Tab
                value="workflow"
                leftSection={<IconHistory size={16} />}
              >
                Workflow
              </Tabs.Tab>
            )}
            
            <Tabs.Tab
              value="settings"
              leftSection={<IconSettings size={16} />}
            >
              Settings
            </Tabs.Tab>
          </Tabs.List>

          {showValidation && (
            <Tabs.Panel value="validation" pt="md">
              <DataQualityValidator
                modelName={modelName}
                modelConfig={modelConfig}
                records={recordsToProcess}
                onValidationComplete={handleValidationComplete}
                showDetails={true}
              />
            </Tabs.Panel>
          )}

          {needsWorkflow && (
            <Tabs.Panel value="workflow" pt="md">
              <ApprovalWorkflow
                modelName={modelName}
                recordId={mode === 'single' ? recordsToProcess[0]?.id : 'bulk-operation'}
                record={mode === 'single' ? recordsToProcess[0] : { 
                  records: recordsToProcess,
                  operation: operationType,
                  count: recordsToProcess.length 
                }}
                workflowType={operationType}
                onWorkflowComplete={handleWorkflowComplete}
                onWorkflowCancel={() => {
                  closeWorkflow();
                  setActiveTab('validation');
                }}
              />
            </Tabs.Panel>
          )}

          <Tabs.Panel value="settings" pt="md">
            <Stack gap="md">
              <Text size="sm" fw={500}>Validation & Workflow Settings</Text>
              
              <Paper p="sm" withBorder>
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
                    <Badge variant="light">
                      {operationType}
                    </Badge>
                  </Group>
                </Stack>
              </Paper>

              <Alert color="blue" icon={<IconAlertTriangle size={16} />}>
                <Text size="sm" fw={500} mb="xs">Workflow Triggers</Text>
                <Text size="xs">
                  Approval workflow is automatically triggered for:
                </Text>
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
              <Text size="sm" c="dimmed">
                Quality Score: {summary.avgScore}% • 
                {summary.valid} valid • 
                {summary.errors} errors • 
                {summary.warnings} warnings
              </Text>
            )}
          </Group>
          
          <Group gap="sm">
            <Button
              variant="light"
              size="sm"
              onClick={() => {
                setValidationResults([]);
                setWorkflowStatus(null);
              }}
            >
              Reset
            </Button>
            
            <Button
              size="sm"
              onClick={proceedWithOperation}
              disabled={!canProceed}
              loading={isValidating}
              leftSection={needsWorkflow ? <IconSend size={14} /> : <IconCheck size={14} />}
            >
              {needsWorkflow ? 'Submit for Approval' : 'Proceed with Operation'}
            </Button>
          </Group>
        </Group>
      </Stack>

      {/* Preview Modal */}
      <Modal
        opened={previewOpened}
        onClose={closePreview}
        title="Records Preview"
        size="lg"
        scrollAreaComponent={ScrollArea.Autosize}
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            {recordsToProcess.length} records will be processed
          </Text>
          
          <ScrollArea h={400}>
            <Stack gap="xs">
              {recordsToProcess.slice(0, 20).map((record, index) => (
                <Paper key={record.id || index} p="sm" withBorder>
                  <Group justify="space-between">
                    <Text size="sm" fw={500}>
                      {record.name || record.title || record.email || `Record ${index + 1}`}
                    </Text>
                    <Badge size="xs" variant="light">
                      {record.id || 'No ID'}
                    </Badge>
                  </Group>
                  {record.description && (
                    <Text size="xs" c="dimmed" mt="xs">
                      {record.description}
                    </Text>
                  )}
                </Paper>
              ))}
              
              {recordsToProcess.length > 20 && (
                <Text size="sm" c="dimmed" ta="center">
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