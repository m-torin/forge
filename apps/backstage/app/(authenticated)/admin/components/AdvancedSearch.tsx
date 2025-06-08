'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Card,
  Stack,
  Group,
  Button,
  Modal,
  Text,
  Select,
  TextInput,
  NumberInput,
  DateInput,
  Checkbox,
  Badge,
  ActionIcon,
  Accordion,
  Collapse,
  Box,
  ScrollArea,
  Divider,
  Paper,
  ThemeIcon,
  MultiSelect,
  Chip,
  Menu,
  Alert,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconSearch,
  IconFilter,
  IconX,
  IconPlus,
  IconChevronDown,
  IconChevronUp,
  IconSave,
  IconHistory,
  IconRefresh,
  IconAdjustments,
  IconDatabase,
  IconCalendar,
  IconSortAscending,
  IconSortDescending,
} from '@tabler/icons-react';
import type { ModelConfig } from '../lib/model-config';

interface SearchFilter {
  id: string;
  field: string;
  operator: string;
  value: any;
  type: string;
  label: string;
}

interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilter[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  createdAt: string;
}

interface AdvancedSearchProps {
  modelName: string;
  modelConfig: ModelConfig;
  onSearch: (filters: SearchFilter[], sortBy?: string, sortOrder?: 'asc' | 'desc') => void;
  onReset: () => void;
  currentFilters?: SearchFilter[];
  isLoading?: boolean;
}

const OPERATORS = {
  text: [
    { value: 'contains', label: 'Contains' },
    { value: 'equals', label: 'Equals' },
    { value: 'startsWith', label: 'Starts with' },
    { value: 'endsWith', label: 'Ends with' },
    { value: 'notContains', label: 'Does not contain' },
    { value: 'notEquals', label: 'Does not equal' },
    { value: 'isEmpty', label: 'Is empty' },
    { value: 'isNotEmpty', label: 'Is not empty' },
  ],
  number: [
    { value: 'equals', label: 'Equals' },
    { value: 'notEquals', label: 'Does not equal' },
    { value: 'gt', label: 'Greater than' },
    { value: 'gte', label: 'Greater than or equal' },
    { value: 'lt', label: 'Less than' },
    { value: 'lte', label: 'Less than or equal' },
    { value: 'between', label: 'Between' },
    { value: 'notBetween', label: 'Not between' },
    { value: 'isNull', label: 'Is null' },
    { value: 'isNotNull', label: 'Is not null' },
  ],
  date: [
    { value: 'equals', label: 'On date' },
    { value: 'notEquals', label: 'Not on date' },
    { value: 'before', label: 'Before' },
    { value: 'after', label: 'After' },
    { value: 'between', label: 'Between' },
    { value: 'notBetween', label: 'Not between' },
    { value: 'isNull', label: 'Is null' },
    { value: 'isNotNull', label: 'Is not null' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'thisWeek', label: 'This week' },
    { value: 'lastWeek', label: 'Last week' },
    { value: 'thisMonth', label: 'This month' },
    { value: 'lastMonth', label: 'Last month' },
    { value: 'thisYear', label: 'This year' },
    { value: 'lastYear', label: 'Last year' },
  ],
  boolean: [
    { value: 'equals', label: 'Equals' },
    { value: 'isNull', label: 'Is null' },
    { value: 'isNotNull', label: 'Is not null' },
  ],
  select: [
    { value: 'equals', label: 'Equals' },
    { value: 'notEquals', label: 'Does not equal' },
    { value: 'in', label: 'In list' },
    { value: 'notIn', label: 'Not in list' },
    { value: 'isNull', label: 'Is null' },
    { value: 'isNotNull', label: 'Is not null' },
  ],
};

export function AdvancedSearch({
  modelName,
  modelConfig,
  onSearch,
  onReset,
  currentFilters = [],
  isLoading = false,
}: AdvancedSearchProps) {
  const [opened, { open, close }] = useDisclosure(false);
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
  const saveSavedSearches = useCallback((searches: SavedSearch[]) => {
    localStorage.setItem(`advanced-search-${modelName}`, JSON.stringify(searches));
    setSavedSearches(searches);
  }, [modelName]);

  // Get searchable fields from model config
  const searchableFields = modelConfig.fields.filter(field => 
    field.type !== 'relation' && 
    field.name !== 'id' && 
    !field.name.endsWith('Id') &&
    field.type !== 'file'
  );

  // Add a new filter
  const addFilter = () => {
    const newFilter: SearchFilter = {
      id: Date.now().toString(),
      field: searchableFields[0]?.name || '',
      operator: 'contains',
      value: '',
      type: searchableFields[0]?.type || 'text',
      label: searchableFields[0]?.label || '',
    };
    setFilters([...filters, newFilter]);
  };

  // Update a filter
  const updateFilter = (id: string, updates: Partial<SearchFilter>) => {
    setFilters(filters.map(filter => 
      filter.id === id ? { ...filter, ...updates } : filter
    ));
  };

  // Remove a filter
  const removeFilter = (id: string) => {
    setFilters(filters.filter(filter => filter.id !== id));
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
    const validFilters = filters.filter(filter => 
      filter.field && filter.operator && 
      (filter.value !== '' || ['isEmpty', 'isNotEmpty', 'isNull', 'isNotNull', 'today', 'yesterday', 'thisWeek', 'lastWeek', 'thisMonth', 'lastMonth', 'thisYear', 'lastYear'].includes(filter.operator))
    );
    onSearch(validFilters, sortBy || undefined, sortOrder);
    close();
  };

  // Save current search
  const saveCurrentSearch = () => {
    if (!saveSearchName.trim()) {
      notifications.show({
        title: 'Error',
        message: 'Please enter a name for the saved search',
        color: 'red',
      });
      return;
    }

    const savedSearch: SavedSearch = {
      id: Date.now().toString(),
      name: saveSearchName.trim(),
      filters: filters.filter(f => f.field && f.operator),
      sortBy: sortBy || undefined,
      sortOrder,
      createdAt: new Date().toISOString(),
    };

    const newSavedSearches = [...savedSearches, savedSearch];
    saveSavedSearches(newSavedSearches);
    setSaveSearchName('');
    setShowSaveSearch(false);

    notifications.show({
      title: 'Search Saved',
      message: `Search "${savedSearch.name}" has been saved`,
      color: 'green',
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
    const newSavedSearches = savedSearches.filter(search => search.id !== id);
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
    const field = searchableFields.find(f => f.name === filter.field);
    if (!field) return null;

    // No value input needed for these operators
    if (['isEmpty', 'isNotEmpty', 'isNull', 'isNotNull', 'today', 'yesterday', 'thisWeek', 'lastWeek', 'thisMonth', 'lastMonth', 'thisYear', 'lastYear'].includes(filter.operator)) {
      return null;
    }

    if (filter.operator === 'between' || filter.operator === 'notBetween') {
      if (field.type === 'number') {
        return (
          <Group gap="xs">
            <NumberInput
              placeholder="Min"
              value={filter.value?.min || ''}
              onChange={(value) => updateFilter(filter.id, { 
                value: { ...filter.value, min: value } 
              })}
              size="sm"
              style={{ flex: 1 }}
            />
            <Text size="sm">to</Text>
            <NumberInput
              placeholder="Max"
              value={filter.value?.max || ''}
              onChange={(value) => updateFilter(filter.id, { 
                value: { ...filter.value, max: value } 
              })}
              size="sm"
              style={{ flex: 1 }}
            />
          </Group>
        );
      } else if (field.type === 'date' || field.type === 'datetime') {
        return (
          <Group gap="xs">
            <DateInput
              placeholder="From date"
              value={filter.value?.from ? new Date(filter.value.from) : null}
              onChange={(date) => updateFilter(filter.id, { 
                value: { ...filter.value, from: date?.toISOString() } 
              })}
              size="sm"
              style={{ flex: 1 }}
            />
            <Text size="sm">to</Text>
            <DateInput
              placeholder="To date"
              value={filter.value?.to ? new Date(filter.value.to) : null}
              onChange={(date) => updateFilter(filter.id, { 
                value: { ...filter.value, to: date?.toISOString() } 
              })}
              size="sm"
              style={{ flex: 1 }}
            />
          </Group>
        );
      }
    }

    if (filter.operator === 'in' || filter.operator === 'notIn') {
      return (
        <MultiSelect
          placeholder="Select values"
          data={field.options || []}
          value={Array.isArray(filter.value) ? filter.value : []}
          onChange={(values) => updateFilter(filter.id, { value: values })}
          size="sm"
          searchable
          creatable
        />
      );
    }

    switch (field.type) {
      case 'number':
        return (
          <NumberInput
            placeholder="Enter number"
            value={filter.value || ''}
            onChange={(value) => updateFilter(filter.id, { value })}
            size="sm"
          />
        );

      case 'date':
      case 'datetime':
        return (
          <DateInput
            placeholder="Select date"
            value={filter.value ? new Date(filter.value) : null}
            onChange={(date) => updateFilter(filter.id, { value: date?.toISOString() })}
            size="sm"
          />
        );

      case 'checkbox':
      case 'switch':
        return (
          <Select
            placeholder="Select value"
            value={filter.value?.toString() || ''}
            onChange={(value) => updateFilter(filter.id, { value: value === 'true' })}
            data={[
              { value: 'true', label: 'True' },
              { value: 'false', label: 'False' },
            ]}
            size="sm"
          />
        );

      case 'select':
        return (
          <Select
            placeholder="Select value"
            value={filter.value || ''}
            onChange={(value) => updateFilter(filter.id, { value })}
            data={field.options || []}
            size="sm"
            searchable
          />
        );

      default:
        return (
          <TextInput
            placeholder="Enter value"
            value={filter.value || ''}
            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
            size="sm"
          />
        );
    }
  };

  // Quick filters for common searches
  const quickFilters = [
    { label: 'Created today', field: 'createdAt', operator: 'today' },
    { label: 'Created this week', field: 'createdAt', operator: 'thisWeek' },
    { label: 'Created this month', field: 'createdAt', operator: 'thisMonth' },
    { label: 'Updated today', field: 'updatedAt', operator: 'today' },
    { label: 'Active only', field: 'isActive', operator: 'equals', value: true },
    { label: 'Inactive only', field: 'isActive', operator: 'equals', value: false },
  ].filter(qf => searchableFields.some(f => f.name === qf.field));

  const applyQuickFilter = (quickFilter: any) => {
    const field = searchableFields.find(f => f.name === quickFilter.field);
    if (!field) return;

    const newFilter: SearchFilter = {
      id: Date.now().toString(),
      field: quickFilter.field,
      operator: quickFilter.operator,
      value: quickFilter.value || '',
      type: field.type,
      label: field.label,
    };

    setFilters([newFilter]);
    onSearch([newFilter], sortBy || undefined, sortOrder);
  };

  const activeFiltersCount = filters.filter(f => 
    f.field && f.operator && 
    (f.value !== '' || ['isEmpty', 'isNotEmpty', 'isNull', 'isNotNull', 'today', 'yesterday', 'thisWeek', 'lastWeek', 'thisMonth', 'lastMonth', 'thisYear', 'lastYear'].includes(f.operator))
  ).length;

  return (
    <>
      <Card withBorder p="sm">
        <Group justify="space-between">
          <Group gap="xs">
            <ThemeIcon size="sm" variant="light" color="blue">
              <IconSearch size={16} />
            </ThemeIcon>
            <Text fw={600} size="sm">Advanced Search</Text>
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
                  <Button
                    variant="subtle"
                    size="xs"
                    leftSection={<IconAdjustments size={14} />}
                  >
                    Quick Filters
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Common Filters</Menu.Label>
                  {quickFilters.map((qf, index) => (
                    <Menu.Item
                      key={index}
                      onClick={() => applyQuickFilter(qf)}
                      leftSection={<IconFilter size={14} />}
                    >
                      {qf.label}
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>
            )}

            <Button
              variant="light"
              size="xs"
              leftSection={<IconFilter size={14} />}
              onClick={open}
            >
              Advanced
            </Button>

            {activeFiltersCount > 0 && (
              <ActionIcon
                variant="subtle"
                size="sm"
                color="red"
                onClick={clearFilters}
                title="Clear all filters"
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
              .filter(f => f.field && f.operator && (f.value !== '' || ['isEmpty', 'isNotEmpty', 'isNull', 'isNotNull', 'today', 'yesterday', 'thisWeek', 'lastWeek', 'thisMonth', 'lastMonth', 'thisYear', 'lastYear'].includes(f.operator)))
              .map(filter => (
                <Chip
                  key={filter.id}
                  size="sm"
                  variant="light"
                  checked={false}
                  onChange={() => removeFilter(filter.id)}
                >
                  {filter.label} {filter.operator} {typeof filter.value === 'object' ? JSON.stringify(filter.value) : filter.value?.toString() || ''}
                </Chip>
              ))}
          </Group>
        )}
      </Card>

      {/* Advanced Search Modal */}
      <Modal
        opened={opened}
        onClose={close}
        title="Advanced Search"
        size="xl"
        scrollAreaComponent={ScrollArea.Autosize}
      >
        <Stack gap="md">
          {/* Saved Searches */}
          {savedSearches.length > 0 && (
            <Paper p="sm" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="sm" fw={500}>Saved Searches</Text>
                <Button
                  variant="subtle"
                  size="xs"
                  leftSection={<IconHistory size={14} />}
                  onClick={() => setShowSaveSearch(!showSaveSearch)}
                >
                  {savedSearches.length} saved
                </Button>
              </Group>
              
              <Group gap="xs">
                {savedSearches.slice(0, 3).map(search => (
                  <Button
                    key={search.id}
                    variant="light"
                    size="xs"
                    onClick={() => loadSavedSearch(search)}
                  >
                    {search.name}
                  </Button>
                ))}
                {savedSearches.length > 3 && (
                  <Menu width={200}>
                    <Menu.Target>
                      <Button variant="subtle" size="xs">
                        +{savedSearches.length - 3} more
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      {savedSearches.slice(3).map(search => (
                        <Menu.Item
                          key={search.id}
                          onClick={() => loadSavedSearch(search)}
                          rightSection={
                            <ActionIcon
                              size="xs"
                              variant="subtle"
                              color="red"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSavedSearch(search.id);
                              }}
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
          <Paper p="sm" withBorder>
            <Group justify="space-between" mb="md">
              <Text fw={500}>Search Filters</Text>
              <Button
                size="xs"
                leftSection={<IconPlus size={14} />}
                onClick={addFilter}
              >
                Add Filter
              </Button>
            </Group>

            <Stack gap="sm">
              {filters.map((filter, index) => {
                const field = searchableFields.find(f => f.name === filter.field);
                const operators = field ? getOperatorsForField(field) : [];

                return (
                  <Paper key={filter.id} p="sm" withBorder>
                    <Group gap="sm" align="flex-start">
                      <Text size="xs" c="dimmed" mt="xs" style={{ minWidth: 20 }}>
                        {index === 0 ? 'WHERE' : 'AND'}
                      </Text>

                      <Select
                        placeholder="Field"
                        value={filter.field}
                        onChange={(value) => {
                          const selectedField = searchableFields.find(f => f.name === value);
                          updateFilter(filter.id, {
                            field: value || '',
                            type: selectedField?.type || 'text',
                            label: selectedField?.label || '',
                            operator: 'contains',
                            value: '',
                          });
                        }}
                        data={searchableFields.map(field => ({
                          value: field.name,
                          label: field.label,
                        }))}
                        size="sm"
                        style={{ flex: 1 }}
                        searchable
                      />

                      <Select
                        placeholder="Operator"
                        value={filter.operator}
                        onChange={(value) => updateFilter(filter.id, { 
                          operator: value || '',
                          value: '',
                        })}
                        data={operators}
                        size="sm"
                        style={{ flex: 1 }}
                      />

                      <Box style={{ flex: 2 }}>
                        {renderFilterValueInput(filter)}
                      </Box>

                      <ActionIcon
                        color="red"
                        variant="subtle"
                        onClick={() => removeFilter(filter.id)}
                        size="sm"
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
          <Paper p="sm" withBorder>
            <Text fw={500} mb="sm">Sort Results</Text>
            <Group gap="sm">
              <Select
                placeholder="Sort by field"
                value={sortBy}
                onChange={(value) => setSortBy(value || '')}
                data={searchableFields.map(field => ({
                  value: field.name,
                  label: field.label,
                }))}
                size="sm"
                style={{ flex: 1 }}
                clearable
              />
              
              <Select
                placeholder="Order"
                value={sortOrder}
                onChange={(value) => setSortOrder(value as 'asc' | 'desc')}
                data={[
                  { value: 'asc', label: 'Ascending' },
                  { value: 'desc', label: 'Descending' },
                ]}
                size="sm"
                style={{ flex: 1 }}
              />
            </Group>
          </Paper>

          {/* Save Search */}
          <Collapse in={showSaveSearch}>
            <Paper p="sm" withBorder>
              <Text fw={500} mb="sm">Save This Search</Text>
              <Group gap="sm">
                <TextInput
                  placeholder="Search name"
                  value={saveSearchName}
                  onChange={(e) => setSaveSearchName(e.target.value)}
                  style={{ flex: 1 }}
                  size="sm"
                />
                <Button
                  leftSection={<IconSave size={14} />}
                  onClick={saveCurrentSearch}
                  size="sm"
                  disabled={!saveSearchName.trim() || filters.length === 0}
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
                variant="light"
                leftSection={<IconSave size={14} />}
                onClick={() => setShowSaveSearch(!showSaveSearch)}
                size="sm"
              >
                Save Search
              </Button>
              <Button
                variant="subtle"
                leftSection={<IconRefresh size={14} />}
                onClick={clearFilters}
                size="sm"
              >
                Reset
              </Button>
            </Group>

            <Group gap="sm">
              <Button variant="light" onClick={close} size="sm">
                Cancel
              </Button>
              <Button
                leftSection={<IconSearch size={14} />}
                onClick={applySearch}
                loading={isLoading}
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