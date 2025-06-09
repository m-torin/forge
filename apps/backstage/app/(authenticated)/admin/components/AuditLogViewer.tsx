'use client';

import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Group,
  LoadingOverlay,
  Pagination,
  Paper,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import {
  IconAlertTriangle,
  IconDownload,
  IconEye,
  IconInfoCircle,
  IconRefresh,
  IconSearch,
  IconShield,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';

// TODO: Replace with API route or server action
// import { Security } from '../lib/security-middleware';

interface AuditEntry {
  action: string;
  error?: string;
  fieldName?: string;
  ipAddress?: string;
  modelName: string;
  newValue?: any;
  oldValue?: any;
  recordId?: string;
  sessionId: string;
  severity: 'low' | 'medium' | 'high';
  success: boolean;
  timestamp: string;
  userAgent?: string;
  userId: string;
}

interface AuditLogViewerProps {
  className?: string;
  modelName?: string; // If provided, shows logs for specific model
  userId?: string; // If provided, shows logs for specific user
}

export function AuditLogViewer({ className, modelName, userId }: AuditLogViewerProps) {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [successFilter, setSuccessFilter] = useState<string>('');

  // Load audit logs
  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would be an API call
      // TODO: Replace with API route or server action
      // const auditLogs = Security.getRecentAuditLogs(1000);
      const auditLogs: AuditEntry[] = [];

      let filtered = auditLogs;

      // Apply user filter if provided
      if (userId) {
        filtered = filtered.filter((log) => log.userId === userId);
      }

      // Apply model filter if provided
      if (modelName) {
        filtered = filtered.filter((log) => log.modelName === modelName);
      }

      setLogs(filtered);
      setFilteredLogs(filtered);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...logs];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.action.toLowerCase().includes(search) ||
          log.modelName.toLowerCase().includes(search) ||
          log.fieldName?.toLowerCase().includes(search) ||
          log.userId.toLowerCase().includes(search) ||
          log.recordId?.toLowerCase().includes(search),
      );
    }

    // Severity filter
    if (severityFilter) {
      filtered = filtered.filter((log) => log.severity === severityFilter);
    }

    // Action filter
    if (actionFilter) {
      filtered = filtered.filter((log) => log.action === actionFilter);
    }

    // Success filter
    if (successFilter) {
      const isSuccess = successFilter === 'true';
      filtered = filtered.filter((log) => log.success === isSuccess);
    }

    // Date range filter
    const [startDate, endDate] = dateRange;
    if (startDate) {
      filtered = filtered.filter((log) => new Date(log.timestamp) >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter((log) => new Date(log.timestamp) <= endDate);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setFilteredLogs(filtered);
    setCurrentPage(1);
  }, [logs, searchTerm, severityFilter, actionFilter, successFilter, dateRange]);

  // Get unique actions for filter
  const uniqueActions = [...new Set(logs.map((log) => log.action))];

  // Get paginated logs
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(filteredLogs.length / pageSize);

  // Severity color mapping
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'red';
      case 'medium':
        return 'orange';
      case 'low':
        return 'blue';
      default:
        return 'gray';
    }
  };

  // Success badge color
  const getSuccessColor = (success: boolean) => (success ? 'green' : 'red');

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  // Export logs to CSV
  const exportLogs = () => {
    const headers = [
      'Timestamp',
      'User ID',
      'Action',
      'Model',
      'Record ID',
      'Field',
      'Severity',
      'Success',
      'IP Address',
      'Error',
    ];

    const csvData = filteredLogs.map((log) => [
      log.timestamp,
      log.userId,
      log.action,
      log.modelName,
      log.recordId || '',
      log.fieldName || '',
      log.severity,
      log.success ? 'Success' : 'Failed',
      log.ipAddress || '',
      log.error || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    loadAuditLogs();
  }, [userId, modelName]);

  return (
    <Card className={className} p="lg">
      <LoadingOverlay visible={loading} />

      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between">
          <Group gap="xs">
            <IconShield size={20} />
            <Text fw={600} size="lg">
              Security Audit Log
              {userId && ` - User: ${userId}`}
              {modelName && ` - Model: ${modelName}`}
            </Text>
          </Group>

          <Group gap="xs">
            <Tooltip label="Refresh logs">
              <ActionIcon loading={loading} onClick={loadAuditLogs} variant="light">
                <IconRefresh size={16} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label="Export to CSV">
              <ActionIcon onClick={exportLogs} disabled={filteredLogs.length === 0} variant="light">
                <IconDownload size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        {/* Summary Stats */}
        <Paper withBorder p="md">
          <Group gap="xl">
            <Box>
              <Text c="blue" fw={700} size="xl">
                {filteredLogs.length}
              </Text>
              <Text c="dimmed" size="sm">
                Total Events
              </Text>
            </Box>

            <Box>
              <Text c="red" fw={700} size="xl">
                {filteredLogs.filter((log) => log.severity === 'high').length}
              </Text>
              <Text c="dimmed" size="sm">
                High Severity
              </Text>
            </Box>

            <Box>
              <Text c="red" fw={700} size="xl">
                {filteredLogs.filter((log) => !log.success).length}
              </Text>
              <Text c="dimmed" size="sm">
                Failed Actions
              </Text>
            </Box>

            <Box>
              <Text c="green" fw={700} size="xl">
                {Math.round(
                  (filteredLogs.filter((log) => log.success).length /
                    Math.max(filteredLogs.length, 1)) *
                    100,
                )}
                %
              </Text>
              <Text c="dimmed" size="sm">
                Success Rate
              </Text>
            </Box>
          </Group>
        </Paper>

        {/* Filters */}
        <Paper withBorder p="md">
          <Stack gap="md">
            <Text fw={500} size="sm">
              Filters
            </Text>

            <Group grow gap="md">
              <TextInput
                leftSection={<IconSearch size={16} />}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search logs..."
                value={searchTerm}
              />

              <Select
                onChange={(value) => setSeverityFilter(value || '')}
                placeholder="Severity"
                clearable
                data={[
                  { label: 'All Severities', value: '' },
                  { label: 'High', value: 'high' },
                  { label: 'Medium', value: 'medium' },
                  { label: 'Low', value: 'low' },
                ]}
                value={severityFilter}
              />

              <Select
                onChange={(value) => setActionFilter(value || '')}
                placeholder="Action"
                clearable
                data={[
                  { label: 'All Actions', value: '' },
                  ...uniqueActions.map((action) => ({ label: action, value: action })),
                ]}
                value={actionFilter}
              />

              <Select
                onChange={(value) => setSuccessFilter(value || '')}
                placeholder="Status"
                clearable
                data={[
                  { label: 'All', value: '' },
                  { label: 'Success', value: 'true' },
                  { label: 'Failed', value: 'false' },
                ]}
                value={successFilter}
              />
            </Group>

            <Group gap="md">
              <DatePickerInput
                onChange={setDateRange}
                placeholder="Date range"
                clearable
                type="range"
                value={dateRange}
              />

              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSeverityFilter('');
                  setActionFilter('');
                  setSuccessFilter('');
                  setDateRange([null, null]);
                }}
                size="sm"
                variant="light"
              >
                Clear Filters
              </Button>
            </Group>
          </Stack>
        </Paper>

        {/* Audit Log Table */}
        {filteredLogs.length === 0 ? (
          <Alert color="blue" icon={<IconInfoCircle size={16} />}>
            No audit logs found matching the current filters.
          </Alert>
        ) : (
          <>
            <ScrollArea>
              <Table highlightOnHover striped>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Timestamp</Table.Th>
                    <Table.Th>Severity</Table.Th>
                    <Table.Th>Action</Table.Th>
                    <Table.Th>Model</Table.Th>
                    <Table.Th>Field</Table.Th>
                    <Table.Th>User</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>IP Address</Table.Th>
                    <Table.Th>Details</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {paginatedLogs.map((log, index) => (
                    <Table.Tr key={`${log.timestamp}-${index}`}>
                      <Table.Td>
                        <Text family="monospace" size="xs">
                          {formatTimestamp(log.timestamp)}
                        </Text>
                      </Table.Td>

                      <Table.Td>
                        <Badge color={getSeverityColor(log.severity)} size="sm" variant="light">
                          {log.severity.toUpperCase()}
                        </Badge>
                      </Table.Td>

                      <Table.Td>
                        <Text fw={500} size="sm">
                          {log.action}
                        </Text>
                      </Table.Td>

                      <Table.Td>
                        <Text size="sm">{log.modelName}</Text>
                        {log.recordId && (
                          <Text c="dimmed" size="xs">
                            ID: {log.recordId}
                          </Text>
                        )}
                      </Table.Td>

                      <Table.Td>
                        {log.fieldName && (
                          <Text family="monospace" size="sm">
                            {log.fieldName}
                          </Text>
                        )}
                      </Table.Td>

                      <Table.Td>
                        <Text family="monospace" size="sm">
                          {log.userId}
                        </Text>
                      </Table.Td>

                      <Table.Td>
                        <Badge color={getSuccessColor(log.success)} size="sm" variant="light">
                          {log.success ? 'Success' : 'Failed'}
                        </Badge>
                      </Table.Td>

                      <Table.Td>
                        <Text family="monospace" size="xs">
                          {log.ipAddress || '-'}
                        </Text>
                      </Table.Td>

                      <Table.Td>
                        {log.error && (
                          <Tooltip label={log.error}>
                            <ActionIcon color="red" size="sm" variant="light">
                              <IconAlertTriangle size={12} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                        {(log.oldValue || log.newValue) && (
                          <Tooltip label="Value changed">
                            <ActionIcon color="blue" size="sm" variant="light">
                              <IconEye size={12} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>

            {/* Pagination */}
            {totalPages > 1 && (
              <Group justify="center">
                <Pagination
                  onChange={setCurrentPage}
                  total={totalPages}
                  size="sm"
                  value={currentPage}
                />
              </Group>
            )}

            <Text c="dimmed" size="xs" ta="center">
              Showing {startIndex + 1}-{Math.min(startIndex + pageSize, filteredLogs.length)} of{' '}
              {filteredLogs.length} events
            </Text>
          </>
        )}
      </Stack>
    </Card>
  );
}
