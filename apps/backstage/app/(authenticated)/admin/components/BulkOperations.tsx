'use client';

import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  FileInput,
  Group,
  Modal,
  NumberInput,
  Paper,
  Progress,
  ScrollArea,
  Select,
  Stack,
  Tabs,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconBulkOff as IconBulk, // Use IconBulkOff as substitute for IconBulk
  IconCopy,
  IconDownload,
  IconEdit,
  IconFileExport,
  IconFileImport,
  IconRefresh,
  IconStatusChange,
  IconTrash,
  IconUpload,
} from '@tabler/icons-react';
import { useCallback, useState } from 'react';

import type { ModelConfig } from '../lib/model-config';

interface BulkOperationsProps {
  modelConfig: ModelConfig;
  modelName: string;
  onRefresh: () => void;
  onSelectionChange: (records: any[]) => void;
  selectedRecords: any[];
}

interface BulkEditField {
  enabled: boolean;
  label: string;
  name: string;
  type: string;
  value: any;
}

interface ImportResult {
  errors: string[];
  failed: number;
  success: number;
  warnings: string[];
}

export function BulkOperations({
  modelConfig,
  modelName,
  onRefresh,
  onSelectionChange,
  selectedRecords,
}: BulkOperationsProps) {
  // Modal states
  const [importOpened, { close: closeImport, open: openImport }] = useDisclosure(false);
  const [exportOpened, { close: closeExport, open: openExport }] = useDisclosure(false);
  const [editOpened, { close: closeEdit, open: openEdit }] = useDisclosure(false);
  const [deleteOpened, { close: closeDelete, open: openDelete }] = useDisclosure(false);
  const [statusOpened, { close: closeStatus, open: openStatus }] = useDisclosure(false);

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
      .filter((field) => field.type !== 'id' && field.type !== 'relation')
      .map((field) => ({
        name: field.name,
        type: field.type,
        enabled: false,
        label: field.label,
        value: '',
      }));
    setBulkEditFields(fields);
    openEdit();
  }, [modelConfig.fields, openEdit]);

  // Handle file import
  const handleImport = async () => {
    if (!importFile) {
      notifications.show({
        color: 'red',
        message: 'Please select a file to import',
        title: 'Error',
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
        setImportProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const response = await fetch('/api/admin/bulk-import', {
        body: formData,
        method: 'POST',
      });

      clearInterval(progressInterval);
      setImportProgress(100);

      const result = await response.json();

      if (response.ok) {
        setImportResult(result);
        notifications.show({
          color: 'green',
          message: `Successfully imported ${result.success} records`,
          title: 'Import Complete',
        });
        onRefresh();
      } else {
        throw new Error(result.message || 'Import failed');
      }
    } catch (error) {
      notifications.show({
        color: 'red',
        message: error instanceof Error ? error.message : 'Failed to import records',
        title: 'Import Failed',
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
        body: JSON.stringify({
          format: exportFormat,
          modelName,
          selectedIds: selectedRecords.map((record) => record.id),
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
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
          color: 'green',
          message: `Exported ${selectedRecords.length} records`,
          title: 'Export Complete',
        });
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      notifications.show({
        color: 'red',
        message: error instanceof Error ? error.message : 'Failed to export records',
        title: 'Export Failed',
      });
    } finally {
      setExporting(false);
      closeExport();
    }
  };

  // Handle bulk edit
  const handleBulkEdit = async () => {
    const updates = bulkEditFields
      .filter((field) => field.enabled && field.value !== '')
      .reduce((acc, field) => ({ ...acc, [field.name]: field.value }), {});

    if (Object.keys(updates).length === 0) {
      notifications.show({
        color: 'red',
        message: 'No fields selected for update',
        title: 'Error',
      });
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch('/api/admin/bulk-update', {
        body: JSON.stringify({
          modelName,
          recordIds: selectedRecords.map((record) => record.id),
          updates,
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      const result = await response.json();

      if (response.ok) {
        notifications.show({
          color: 'green',
          message: `Updated ${selectedRecords.length} records`,
          title: 'Bulk Edit Complete',
        });
        onRefresh();
        closeEdit();
      } else {
        throw new Error(result.message || 'Bulk update failed');
      }
    } catch (error) {
      notifications.show({
        color: 'red',
        message: error instanceof Error ? error.message : 'Failed to update records',
        title: 'Bulk Edit Failed',
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
        body: JSON.stringify({
          modelName,
          recordIds: selectedRecords.map((record) => record.id),
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      const result = await response.json();

      if (response.ok) {
        notifications.show({
          color: 'green',
          message: `Deleted ${selectedRecords.length} records`,
          title: 'Bulk Delete Complete',
        });
        onSelectionChange([]);
        onRefresh();
        closeDelete();
      } else {
        throw new Error(result.message || 'Bulk delete failed');
      }
    } catch (error) {
      notifications.show({
        color: 'red',
        message: error instanceof Error ? error.message : 'Failed to delete records',
        title: 'Bulk Delete Failed',
      });
    } finally {
      setProcessing(false);
    }
  };

  // Handle status change
  const handleStatusChange = async () => {
    if (!newStatus) {
      notifications.show({
        color: 'red',
        message: 'Please select a status',
        title: 'Error',
      });
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch('/api/admin/bulk-status', {
        body: JSON.stringify({
          modelName,
          recordIds: selectedRecords.map((record) => record.id),
          status: newStatus,
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      const result = await response.json();

      if (response.ok) {
        notifications.show({
          color: 'green',
          message: `Updated status for ${selectedRecords.length} records`,
          title: 'Status Update Complete',
        });
        onRefresh();
        closeStatus();
      } else {
        throw new Error(result.message || 'Status update failed');
      }
    } catch (error) {
      notifications.show({
        color: 'red',
        message: error instanceof Error ? error.message : 'Failed to update status',
        title: 'Status Update Failed',
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
              <ThemeIcon color="blue" size="sm" variant="light">
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
              leftSection={<IconRefresh size={14} />}
              onClick={onRefresh}
              size="xs"
              variant="light"
            >
              Refresh
            </Button>
          </Group>

          <Divider />

          <Tabs defaultValue="actions">
            <Tabs.List>
              <Tabs.Tab leftSection={<IconEdit size={16} />} value="actions">
                Actions
              </Tabs.Tab>
              <Tabs.Tab leftSection={<IconFileImport size={16} />} value="import">
                Import
              </Tabs.Tab>
              <Tabs.Tab leftSection={<IconFileExport size={16} />} value="export">
                Export
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel pt="md" value="actions">
              <Group gap="sm">
                <Button
                  leftSection={<IconEdit size={16} />}
                  onClick={initializeBulkEdit}
                  disabled={selectedRecords.length === 0}
                  variant="light"
                >
                  Bulk Edit
                </Button>

                <Button
                  color="orange"
                  leftSection={<IconStatusChange size={16} />}
                  onClick={openStatus}
                  disabled={selectedRecords.length === 0}
                  variant="light"
                >
                  Change Status
                </Button>

                <Button
                  color="blue"
                  leftSection={<IconCopy size={16} />}
                  disabled={selectedRecords.length === 0}
                  variant="light"
                >
                  Duplicate
                </Button>

                <Button
                  color="red"
                  leftSection={<IconTrash size={16} />}
                  onClick={openDelete}
                  disabled={selectedRecords.length === 0}
                  variant="light"
                >
                  Delete
                </Button>
              </Group>
            </Tabs.Panel>

            <Tabs.Panel pt="md" value="import">
              <Stack gap="sm">
                <FileInput
                  leftSection={<IconUpload size={16} />}
                  onChange={setImportFile}
                  placeholder="Select CSV or JSON file"
                  accept=".csv,.json"
                  label="Import File"
                  value={importFile}
                />
                <Button
                  leftSection={<IconFileImport size={16} />}
                  loading={importing}
                  onClick={handleImport}
                  disabled={!importFile}
                >
                  Import Data
                </Button>
                {importing && <Progress animated size="sm" value={importProgress} />}
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel pt="md" value="export">
              <Stack gap="sm">
                <Select
                  onChange={(value) => setExportFormat(value as 'json' | 'csv')}
                  data={[
                    { label: 'CSV', value: 'csv' },
                    { label: 'JSON', value: 'json' },
                  ]}
                  label="Export Format"
                  value={exportFormat}
                />
                <Group gap="sm">
                  <Button
                    leftSection={<IconDownload size={16} />}
                    loading={exporting}
                    onClick={handleExport}
                  >
                    Export All
                  </Button>
                  <Button
                    leftSection={<IconDownload size={16} />}
                    loading={exporting}
                    onClick={handleExport}
                    disabled={selectedRecords.length === 0}
                    variant="light"
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
        <Modal onClose={() => setImportResult(null)} opened={!!importResult} title="Import Results">
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
                    <Text key={index} size="sm">
                      {error}
                    </Text>
                  ))}
                  {importResult.errors.length > 5 && (
                    <Text c="dimmed" size="sm">
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
                    <Text key={index} size="sm">
                      {warning}
                    </Text>
                  ))}
                </Stack>
              </Alert>
            )}
          </Stack>
        </Modal>
      )}

      {/* Bulk Edit Modal */}
      <Modal onClose={closeEdit} opened={editOpened} size="lg" title="Bulk Edit">
        <Stack gap="md">
          <Text c="dimmed" size="sm">
            Select the fields you want to update for {selectedRecords.length} records:
          </Text>

          <ScrollArea h={400}>
            <Stack gap="sm">
              {bulkEditFields.map((field, index) => (
                <Paper key={field.name} withBorder p="sm">
                  <Group align="flex-start" gap="md">
                    <Checkbox
                      onChange={(e) => {
                        const updated = [...bulkEditFields];
                        updated[index].enabled = e.target.checked;
                        setBulkEditFields(updated);
                      }}
                      checked={field.enabled}
                      mt={field.type === 'textarea' ? 'xs' : 4}
                    />

                    <Box style={{ flex: 1 }}>
                      <Text fw={500} mb="xs" size="sm">
                        {field.label}
                      </Text>

                      {field.type === 'textarea' ? (
                        <Textarea
                          onChange={(e) => {
                            const updated = [...bulkEditFields];
                            updated[index].value = e.target.value;
                            setBulkEditFields(updated);
                          }}
                          rows={3}
                          disabled={!field.enabled}
                          value={field.value}
                        />
                      ) : field.type === 'number' ? (
                        <NumberInput
                          onChange={(value) => {
                            const updated = [...bulkEditFields];
                            updated[index].value = value;
                            setBulkEditFields(updated);
                          }}
                          disabled={!field.enabled}
                          value={field.value}
                        />
                      ) : (
                        <TextInput
                          onChange={(e) => {
                            const updated = [...bulkEditFields];
                            updated[index].value = e.target.value;
                            setBulkEditFields(updated);
                          }}
                          disabled={!field.enabled}
                          value={field.value}
                        />
                      )}
                    </Box>
                  </Group>
                </Paper>
              ))}
            </Stack>
          </ScrollArea>

          <Group justify="flex-end">
            <Button onClick={closeEdit} variant="light">
              Cancel
            </Button>
            <Button loading={processing} onClick={handleBulkEdit}>
              Update {selectedRecords.length} Records
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal onClose={closeDelete} opened={deleteOpened} title="Confirm Bulk Delete">
        <Stack gap="md">
          <Alert color="red" icon={<IconTrash size={16} />}>
            Are you sure you want to delete {selectedRecords.length} records? This action cannot be
            undone.
          </Alert>

          <Group justify="flex-end">
            <Button onClick={closeDelete} variant="light">
              Cancel
            </Button>
            <Button color="red" loading={processing} onClick={handleBulkDelete}>
              Delete {selectedRecords.length} Records
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Status Change Modal */}
      <Modal onClose={closeStatus} opened={statusOpened} title="Change Status">
        <Stack gap="md">
          <Text c="dimmed" size="sm">
            Change status for {selectedRecords.length} selected records:
          </Text>

          <Select
            onChange={(value) => setNewStatus(value || '')}
            placeholder="Select status"
            data={[
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
              { label: 'Pending', value: 'pending' },
              { label: 'Archived', value: 'archived' },
              { label: 'Draft', value: 'draft' },
              { label: 'Published', value: 'published' },
            ]}
            label="New Status"
            value={newStatus}
          />

          <Group justify="flex-end">
            <Button onClick={closeStatus} variant="light">
              Cancel
            </Button>
            <Button loading={processing} onClick={handleStatusChange}>
              Update Status
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
