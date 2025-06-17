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
    } as unknown as T,
  });

  const setSorting = (field: string) => {
    const reversed =
      field === (form.values as any).sortBy ? !(form.values as any).reverseSortDirection : false;
    form.setFieldValue('reverseSortDirection' as any, reversed as any);
    form.setFieldValue('sortBy' as any, field as any);
  };

  const toggleAllRows = (ids: string[], checked: boolean) => {
    if (checked) {
      form.setFieldValue('selectedRows' as any, ids as any);
    } else {
      form.setFieldValue('selectedRows' as any, [] as any);
    }
  };

  const toggleRow = (id: string, checked: boolean) => {
    const selectedRows = ((form.values as any).selectedRows as string[]) || [];
    if (checked) {
      form.setFieldValue('selectedRows' as any, [...selectedRows, id] as any);
    } else {
      form.setFieldValue(
        'selectedRows' as any,
        selectedRows.filter((rowId) => rowId !== id) as any,
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

    if (
      aValue &&
      typeof aValue === 'object' &&
      'getTime' in aValue &&
      bValue &&
      typeof bValue === 'object' &&
      'getTime' in bValue
    ) {
      return reverse
        ? (bValue as Date).getTime() - (aValue as Date).getTime()
        : (aValue as Date).getTime() - (bValue as Date).getTime();
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
