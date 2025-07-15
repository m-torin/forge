// views.tsx
import React from 'react';
import {
  Table,
  Avatar,
  Text,
  Group,
  Box,
  Stack,
  Badge,
  ActionIcon,
  Menu,
  Timeline,
} from '@mantine/core';
import {
  IconDotsVertical,
  IconRefresh,
  IconClock,
  IconChevronDown,
  IconChevronRight,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { DataEntry, ViewProps, getActionProps } from './types';

interface ExpandedContentProps {
  item: DataEntry;
  classes: Record<string, string>;
}

export const ExpandedContent: React.FC<ExpandedContentProps> = ({
  item,
  classes,
}) => (
  <Box p="md" className={classes.expandedRow}>
    <Stack gap="xs">
      <Group justify="space-between">
        <Text size="sm" fw={500}>
          Metadata
        </Text>
        <Menu position="bottom-end">
          <Menu.Target>
            <ActionIcon variant="subtle">
              <IconDotsVertical size={16} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<IconRefresh size={14} />}>
              Retry Action
            </Menu.Item>
            <Menu.Item leftSection={<IconClock size={14} />}>
              View History
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
      {item.metadata?.previousState && (
        <Group>
          <Text size="sm" c="dimmed">
            Previous State:
          </Text>
          <Text size="sm">{item.metadata.previousState}</Text>
        </Group>
      )}
      {item.metadata?.newState && (
        <Group>
          <Text size="sm" c="dimmed">
            New State:
          </Text>
          <Text size="sm">{item.metadata.newState}</Text>
        </Group>
      )}
      {item.metadata?.duration && (
        <Group>
          <Text size="sm" c="dimmed">
            Duration:
          </Text>
          <Text size="sm">{item.metadata.duration}</Text>
        </Group>
      )}
      {item.metadata?.relatedEntries && (
        <Box>
          <Text size="sm" c="dimmed">
            Related Entries:
          </Text>
          <Group mt="xs" gap="xs">
            {item.metadata.relatedEntries.map((entry) => (
              <Badge key={entry} size="sm" variant="light">
                {entry}
              </Badge>
            ))}
          </Group>
        </Box>
      )}
    </Stack>
  </Box>
);

export const TableView: React.FC<ViewProps> = ({
  data,
  classes,
  expandedRows,
  toggleRow,
}) => {
  const groupedData = data.reduce(
    (acc, item) => {
      const date = dayjs(item.datetime).format('MMMM D, YYYY');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    },
    {} as Record<string, DataEntry[]>,
  );

  return (
    <Table.ScrollContainer minWidth={800}>
      <Table verticalSpacing="sm" horizontalSpacing="lg">
        <Table.Thead className={classes.tableHeader}>
          <Table.Tr>
            <Table.Th w={40} />
            <Table.Th>User</Table.Th>
            <Table.Th>Action</Table.Th>
            <Table.Th>Entry</Table.Th>
            <Table.Th>Role</Table.Th>
            <Table.Th>DateTime</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {Object.entries(groupedData).map(([date, items]) => (
            <React.Fragment key={`group-${date}`}>
              <Table.Tr>
                <Table.Td colSpan={6} className={classes.dateGroup}>
                  <Text fw={500}>{date}</Text>
                </Table.Td>
              </Table.Tr>
              {items.map((item) => (
                <React.Fragment key={`row-${item.id}`}>
                  <Table.Tr className={classes.row}>
                    <Table.Td>
                      <ActionIcon
                        onClick={() => toggleRow(item.id)}
                        variant="subtle"
                      >
                        {expandedRows.has(item.id) ? (
                          <IconChevronDown size={16} />
                        ) : (
                          <IconChevronRight size={16} />
                        )}
                      </ActionIcon>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="sm">
                        <Avatar radius="xl" color="blue">
                          {item.name.charAt(0)}
                        </Avatar>
                        <Text size="sm" fw={500}>
                          {item.name}
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        className={classes.actionBadge}
                        color={getActionProps(item.action).color}
                        leftSection={getActionProps(item.action).icon}
                      >
                        {item.action}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" color="gray">
                        {item.entry}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {item.role}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {dayjs(item.datetime).format('h:mm A')}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                  {expandedRows.has(item.id) && (
                    <Table.Tr>
                      <Table.Td colSpan={6} p={0}>
                        <ExpandedContent item={item} classes={classes} />
                      </Table.Td>
                    </Table.Tr>
                  )}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
};

export const TimelineView: React.FC<ViewProps> = ({ data, classes }) => (
  <Timeline active={data.length - 1} bulletSize={24} lineWidth={2}>
    {data.map((item) => {
      const actionProps = getActionProps(item.action);
      return (
        <Timeline.Item
          key={item.id}
          bullet={actionProps.icon}
          title={
            <Group justify="space-between">
              <Text size="sm" fw={500}>
                {item.entry}
              </Text>
              <Text size="xs" c="dimmed">
                {dayjs(item.datetime).format('h:mm A')}
              </Text>
            </Group>
          }
          className={classes.timelineItem}
        >
          <Group justify="space-between" mt="xs">
            <Group gap="sm">
              <Avatar size="sm" radius="xl" color="blue">
                {item.name.charAt(0)}
              </Avatar>
              <Text size="sm">{item.name}</Text>
              <Badge size="sm" variant="light" color={actionProps.color}>
                {item.action}
              </Badge>
            </Group>
          </Group>
        </Timeline.Item>
      );
    })}
  </Timeline>
);
