'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Text,
  Table,
  Badge,
  Stack,
  Group,
  Select,
  TextInput,
  Button,
  ActionIcon,
  Tooltip,
  Alert,
  Pagination,
  Box,
  ScrollArea,
  Paper,
  Divider,
  LoadingOverlay,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import {
  IconSearch,
  IconRefresh,
  IconEye,
  IconDownload,
  IconShield,
  IconAlertTriangle,
  IconInfoCircle,
} from '@tabler/icons-react';
import { Security } from '../lib/security-middleware';

interface AuditEntry {
  timestamp: string;
  userId: string;
  action: string;
  modelName: string;
  recordId?: string;
  fieldName?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
  sessionId: string;
  severity: 'low' | 'medium' | 'high';
  success: boolean;
  error?: string;
}

interface AuditLogViewerProps {
  userId?: string; // If provided, shows logs for specific user
  modelName?: string; // If provided, shows logs for specific model
  className?: string;
}

export function AuditLogViewer({ userId, modelName, className }: AuditLogViewerProps) {
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
      const auditLogs = Security.getRecentAuditLogs(1000);
      
      let filtered = auditLogs;
      
      // Apply user filter if provided
      if (userId) {
        filtered = filtered.filter(log => log.userId === userId);
      }
      
      // Apply model filter if provided
      if (modelName) {
        filtered = filtered.filter(log => log.modelName === modelName);
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
      filtered = filtered.filter(log =>
        log.action.toLowerCase().includes(search) ||
        log.modelName.toLowerCase().includes(search) ||
        log.fieldName?.toLowerCase().includes(search) ||
        log.userId.toLowerCase().includes(search) ||
        log.recordId?.toLowerCase().includes(search)
      );
    }
    
    // Severity filter
    if (severityFilter) {
      filtered = filtered.filter(log => log.severity === severityFilter);
    }
    
    // Action filter
    if (actionFilter) {
      filtered = filtered.filter(log => log.action === actionFilter);
    }
    
    // Success filter
    if (successFilter) {
      const isSuccess = successFilter === 'true';
      filtered = filtered.filter(log => log.success === isSuccess);
    }
    
    // Date range filter
    const [startDate, endDate] = dateRange;
    if (startDate) {
      filtered = filtered.filter(log => new Date(log.timestamp) >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(log => new Date(log.timestamp) <= endDate);
    }
    
    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    setFilteredLogs(filtered);
    setCurrentPage(1);
  }, [logs, searchTerm, severityFilter, actionFilter, successFilter, dateRange]);

  // Get unique actions for filter
  const uniqueActions = [...new Set(logs.map(log => log.action))];

  // Get paginated logs
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(filteredLogs.length / pageSize);

  // Severity color mapping
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'blue';
      default: return 'gray';
    }
  };

  // Success badge color
  const getSuccessColor = (success: boolean) => success ? 'green' : 'red';

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
      'Error'
    ];
    
    const csvData = filteredLogs.map(log => [
      log.timestamp,
      log.userId,
      log.action,
      log.modelName,
      log.recordId || '',
      log.fieldName || '',
      log.severity,
      log.success ? 'Success' : 'Failed',
      log.ipAddress || '',
      log.error || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
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
            <Text size="lg" fw={600}>
              Security Audit Log
              {userId && ` - User: ${userId}`}
              {modelName && ` - Model: ${modelName}`}
            </Text>
          </Group>
          
          <Group gap="xs">
            <Tooltip label="Refresh logs">
              <ActionIcon
                variant="light"
                onClick={loadAuditLogs}
                loading={loading}
              >
                <IconRefresh size={16} />
              </ActionIcon>
            </Tooltip>
            
            <Tooltip label="Export to CSV">
              <ActionIcon
                variant="light"
                onClick={exportLogs}
                disabled={filteredLogs.length === 0}
              >
                <IconDownload size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        {/* Summary Stats */}
        <Paper p="md" withBorder>
          <Group gap="xl">
            <Box>
              <Text size="xl" fw={700} c="blue">
                {filteredLogs.length}
              </Text>
              <Text size="sm" c="dimmed">Total Events</Text>
            </Box>
            
            <Box>
              <Text size="xl" fw={700} c="red">
                {filteredLogs.filter(log => log.severity === 'high').length}
              </Text>
              <Text size="sm" c="dimmed">High Severity</Text>
            </Box>
            
            <Box>
              <Text size="xl" fw={700} c="red">
                {filteredLogs.filter(log => !log.success).length}
              </Text>
              <Text size="sm" c="dimmed">Failed Actions</Text>
            </Box>
            
            <Box>
              <Text size="xl" fw={700} c="green">
                {Math.round((filteredLogs.filter(log => log.success).length / Math.max(filteredLogs.length, 1)) * 100)}%
              </Text>
              <Text size="sm" c="dimmed">Success Rate</Text>
            </Box>
          </Group>
        </Paper>

        {/* Filters */}
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Text size="sm" fw={500}>Filters</Text>
            
            <Group gap="md" grow>
              <TextInput
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftSection={<IconSearch size={16} />}
              />
              
              <Select
                placeholder="Severity"
                value={severityFilter}
                onChange={(value) => setSeverityFilter(value || '')}
                data={[
                  { value: '', label: 'All Severities' },
                  { value: 'high', label: 'High' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'low', label: 'Low' },
                ]}
                clearable
              />
              
              <Select
                placeholder="Action"
                value={actionFilter}
                onChange={(value) => setActionFilter(value || '')}
                data={[
                  { value: '', label: 'All Actions' },
                  ...uniqueActions.map(action => ({ value: action, label: action }))
                ]}
                clearable
              />
              
              <Select
                placeholder="Status"
                value={successFilter}
                onChange={(value) => setSuccessFilter(value || '')}
                data={[
                  { value: '', label: 'All' },
                  { value: 'true', label: 'Success' },
                  { value: 'false', label: 'Failed' },
                ]}
                clearable
              />
            </Group>
            
            <Group gap="md">
              <DatePickerInput
                type="range"
                placeholder="Date range"
                value={dateRange}
                onChange={setDateRange}
                clearable
              />
              
              <Button
                variant="light"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSeverityFilter('');
                  setActionFilter('');
                  setSuccessFilter('');
                  setDateRange([null, null]);
                }}
              >
                Clear Filters
              </Button>
            </Group>
          </Stack>
        </Paper>

        {/* Audit Log Table */}
        {filteredLogs.length === 0 ? (
          <Alert icon={<IconInfoCircle size={16} />} color="blue">
            No audit logs found matching the current filters.
          </Alert>
        ) : (
          <>
            <ScrollArea>
              <Table striped highlightOnHover>
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
                        <Text size="xs" family="monospace">
                          {formatTimestamp(log.timestamp)}
                        </Text>
                      </Table.Td>
                      
                      <Table.Td>
                        <Badge
                          size="sm"
                          color={getSeverityColor(log.severity)}
                          variant="light"
                        >
                          {log.severity.toUpperCase()}
                        </Badge>
                      </Table.Td>
                      
                      <Table.Td>
                        <Text size="sm" fw={500}>
                          {log.action}
                        </Text>
                      </Table.Td>
                      
                      <Table.Td>
                        <Text size="sm">{log.modelName}</Text>
                        {log.recordId && (
                          <Text size="xs" c="dimmed">
                            ID: {log.recordId}
                          </Text>
                        )}
                      </Table.Td>
                      
                      <Table.Td>
                        {log.fieldName && (
                          <Text size="sm" family="monospace">
                            {log.fieldName}
                          </Text>
                        )}
                      </Table.Td>
                      
                      <Table.Td>
                        <Text size="sm" family="monospace">
                          {log.userId}
                        </Text>
                      </Table.Td>
                      
                      <Table.Td>
                        <Badge
                          size="sm"
                          color={getSuccessColor(log.success)}
                          variant="light"
                        >
                          {log.success ? 'Success' : 'Failed'}
                        </Badge>
                      </Table.Td>
                      
                      <Table.Td>
                        <Text size="xs" family="monospace">
                          {log.ipAddress || '-'}
                        </Text>
                      </Table.Td>
                      
                      <Table.Td>
                        {log.error && (
                          <Tooltip label={log.error}>
                            <ActionIcon size="sm" variant="light" color="red">
                              <IconAlertTriangle size={12} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                        {(log.oldValue || log.newValue) && (
                          <Tooltip label="Value changed">
                            <ActionIcon size="sm" variant="light" color="blue">
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
                  value={currentPage}
                  onChange={setCurrentPage}
                  total={totalPages}
                  size="sm"
                />
              </Group>
            )}

            <Text size="xs" c="dimmed" ta="center">
              Showing {startIndex + 1}-{Math.min(startIndex + pageSize, filteredLogs.length)} of {filteredLogs.length} events
            </Text>
          </>
        )}
      </Stack>
    </Card>
  );
}