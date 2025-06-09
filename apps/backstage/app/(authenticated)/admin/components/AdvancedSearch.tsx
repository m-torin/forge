'use client';

import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Chip,
  Collapse,
  Group,
  Menu,
  Modal,
  MultiSelect,
  NumberInput,
  Paper,
  ScrollArea,
  Select,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconAdjustments,
  IconDatabase,
  IconDeviceFloppy,
  IconFilter,
  IconHistory,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconX,
} from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';

import type { ModelConfig } from '../lib/model-config';

interface SearchFilter {
  field: string;
  id: string;
  label: string;
  operator: string;
  type: string;
  value: any;
}

interface SavedSearch {
  createdAt: string;
  filters: SearchFilter[];
  id: string;
  name: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface AdvancedSearchProps {
  currentFilters?: SearchFilter[];
  isLoading?: boolean;
  modelConfig: ModelConfig;
  modelName: string;
  onReset: () => void;
  onSearch: (filters: SearchFilter[], sortBy?: string, sortOrder?: 'asc' | 'desc') => void;
}

const OPERATORS = {
  boolean: [
    { label: 'Equals', value: 'equals' },
    { label: 'Is null', value: 'isNull' },
    { label: 'Is not null', value: 'isNotNull' },
  ],
  date: [
    { label: 'On date', value: 'equals' },
    { label: 'Not on date', value: 'notEquals' },
    { label: 'Before', value: 'before' },
    { label: 'After', value: 'after' },
    { label: 'Between', value: 'between' },
    { label: 'Not between', value: 'notBetween' },
    { label: 'Is null', value: 'isNull' },
    { label: 'Is not null', value: 'isNotNull' },
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'This week', value: 'thisWeek' },
    { label: 'Last week', value: 'lastWeek' },
    { label: 'This month', value: 'thisMonth' },
    { label: 'Last month', value: 'lastMonth' },
    { label: 'This year', value: 'thisYear' },
    { label: 'Last year', value: 'lastYear' },
  ],
  number: [
    { label: 'Equals', value: 'equals' },
    { label: 'Does not equal', value: 'notEquals' },
    { label: 'Greater than', value: 'gt' },
    { label: 'Greater than or equal', value: 'gte' },
    { label: 'Less than', value: 'lt' },
    { label: 'Less than or equal', value: 'lte' },
    { label: 'Between', value: 'between' },
    { label: 'Not between', value: 'notBetween' },
    { label: 'Is null', value: 'isNull' },
    { label: 'Is not null', value: 'isNotNull' },
  ],
  select: [
    { label: 'Equals', value: 'equals' },
    { label: 'Does not equal', value: 'notEquals' },
    { label: 'In list', value: 'in' },
    { label: 'Not in list', value: 'notIn' },
    { label: 'Is null', value: 'isNull' },
    { label: 'Is not null', value: 'isNotNull' },
  ],
  text: [
    { label: 'Contains', value: 'contains' },
    { label: 'Equals', value: 'equals' },
    { label: 'Starts with', value: 'startsWith' },
    { label: 'Ends with', value: 'endsWith' },
    { label: 'Does not contain', value: 'notContains' },
    { label: 'Does not equal', value: 'notEquals' },
    { label: 'Is empty', value: 'isEmpty' },
    { label: 'Is not empty', value: 'isNotEmpty' },
  ],
};

export function AdvancedSearch({
  currentFilters = [],
  isLoading = false,
  modelConfig,
  modelName,
  onReset,
  onSearch,
}: AdvancedSearchProps) {
  const [opened, { close, open }] = useDisclosure(false);
  const [filters, setFilters] = useState<SearchFilter[]>(currentFilters);
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [saveSearchName, setSaveSearchName] = useState('');
  const [showSaveSearch, setShowSaveSearch] = useState(false);
  const [quickFiltersOpen, setQuickFiltersOpen] = useState(false);

  // Load saved searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`advanced-search-${modelName}`);
    if (saved) {
      try {
        setSavedSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load saved searches:', error);
      }
    }
  }, [modelName]);

  // Save searches to localStorage
  const saveSavedSearches = useCallback(
    (searches: SavedSearch[]) => {
      localStorage.setItem(`advanced-search-${modelName}`, JSON.stringify(searches));
      setSavedSearches(searches);
    },
    [modelName],
  );

  // Get searchable fields from model config
  const searchableFields = modelConfig.fields.filter(
    (field) =>
      field.type !== 'relation' &&
      field.name !== 'id' &&
      !field.name.endsWith('Id') &&
      field.type !== 'file',
  );

  // Add a new filter
  const addFilter = () => {
    const newFilter: SearchFilter = {
      id: Date.now().toString(),
      type: searchableFields[0]?.type || 'text',
      field: searchableFields[0]?.name || '',
      label: searchableFields[0]?.label || '',
      operator: 'contains',
      value: '',
    };
    setFilters([...filters, newFilter]);
  };

  // Update a filter
  const updateFilter = (id: string, updates: Partial<SearchFilter>) => {
    setFilters(filters.map((filter) => (filter.id === id ? { ...filter, ...updates } : filter)));
  };

  // Remove a filter
  const removeFilter = (id: string) => {
    setFilters(filters.filter((filter) => filter.id !== id));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters([]);
    setSortBy('');
    setSortOrder('desc');
    onReset();
  };

  // Apply search
  const applySearch = () => {
    const validFilters = filters.filter(
      (filter) =>
        filter.field &&
        filter.operator &&
        (filter.value !== '' ||
          [
            'isEmpty',
            'isNotEmpty',
            'isNotNull',
            'isNull',
            'lastMonth',
            'lastWeek',
            'lastYear',
            'thisMonth',
            'thisWeek',
            'thisYear',
            'today',
            'yesterday',
          ].includes(filter.operator)),
    );
    onSearch(validFilters, sortBy || undefined, sortOrder);
    close();
  };

  // Save current search
  const saveCurrentSearch = () => {
    if (!saveSearchName.trim()) {
      notifications.show({
        color: 'red',
        message: 'Please enter a name for the saved search',
        title: 'Error',
      });
      return;
    }

    const savedSearch: SavedSearch = {
      id: Date.now().toString(),
      name: saveSearchName.trim(),
      createdAt: new Date().toISOString(),
      filters: filters.filter((f) => f.field && f.operator),
      sortBy: sortBy || undefined,
      sortOrder,
    };

    const newSavedSearches = [...savedSearches, savedSearch];
    saveSavedSearches(newSavedSearches);
    setSaveSearchName('');
    setShowSaveSearch(false);

    notifications.show({
      color: 'green',
      message: `Search "${savedSearch.name}" has been saved`,
      title: 'Search Saved',
    });
  };

  // Load a saved search
  const loadSavedSearch = (savedSearch: SavedSearch) => {
    setFilters(savedSearch.filters);
    setSortBy(savedSearch.sortBy || '');
    setSortOrder(savedSearch.sortOrder || 'desc');
    onSearch(savedSearch.filters, savedSearch.sortBy, savedSearch.sortOrder);
    close();
  };

  // Delete a saved search
  const deleteSavedSearch = (id: string) => {
    const newSavedSearches = savedSearches.filter((search) => search.id !== id);
    saveSavedSearches(newSavedSearches);
  };

  // Get operators for field type
  const getOperatorsForField = (field: any) => {
    if (field.type === 'number') return OPERATORS.number;
    if (field.type === 'date' || field.type === 'datetime') return OPERATORS.date;
    if (field.type === 'checkbox' || field.type === 'switch') return OPERATORS.boolean;
    if (field.type === 'select' || field.type === 'multiselect') return OPERATORS.select;
    return OPERATORS.text;
  };

  // Render filter value input
  const renderFilterValueInput = (filter: SearchFilter) => {
    const field = searchableFields.find((f) => f.name === filter.field);
    if (!field) return null;

    // No value input needed for these operators
    if (
      [
        'isEmpty',
        'isNotEmpty',
        'isNotNull',
        'isNull',
        'lastMonth',
        'lastWeek',
        'lastYear',
        'thisMonth',
        'thisWeek',
        'thisYear',
        'today',
        'yesterday',
      ].includes(filter.operator)
    ) {
      return null;
    }

    if (filter.operator === 'between' || filter.operator === 'notBetween') {
      if (field.type === 'number') {
        return (
          <Group gap="xs">
            <NumberInput
              onChange={(value) =>
                updateFilter(filter.id, {
                  value: { ...filter.value, min: value },
                })
              }
              placeholder="Min"
              style={{ flex: 1 }}
              size="sm"
              value={filter.value?.min || ''}
            />
            <Text size="sm">to</Text>
            <NumberInput
              onChange={(value) =>
                updateFilter(filter.id, {
                  value: { ...filter.value, max: value },
                })
              }
              placeholder="Max"
              style={{ flex: 1 }}
              size="sm"
              value={filter.value?.max || ''}
            />
          </Group>
        );
      } else if (field.type === 'date' || field.type === 'datetime') {
        return (
          <Group gap="xs">
            <DateInput
              onChange={(date) =>
                updateFilter(filter.id, {
                  value: { ...filter.value, from: date?.toISOString() },
                })
              }
              placeholder="From date"
              style={{ flex: 1 }}
              size="sm"
              value={filter.value?.from ? new Date(filter.value.from) : null}
            />
            <Text size="sm">to</Text>
            <DateInput
              onChange={(date) =>
                updateFilter(filter.id, {
                  value: { ...filter.value, to: date?.toISOString() },
                })
              }
              placeholder="To date"
              style={{ flex: 1 }}
              size="sm"
              value={filter.value?.to ? new Date(filter.value.to) : null}
            />
          </Group>
        );
      }
    }

    if (filter.operator === 'in' || filter.operator === 'notIn') {
      return (
        <MultiSelect
          onChange={(values) => updateFilter(filter.id, { value: values })}
          placeholder="Select values"
          creatable
          data={field.options || []}
          searchable
          size="sm"
          value={Array.isArray(filter.value) ? filter.value : []}
        />
      );
    }

    switch (field.type) {
      case 'number':
        return (
          <NumberInput
            onChange={(value) => updateFilter(filter.id, { value })}
            placeholder="Enter number"
            size="sm"
            value={filter.value || ''}
          />
        );

      case 'date':
      case 'datetime':
        return (
          <DateInput
            onChange={(date) => updateFilter(filter.id, { value: date?.toISOString() })}
            placeholder="Select date"
            size="sm"
            value={filter.value ? new Date(filter.value) : null}
          />
        );

      case 'checkbox':
      case 'switch':
        return (
          <Select
            onChange={(value) => updateFilter(filter.id, { value: value === 'true' })}
            placeholder="Select value"
            data={[
              { label: 'True', value: 'true' },
              { label: 'False', value: 'false' },
            ]}
            size="sm"
            value={filter.value?.toString() || ''}
          />
        );

      case 'select':
        return (
          <Select
            onChange={(value) => updateFilter(filter.id, { value })}
            placeholder="Select value"
            data={field.options || []}
            searchable
            size="sm"
            value={filter.value || ''}
          />
        );

      default:
        return (
          <TextInput
            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
            placeholder="Enter value"
            size="sm"
            value={filter.value || ''}
          />
        );
    }
  };

  // Quick filters for common searches
  const quickFilters = [
    { field: 'createdAt', label: 'Created today', operator: 'today' },
    { field: 'createdAt', label: 'Created this week', operator: 'thisWeek' },
    { field: 'createdAt', label: 'Created this month', operator: 'thisMonth' },
    { field: 'updatedAt', label: 'Updated today', operator: 'today' },
    { field: 'isActive', label: 'Active only', operator: 'equals', value: true },
    { field: 'isActive', label: 'Inactive only', operator: 'equals', value: false },
  ].filter((qf) => searchableFields.some((f) => f.name === qf.field));

  const applyQuickFilter = (quickFilter: any) => {
    const field = searchableFields.find((f) => f.name === quickFilter.field);
    if (!field) return;

    const newFilter: SearchFilter = {
      id: Date.now().toString(),
      type: field.type,
      field: quickFilter.field,
      label: field.label,
      operator: quickFilter.operator,
      value: quickFilter.value || '',
    };

    setFilters([newFilter]);
    onSearch([newFilter], sortBy || undefined, sortOrder);
  };

  const activeFiltersCount = filters.filter(
    (f) =>
      f.field &&
      f.operator &&
      (f.value !== '' ||
        [
          'isEmpty',
          'isNotEmpty',
          'isNotNull',
          'isNull',
          'lastMonth',
          'lastWeek',
          'lastYear',
          'thisMonth',
          'thisWeek',
          'thisYear',
          'today',
          'yesterday',
        ].includes(f.operator)),
  ).length;

  return (
    <>
      <Card withBorder p="sm">
        <Group justify="space-between">
          <Group gap="xs">
            <ThemeIcon color="blue" size="sm" variant="light">
              <IconSearch size={16} />
            </ThemeIcon>
            <Text fw={600} size="sm">
              Advanced Search
            </Text>
            {activeFiltersCount > 0 && (
              <Badge size="sm" variant="light">
                {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </Group>

          <Group gap="xs">
            {quickFilters.length > 0 && (
              <Menu width={200} shadow="md">
                <Menu.Target>
                  <Button leftSection={<IconAdjustments size={14} />} size="xs" variant="subtle">
                    Quick Filters
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Common Filters</Menu.Label>
                  {quickFilters.map((qf, index) => (
                    <Menu.Item
                      key={index}
                      leftSection={<IconFilter size={14} />}
                      onClick={() => applyQuickFilter(qf)}
                    >
                      {qf.label}
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>
            )}

            <Button leftSection={<IconFilter size={14} />} onClick={open} size="xs" variant="light">
              Advanced
            </Button>

            {activeFiltersCount > 0 && (
              <ActionIcon
                color="red"
                onClick={clearFilters}
                size="sm"
                title="Clear all filters"
                variant="subtle"
              >
                <IconX size={14} />
              </ActionIcon>
            )}
          </Group>
        </Group>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <Group gap="xs" mt="sm">
            {filters
              .filter(
                (f) =>
                  f.field &&
                  f.operator &&
                  (f.value !== '' ||
                    [
                      'isEmpty',
                      'isNotEmpty',
                      'isNotNull',
                      'isNull',
                      'lastMonth',
                      'lastWeek',
                      'lastYear',
                      'thisMonth',
                      'thisWeek',
                      'thisYear',
                      'today',
                      'yesterday',
                    ].includes(f.operator)),
              )
              .map((filter) => (
                <Chip
                  key={filter.id}
                  onChange={() => removeFilter(filter.id)}
                  checked={false}
                  size="sm"
                  variant="light"
                >
                  {filter.label} {filter.operator}{' '}
                  {typeof filter.value === 'object'
                    ? JSON.stringify(filter.value)
                    : filter.value?.toString() || ''}
                </Chip>
              ))}
          </Group>
        )}
      </Card>

      {/* Advanced Search Modal */}
      <Modal
        onClose={close}
        opened={opened}
        scrollAreaComponent={ScrollArea.Autosize}
        size="xl"
        title="Advanced Search"
      >
        <Stack gap="md">
          {/* Saved Searches */}
          {savedSearches.length > 0 && (
            <Paper withBorder p="sm">
              <Group justify="space-between" mb="xs">
                <Text fw={500} size="sm">
                  Saved Searches
                </Text>
                <Button
                  leftSection={<IconHistory size={14} />}
                  onClick={() => setShowSaveSearch(!showSaveSearch)}
                  size="xs"
                  variant="subtle"
                >
                  {savedSearches.length} saved
                </Button>
              </Group>

              <Group gap="xs">
                {savedSearches.slice(0, 3).map((search) => (
                  <Button
                    key={search.id}
                    onClick={() => loadSavedSearch(search)}
                    size="xs"
                    variant="light"
                  >
                    {search.name}
                  </Button>
                ))}
                {savedSearches.length > 3 && (
                  <Menu width={200}>
                    <Menu.Target>
                      <Button size="xs" variant="subtle">
                        +{savedSearches.length - 3} more
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      {savedSearches.slice(3).map((search) => (
                        <Menu.Item
                          key={search.id}
                          onClick={() => loadSavedSearch(search)}
                          rightSection={
                            <ActionIcon
                              color="red"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSavedSearch(search.id);
                              }}
                              size="xs"
                              variant="subtle"
                            >
                              <IconX size={12} />
                            </ActionIcon>
                          }
                        >
                          {search.name}
                        </Menu.Item>
                      ))}
                    </Menu.Dropdown>
                  </Menu>
                )}
              </Group>
            </Paper>
          )}

          {/* Filters */}
          <Paper withBorder p="sm">
            <Group justify="space-between" mb="md">
              <Text fw={500}>Search Filters</Text>
              <Button leftSection={<IconPlus size={14} />} onClick={addFilter} size="xs">
                Add Filter
              </Button>
            </Group>

            <Stack gap="sm">
              {filters.map((filter, index) => {
                const field = searchableFields.find((f) => f.name === filter.field);
                const operators = field ? getOperatorsForField(field) : [];

                return (
                  <Paper key={filter.id} withBorder p="sm">
                    <Group align="flex-start" gap="sm">
                      <Text style={{ minWidth: 20 }} c="dimmed" mt="xs" size="xs">
                        {index === 0 ? 'WHERE' : 'AND'}
                      </Text>

                      <Select
                        onChange={(value) => {
                          const selectedField = searchableFields.find((f) => f.name === value);
                          updateFilter(filter.id, {
                            type: selectedField?.type || 'text',
                            field: value || '',
                            label: selectedField?.label || '',
                            operator: 'contains',
                            value: '',
                          });
                        }}
                        placeholder="Field"
                        style={{ flex: 1 }}
                        data={searchableFields.map((field) => ({
                          label: field.label,
                          value: field.name,
                        }))}
                        searchable
                        size="sm"
                        value={filter.field}
                      />

                      <Select
                        onChange={(value) =>
                          updateFilter(filter.id, {
                            operator: value || '',
                            value: '',
                          })
                        }
                        placeholder="Operator"
                        style={{ flex: 1 }}
                        data={operators}
                        size="sm"
                        value={filter.operator}
                      />

                      <Box style={{ flex: 2 }}>{renderFilterValueInput(filter)}</Box>

                      <ActionIcon
                        color="red"
                        onClick={() => removeFilter(filter.id)}
                        size="sm"
                        variant="subtle"
                      >
                        <IconX size={16} />
                      </ActionIcon>
                    </Group>
                  </Paper>
                );
              })}

              {filters.length === 0 && (
                <Alert color="blue" icon={<IconDatabase size={16} />}>
                  No filters added yet. Click "Add Filter" to start building your search.
                </Alert>
              )}
            </Stack>
          </Paper>

          {/* Sorting */}
          <Paper withBorder p="sm">
            <Text fw={500} mb="sm">
              Sort Results
            </Text>
            <Group gap="sm">
              <Select
                onChange={(value) => setSortBy(value || '')}
                placeholder="Sort by field"
                style={{ flex: 1 }}
                clearable
                data={searchableFields.map((field) => ({
                  label: field.label,
                  value: field.name,
                }))}
                size="sm"
                value={sortBy}
              />

              <Select
                onChange={(value) => setSortOrder(value as 'asc' | 'desc')}
                placeholder="Order"
                style={{ flex: 1 }}
                data={[
                  { label: 'Ascending', value: 'asc' },
                  { label: 'Descending', value: 'desc' },
                ]}
                size="sm"
                value={sortOrder}
              />
            </Group>
          </Paper>

          {/* Save Search */}
          <Collapse in={showSaveSearch}>
            <Paper withBorder p="sm">
              <Text fw={500} mb="sm">
                Save This Search
              </Text>
              <Group gap="sm">
                <TextInput
                  onChange={(e) => setSaveSearchName(e.target.value)}
                  placeholder="Search name"
                  style={{ flex: 1 }}
                  size="sm"
                  value={saveSearchName}
                />
                <Button
                  leftSection={<IconDeviceFloppy size={14} />}
                  onClick={saveCurrentSearch}
                  disabled={!saveSearchName.trim() || filters.length === 0}
                  size="sm"
                >
                  Save
                </Button>
              </Group>
            </Paper>
          </Collapse>

          {/* Actions */}
          <Group justify="space-between">
            <Group gap="sm">
              <Button
                leftSection={<IconDeviceFloppy size={14} />}
                onClick={() => setShowSaveSearch(!showSaveSearch)}
                size="sm"
                variant="light"
              >
                Save Search
              </Button>
              <Button
                leftSection={<IconRefresh size={14} />}
                onClick={clearFilters}
                size="sm"
                variant="subtle"
              >
                Reset
              </Button>
            </Group>

            <Group gap="sm">
              <Button onClick={close} size="sm" variant="light">
                Cancel
              </Button>
              <Button
                leftSection={<IconSearch size={14} />}
                loading={isLoading}
                onClick={applySearch}
                size="sm"
              >
                Search
              </Button>
            </Group>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
