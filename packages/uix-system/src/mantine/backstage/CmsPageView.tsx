'use client';

import { Button, Group, SegmentedControl, Stack } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { ReactNode, useState } from 'react';

type ViewMode = 'list' | 'bulk-edit';

export interface CmsPageViewProps<_T = any> {
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ size?: number }>;
  viewModes?: Array<{
    label: string;
    value: ViewMode;
  }>;
  defaultViewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onAdd?: () => void;
  onBulkDelete?: (ids: string[]) => void;
  addButtonLabel?: string;
  bulkDeleteButtonLabel?: string;
  actions?: ReactNode;
  children?: ReactNode;
  listTableComponent?: ReactNode;
  bulkEditTableComponent?: ReactNode;
  'data-testid'?: string;
}

export function CmsPageView<T = any>({
  viewModes = [
    { label: 'List View', value: 'list' },
    { label: 'Bulk Edit', value: 'bulk-edit' },
  ],
  defaultViewMode = 'list',
  onViewModeChange,
  selectedIds = [],
  onSelectionChange: _onSelectionChange,
  onAdd,
  onBulkDelete,
  addButtonLabel = 'Add New',
  bulkDeleteButtonLabel = 'Delete Selected',
  actions,
  children,
  listTableComponent,
  bulkEditTableComponent,
  'data-testid': testId,
}: CmsPageViewProps<T>) {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode);

  const handleViewModeChange = (mode: string) => {
    const viewMode = mode as ViewMode;
    setViewMode(viewMode);
    onViewModeChange?.(viewMode);
  };

  const handleBulkDeleteClick = async () => {
    if (selectedIds.length > 0 && onBulkDelete) {
      await onBulkDelete(selectedIds);
    }
  };

  return (
    <Stack gap="md" data-testid={testId}>
      <Group justify="space-between">
        <SegmentedControl
          value={viewMode}
          onChange={handleViewModeChange}
          data={viewModes}
          data-testid="view-mode-control"
        />

        <Group>
          {viewMode === 'bulk-edit' && selectedIds.length > 0 && onBulkDelete && (
            <Button
              leftSection={<IconTrash size={16} />}
              variant="light"
              color="red"
              onClick={handleBulkDeleteClick}
              data-testid="bulk-delete-button"
            >
              {bulkDeleteButtonLabel} ({selectedIds.length})
            </Button>
          )}

          {onAdd && (
            <Button leftSection={<IconPlus size={16} />} onClick={onAdd} data-testid="add-button">
              {addButtonLabel}
            </Button>
          )}

          {actions}
        </Group>
      </Group>

      {children}

      {viewMode === 'list' && listTableComponent}
      {viewMode === 'bulk-edit' && bulkEditTableComponent}
    </Stack>
  );
}
