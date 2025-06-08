'use client';

import { useState, useCallback } from 'react';
import {
  Card,
  Stack,
  Group,
  Button,
  Modal,
  Text,
  Select,
  FileInput,
  Progress,
  Alert,
  Badge,
  ActionIcon,
  Table,
  Checkbox,
  Tabs,
  NumberInput,
  TextInput,
  Textarea,
  Box,
  ScrollArea,
  Divider,
  Paper,
  ThemeIcon,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconUpload,
  IconDownload,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
  IconFileImport,
  IconFileExport,
  IconTable,
  IconBulk,
  IconStatusChange,
  IconCopy,
  IconRefresh,
} from '@tabler/icons-react';
import type { ModelConfig } from '../lib/model-config';

interface BulkOperationsProps {
  modelName: string;
  modelConfig: ModelConfig;
  selectedRecords: any[];
  onSelectionChange: (records: any[]) => void;
  onRefresh: () => void;
}

interface BulkEditField {
  name: string;
  label: string;
  type: string;
  value: any;
  enabled: boolean;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
  warnings: string[];
}

export function BulkOperations({
  modelName,
  modelConfig,
  selectedRecords,
  onSelectionChange,
  onRefresh,
}: BulkOperationsProps) {
  // Modal states
  const [importOpened, { open: openImport, close: closeImport }] = useDisclosure(false);
  const [exportOpened, { open: openExport, close: closeExport }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [statusOpened, { open: openStatus, close: closeStatus }] = useDisclosure(false);

  // Operation states
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  // Form data
  const [importFile, setImportFile] = useState<File | null>(null);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('csv');
  const [bulkEditFields, setBulkEditFields] = useState<BulkEditField[]>([]);
  const [newStatus, setNewStatus] = useState<string>('');

  // Initialize bulk edit fields when modal opens
  const initializeBulkEdit = useCallback(() => {
    const fields: BulkEditField[] = modelConfig.fields
      .filter(field => field.type !== 'id' && field.type !== 'relation')
      .map(field => ({
        name: field.name,
        label: field.label,
        type: field.type,
        value: '',
        enabled: false,
      }));
    setBulkEditFields(fields);
    openEdit();
  }, [modelConfig.fields, openEdit]);

  // Handle file import
  const handleImport = async () => {
    if (!importFile) {
      notifications.show({
        title: 'Error',
        message: 'Please select a file to import',
        color: 'red',
      });
      return;
    }

    setImporting(true);
    setImportProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('modelName', modelName);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setImportProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const response = await fetch('/api/admin/bulk-import', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setImportProgress(100);

      const result = await response.json();

      if (response.ok) {
        setImportResult(result);
        notifications.show({
          title: 'Import Complete',
          message: `Successfully imported ${result.success} records`,
          color: 'green',
        });
        onRefresh();
      } else {
        throw new Error(result.message || 'Import failed');
      }
    } catch (error) {
      notifications.show({
        title: 'Import Failed',
        message: error instanceof Error ? error.message : 'Failed to import records',
        color: 'red',
      });
    } finally {
      setImporting(false);
    }
  };

  // Handle export
  const handleExport = async () => {
    setExporting(true);

    try {
      const response = await fetch('/api/admin/bulk-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelName,
          format: exportFormat,
          selectedIds: selectedRecords.map(record => record.id),
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${modelName}-export-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
        link.click();
        window.URL.revokeObjectURL(url);

        notifications.show({
          title: 'Export Complete',
          message: `Exported ${selectedRecords.length} records`,
          color: 'green',
        });
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      notifications.show({
        title: 'Export Failed',
        message: error instanceof Error ? error.message : 'Failed to export records',
        color: 'red',
      });
    } finally {
      setExporting(false);
      closeExport();
    }
  };

  // Handle bulk edit
  const handleBulkEdit = async () => {
    const updates = bulkEditFields
      .filter(field => field.enabled && field.value !== '')
      .reduce((acc, field) => ({ ...acc, [field.name]: field.value }), {});

    if (Object.keys(updates).length === 0) {
      notifications.show({
        title: 'Error',
        message: 'No fields selected for update',
        color: 'red',
      });
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch('/api/admin/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelName,
          recordIds: selectedRecords.map(record => record.id),
          updates,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        notifications.show({
          title: 'Bulk Edit Complete',
          message: `Updated ${selectedRecords.length} records`,
          color: 'green',
        });
        onRefresh();
        closeEdit();
      } else {
        throw new Error(result.message || 'Bulk update failed');
      }
    } catch (error) {
      notifications.show({
        title: 'Bulk Edit Failed',
        message: error instanceof Error ? error.message : 'Failed to update records',
        color: 'red',
      });
    } finally {
      setProcessing(false);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    setProcessing(true);

    try {
      const response = await fetch('/api/admin/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelName,
          recordIds: selectedRecords.map(record => record.id),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        notifications.show({
          title: 'Bulk Delete Complete',
          message: `Deleted ${selectedRecords.length} records`,
          color: 'green',
        });
        onSelectionChange([]);
        onRefresh();
        closeDelete();
      } else {
        throw new Error(result.message || 'Bulk delete failed');
      }
    } catch (error) {
      notifications.show({
        title: 'Bulk Delete Failed',
        message: error instanceof Error ? error.message : 'Failed to delete records',
        color: 'red',
      });
    } finally {
      setProcessing(false);
    }
  };

  // Handle status change
  const handleStatusChange = async () => {
    if (!newStatus) {
      notifications.show({
        title: 'Error',
        message: 'Please select a status',
        color: 'red',
      });
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch('/api/admin/bulk-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelName,
          recordIds: selectedRecords.map(record => record.id),
          status: newStatus,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        notifications.show({
          title: 'Status Update Complete',
          message: `Updated status for ${selectedRecords.length} records`,
          color: 'green',
        });
        onRefresh();
        closeStatus();
      } else {
        throw new Error(result.message || 'Status update failed');
      }
    } catch (error) {
      notifications.show({
        title: 'Status Update Failed',
        message: error instanceof Error ? error.message : 'Failed to update status',
        color: 'red',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <Card withBorder p="md">
        <Stack gap="md">
          <Group justify="space-between">
            <Group gap="xs">
              <ThemeIcon size="sm" variant="light" color="blue">
                <IconBulk size={16} />
              </ThemeIcon>
              <Text fw={600}>Bulk Operations</Text>
              {selectedRecords.length > 0 && (
                <Badge size="sm" variant="light">
                  {selectedRecords.length} selected
                </Badge>
              )}
            </Group>
            <Button
              variant="light"
              size="xs"
              leftSection={<IconRefresh size={14} />}
              onClick={onRefresh}
            >
              Refresh
            </Button>
          </Group>

          <Divider />

          <Tabs defaultValue="actions">
            <Tabs.List>
              <Tabs.Tab value="actions" leftSection={<IconEdit size={16} />}>
                Actions
              </Tabs.Tab>
              <Tabs.Tab value="import" leftSection={<IconFileImport size={16} />}>
                Import
              </Tabs.Tab>
              <Tabs.Tab value="export" leftSection={<IconFileExport size={16} />}>
                Export
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="actions" pt="md">
              <Group gap="sm">
                <Button
                  leftSection={<IconEdit size={16} />}
                  variant="light"
                  onClick={initializeBulkEdit}
                  disabled={selectedRecords.length === 0}
                >
                  Bulk Edit
                </Button>

                <Button
                  leftSection={<IconStatusChange size={16} />}
                  variant="light"
                  color="orange"
                  onClick={openStatus}
                  disabled={selectedRecords.length === 0}
                >
                  Change Status
                </Button>

                <Button
                  leftSection={<IconCopy size={16} />}
                  variant="light"
                  color="blue"
                  disabled={selectedRecords.length === 0}
                >
                  Duplicate
                </Button>

                <Button
                  leftSection={<IconTrash size={16} />}
                  variant="light"
                  color="red"
                  onClick={openDelete}
                  disabled={selectedRecords.length === 0}
                >
                  Delete
                </Button>
              </Group>
            </Tabs.Panel>

            <Tabs.Panel value="import" pt="md">
              <Stack gap="sm">
                <FileInput
                  label="Import File"
                  placeholder="Select CSV or JSON file"
                  accept=".csv,.json"
                  value={importFile}
                  onChange={setImportFile}
                  leftSection={<IconUpload size={16} />}
                />
                <Button
                  leftSection={<IconFileImport size={16} />}
                  onClick={handleImport}
                  loading={importing}
                  disabled={!importFile}
                >
                  Import Data
                </Button>
                {importing && (
                  <Progress value={importProgress} size="sm" animated />
                )}
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="export" pt="md">
              <Stack gap="sm">
                <Select
                  label="Export Format"
                  value={exportFormat}
                  onChange={(value) => setExportFormat(value as 'json' | 'csv')}
                  data={[
                    { value: 'csv', label: 'CSV' },
                    { value: 'json', label: 'JSON' },
                  ]}
                />
                <Group gap="sm">
                  <Button
                    leftSection={<IconDownload size={16} />}
                    onClick={handleExport}
                    loading={exporting}
                  >
                    Export All
                  </Button>
                  <Button
                    leftSection={<IconDownload size={16} />}
                    variant="light"
                    onClick={handleExport}
                    loading={exporting}
                    disabled={selectedRecords.length === 0}
                  >
                    Export Selected ({selectedRecords.length})
                  </Button>
                </Group>
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Card>

      {/* Import Result Modal */}
      {importResult && (
        <Modal opened={!!importResult} onClose={() => setImportResult(null)} title="Import Results">
          <Stack gap="md">
            <Group justify="space-between">
              <Text>Successful:</Text>
              <Badge color="green">{importResult.success}</Badge>
            </Group>
            <Group justify="space-between">
              <Text>Failed:</Text>
              <Badge color="red">{importResult.failed}</Badge>
            </Group>
            
            {importResult.errors.length > 0 && (
              <Alert color="red" title="Errors">
                <Stack gap="xs">
                  {importResult.errors.slice(0, 5).map((error, index) => (
                    <Text key={index} size="sm">{error}</Text>
                  ))}
                  {importResult.errors.length > 5 && (
                    <Text size="sm" c="dimmed">
                      ... and {importResult.errors.length - 5} more errors
                    </Text>
                  )}
                </Stack>
              </Alert>
            )}

            {importResult.warnings.length > 0 && (
              <Alert color="yellow" title="Warnings">
                <Stack gap="xs">
                  {importResult.warnings.slice(0, 3).map((warning, index) => (
                    <Text key={index} size="sm">{warning}</Text>
                  ))}
                </Stack>
              </Alert>
            )}
          </Stack>
        </Modal>
      )}

      {/* Bulk Edit Modal */}
      <Modal opened={editOpened} onClose={closeEdit} title="Bulk Edit" size="lg">
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Select the fields you want to update for {selectedRecords.length} records:
          </Text>

          <ScrollArea h={400}>
            <Stack gap="sm">
              {bulkEditFields.map((field, index) => (
                <Paper key={field.name} p="sm" withBorder>
                  <Group align="flex-start" gap="md">
                    <Checkbox
                      checked={field.enabled}
                      onChange={(e) => {
                        const updated = [...bulkEditFields];
                        updated[index].enabled = e.target.checked;
                        setBulkEditFields(updated);
                      }}
                      mt={field.type === 'textarea' ? 'xs' : 4}
                    />
                    
                    <Box style={{ flex: 1 }}>
                      <Text size="sm" fw={500} mb="xs">
                        {field.label}
                      </Text>
                      
                      {field.type === 'textarea' ? (
                        <Textarea
                          value={field.value}
                          onChange={(e) => {
                            const updated = [...bulkEditFields];
                            updated[index].value = e.target.value;
                            setBulkEditFields(updated);
                          }}
                          disabled={!field.enabled}
                          rows={3}
                        />
                      ) : field.type === 'number' ? (
                        <NumberInput
                          value={field.value}
                          onChange={(value) => {
                            const updated = [...bulkEditFields];
                            updated[index].value = value;
                            setBulkEditFields(updated);
                          }}
                          disabled={!field.enabled}
                        />
                      ) : (
                        <TextInput
                          value={field.value}
                          onChange={(e) => {
                            const updated = [...bulkEditFields];
                            updated[index].value = e.target.value;
                            setBulkEditFields(updated);
                          }}
                          disabled={!field.enabled}
                        />
                      )}
                    </Box>
                  </Group>
                </Paper>
              ))}
            </Stack>
          </ScrollArea>

          <Group justify="flex-end">
            <Button variant="light" onClick={closeEdit}>
              Cancel
            </Button>
            <Button onClick={handleBulkEdit} loading={processing}>
              Update {selectedRecords.length} Records
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal opened={deleteOpened} onClose={closeDelete} title="Confirm Bulk Delete">
        <Stack gap="md">
          <Alert color="red" icon={<IconTrash size={16} />}>
            Are you sure you want to delete {selectedRecords.length} records? This action cannot be undone.
          </Alert>

          <Group justify="flex-end">
            <Button variant="light" onClick={closeDelete}>
              Cancel
            </Button>
            <Button color="red" onClick={handleBulkDelete} loading={processing}>
              Delete {selectedRecords.length} Records
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Status Change Modal */}
      <Modal opened={statusOpened} onClose={closeStatus} title="Change Status">
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Change status for {selectedRecords.length} selected records:
          </Text>

          <Select
            label="New Status"
            placeholder="Select status"
            value={newStatus}
            onChange={(value) => setNewStatus(value || '')}
            data={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'pending', label: 'Pending' },
              { value: 'archived', label: 'Archived' },
              { value: 'draft', label: 'Draft' },
              { value: 'published', label: 'Published' },
            ]}
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={closeStatus}>
              Cancel
            </Button>
            <Button onClick={handleStatusChange} loading={processing}>
              Update Status
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}