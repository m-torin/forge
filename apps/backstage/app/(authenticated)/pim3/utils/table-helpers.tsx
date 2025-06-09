import { Center, Group, rem, Table, Text, UnstyledButton } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconChevronDown, IconChevronUp, IconSelector } from '@tabler/icons-react';

/**
 * Reusable table header component with sorting functionality
 */
interface ThProps {
  children: React.ReactNode;
  onSort(): void;
  reversed: boolean;
  sorted: boolean;
}

export function Th({ children, onSort, reversed, sorted }: ThProps) {
  const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector;
  return (
    <Table.Th>
      <UnstyledButton onClick={onSort} style={{ width: '100%' }}>
        <Group justify="space-between">
          <Text fw={500} fz="sm">
            {children}
          </Text>
          <Center>
            <Icon stroke={1.5} style={{ width: rem(16), height: rem(16) }} />
          </Center>
        </Group>
      </UnstyledButton>
    </Table.Th>
  );
}

/**
 * Custom hook that extends Mantine's useForm for table state management
 */
export function useTableForm<T extends Record<string, any>>(additionalValues: Partial<T> = {}) {
  const defaultTableValues = {
    page: 1,
    reverseSortDirection: false,
    search: '',
    selectedRows: [] as string[],
    sortBy: null as string | null,
    ...additionalValues,
  };

  const form = useForm<T>({
    initialValues: {
      ...defaultTableValues,
      ...additionalValues,
    } as T,
  });

  const setSorting = (field: string) => {
    const reversed = field === form.values.sortBy ? !form.values.reverseSortDirection : false;
    form.setFieldValue('reverseSortDirection' as any, reversed);
    form.setFieldValue('sortBy' as any, field);
  };

  const toggleAllRows = (ids: string[], checked: boolean) => {
    if (checked) {
      form.setFieldValue('selectedRows' as any, ids);
    } else {
      form.setFieldValue('selectedRows' as any, []);
    }
  };

  const toggleRow = (id: string, checked: boolean) => {
    const selectedRows = form.values.selectedRows as string[];
    if (checked) {
      form.setFieldValue('selectedRows' as any, [...selectedRows, id]);
    } else {
      form.setFieldValue(
        'selectedRows' as any,
        selectedRows.filter((rowId) => rowId !== id),
      );
    }
  };

  return {
    ...form,
    setSorting,
    toggleAllRows,
    toggleRow,
  };
}

/**
 * Generic sort function for table data
 */
export function sortTableData<T extends Record<string, any>>(
  data: T[],
  sortBy: keyof T | null,
  reverse: boolean,
): T[] {
  if (!sortBy) return data;

  return [...data].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return reverse ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return reverse ? bValue - aValue : aValue - bValue;
    }

    if (aValue instanceof Date && bValue instanceof Date) {
      return reverse ? bValue.getTime() - aValue.getTime() : aValue.getTime() - bValue.getTime();
    }

    return 0;
  });
}

/**
 * Helper function to get checkbox props for select all functionality
 */
export function getSelectAllCheckboxProps<T extends { selectedRows: string[] }>(
  form: T,
  totalRows: number,
) {
  const selectedRows = form.selectedRows || [];
  const selectedCount = selectedRows.length;
  return {
    checked: selectedCount === totalRows && totalRows > 0,
    indeterminate: selectedCount > 0 && selectedCount < totalRows,
  };
}

/**
 * Helper function to set sorting on a form
 */
export function setSorting<T extends { sortBy: string | null; reverseSortDirection: boolean }>(
  form: any,
  field: string,
) {
  const reversed = field === form.values.sortBy ? !form.values.reverseSortDirection : false;
  form.setFieldValue('reverseSortDirection', reversed);
  form.setFieldValue('sortBy', field);
}

/**
 * Helper function to toggle all row selection
 */
export function toggleAllRows<T extends { selectedRows: string[] }>(
  form: any,
  ids: string[],
  checked: boolean,
) {
  if (checked) {
    form.setFieldValue('selectedRows', ids);
  } else {
    form.setFieldValue('selectedRows', []);
  }
}

/**
 * Helper function to toggle single row selection
 */
export function toggleRowSelection<T extends { selectedRows: string[] }>(
  form: any,
  id: string,
  checked: boolean,
) {
  const selectedRows = (form.values.selectedRows as string[]) || [];
  if (checked) {
    form.setFieldValue('selectedRows', [...selectedRows, id]);
  } else {
    form.setFieldValue(
      'selectedRows',
      selectedRows.filter((rowId) => rowId !== id),
    );
  }
}
