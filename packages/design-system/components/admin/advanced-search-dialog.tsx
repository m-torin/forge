'use client';

import {
  ActionIcon,
  Badge,
  Button,
  Divider,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconPlus, IconSearch, IconX } from '@tabler/icons-react';
import React, { useState } from 'react';

interface Filter {
  field: string;
  operator: string;
  value: string;
}

interface AdvancedSearchDialogProps {
  onSearch: (
    filters: Filter[],
    searchField?: string,
    searchOperator?: string,
    searchValue?: string,
  ) => void;
}

export function AdvancedSearchDialog({ onSearch }: AdvancedSearchDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchField, setSearchField] = useState<string>('email');
  const [searchOperator, setSearchOperator] = useState<string>('contains');
  const [searchValue, setSearchValue] = useState<string>('');
  const [filters, setFilters] = useState<Filter[]>([]);
  const [newFilter, setNewFilter] = useState<Filter>({
    field: 'role',
    operator: 'eq',
    value: '',
  });
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const handleAddFilter = () => {
    if (newFilter.value) {
      setFilters([...filters, newFilter]);
      setNewFilter({
        field: 'role',
        operator: 'eq',
        value: '',
      });
    }
  };

  const handleRemoveFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const handleSearch = () => {
    onSearch(
      filters,
      searchValue ? searchField : undefined,
      searchValue ? searchOperator : undefined,
      searchValue || undefined,
    );
    setIsOpen(false);
    if (searchValue) {
      setSearchHistory([...searchHistory, searchValue]);
    }
  };

  const handleReset = () => {
    setSearchField('email');
    setSearchOperator('contains');
    setSearchValue('');
    setFilters([]);
    setNewFilter({
      field: 'role',
      operator: 'eq',
      value: '',
    });
  };

  return (
    <>
      <ActionIcon onClick={() => setIsOpen(true)} variant="outline">
        <IconSearch size={16} />
      </ActionIcon>

      <Modal
        onClose={() => setIsOpen(false)}
        opened={isOpen}
        size="lg"
        title={<Title order={4}>Advanced Search</Title>}
      >
        <Text c="dimmed" mb="lg" size="sm">
          Build complex queries to filter users
        </Text>

        <Stack gap="lg">
          {/* Search Section */}
          <Stack gap="sm">
            <Text fw={500}>Search</Text>
            <Group grow gap="sm">
              <Select
                onChange={(value) => setSearchField(value!)}
                data={[
                  { label: 'Email', value: 'email' },
                  { label: 'Name', value: 'name' },
                ]}
                value={searchField}
              />
              <Select
                onChange={(value) => setSearchOperator(value!)}
                data={[
                  { label: 'Contains', value: 'contains' },
                  { label: 'Starts with', value: 'starts_with' },
                  { label: 'Ends with', value: 'ends_with' },
                ]}
                value={searchOperator}
              />
              <TextInput
                onChange={(e) => setSearchValue(e.currentTarget.value)}
                placeholder="Search value..."
                style={{ flex: 2 }}
                value={searchValue}
              />
            </Group>
          </Stack>

          <Divider />

          {/* Filters Section */}
          <Stack gap="sm">
            <Text fw={500}>Filters</Text>
            {filters.length > 0 && (
              <Stack gap="xs">
                {filters.map((filter, index) => (
                  <Group key={`${filter.field}-${filter.operator}-${filter.value}`} gap="xs">
                    <Badge size="lg" variant="light">
                      {filter.field} {filter.operator} {filter.value}
                    </Badge>
                    <ActionIcon
                      color="red"
                      onClick={() => handleRemoveFilter(index)}
                      size="sm"
                      variant="subtle"
                    >
                      <IconX size={14} />
                    </ActionIcon>
                  </Group>
                ))}
              </Stack>
            )}
            <Group grow gap="sm">
              <Select
                onChange={(value) => setNewFilter({ ...newFilter, field: value! })}
                data={[
                  { label: 'Role', value: 'role' },
                  { label: 'Banned', value: 'banned' },
                  { label: 'Verified', value: 'emailVerified' },
                ]}
                value={newFilter.field}
              />
              <Select
                onChange={(value) => setNewFilter({ ...newFilter, operator: value! })}
                data={[
                  { label: 'Equals', value: 'eq' },
                  { label: 'Not equals', value: 'neq' },
                  { label: 'Greater than', value: 'gt' },
                  { label: 'Less than', value: 'lt' },
                ]}
                value={newFilter.operator}
              />
              <TextInput
                onChange={(e) => setNewFilter({ ...newFilter, value: e.currentTarget.value })}
                placeholder="Filter value..."
                style={{ flex: 2 }}
                value={newFilter.value}
              />
              <ActionIcon onClick={handleAddFilter} disabled={!newFilter.value} variant="outline">
                <IconPlus size={16} />
              </ActionIcon>
            </Group>
          </Stack>

          <Divider />

          {/* Search History Section */}
          <Stack gap="sm">
            <Text fw={500}>Search History</Text>
            {searchHistory.length > 0 && (
              <Stack gap="xs">
                {searchHistory.map((term) => (
                  <Button
                    key={term}
                    onClick={() => setSearchValue(term)}
                    size="xs"
                    variant="subtle"
                  >
                    {term}
                  </Button>
                ))}
              </Stack>
            )}
          </Stack>
        </Stack>

        <Group justify="flex-end" mt="xl">
          <Button onClick={handleReset} variant="subtle">
            Reset
          </Button>
          <Button onClick={handleSearch}>Search</Button>
        </Group>
      </Modal>
    </>
  );
}
