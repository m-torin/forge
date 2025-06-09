'use client';

import {
  ActionIcon,
  Box,
  Button,
  Combobox,
  Divider,
  Group,
  Input,
  Loader,
  Modal,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  Tooltip,
  useCombobox,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconDatabase, IconPlus, IconSearch, IconX } from '@tabler/icons-react';
import { forwardRef, useEffect, useState } from 'react';

import { notify } from '@repo/notifications/mantine-notifications';

interface RelationshipSelectProps {
  error?: string;
  onBlur?: () => void;
  onChange: (value: string | string[] | null) => void;
  // Core props
  value?: string | string[];

  description?: string;
  disabled?: boolean;
  // Field configuration
  label: string;
  multiple?: boolean;
  placeholder?: string;
  required?: boolean;

  displayFields?: string[];
  filterBy?: Record<string, any>;
  includeRelations?: string[];
  // Relationship configuration
  modelName: string;
  orderBy?: Record<string, any>;
  searchFields?: string[];

  allowClear?: boolean;
  // Features
  allowCreate?: boolean;
  groupBy?: string;
  showPreview?: boolean;
  showRecordCount?: boolean;

  // Custom rendering
  renderOption?: (record: any) => React.ReactNode;
  renderValue?: (record: any) => React.ReactNode;

  createRecord?: (data: any) => Promise<any>;
  // Data fetching
  fetchRecords: (query: string, options: any) => Promise<any[]>;
  previewRecord?: (id: string) => Promise<any>;
}

export const RelationshipSelect = forwardRef<HTMLInputElement, RelationshipSelectProps>(
  (
    {
      allowClear = true,
      allowCreate = false,
      createRecord,
      description,
      disabled,
      displayFields = ['name', 'title', 'email'],
      error,
      fetchRecords,
      filterBy,
      groupBy,
      includeRelations,
      label,
      modelName,
      multiple = false,
      onBlur,
      onChange,
      orderBy,
      placeholder = 'Search and select...',
      previewRecord,
      renderOption,
      renderValue,
      required,
      searchFields = ['name', 'title', 'email'],
      showPreview = false,
      showRecordCount = true,
      value,
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
          include: includeRelations,
          orderBy,
          take: 50,
          where: filterBy,
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
        className={
          multiple && Array.isArray(value) && value.includes(record.id)
            ? 'mantine-Combobox-option--selected'
            : undefined
        }
        value={record.id}
      >
        {renderOption ? (
          renderOption(record)
        ) : (
          <Group gap="sm">
            {multiple && (
              <Checkbox
                aria-hidden
                onChange={() => {}}
                style={{ pointerEvents: 'none' }}
                checked={Array.isArray(value) && value.includes(record.id)}
              />
            )}
            <div style={{ flex: 1 }}>
              <Text size="sm">{getRecordDisplay(record)}</Text>
              {record.email && record.email !== getRecordDisplay(record) && (
                <Text c="dimmed" size="xs">
                  {record.email}
                </Text>
              )}
            </div>
            {showPreview && previewRecord && (
              <Tooltip label="Preview record">
                <ActionIcon
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreview(record.id);
                  }}
                  size="xs"
                  variant="subtle"
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
        <Combobox onOptionSubmit={handleSelect} store={combobox} withinPortal={false}>
          <Combobox.Target>
            <Input.Wrapper
              description={description}
              error={error}
              label={label}
              required={required}
            >
              <Input
                ref={ref}
                leftSection={<IconDatabase size={16} />}
                onBlur={onBlur}
                onChange={(e) => {
                  setSearch(e.currentTarget.value);
                  combobox.openDropdown();
                }}
                onClick={() => combobox.openDropdown()}
                onFocus={() => combobox.openDropdown()}
                placeholder={placeholder}
                rightSection={
                  loading ? (
                    <Loader size={18} />
                  ) : (
                    <Group gap={4} wrap="nowrap">
                      {allowClear && value && (
                        <ActionIcon color="gray" onClick={handleClear} size="sm" variant="subtle">
                          <IconX size={14} />
                        </ActionIcon>
                      )}
                      <Combobox.Chevron />
                    </Group>
                  )
                }
                rightSectionPointerEvents={value ? 'all' : 'none'}
                disabled={disabled}
                value={search || selectedDisplay}
              />
            </Input.Wrapper>
          </Combobox.Target>

          <Combobox.Dropdown>
            <Combobox.Search
              leftSection={<IconSearch size={14} />}
              onChange={(event) => setSearch(event.currentTarget.value)}
              placeholder={`Search ${modelName}...`}
              value={search}
            />

            <ScrollArea.Autosize mah={300} type="scroll">
              <Box px={4} py={4}>
                {loading && (
                  <Group justify="center" py="xl">
                    <Loader size="sm" />
                  </Group>
                )}

                {!loading && filteredRecords.length === 0 && !allowCreate && (
                  <Text c="dimmed" py="xl" size="sm" ta="center">
                    No records found
                  </Text>
                )}

                {!loading && groupBy ? (
                  Object.entries(groupedRecords).map(([group, groupRecords]) => (
                    <div key={group}>
                      {group && (
                        <Text c="dimmed" fw={500} px="sm" py={4} size="xs">
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
                  <Text c="dimmed" py="xs" size="xs" ta="center">
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
            onClose={() => setCreateModalOpen(false)}
            opened={createModalOpen}
            title={`Create New ${modelName}`}
          >
            {/* This would include your create form */}
            <Stack>
              <TextInput data-autofocus placeholder="Enter name" label="Name" />
              <Group justify="flex-end">
                <Button onClick={() => setCreateModalOpen(false)} variant="subtle">
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
            onClose={() => setPreviewModalOpen(false)}
            opened={previewModalOpen}
            size="lg"
            title={`${modelName} Details`}
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
