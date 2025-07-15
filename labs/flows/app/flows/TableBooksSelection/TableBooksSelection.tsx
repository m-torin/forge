'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import cx from 'clsx';
import {
  Anchor,
  Avatar,
  Badge,
  Button,
  Checkbox,
  Group,
  Progress,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import { IconActivity } from '@tabler/icons-react';
import Link from 'next/link';
import classes from './TableBooksSelection.module.scss';

interface FlowData {
  id: string;
  name: string;
  owner: string;
  runs: {
    positive: number;
    negative: number;
  };
  isEnabled: boolean;
  metadata?: any;
}

interface TableBooksSelectionProps {
  data: FlowData[];
}

export function TableBooksSelection({ data }: TableBooksSelectionProps) {
  const router = useRouter();
  const [selection, setSelection] = useState<string[]>([]);

  const toggleRow = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    e.stopPropagation();
    setSelection((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const toggleAll = () =>
    setSelection((current) =>
      current.length === data.length ? [] : data.map((item) => item.id),
    );

  const handleRowClick = (id: string) => {
    router.push(`/flows/${id}`);
  };

  const handleRowMouseEnter = (id: string) => {
    router.prefetch(`/flows/${id}`);
  };

  const activeFlows = data.filter((flow) => flow.isEnabled).length;
  const inactiveFlows = data.length - activeFlows;
  const totalRuns = data.reduce(
    (sum, flow) => sum + flow.runs.positive + flow.runs.negative,
    0,
  );

  const rows = data.map((row) => {
    const totalRuns = row.runs.negative + row.runs.positive;
    const positiveRuns =
      totalRuns > 0 ? (row.runs.positive / totalRuns) * 100 : 0;
    const negativeRuns =
      totalRuns > 0 ? (row.runs.negative / totalRuns) * 100 : 0;
    const selected = selection.includes(row.id);

    return (
      <Table.Tr
        key={row.id}
        className={cx({ [classes.rowSelected]: selected })}
        onClick={() => handleRowClick(row.id)}
        onMouseEnter={() => handleRowMouseEnter(row.id)}
        style={{ cursor: 'pointer' }}
      >
        <Table.Td onClick={(e) => e.stopPropagation()}>
          <Checkbox checked={selected} onChange={(e) => toggleRow(e, row.id)} />
        </Table.Td>
        <Table.Td>
          <Group gap="xs">
            <Anchor component="button" fz="sm">
              {row.name}
            </Anchor>

            <Badge
              size="xs"
              variant="light"
              color={row.isEnabled ? 'green' : 'gray'}
            >
              {row.isEnabled ? 'Active' : 'Inactive'}
            </Badge>
          </Group>
        </Table.Td>
        <Table.Td>
          <Group gap="sm">
            <Avatar
              size={26}
              src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-1.png"
              radius={26}
            />

            <Anchor component="button" fz="sm">
              {row.owner}
            </Anchor>
          </Group>
        </Table.Td>
        <Table.Td>{Intl.NumberFormat().format(totalRuns)}</Table.Td>
        <Table.Td>
          <Group justify="space-between">
            <Text fz="xs" c="teal" fw={700}>
              {positiveRuns.toFixed(0)}%
            </Text>
            <Text fz="xs" c="red" fw={700}>
              {negativeRuns.toFixed(0)}%
            </Text>
          </Group>
          <Progress.Root>
            <Progress.Section
              className={classes.progressSection}
              value={positiveRuns}
              color="teal"
            />
            <Progress.Section
              className={classes.progressSection}
              value={negativeRuns}
              color="red"
            />
          </Progress.Root>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Stack gap="md">
      <Group px="md" pt="md">
        <Badge color="green" size="lg" variant="light">
          {activeFlows} Active
        </Badge>
        <Badge color="gray" size="lg" variant="light">
          {inactiveFlows} Inactive
        </Badge>
        <Badge color="blue" size="lg" variant="light">
          {totalRuns} Total Runs
        </Badge>

        <Button
          ml="auto"
          leftSection={<IconActivity size={16} />}
          variant="light"
          color="gray"
          component={Link}
          href="/flows/metrics"
        >
          Metrics
        </Button>
      </Group>

      <Table.ScrollContainer minWidth={800}>
        <Table horizontalSpacing="md" verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={40}>
                <Checkbox
                  onChange={toggleAll}
                  checked={selection.length === data.length}
                  indeterminate={
                    selection.length > 0 && selection.length !== data.length
                  }
                />
              </Table.Th>
              <Table.Th>Flow name</Table.Th>
              <Table.Th>Owner</Table.Th>
              <Table.Th>Runs</Table.Th>
              <Table.Th>Result distribution</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Stack>
  );
}
