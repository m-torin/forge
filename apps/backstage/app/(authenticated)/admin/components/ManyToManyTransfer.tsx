'use client';

import { useState, useEffect } from 'react';
import {
  TransferList,
  TransferListData,
  Stack,
  Text,
  Badge,
  Group,
  TextInput,
  Loader,
  Card,
  Button,
  Checkbox,
  ActionIcon,
  Tooltip,
  Box,
} from '@mantine/core';
import { IconSearch, IconRefresh, IconFilter } from '@tabler/icons-react';
import { useDebouncedValue } from '@mantine/hooks';
import { notify } from '@repo/notifications/mantine-notifications';

interface ManyToManyTransferProps {
  // Core props
  value: string[];
  onChange: (value: string[]) => void;

  // Configuration
  label: string;
  description?: string;
  leftTitle?: string;
  rightTitle?: string;

  // Data configuration
  modelName: string;
  displayField?: string;
  searchFields?: string[];

  // Features
  showSearch?: boolean;
  showCount?: boolean;
  showRefresh?: boolean;
  height?: number;

  // Data fetching
  fetchAvailable: () => Promise<any[]>;
  fetchSelected: (ids: string[]) => Promise<any[]>;
  onSave?: (selectedIds: string[]) => Promise<void>;
}

export function ManyToManyTransfer({
  value,
  onChange,
  label,
  description,
  leftTitle = 'Available',
  rightTitle = 'Selected',
  modelName,
  displayField = 'name',
  searchFields = ['name', 'email'],
  showSearch = true,
  showCount = true,
  showRefresh = true,
  height = 300,
  fetchAvailable,
  fetchSelected,
  onSave,
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
          value: record.id,
          label: record[displayField] || record.id,
          record, // Store the full record for searching
        }));

      const selectedItems = selected.map((record) => ({
        value: record.id,
        label: record[displayField] || record.id,
        record,
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
        value: record.id,
        label: record[displayField] || record.id,
        record,
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
          <Group justify="space-between" align="flex-start">
            <div>
              <Text fw={500} size="lg">
                {label}
              </Text>
              {description && (
                <Text size="sm" c="dimmed" mt={4}>
                  {description}
                </Text>
              )}
            </div>
            {showRefresh && (
              <Tooltip label="Refresh data">
                <ActionIcon variant="subtle" onClick={loadData} loading={loading}>
                  <IconRefresh size={18} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </div>

        {showSearch && (
          <TextInput
            placeholder={`Search ${modelName}...`}
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />
        )}

        {loading ? (
          <Group justify="center" py="xl">
            <Loader />
          </Group>
        ) : (
          <Box>
            <TransferList
              value={filteredData}
              onChange={handleChange}
              searchPlaceholder="Search..."
              nothingFound="No records found"
              titles={[
                showCount ? `${leftTitle} (${filteredData[0].length})` : leftTitle,
                showCount ? `${rightTitle} (${filteredData[1].length})` : rightTitle,
              ]}
              listHeight={height}
              showTransferAll
              searchValues={['', '']}
              // Custom item component for better display
              itemComponent={({ data, selected }) => (
                <Group gap="xs" style={{ width: '100%' }}>
                  <Checkbox
                    checked={selected}
                    onChange={() => {}}
                    aria-hidden
                    tabIndex={-1}
                    style={{ pointerEvents: 'none' }}
                  />
                  <div style={{ flex: 1 }}>
                    <Text size="sm" truncate>
                      {data.label}
                    </Text>
                    {(data as any).record?.email && (
                      <Text size="xs" c="dimmed" truncate>
                        {(data as any).record.email}
                      </Text>
                    )}
                  </div>
                </Group>
              )}
            />
          </Box>
        )}

        {onSave && (
          <Group justify="flex-end">
            <Text size="xs" c="dimmed">
              {data[1].length} {modelName}s selected
            </Text>
            <Button onClick={handleSave} loading={saving} disabled={loading}>
              Save Changes
            </Button>
          </Group>
        )}
      </Stack>
    </Card>
  );
}
