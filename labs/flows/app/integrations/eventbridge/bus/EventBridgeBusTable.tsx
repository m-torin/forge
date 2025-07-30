'use client';

import { useState, useEffect } from 'react';
import { Box, ActionIcon, Alert } from '@mantine/core';
import { StatusBadge, EntityTable, type StatusConfig } from '../GenericTable';
import { IconEdit, IconAlertCircle } from '@tabler/icons-react';
import { logInfo, logError } from '@repo/observability';

import {
  type DataTableColumn,
  type DataTableSortStatus,
} from 'mantine-datatable';
import { ListEventBusesCommand } from '#/integrations/aws/eventbridge';

// Make all AWS EventBus properties required that we know will always be present
interface EventBridgeBus {
  id: string;
  Name: string;
  State: string;
  Arn: string;
  CreationTime?: Date | undefined;
  Description?: string | undefined;  
  Policy?: string | undefined;
  LastModifiedTime?: Date | undefined;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  active: { value: 'active', color: 'green', label: 'Active' },
  creating: { value: 'creating', color: 'yellow', label: 'Creating' },
};

export const EventBridgeBusTable = (): React.JSX.Element => {
  const [buses, setBuses] = useState<EventBridgeBus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortStatus, setSortStatus] = useState<
    DataTableSortStatus<EventBridgeBus>
  >({ columnAccessor: 'Name', direction: 'asc' });
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const loadBuses = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await ListEventBusesCommand({});
        const fetchedBuses = response.EventBuses || [];

        // Transform and validate the data
        const transformedBuses: EventBridgeBus[] = fetchedBuses
          .filter(
            (bus): bus is EventBridgeBus & { Name: string; Arn: string } =>
              Boolean(bus.Name && bus.Arn),
          )
          .map((bus) => ({
            id: bus.Arn,
            Name: bus.Name,
            Arn: bus.Arn,
            State: bus.State || 'active',
            CreationTime: bus.CreationTime,
            Description: bus.Description,
            Policy: bus.Policy,
            LastModifiedTime: bus.LastModifiedTime,
          }));

        setBuses(transformedBuses);
      } catch (err) {
        logError('Error loading buses', { err });
        setError(err instanceof Error ? err.message : 'Failed to load buses');
      } finally {
        setLoading(false);
      }
    };

    loadBuses();
  }, []);

  const handleSort = (newSortStatus: DataTableSortStatus<EventBridgeBus>) => {
    setSortStatus(newSortStatus);
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const handleReset = () => {
    setBuses([]);
    setSearchValue('');
    setSortStatus({ columnAccessor: 'Name', direction: 'asc' });
  };

  const columns: DataTableColumn<EventBridgeBus>[] = [
    {
      accessor: 'Name',
      title: 'Bus Name',
      sortable: true,
    },
    {
      accessor: 'Arn',
      title: 'ARN',
      sortable: true,
    },
    {
      accessor: 'CreationTime',
      title: 'Created At',
      sortable: true,
      render: (record: EventBridgeBus) =>
        record.CreationTime
          ? new Date(record.CreationTime).toLocaleString()
          : 'N/A',
    },
    {
      accessor: 'State',
      title: 'State',
      render: (record: EventBridgeBus) => (
        <StatusBadge
          status={record.State.toLowerCase()}
          config={STATUS_CONFIG}
        />
      ),
    },
    {
      accessor: 'actions',
      title: <Box mx={6}>Actions</Box>,
      render: (record: EventBridgeBus) => (
        <ActionIcon
          size="sm"
          variant="subtle"
          color="blue"
          onClick={(e) => {
            e.stopPropagation();
            logInfo('Edit bus', { record });
          }}
        >
          <IconEdit size={16} />
        </ActionIcon>
      ),
    },
  ];

  return (
    <Box>
      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error"
          color="red"
          mb="md"
        >
          {error}
        </Alert>
      )}

      <EntityTable<EventBridgeBus>
        records={buses}
        columns={columns}
        loading={loading}
        page={1}
        totalRecords={buses.length}
        pageSize={10}
        sortStatus={sortStatus}
        onSort={handleSort}
        onSearch={handleSearch}
        searchValue={searchValue}
        onReset={handleReset}
        sortable
        searchable
      />

      {buses.length === 0 && !loading && !error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="blue"
          variant="light"
        >
          No EventBridge buses found.
        </Alert>
      )}
    </Box>
  );
};

export default EventBridgeBusTable;
