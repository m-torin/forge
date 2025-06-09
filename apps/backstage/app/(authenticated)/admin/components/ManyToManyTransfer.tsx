'use client';

import {
  ActionIcon,
  Box,
  Button,
  Card,
  Checkbox,
  Group,
  Loader,
  Stack,
  Text,
  TextInput,
  Tooltip,
  TransferList,
  type TransferListData,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconRefresh, IconSearch } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { notify } from '@repo/notifications/mantine-notifications';

interface ManyToManyTransferProps {
  onChange: (value: string[]) => void;
  // Core props
  value: string[];

  description?: string;
  // Configuration
  label: string;
  leftTitle?: string;
  rightTitle?: string;

  displayField?: string;
  // Data configuration
  modelName: string;
  searchFields?: string[];

  height?: number;
  showCount?: boolean;
  showRefresh?: boolean;
  // Features
  showSearch?: boolean;

  // Data fetching
  fetchAvailable: () => Promise<any[]>;
  fetchSelected: (ids: string[]) => Promise<any[]>;
  onSave?: (selectedIds: string[]) => Promise<void>;
}

export function ManyToManyTransfer({
  description,
  displayField = 'name',
  fetchAvailable,
  fetchSelected,
  height = 300,
  label,
  leftTitle = 'Available',
  modelName,
  onChange,
  onSave,
  rightTitle = 'Selected',
  searchFields = ['name', 'email'],
  showCount = true,
  showRefresh = true,
  showSearch = true,
  value,
}: ManyToManyTransferProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [availableRecords, setAvailableRecords] = useState<any[]>([]);
  const [selectedRecords, setSelectedRecords] = useState<any[]>([]);
  const [data, setData] = useState<TransferListData>([[], []]);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 300);

  // Load data on mount and when value changes
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (value.length > 0) {
      loadSelectedData();
    }
  }, [value]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [available, selected] = await Promise.all([
        fetchAvailable(),
        value.length > 0 ? fetchSelected(value) : Promise.resolve([]),
      ]);

      setAvailableRecords(available);
      setSelectedRecords(selected);

      // Convert to TransferList format
      const availableItems = available
        .filter((record) => !value.includes(record.id))
        .map((record) => ({
          label: record[displayField] || record.id,
          record, // Store the full record for searching
          value: record.id,
        }));

      const selectedItems = selected.map((record) => ({
        label: record[displayField] || record.id,
        record,
        value: record.id,
      }));

      setData([availableItems, selectedItems]);
    } catch (error) {
      notify.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedData = async () => {
    try {
      const selected = await fetchSelected(value);
      setSelectedRecords(selected);

      // Update only the selected side
      const selectedItems = selected.map((record) => ({
        label: record[displayField] || record.id,
        record,
        value: record.id,
      }));

      setData((current) => [current[0], selectedItems]);
    } catch (error) {
      notify.error('Failed to load selected records');
    }
  };

  const handleChange = (newData: TransferListData) => {
    setData(newData);
    const selectedIds = newData[1].map((item) => item.value);
    onChange(selectedIds);
  };

  const handleSave = async () => {
    if (!onSave) return;

    setSaving(true);
    try {
      const selectedIds = data[1].map((item) => item.value);
      await onSave(selectedIds);
      notify.success('Changes saved successfully');
    } catch (error) {
      notify.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // Filter data based on search
  const filteredData: TransferListData = search
    ? [
        data[0].filter((item) => {
          const record = (item as any).record;
          return searchFields.some((field) =>
            record[field]?.toString().toLowerCase().includes(debouncedSearch.toLowerCase()),
          );
        }),
        data[1].filter((item) => {
          const record = (item as any).record;
          return searchFields.some((field) =>
            record[field]?.toString().toLowerCase().includes(debouncedSearch.toLowerCase()),
          );
        }),
      ]
    : data;

  return (
    <Card withBorder>
      <Stack>
        <div>
          <Group align="flex-start" justify="space-between">
            <div>
              <Text fw={500} size="lg">
                {label}
              </Text>
              {description && (
                <Text c="dimmed" mt={4} size="sm">
                  {description}
                </Text>
              )}
            </div>
            {showRefresh && (
              <Tooltip label="Refresh data">
                <ActionIcon loading={loading} onClick={loadData} variant="subtle">
                  <IconRefresh size={18} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </div>

        {showSearch && (
          <TextInput
            leftSection={<IconSearch size={16} />}
            onChange={(e) => setSearch(e.currentTarget.value)}
            placeholder={`Search ${modelName}...`}
            value={search}
          />
        )}

        {loading ? (
          <Group justify="center" py="xl">
            <Loader />
          </Group>
        ) : (
          <Box>
            <TransferList
              // Custom item component for better display
              itemComponent={({ data, selected }) => (
                <Group style={{ width: '100%' }} gap="xs">
                  <Checkbox
                    aria-hidden
                    onChange={() => {}}
                    style={{ pointerEvents: 'none' }}
                    checked={selected}
                    tabIndex={-1}
                  />
                  <div style={{ flex: 1 }}>
                    <Text size="sm" truncate>
                      {data.label}
                    </Text>
                    {(data as any).record?.email && (
                      <Text c="dimmed" size="xs" truncate>
                        {(data as any).record.email}
                      </Text>
                    )}
                  </div>
                </Group>
              )}
              nothingFound="No records found"
              onChange={handleChange}
              searchPlaceholder="Search..."
              showTransferAll
              listHeight={height}
              searchValues={['', '']}
              titles={[
                showCount ? `${leftTitle} (${filteredData[0].length})` : leftTitle,
                showCount ? `${rightTitle} (${filteredData[1].length})` : rightTitle,
              ]}
              value={filteredData}
            />
          </Box>
        )}

        {onSave && (
          <Group justify="flex-end">
            <Text c="dimmed" size="xs">
              {data[1].length} {modelName}s selected
            </Text>
            <Button loading={saving} onClick={handleSave} disabled={loading}>
              Save Changes
            </Button>
          </Group>
        )}
      </Stack>
    </Card>
  );
}
