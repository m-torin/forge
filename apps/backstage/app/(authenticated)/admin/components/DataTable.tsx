'use client';

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Checkbox,
  Flex,
  Group,
  Menu,
  Pagination,
  ScrollArea,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import {
  IconDownload,
  IconEdit,
  IconEye,
  IconPlus,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { notify } from '@repo/notifications/mantine-notifications';
import { downloadFile } from './ExportHandler';
import { DeleteConfirmation } from './DeleteConfirmation';
import { BulkOperations } from './BulkOperations';
import type { ModelConfig } from '../lib/model-config';

interface Column {
  key: string;
  label: string;
  render?: (value: any, record: any) => React.ReactNode;
  sortable?: boolean;
  width?: string | number;
}

interface DataTableProps {
  columns: Column[];
  createHref?: string;
  data: {
    records: any[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  editHref?: (id: string) => string;
  modelName: string;
  modelConfig?: ModelConfig;
  modelKey?: string; // For fetching cascade info
  onBulkDelete?: (ids: string[]) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onExport?: (
    format: 'json' | 'csv',
  ) => Promise<{ content: string; filename: string; mimeType: string } | void>;
  onRefresh?: () => void;
  searchKeys?: string[];
  showBulkOperations?: boolean;
  viewHref?: (id: string) => string;
}

export function DataTable({
  columns,
  createHref,
  data,
  editHref,
  modelName,
  modelConfig,
  modelKey,
  onBulkDelete,
  onDelete,
  onExport,
  onRefresh,
  searchKeys = ['name', 'email', 'title'],
  showBulkOperations = true,
  viewHref,
}: DataTableProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredRecords = data.records.filter((record) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return searchKeys.some((key) => {
      const value = record[key];
      return value && value.toString().toLowerCase().includes(searchLower);
    });
  });

  const handleDelete = async (id: string, recordName?: string) => {
    if (!onDelete) return;

    modals.openConfirmModal({
      title: `Delete ${modelName}`,
      centered: true,
      size: 'lg',
      children: modelKey ? (
        <DeleteConfirmation modelName={modelKey} recordId={id} recordName={recordName} />
      ) : (
        <Text size="sm">
          Are you sure you want to delete{' '}
          {recordName ? <strong>{recordName}</strong> : 'this record'}? This action cannot be
          undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        setDeletingId(id);
        startTransition(async () => {
          try {
            await onDelete(id);
            notify.success('Record deleted successfully');
            setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
          } catch (error) {
            notify.error('Failed to delete record');
          } finally {
            setDeletingId(null);
          }
        });
      },
    });
  };

  const handleBulkDelete = async () => {
    if (!onBulkDelete || selectedIds.length === 0) return;

    modals.openConfirmModal({
      title: 'Delete Multiple Records',
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete {selectedIds.length} selected records? This action cannot
          be undone.
        </Text>
      ),
      labels: { confirm: 'Delete All', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        startTransition(async () => {
          try {
            await onBulkDelete(selectedIds);
            notify.success(`${selectedIds.length} records deleted successfully`);
            setSelectedIds([]);
          } catch (error) {
            notify.error('Failed to delete records');
          }
        });
      },
    });
  };

  const handleExport = async (format: 'json' | 'csv') => {
    if (!onExport) return;

    startTransition(async () => {
      try {
        const result = await onExport(format);
        if (result && 'content' in result) {
          downloadFile(result.content, result.filename, result.mimeType);
          notify.success(`Export completed - ${result.filename}`);
        } else {
          notify.success(`Export completed`);
        }
      } catch (error) {
        notify.error('Failed to export data');
      }
    });
  };

  const allSelected =
    filteredRecords.length > 0 &&
    filteredRecords.every((record) => selectedIds.includes(record.id));
  const indeterminate = selectedIds.length > 0 && !allSelected;

  // Get selected records for bulk operations
  const selectedRecords = data.records.filter(record => selectedIds.includes(record.id));

  return (
    <>
      {/* Bulk Operations */}
      {showBulkOperations && modelConfig && (
        <BulkOperations
          modelName={modelName}
          modelConfig={modelConfig}
          selectedRecords={selectedRecords}
          onSelectionChange={setSelectedIds}
          onRefresh={onRefresh || (() => window.location.reload())}
        />
      )}

      <Card withBorder>
      <Flex align="center" gap="md" justify="space-between" mb="md" wrap="wrap">
        <Group>
          <TextInput
            leftSection={<IconSearch size={16} />}
            onChange={(e) => setSearch(e.currentTarget.value)}
            placeholder={`Search ${modelName}...`}
            style={{ width: 300 }}
            value={search}
          />
          {selectedIds.length > 0 && (
            <Badge color="blue" variant="filled">
              {selectedIds.length} selected
            </Badge>
          )}
        </Group>

        <Group>
          {selectedIds.length > 0 && onBulkDelete && (
            <Button
              color="red"
              leftSection={<IconTrash size={16} />}
              loading={isPending}
              onClick={handleBulkDelete}
              size="sm"
              variant="light"
            >
              Delete Selected
            </Button>
          )}

          {onExport && (
            <Menu width={200} shadow="md">
              <Menu.Target>
                <Button
                  leftSection={<IconDownload size={16} />}
                  loading={isPending}
                  size="sm"
                  variant="light"
                >
                  Export
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={() => handleExport('json')}>Export as JSON</Menu.Item>
                <Menu.Item onClick={() => handleExport('csv')}>Export as CSV</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}

          {createHref && (
            <Button
              href={createHref}
              component={Link}
              leftSection={<IconPlus size={16} />}
              size="sm"
            >
              Create {modelName}
            </Button>
          )}
        </Group>
      </Flex>

      <ScrollArea>
        <Table highlightOnHover striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: 40 }}>
                <Checkbox
                  onChange={(e) => {
                    if (e.currentTarget.checked) {
                      setSelectedIds(filteredRecords.map((r) => r.id));
                    } else {
                      setSelectedIds([]);
                    }
                  }}
                  checked={allSelected}
                  indeterminate={indeterminate}
                />
              </Table.Th>
              {columns.map((column) => (
                <Table.Th key={column.key} style={{ width: column.width }}>
                  {column.label}
                </Table.Th>
              ))}
              <Table.Th style={{ width: 100 }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredRecords.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={columns.length + 2}>
                  <Text c="dimmed" py="xl" ta="center">
                    No records found
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              filteredRecords.map((record) => (
                <Table.Tr key={record.id}>
                  <Table.Td>
                    <Checkbox
                      onChange={(e) => {
                        if (e.currentTarget.checked) {
                          setSelectedIds([...selectedIds, record.id]);
                        } else {
                          setSelectedIds(selectedIds.filter((id) => id !== record.id));
                        }
                      }}
                      checked={selectedIds.includes(record.id)}
                    />
                  </Table.Td>
                  {columns.map((column) => (
                    <Table.Td key={column.key}>
                      {column.render
                        ? column.render(record[column.key], record)
                        : record[column.key] || '-'}
                    </Table.Td>
                  ))}
                  <Table.Td>
                    <Group gap={4} wrap="nowrap">
                      {viewHref && (
                        <ActionIcon
                          href={viewHref(record.id)}
                          color="blue"
                          component={Link}
                          size="sm"
                          variant="subtle"
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                      )}
                      {editHref && (
                        <ActionIcon
                          href={editHref(record.id)}
                          color="gray"
                          component={Link}
                          size="sm"
                          variant="subtle"
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                      )}
                      {onDelete && (
                        <ActionIcon
                          color="red"
                          loading={deletingId === record.id}
                          onClick={() => {
                            const recordName =
                              record.name ||
                              record.title ||
                              record.email ||
                              record.barcode ||
                              record.type ||
                              undefined;
                            handleDelete(record.id, recordName);
                          }}
                          size="sm"
                          variant="subtle"
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      {data.pages > 1 && (
        <Flex justify="center" mt="xl">
          <Pagination
            onChange={(page) => {
              const params = new URLSearchParams(window.location.search);
              params.set('page', page.toString());
              router.push(`${window.location.pathname}?${params.toString()}`);
            }}
            total={data.pages}
            value={data.page}
          />
        </Flex>
      )}
    </Card>
    </>
  );
}
