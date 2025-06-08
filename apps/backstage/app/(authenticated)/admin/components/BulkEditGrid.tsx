'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  Checkbox,
  Group,
  NumberInput,
  Paper,
  ScrollArea,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
  ActionIcon,
  Badge,
  Loader,
  Modal,
  Alert,
  Progress,
  Menu,
  MultiSelect,
  Textarea,
  Switch,
} from '@mantine/core';
import {
  IconTableExport,
  IconTableImport,
  IconDeviceFloppy,
  IconX,
  IconCheck,
  IconAlertCircle,
  IconCopy,
  IconClipboard,
  IconTrash,
  IconEdit,
  IconFilter,
  IconColumns,
  IconArrowsSort,
  IconRefresh,
} from '@tabler/icons-react';
import { useHotkeys, useMediaQuery } from '@mantine/hooks';
import { modals } from '@mantine/modals';

import { notify } from '@repo/notifications/mantine-notifications';

interface GridColumn {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean' | 'date' | 'readonly';
  width?: number;
  options?: { value: string; label: string }[];
  editable?: boolean;
  required?: boolean;
  validation?: (value: any) => string | null;
  format?: (value: any) => string;
  parse?: (value: string) => any;
}

interface GridRow {
  id: string;
  [key: string]: any;
}

interface BulkEditGridProps {
  title: string;
  columns: GridColumn[];
  data: GridRow[];
  onSave?: (changes: GridRow[]) => Promise<void>;
  onDelete?: (ids: string[]) => Promise<void>;
  loading?: boolean;
  // Features
  enableCopy?: boolean;
  enablePaste?: boolean;
  enableUndo?: boolean;
  enableColumnFilter?: boolean;
  enableExport?: boolean;
  enableImport?: boolean;
  maxRows?: number;
  // Callbacks
  onCellChange?: (rowId: string, columnKey: string, value: any) => void;
  onRowSelect?: (selectedIds: string[]) => void;
}

interface CellPosition {
  row: number;
  col: number;
}

interface ChangeHistory {
  rowId: string;
  columnKey: string;
  oldValue: any;
  newValue: any;
}

export function BulkEditGrid({
  title,
  columns,
  data,
  onSave,
  onDelete,
  loading = false,
  enableCopy = true,
  enablePaste = true,
  enableUndo = true,
  enableColumnFilter = true,
  enableExport = true,
  enableImport = true,
  maxRows = 1000,
  onCellChange,
  onRowSelect,
}: BulkEditGridProps) {
  const [gridData, setGridData] = useState<GridRow[]>(data);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [activeCell, setActiveCell] = useState<CellPosition | null>(null);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [changeHistory, setChangeHistory] = useState<ChangeHistory[]>([]);
  const [redoHistory, setRedoHistory] = useState<ChangeHistory[]>([]);
  const [modifiedCells, setModifiedCells] = useState<Set<string>>(new Set());
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.map((c) => c.key)),
  );
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(
    null,
  );
  const [filterModalOpened, setFilterModalOpened] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const gridRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Responsive
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  // Update grid data when prop changes
  useEffect(() => {
    setGridData(data);
  }, [data]);

  // Visible columns for rendering
  const visibleColumnsList = columns.filter((col) => visibleColumns.has(col.key));

  // Calculate cell key
  const getCellKey = (rowId: string, columnKey: string) => `${rowId}-${columnKey}`;

  // Handle cell selection
  const handleCellClick = (rowIndex: number, colIndex: number, event: React.MouseEvent) => {
    const cellKey = getCellKey(gridData[rowIndex].id, visibleColumnsList[colIndex].key);

    if (event.shiftKey && activeCell) {
      // Range selection
      const startRow = Math.min(activeCell.row, rowIndex);
      const endRow = Math.max(activeCell.row, rowIndex);
      const startCol = Math.min(activeCell.col, colIndex);
      const endCol = Math.max(activeCell.col, colIndex);

      const newSelection = new Set<string>();
      for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
          if (r < gridData.length && c < visibleColumnsList.length) {
            newSelection.add(getCellKey(gridData[r].id, visibleColumnsList[c].key));
          }
        }
      }
      setSelectedCells(newSelection);
    } else if (event.ctrlKey || event.metaKey) {
      // Multi-select
      const newSelection = new Set(selectedCells);
      if (newSelection.has(cellKey)) {
        newSelection.delete(cellKey);
      } else {
        newSelection.add(cellKey);
      }
      setSelectedCells(newSelection);
    } else {
      // Single select
      setSelectedCells(new Set([cellKey]));
      setActiveCell({ row: rowIndex, col: colIndex });
    }
  };

  // Handle cell editing
  const handleCellDoubleClick = (rowId: string, columnKey: string) => {
    const column = columns.find((c) => c.key === columnKey);
    if (column?.editable !== false && column?.type !== 'readonly') {
      setEditingCell(getCellKey(rowId, columnKey));
    }
  };

  // Handle cell value change
  const handleCellValueChange = (rowId: string, columnKey: string, newValue: any) => {
    const rowIndex = gridData.findIndex((row) => row.id === rowId);
    if (rowIndex === -1) return;

    const oldValue = gridData[rowIndex][columnKey];
    if (oldValue === newValue) return;

    // Add to history
    setChangeHistory((prev) => [...prev, { rowId, columnKey, oldValue, newValue }]);
    setRedoHistory([]);

    // Update data
    const newData = [...gridData];
    newData[rowIndex] = { ...newData[rowIndex], [columnKey]: newValue };
    setGridData(newData);

    // Mark as modified
    setModifiedCells((prev) => new Set(prev).add(getCellKey(rowId, columnKey)));

    // Close editing
    setEditingCell(null);

    // Callback
    onCellChange?.(rowId, columnKey, newValue);
  };

  // Undo/Redo
  const handleUndo = () => {
    if (changeHistory.length === 0) return;

    const lastChange = changeHistory[changeHistory.length - 1];
    const rowIndex = gridData.findIndex((row) => row.id === lastChange.rowId);
    if (rowIndex === -1) return;

    // Revert change
    const newData = [...gridData];
    newData[rowIndex] = { ...newData[rowIndex], [lastChange.columnKey]: lastChange.oldValue };
    setGridData(newData);

    // Update history
    setChangeHistory((prev) => prev.slice(0, -1));
    setRedoHistory((prev) => [...prev, lastChange]);

    // Update modified cells
    const cellKey = getCellKey(lastChange.rowId, lastChange.columnKey);
    const isStillModified = changeHistory
      .slice(0, -1)
      .some((change) => getCellKey(change.rowId, change.columnKey) === cellKey);
    if (!isStillModified) {
      setModifiedCells((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cellKey);
        return newSet;
      });
    }
  };

  const handleRedo = () => {
    if (redoHistory.length === 0) return;

    const change = redoHistory[redoHistory.length - 1];
    const rowIndex = gridData.findIndex((row) => row.id === change.rowId);
    if (rowIndex === -1) return;

    // Apply change
    const newData = [...gridData];
    newData[rowIndex] = { ...newData[rowIndex], [change.columnKey]: change.newValue };
    setGridData(newData);

    // Update history
    setRedoHistory((prev) => prev.slice(0, -1));
    setChangeHistory((prev) => [...prev, change]);
    setModifiedCells((prev) => new Set(prev).add(getCellKey(change.rowId, change.columnKey)));
  };

  // Copy/Paste
  const handleCopy = () => {
    if (selectedCells.size === 0) return;

    const cellData: any[][] = [];
    const selectedArray = Array.from(selectedCells);

    // Group by row
    const rowMap = new Map<string, any[]>();
    selectedArray.forEach((cellKey) => {
      const [rowId, columnKey] = cellKey.split('-');
      const row = gridData.find((r) => r.id === rowId);
      if (row) {
        if (!rowMap.has(rowId)) rowMap.set(rowId, []);
        rowMap.get(rowId)!.push(row[columnKey]);
      }
    });

    // Convert to clipboard format
    const clipboardText = Array.from(rowMap.values())
      .map((row) => row.join('\t'))
      .join('\n');

    navigator.clipboard.writeText(clipboardText);
    notify.success('Copied to clipboard');
  };

  const handlePaste = async () => {
    if (!activeCell || !enablePaste) return;

    try {
      const text = await navigator.clipboard.readText();
      const rows = text.split('\n').map((row) => row.split('\t'));

      rows.forEach((rowData, rowOffset) => {
        rowData.forEach((cellValue, colOffset) => {
          const targetRow = activeCell.row + rowOffset;
          const targetCol = activeCell.col + colOffset;

          if (targetRow < gridData.length && targetCol < visibleColumnsList.length) {
            const rowId = gridData[targetRow].id;
            const columnKey = visibleColumnsList[targetCol].key;
            const column = columns.find((c) => c.key === columnKey);

            if (column?.editable !== false && column?.type !== 'readonly') {
              // Parse value based on column type
              let parsedValue = cellValue;
              if (column.parse) {
                parsedValue = column.parse(cellValue);
              } else if (column.type === 'number') {
                parsedValue = parseFloat(cellValue) || 0;
              } else if (column.type === 'boolean') {
                parsedValue = cellValue.toLowerCase() === 'true';
              }

              handleCellValueChange(rowId, columnKey, parsedValue);
            }
          }
        });
      });

      notify.success('Pasted from clipboard');
    } catch (error) {
      notify.error('Failed to paste from clipboard');
    }
  };

  // Keyboard navigation
  useHotkeys([
    ['mod+z', handleUndo],
    ['mod+shift+z', handleRedo],
    ['mod+c', handleCopy],
    ['mod+v', handlePaste],
    ['escape', () => setEditingCell(null)],
  ]);

  // Save changes
  const handleSave = async () => {
    if (!onSave || modifiedCells.size === 0) return;

    setIsPending(true);
    try {
      // Get modified rows
      const modifiedRows = new Set<string>();
      modifiedCells.forEach((cellKey) => {
        const [rowId] = cellKey.split('-');
        modifiedRows.add(rowId);
      });

      const changedData = gridData.filter((row) => modifiedRows.has(row.id));
      await onSave(changedData);

      // Clear modified state
      setModifiedCells(new Set());
      setChangeHistory([]);
      setRedoHistory([]);

      notify.success('Changes saved successfully');
    } catch (error) {
      notify.error('Failed to save changes');
    } finally {
      setIsPending(false);
    }
  };

  // Delete selected rows
  const handleDeleteRows = async () => {
    if (!onDelete || selectedRows.size === 0) return;

    modals.openConfirmModal({
      title: 'Delete Selected Rows',
      children: (
        <Text size="sm">
          Are you sure you want to delete {selectedRows.size} selected rows? This action cannot be
          undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        setIsPending(true);
        try {
          await onDelete(Array.from(selectedRows));
          setSelectedRows(new Set());
          notify.success('Rows deleted successfully');
        } catch (error) {
          notify.error('Failed to delete rows');
        } finally {
          setIsPending(false);
        }
      },
    });
  };

  // Render cell based on type
  const renderCell = (row: GridRow, column: GridColumn) => {
    const cellKey = getCellKey(row.id, column.key);
    const isEditing = editingCell === cellKey;
    const value = row[column.key];

    if (isEditing) {
      switch (column.type) {
        case 'text':
          return (
            <TextInput
              defaultValue={value}
              size="xs"
              autoFocus
              onBlur={(e) => handleCellValueChange(row.id, column.key, e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCellValueChange(row.id, column.key, e.currentTarget.value);
                } else if (e.key === 'Escape') {
                  setEditingCell(null);
                }
              }}
              style={{ width: '100%' }}
            />
          );

        case 'number':
          return (
            <NumberInput
              defaultValue={value}
              size="xs"
              autoFocus
              onBlur={(e) => handleCellValueChange(row.id, column.key, e.currentTarget.value)}
              style={{ width: '100%' }}
            />
          );

        case 'select':
          return (
            <Select
              data={column.options || []}
              defaultValue={value}
              size="xs"
              autoFocus
              onChange={(val) => handleCellValueChange(row.id, column.key, val)}
              style={{ width: '100%' }}
            />
          );

        case 'boolean':
          return (
            <Switch
              defaultChecked={value}
              size="xs"
              onChange={(e) => handleCellValueChange(row.id, column.key, e.currentTarget.checked)}
            />
          );

        default:
          return value;
      }
    }

    // Display value
    if (column.format) {
      return column.format(value);
    }

    if (column.type === 'boolean') {
      return <Checkbox checked={value} readOnly size="xs" />;
    }

    return value?.toString() || '';
  };

  return (
    <Card withBorder>
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between" wrap="wrap">
          <Title order={3}>{title}</Title>

          <Group gap="xs">
            {/* Column visibility */}
            {enableColumnFilter && (
              <Menu position="bottom-end" withinPortal>
                <Menu.Target>
                  <ActionIcon variant="subtle" size="md">
                    <IconColumns size={18} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Visible Columns</Menu.Label>
                  {columns.map((col) => (
                    <Menu.Item
                      key={col.key}
                      onClick={() => {
                        setVisibleColumns((prev) => {
                          const newSet = new Set(prev);
                          if (newSet.has(col.key)) {
                            newSet.delete(col.key);
                          } else {
                            newSet.add(col.key);
                          }
                          return newSet;
                        });
                      }}
                    >
                      <Group gap="xs">
                        <Checkbox checked={visibleColumns.has(col.key)} readOnly size="xs" />
                        <Text size="sm">{col.label}</Text>
                      </Group>
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>
            )}

            {/* Undo/Redo */}
            {enableUndo && (
              <Group gap={4}>
                <Tooltip label="Undo (Ctrl+Z)">
                  <ActionIcon
                    variant="subtle"
                    size="md"
                    onClick={handleUndo}
                    disabled={changeHistory.length === 0}
                  >
                    <IconRefresh size={18} style={{ transform: 'scaleX(-1)' }} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Redo (Ctrl+Shift+Z)">
                  <ActionIcon
                    variant="subtle"
                    size="md"
                    onClick={handleRedo}
                    disabled={redoHistory.length === 0}
                  >
                    <IconRefresh size={18} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            )}

            {/* Copy/Paste */}
            {(enableCopy || enablePaste) && (
              <Group gap={4}>
                {enableCopy && (
                  <Tooltip label="Copy (Ctrl+C)">
                    <ActionIcon
                      variant="subtle"
                      size="md"
                      onClick={handleCopy}
                      disabled={selectedCells.size === 0}
                    >
                      <IconCopy size={18} />
                    </ActionIcon>
                  </Tooltip>
                )}
                {enablePaste && (
                  <Tooltip label="Paste (Ctrl+V)">
                    <ActionIcon variant="subtle" size="md" onClick={handlePaste}>
                      <IconClipboard size={18} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </Group>
            )}

            {/* Actions */}
            {onDelete && selectedRows.size > 0 && (
              <Button
                size="xs"
                color="red"
                variant="subtle"
                leftSection={<IconTrash size={14} />}
                onClick={handleDeleteRows}
              >
                Delete ({selectedRows.size})
              </Button>
            )}

            {onSave && modifiedCells.size > 0 && (
              <Button
                size="xs"
                leftSection={<IconDeviceFloppy size={14} />}
                onClick={handleSave}
                loading={isPending}
              >
                Save ({modifiedCells.size} changes)
              </Button>
            )}
          </Group>
        </Group>

        {/* Status bar */}
        {(selectedCells.size > 0 || modifiedCells.size > 0) && (
          <Paper p="xs" withBorder bg="gray.0">
            <Group justify="space-between">
              <Group gap="xs">
                {selectedCells.size > 0 && (
                  <Badge variant="dot" size="sm">
                    {selectedCells.size} cells selected
                  </Badge>
                )}
                {selectedRows.size > 0 && (
                  <Badge variant="dot" size="sm" color="blue">
                    {selectedRows.size} rows selected
                  </Badge>
                )}
              </Group>
              {modifiedCells.size > 0 && (
                <Badge variant="filled" size="sm" color="orange">
                  {modifiedCells.size} unsaved changes
                </Badge>
              )}
            </Group>
          </Paper>
        )}

        {/* Grid */}
        <ScrollArea>
          <Box
            ref={gridRef}
            style={{
              display: 'grid',
              gridTemplateColumns: `40px ${visibleColumnsList
                .map((col) => `${col.width || (isMobile ? 100 : 150)}px`)
                .join(' ')}`,
              gap: 0,
              border: '1px solid var(--mantine-color-gray-3)',
              borderRadius: 'var(--mantine-radius-sm)',
              overflow: 'hidden',
              minWidth: isMobile ? '100%' : 'auto',
            }}
          >
            {/* Header row */}
            <Box
              style={{
                gridColumn: '1',
                backgroundColor: 'var(--mantine-color-gray-1)',
                borderRight: '1px solid var(--mantine-color-gray-3)',
                borderBottom: '1px solid var(--mantine-color-gray-3)',
                padding: '8px',
                position: 'sticky',
                left: 0,
                zIndex: 2,
              }}
            >
              <Checkbox
                size="xs"
                checked={selectedRows.size === gridData.length && gridData.length > 0}
                indeterminate={selectedRows.size > 0 && selectedRows.size < gridData.length}
                onChange={() => {
                  if (selectedRows.size === gridData.length) {
                    setSelectedRows(new Set());
                  } else {
                    setSelectedRows(new Set(gridData.map((r) => r.id)));
                  }
                }}
              />
            </Box>

            {visibleColumnsList.map((column, colIndex) => (
              <Box
                key={column.key}
                style={{
                  gridColumn: colIndex + 2,
                  backgroundColor: 'var(--mantine-color-gray-1)',
                  borderRight: '1px solid var(--mantine-color-gray-3)',
                  borderBottom: '1px solid var(--mantine-color-gray-3)',
                  padding: '8px',
                  fontWeight: 600,
                  fontSize: isMobile ? '12px' : '14px',
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                  cursor: column.sortable ? 'pointer' : 'default',
                }}
                onClick={() => {
                  if (column.sortable) {
                    // Implement sorting
                  }
                }}
              >
                <Group gap={4} wrap="nowrap">
                  <Text size="sm" truncate>
                    {column.label}
                  </Text>
                  {column.required && <Text c="red">*</Text>}
                </Group>
              </Box>
            ))}

            {/* Data rows */}
            {gridData.map((row, rowIndex) => (
              <>
                {/* Row selector */}
                <Box
                  key={`selector-${row.id}`}
                  style={{
                    gridColumn: '1',
                    gridRow: rowIndex + 2,
                    backgroundColor: selectedRows.has(row.id)
                      ? 'var(--mantine-color-blue-0)'
                      : 'var(--mantine-color-gray-0)',
                    borderRight: '1px solid var(--mantine-color-gray-3)',
                    borderBottom: '1px solid var(--mantine-color-gray-3)',
                    padding: '8px',
                    position: 'sticky',
                    left: 0,
                    zIndex: 1,
                  }}
                >
                  <Checkbox
                    size="xs"
                    checked={selectedRows.has(row.id)}
                    onChange={() => {
                      setSelectedRows((prev) => {
                        const newSet = new Set(prev);
                        if (newSet.has(row.id)) {
                          newSet.delete(row.id);
                        } else {
                          newSet.add(row.id);
                        }
                        return newSet;
                      });
                    }}
                  />
                </Box>

                {/* Data cells */}
                {visibleColumnsList.map((column, colIndex) => {
                  const cellKey = getCellKey(row.id, column.key);
                  const isSelected = selectedCells.has(cellKey);
                  const isModified = modifiedCells.has(cellKey);

                  return (
                    <Box
                      key={cellKey}
                      ref={(el) => {
                        if (el) cellRefs.current.set(cellKey, el);
                      }}
                      style={{
                        gridColumn: colIndex + 2,
                        gridRow: rowIndex + 2,
                        backgroundColor: isSelected
                          ? 'var(--mantine-color-blue-1)'
                          : isModified
                            ? 'var(--mantine-color-yellow-0)'
                            : 'white',
                        borderRight: '1px solid var(--mantine-color-gray-3)',
                        borderBottom: '1px solid var(--mantine-color-gray-3)',
                        padding: '8px',
                        cursor: column.editable !== false ? 'cell' : 'default',
                        fontSize: isMobile ? '12px' : '14px',
                        overflow: 'hidden',
                      }}
                      onClick={(e) => handleCellClick(rowIndex, colIndex, e)}
                      onDoubleClick={() => handleCellDoubleClick(row.id, column.key)}
                    >
                      {renderCell(row, column)}
                    </Box>
                  );
                })}
              </>
            ))}
          </Box>
        </ScrollArea>

        {/* Footer info */}
        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            {gridData.length} rows × {visibleColumnsList.length} columns
          </Text>
          {loading && <Loader size="xs" />}
        </Group>
      </Stack>
    </Card>
  );
}
