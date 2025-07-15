'use client';

import React, { useRef, ReactNode, useState } from 'react';
import {
  DataTable,
  DataTableSortStatus,
  DataTableRowExpansionProps,
  DataTableColumn,
} from 'mantine-datatable';
import { useForm, UseFormReturnType } from '@mantine/form';
import { useUncontrolled } from '@mantine/hooks';
import { logInfo, logError } from '@repo/observability';
import {
  Box,
  Text,
  Badge,
  Stack,
  Group,
  Button,
  TextInput,
  Grid,
  Textarea,
  LoadingOverlay,
  Center,
  Paper,
  Container,
  MantineColor,
} from '@mantine/core';
import { IconCheck, IconArrowBackUp } from '@tabler/icons-react';

// --------------------
// Generic Types
// --------------------
export interface BaseRecord {
  id: string | number;
}

export interface StatusConfig {
  value: string;
  color: MantineColor;
  label: string;
}

export interface DetailField {
  label: string;
  value: string | number;
  span?: number;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea';
  span?: {
    base: number;
    xs?: number;
  };
}

// --------------------
// Reusable Components
// --------------------
export const StatusBadge = ({
  status,
  config,
}: {
  status: string;
  config: Record<string, StatusConfig>;
}): React.JSX.Element => (
  <Badge c={config[status]?.color || 'gray'} variant="light">
    {config[status]?.label || status}
  </Badge>
);

export const DetailsViewer = ({
  loading,
  error,
  fields,
  onEdit,
  extraContent,
}: {
  loading: boolean;
  error: string | null;
  fields: DetailField[][];
  onEdit?: () => void;
  extraContent?: ReactNode;
}): React.JSX.Element => {
  if (error) {
    return (
      <Center p="md" style={{ color: 'red' }}>
        {error}
      </Center>
    );
  }

  return (
    <Box p="md">
      <LoadingOverlay visible={loading} />
      <Stack>
        {fields.map((fieldGroup, groupIndex) => (
          <Group key={`group-${JSON.stringify(fieldGroup.map(f => f.label || f.value).slice(0, 3))}`}>
            {fieldGroup.map((field) => (
              <Box key={`field-${field.label || field.value || Math.random()}`} style={{ flex: field.span ?? 1 }}>
                <Text c="gray.6" size="sm" fw={500}>
                  {field.label}
                </Text>
                <Text size="sm">{field.value}</Text>
              </Box>
            ))}
            {groupIndex === 0 && onEdit && (
              <Button size="xs" onClick={onEdit}>
                Edit
              </Button>
            )}
          </Group>
        ))}
        {extraContent}
      </Stack>
    </Box>
  );
};

export const FormEditor = <TFormValues extends Record<string, any>>({
  initialValues,
  fields,
  onSubmit,
  onCancel,
}: {
  initialValues: TFormValues;
  fields: FormField[];
  onSubmit: (values: TFormValues) => void;
  onCancel: () => void;
}): React.JSX.Element => {
  const form: UseFormReturnType<TFormValues> = useForm<TFormValues>({
    initialValues,
  });

  return (
    <Box p="md">
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Grid gutter="md">
          {fields.map((field) => (
            <Grid.Col
              key={`edit-field-${field.label || field.name || Math.random()}`}
              span={{ base: field.span?.base ?? 12, ...(field.span?.xs !== undefined && { xs: field.span.xs }) }}
            >
              {field.type === 'textarea' ? (
                <Textarea
                  label={field.label}
                  size="xs"
                  {...form.getInputProps(field.name)}
                  minRows={2}
                />
              ) : (
                <TextInput
                  label={field.label}
                  size="xs"
                  {...form.getInputProps(field.name)}
                />
              )}
            </Grid.Col>
          ))}
          <Grid.Col span={12}>
            <Group mt="md">
              <Button
                variant="default"
                size="xs"
                leftSection={<IconArrowBackUp size={16} />}
                onClick={onCancel}
                type="button"
              >
                Cancel
              </Button>
              <Button
                size="xs"
                leftSection={<IconCheck size={16} />}
                type="submit"
              >
                Save
              </Button>
            </Group>
          </Grid.Col>
        </Grid>
      </form>
    </Box>
  );
};

// --------------------
// Enhanced Data Table Component
// --------------------
export const EnhancedDataTable = <T extends BaseRecord>({
  records,
  columns,
  loading,
  page,
  totalRecords,
  pageSize,
  sortStatus,
  expandedContent,
  onLoadMore,
  onReset,
  onEdit: _onEdit,
  onSort,
  onSearch,
  searchValue,
}: {
  records: T[];
  columns: DataTableColumn<T>[];
  loading: boolean;
  page: number;
  totalRecords: number;
  pageSize: number;
  sortStatus: DataTableSortStatus<T>;
  expandedContent?: (record: T, onCollapse: () => void) => ReactNode;
  onLoadMore: () => void;
  onReset: () => void;
  onEdit?: (record: T) => void;
  onSort: (status: DataTableSortStatus<T>) => void;
  onSearch?: (value: string) => void;
  searchValue?: string;
}): React.JSX.Element => {
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const [expandedRecordIds, setExpandedRecordIds] = useUncontrolled<number[]>({
    value: [],
    defaultValue: [],
    finalValue: [],
    onChange: (_ids: number[]) => {
      // Additional onChange logic if needed
    },
  });

  const rowExpansionConfig: DataTableRowExpansionProps<T> | undefined =
    expandedContent
      ? {
          allowMultiple: true,
          expanded: {
            recordIds: expandedRecordIds,
            onRecordIdsChange: (ids: unknown[]) =>
              setExpandedRecordIds(ids as number[]),
          },
          content: ({ record, collapse }) => expandedContent(record, collapse),
        }
      : undefined;

  return (
    <Stack className="w-full">
      {onSearch && (
        <TextInput
          placeholder="Search..."
          value={searchValue}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            onSearch(event.currentTarget.value)
          }
          mb="md"
        />
      )}
      <DataTable<T>
        withTableBorder={false}
        borderRadius="sm"
        withColumnBorders
        striped
        highlightOnHover
        minHeight={180}
        records={records}
        columns={columns}
        noRecordsText="No records found"
        noRecordsIcon={
          records.length === 0 && !loading ? (
            <Box ta="center" p="xl">
              No records found
            </Box>
          ) : undefined
        }
        {...(rowExpansionConfig && { rowExpansion: rowExpansionConfig })}
        totalRecords={totalRecords}
        recordsPerPage={pageSize}
        page={page}
        onPageChange={() => {}}
        sortStatus={sortStatus}
        {...(onSort && { onSortStatusChange: onSort })}
        {...(onLoadMore && { onScrollToBottom: onLoadMore })}
        scrollViewportRef={scrollViewportRef}
        fetching={loading}
        loaderType="oval"
        loaderSize="lg"
        loaderColor="blue"
        loaderBackgroundBlur={1}
        onRecordsPerPageChange={() => {}}
        recordsPerPageOptions={[10, 20, 50]}
      />
      <Paper p="md" withBorder>
        <Group gap="apart">
          <Text size="sm">
            Showing {records.length} records{loading && ', loading more...'}
          </Text>
          <Button variant="light" onClick={onReset}>
            Reset records
          </Button>
        </Group>
      </Paper>
    </Stack>
  );
};

// --------------------
// Entity Table Component
// --------------------
export const EntityTable = <T extends BaseRecord>({
  records,
  columns,
  loading,
  page = 1,
  totalRecords = 0,
  pageSize = 10,
  sortStatus,
  expandedContent,
  onLoadMore,
  onReset,
  onEdit: _onEdit2,
  onSort,
  onSearch,
  searchValue = '',
  sortable: _sortable = true,
  searchable = true,
}: {
  records: T[];
  columns: DataTableColumn<T>[];
  loading: boolean;
  page?: number;
  totalRecords?: number;
  pageSize?: number;
  sortStatus: DataTableSortStatus<T>; // Made required
  expandedContent?: (record: T, onCollapse: () => void) => ReactNode;
  onLoadMore?: () => void;
  onReset: () => void;
  onEdit?: (record: T) => void;
  onSort?: (status: DataTableSortStatus<T>) => void;
  onSearch?: (value: string) => void;
  searchValue?: string;
  sortable?: boolean;
  searchable?: boolean;
}): React.JSX.Element => {
  const [expandedRecordIds, setExpandedRecordIds] = useState<number[]>([]);

  const rowExpansionConfig: DataTableRowExpansionProps<T> | undefined =
    expandedContent
      ? {
          allowMultiple: false,
          expanded: {
            recordIds: expandedRecordIds,
            onRecordIdsChange: (ids: unknown[]) =>
              setExpandedRecordIds(ids as number[]),
          },
          content: ({ record, collapse }) => expandedContent(record, collapse),
          collapseProps: {
            transitionDuration: 200,
            animateOpacity: true,
          },
        }
      : undefined;

  const handlePageChange = (newPage: number) => {
    // Implement page change logic if needed
    logInfo('Page changed to', { newPage });
  };

  return (
    <Container size="lg" my="lg">
      {searchable && onSearch && (
        <TextInput
          placeholder="Search..."
          value={searchValue}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            onSearch(event.currentTarget.value)
          }
          mb="md"
        />
      )}
      <DataTable<T>
        withTableBorder={false}
        borderRadius="sm"
        withColumnBorders
        striped
        highlightOnHover
        minHeight={180}
        records={records}
        columns={columns}
        idAccessor="id"
        onPageChange={handlePageChange}
        noRecordsText="No records found"
        {...(rowExpansionConfig && { rowExpansion: rowExpansionConfig })}
        totalRecords={totalRecords}
        recordsPerPage={pageSize}
        page={page}
        sortStatus={sortStatus}
        {...(onSort && { onSortStatusChange: onSort })}
        {...(onLoadMore && { onScrollToBottom: onLoadMore })}
        fetching={loading}
        loaderType="oval"
        loaderSize="lg"
        loaderColor="blue"
        loaderBackgroundBlur={1}
        onRecordsPerPageChange={() => {}}
        recordsPerPageOptions={[10, 20, 50]}
      />
      <Paper p="md" withBorder>
        <Group gap="apart">
          <Text size="sm">
            Showing {records.length} records{loading && ', loading more...'}
          </Text>
          <Button variant="light" onClick={onReset}>
            Reset records
          </Button>
        </Group>
      </Paper>
    </Container>
  );
};

// --------------------
// Generic Data Fetching
// --------------------
export const fetchData = async <T,>(
  page: number,
  pageSize: number,
  generateMockData: (index: number) => T,
): Promise<T[]> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return Array.from({ length: pageSize }, (_, index) =>
      generateMockData(page * pageSize + index),
    );
  } catch (error) {
    logError('Error fetching data', { error });
    return [];
  }
};

export const fetchDetails = async <T,>(
  id: number,
  generateMockDetails: () => T,
): Promise<T | Error> => {
  try {
    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * 1000 + 500),
    );
    return generateMockDetails();
  } catch (error) {
    return error instanceof Error ? error : new Error('Unknown error occurred');
  }
};

// --------------------
// Generic Search and Filter Utility
// --------------------
export const filterRecords = <T extends Record<string, any>>(
  records: T[],
  searchValue: string,
  searchFields: (keyof T)[],
): T[] => {
  const lowercasedSearch = searchValue.toLowerCase();
  return records.filter((record) =>
    searchFields.some((field) =>
      String(record[field]).toLowerCase().includes(lowercasedSearch),
    ),
  );
};
