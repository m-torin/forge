'use client';

import { useState, useEffect, forwardRef } from 'react';
import {
  Select,
  Loader,
  Group,
  Text,
  Avatar,
  Badge,
  Stack,
  ActionIcon,
  Tooltip,
  Modal,
  Button,
  TextInput,
  Combobox,
  useCombobox,
  Input,
  ScrollArea,
  Box,
  Divider,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconPlus, IconSearch, IconX, IconCheck, IconDatabase } from '@tabler/icons-react';
import { notify } from '@repo/notifications/mantine-notifications';

interface RelationshipSelectProps {
  // Core props
  value?: string | string[];
  onChange: (value: string | string[] | null) => void;
  onBlur?: () => void;
  error?: string;

  // Field configuration
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  multiple?: boolean;

  // Relationship configuration
  modelName: string;
  displayFields?: string[];
  searchFields?: string[];
  filterBy?: Record<string, any>;
  orderBy?: Record<string, any>;
  includeRelations?: string[];

  // Features
  allowCreate?: boolean;
  allowClear?: boolean;
  showPreview?: boolean;
  showRecordCount?: boolean;
  groupBy?: string;

  // Custom rendering
  renderOption?: (record: any) => React.ReactNode;
  renderValue?: (record: any) => React.ReactNode;

  // Data fetching
  fetchRecords: (query: string, options: any) => Promise<any[]>;
  createRecord?: (data: any) => Promise<any>;
  previewRecord?: (id: string) => Promise<any>;
}

export const RelationshipSelect = forwardRef<HTMLInputElement, RelationshipSelectProps>(
  (
    {
      value,
      onChange,
      onBlur,
      error,
      label,
      placeholder = 'Search and select...',
      description,
      required,
      disabled,
      multiple = false,
      modelName,
      displayFields = ['name', 'title', 'email'],
      searchFields = ['name', 'title', 'email'],
      filterBy,
      orderBy,
      includeRelations,
      allowCreate = false,
      allowClear = true,
      showPreview = false,
      showRecordCount = true,
      groupBy,
      renderOption,
      renderValue,
      fetchRecords,
      createRecord,
      previewRecord,
    },
    ref,
  ) => {
    const combobox = useCombobox({
      onDropdownClose: () => {
        combobox.resetSelectedOption();
        setSearch('');
      },
    });

    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState<any[]>([]);
    const [selectedRecords, setSelectedRecords] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebouncedValue(search, 300);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);
    const [totalCount, setTotalCount] = useState(0);

    // Load initial records and selected values
    useEffect(() => {
      loadRecords('');
      if (value) {
        loadSelectedRecords();
      }
    }, []);

    // Search when debounced value changes
    useEffect(() => {
      if (debouncedSearch) {
        loadRecords(debouncedSearch);
      }
    }, [debouncedSearch]);

    const loadRecords = async (query: string) => {
      setLoading(true);
      try {
        const data = await fetchRecords(query, {
          where: filterBy,
          orderBy,
          include: includeRelations,
          take: 50,
        });
        setRecords(data);
        // Assuming the fetch function also returns total count
        // setTotalCount(data.total || data.length);
      } catch (error) {
        notify.error('Failed to load records');
      } finally {
        setLoading(false);
      }
    };

    const loadSelectedRecords = async () => {
      // Load the currently selected records to display them properly
      // This would need to be implemented based on your data fetching logic
    };

    const getRecordDisplay = (record: any): string => {
      if (!record) return '';

      for (const field of displayFields) {
        if (record[field]) {
          return String(record[field]);
        }
      }
      return record.id || 'Unknown';
    };

    const getRecordSearchText = (record: any): string => {
      return searchFields
        .map((field) => record[field])
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
    };

    const handleSelect = (recordId: string) => {
      const record = records.find((r) => r.id === recordId);
      if (!record) return;

      if (multiple) {
        const currentValues = Array.isArray(value) ? value : [];
        const newValues = currentValues.includes(recordId)
          ? currentValues.filter((id) => id !== recordId)
          : [...currentValues, recordId];

        onChange(newValues.length > 0 ? newValues : null);
        setSelectedRecords(newValues.map((id) => records.find((r) => r.id === id)).filter(Boolean));
      } else {
        onChange(recordId);
        setSelectedRecords([record]);
        combobox.closeDropdown();
      }
    };

    const handleClear = () => {
      onChange(null);
      setSelectedRecords([]);
      setSearch('');
    };

    const handleCreate = async (data: any) => {
      if (!createRecord) return;

      try {
        const newRecord = await createRecord(data);
        notify.success('Record created successfully');

        // Add to records and select it
        setRecords([newRecord, ...records]);
        handleSelect(newRecord.id);
        setCreateModalOpen(false);
      } catch (error) {
        notify.error('Failed to create record');
      }
    };

    const handlePreview = async (recordId: string) => {
      if (!previewRecord) return;

      setPreviewModalOpen(true);
      try {
        const data = await previewRecord(recordId);
        setPreviewData(data);
      } catch (error) {
        notify.error('Failed to load preview');
        setPreviewModalOpen(false);
      }
    };

    // Group records if groupBy is specified
    const groupedRecords = groupBy
      ? records.reduce(
          (acc, record) => {
            const group = record[groupBy] || 'Other';
            if (!acc[group]) acc[group] = [];
            acc[group].push(record);
            return acc;
          },
          {} as Record<string, any[]>,
        )
      : { '': records };

    const filteredRecords = search
      ? records.filter((record) => getRecordSearchText(record).includes(search.toLowerCase()))
      : records;

    const options = filteredRecords.map((record) => (
      <Combobox.Option
        key={record.id}
        value={record.id}
        className={
          multiple && Array.isArray(value) && value.includes(record.id)
            ? 'mantine-Combobox-option--selected'
            : undefined
        }
      >
        {renderOption ? (
          renderOption(record)
        ) : (
          <Group gap="sm">
            {multiple && (
              <Checkbox
                checked={Array.isArray(value) && value.includes(record.id)}
                onChange={() => {}}
                aria-hidden
                style={{ pointerEvents: 'none' }}
              />
            )}
            <div style={{ flex: 1 }}>
              <Text size="sm">{getRecordDisplay(record)}</Text>
              {record.email && record.email !== getRecordDisplay(record) && (
                <Text size="xs" c="dimmed">
                  {record.email}
                </Text>
              )}
            </div>
            {showPreview && previewRecord && (
              <Tooltip label="Preview record">
                <ActionIcon
                  size="xs"
                  variant="subtle"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreview(record.id);
                  }}
                >
                  <IconSearch size={14} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        )}
      </Combobox.Option>
    ));

    const selectedDisplay = multiple
      ? selectedRecords.map((r) => getRecordDisplay(r)).join(', ')
      : selectedRecords[0]
        ? getRecordDisplay(selectedRecords[0])
        : '';

    return (
      <>
        <Combobox store={combobox} onOptionSubmit={handleSelect} withinPortal={false}>
          <Combobox.Target>
            <Input.Wrapper
              label={label}
              description={description}
              required={required}
              error={error}
            >
              <Input
                ref={ref}
                placeholder={placeholder}
                value={search || selectedDisplay}
                onChange={(e) => {
                  setSearch(e.currentTarget.value);
                  combobox.openDropdown();
                }}
                onClick={() => combobox.openDropdown()}
                onFocus={() => combobox.openDropdown()}
                onBlur={onBlur}
                disabled={disabled}
                rightSection={
                  loading ? (
                    <Loader size={18} />
                  ) : (
                    <Group gap={4} wrap="nowrap">
                      {allowClear && value && (
                        <ActionIcon size="sm" variant="subtle" color="gray" onClick={handleClear}>
                          <IconX size={14} />
                        </ActionIcon>
                      )}
                      <Combobox.Chevron />
                    </Group>
                  )
                }
                rightSectionPointerEvents={value ? 'all' : 'none'}
                leftSection={<IconDatabase size={16} />}
              />
            </Input.Wrapper>
          </Combobox.Target>

          <Combobox.Dropdown>
            <Combobox.Search
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              placeholder={`Search ${modelName}...`}
              leftSection={<IconSearch size={14} />}
            />

            <ScrollArea.Autosize mah={300} type="scroll">
              <Box px={4} py={4}>
                {loading && (
                  <Group justify="center" py="xl">
                    <Loader size="sm" />
                  </Group>
                )}

                {!loading && filteredRecords.length === 0 && !allowCreate && (
                  <Text ta="center" py="xl" c="dimmed" size="sm">
                    No records found
                  </Text>
                )}

                {!loading && groupBy ? (
                  Object.entries(groupedRecords).map(([group, groupRecords]) => (
                    <div key={group}>
                      {group && (
                        <Text size="xs" c="dimmed" fw={500} px="sm" py={4}>
                          {group}
                        </Text>
                      )}
                      <Combobox.Options>
                        {groupRecords.map((record) => options.find((opt) => opt.key === record.id))}
                      </Combobox.Options>
                    </div>
                  ))
                ) : (
                  <Combobox.Options>{options}</Combobox.Options>
                )}

                {allowCreate && createRecord && (
                  <>
                    {filteredRecords.length > 0 && <Divider my="xs" />}
                    <Combobox.Option value="__create__">
                      <Group gap="xs">
                        <ActionIcon size="sm" variant="light">
                          <IconPlus size={14} />
                        </ActionIcon>
                        <Text size="sm">
                          Create new {modelName}
                          {search && ` "${search}"`}
                        </Text>
                      </Group>
                    </Combobox.Option>
                  </>
                )}

                {showRecordCount && totalCount > filteredRecords.length && (
                  <Text size="xs" c="dimmed" ta="center" py="xs">
                    Showing {filteredRecords.length} of {totalCount} records
                  </Text>
                )}
              </Box>
            </ScrollArea.Autosize>
          </Combobox.Dropdown>
        </Combobox>

        {/* Create Modal */}
        {allowCreate && (
          <Modal
            opened={createModalOpen}
            onClose={() => setCreateModalOpen(false)}
            title={`Create New ${modelName}`}
          >
            {/* This would include your create form */}
            <Stack>
              <TextInput label="Name" placeholder="Enter name" data-autofocus />
              <Group justify="flex-end">
                <Button variant="subtle" onClick={() => setCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleCreate({ name: 'New Record' })}>Create</Button>
              </Group>
            </Stack>
          </Modal>
        )}

        {/* Preview Modal */}
        {showPreview && (
          <Modal
            opened={previewModalOpen}
            onClose={() => setPreviewModalOpen(false)}
            title={`${modelName} Details`}
            size="lg"
          >
            {previewData ? (
              <Stack>
                {/* Render preview data */}
                <pre>{JSON.stringify(previewData, null, 2)}</pre>
              </Stack>
            ) : (
              <Group justify="center" py="xl">
                <Loader />
              </Group>
            )}
          </Modal>
        )}
      </>
    );
  },
);

RelationshipSelect.displayName = 'RelationshipSelect';
