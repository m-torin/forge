'use client';

import { useState } from 'react';
import {
  Paper,
  Box,
  Group,
  TextInput,
  Select,
  Button,
  ActionIcon,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import {
  IconSearch,
  IconUser,
  IconFilter,
  IconMoon,
  IconSun,
} from '@tabler/icons-react';
import cx from 'clsx';
import { TableView, TimelineView } from './views';
import { DataEntry, FilterState, ROLE_OPTIONS, ACTION_OPTIONS } from './types';
import classes from './AuditTable.module.scss';
import { logInfo } from '@repo/observability';

const INITIAL_DATA: DataEntry[] = [
  {
    id: '1',
    name: 'Robert Wolfkisser',
    role: 'Engineer',
    action: 'Edited',
    entry: 'Node 316',
    datetime: '2024-05-23 18:30:00',
    metadata: {
      previousState: 'Inactive',
      newState: 'Active',
      relatedEntries: ['Flow 123', 'Node 315'],
    },
  },
  {
    id: '2',
    name: 'Jill Jailbreaker',
    role: 'Engineer',
    action: 'Created',
    entry: 'Node 305',
    datetime: '2024-05-23 17:45:00',
    metadata: {
      newState: 'Draft',
      relatedEntries: ['Flow 124'],
    },
  },
  {
    id: '3',
    name: 'Henry Silkeater',
    role: 'Analyst',
    action: 'Stopped',
    entry: 'Flow 526',
    datetime: '2024-05-23 16:10:00',
    metadata: {
      duration: '2h 15m',
      previousState: 'Running',
      newState: 'Stopped',
    },
  },
  {
    id: '4',
    name: 'Bill Horsefighter',
    role: 'Analyst',
    action: 'Started',
    entry: 'Flow 547',
    datetime: '2024-05-23 15:00:00',
    metadata: {
      previousState: 'Stopped',
      newState: 'Running',
    },
  },
  {
    id: '5',
    name: 'Jeremy Footviewer',
    role: 'Manager',
    action: 'Deleted',
    entry: 'Node 680',
    datetime: '2024-05-23 14:20:00',
    metadata: {
      previousState: 'Active',
      relatedEntries: ['Flow 125', 'Node 681'],
    },
  },
];

export function AuditTable() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', {
    getInitialValueInEffect: true,
  });
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    filterRole: null,
    filterAction: null,
  });
  const [data] = useState<DataEntry[]>(INITIAL_DATA);

  const toggleRow = (id: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (expandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  const updateFilter = (key: keyof FilterState, value: string | null) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredData = data.filter((item) => {
    const matchesSearch =
      !filters.searchQuery ||
      item.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      item.entry.toLowerCase().includes(filters.searchQuery.toLowerCase());

    const matchesRole =
      !filters.filterRole ||
      item.role.toLowerCase() === filters.filterRole.toLowerCase();

    const matchesAction =
      !filters.filterAction ||
      item.action.toLowerCase() === filters.filterAction.toLowerCase();

    return matchesSearch && matchesRole && matchesAction;
  });

  const handleLoadMore = () => {
    // In a real application, this would fetch more data
    logInfo('Loading more audit table data');
  };

  return (
    <Paper shadow="xs" radius="md">
      <Box className={classes.header}>
        <Group className={classes.searchSection}>
          <TextInput
            placeholder="Search logs..."
            leftSection={<IconSearch size={16} />}
            value={filters.searchQuery}
            onChange={(e) => updateFilter('searchQuery', e.currentTarget.value)}
            w={300}
          />
        </Group>

        <Group gap="sm" className={classes.controls}>
          <Select
            placeholder="Filter by role"
            leftSection={<IconUser size={16} />}
            value={filters.filterRole}
            onChange={(value) => updateFilter('filterRole', value)}
            data={ROLE_OPTIONS}
            clearable
          />
          <Select
            placeholder="Filter by action"
            leftSection={<IconFilter size={16} />}
            value={filters.filterAction}
            onChange={(value) => updateFilter('filterAction', value)}
            data={ACTION_OPTIONS}
            clearable
          />

          <Button.Group>
            <Button
              variant={viewMode === 'table' ? 'filled' : 'light'}
              onClick={() => setViewMode('table')}
            >
              Table
            </Button>
            <Button
              variant={viewMode === 'timeline' ? 'filled' : 'light'}
              onClick={() => setViewMode('timeline')}
            >
              Timeline
            </Button>
          </Button.Group>

          <ActionIcon
            onClick={() =>
              setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')
            }
            variant="default"
            size="lg"
            aria-label="Toggle color scheme"
            className={classes.darkModeToggle}
          >
            <IconSun className={cx(classes.icon, classes.light)} stroke={1.5} />
            <IconMoon className={cx(classes.icon, classes.dark)} stroke={1.5} />
          </ActionIcon>
        </Group>
      </Box>

      <Box className={classes.content}>
        {viewMode === 'table' ? (
          <TableView
            data={filteredData}
            classes={classes}
            expandedRows={expandedRows}
            toggleRow={toggleRow}
          />
        ) : (
          <TimelineView
            data={filteredData}
            classes={classes}
            expandedRows={expandedRows}
            toggleRow={toggleRow}
          />
        )}
      </Box>

      <Box p="md" ta="center" className={classes.footer}>
        <Button
          variant="subtle"
          color="gray"
          onClick={handleLoadMore}
          leftSection={<IconFilter size={16} />}
        >
          Load more logs...
        </Button>
      </Box>
    </Paper>
  );
}
