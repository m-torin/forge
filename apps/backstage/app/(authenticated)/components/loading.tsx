'use client';

import {
  Skeleton,
  Stack,
  Group,
  Card,
  SimpleGrid,
  Table,
  Avatar,
  Badge,
  Text,
  Box,
} from '@mantine/core';

export function StatsCardSkeleton() {
  return (
    <Card shadow="sm" withBorder padding="lg">
      <Stack gap="sm">
        <Group justify="space-between">
          <Stack gap="xs" style={{ flex: 1 }}>
            <Skeleton height={16} width="60%" />
            <Skeleton height={24} width="40%" />
          </Stack>
          <Skeleton height={40} width={40} radius="md" />
        </Group>
        <Skeleton height={8} />
      </Stack>
    </Card>
  );
}

export function TableRowSkeleton({ columns = 6 }: { columns?: number }) {
  return (
    <Table.Tr>
      {Array.from({ length: columns }, (_, i) => (
        <Table.Td key={i}>
          {i === 0 ? (
            <Group gap="sm">
              <Skeleton height={32} width={32} radius="xl" />
              <Stack gap={4}>
                <Skeleton height={14} width={120} />
                <Skeleton height={12} width={80} />
              </Stack>
            </Group>
          ) : i === 1 ? (
            <Skeleton height={20} width={60} radius="sm" />
          ) : (
            <Skeleton height={12} width={Math.random() * 60 + 40} />
          )}
        </Table.Td>
      ))}
    </Table.Tr>
  );
}

export function TableSkeleton({
  rows = 5,
  columns = 6,
  showHeader = true,
}: {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}) {
  return (
    <Card shadow="sm" withBorder padding="lg">
      <Stack gap="md">
        <Group justify="space-between">
          <Skeleton height={24} width={200} />
          <Group>
            <Skeleton height={14} width={100} />
            <Skeleton height={32} width={80} />
          </Group>
        </Group>

        <Table highlightOnHover>
          {showHeader && (
            <Table.Thead>
              <Table.Tr>
                {Array.from({ length: columns }, (_, i) => (
                  <Table.Th key={i}>
                    <Skeleton height={14} width={Math.random() * 60 + 40} />
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
          )}
          <Table.Tbody>
            {Array.from({ length: rows }, (_, i) => (
              <TableRowSkeleton key={i} columns={columns} />
            ))}
          </Table.Tbody>
        </Table>
      </Stack>
    </Card>
  );
}

export function DashboardSkeleton() {
  return (
    <Stack gap="xl">
      {/* Page Header Skeleton */}
      <Stack gap="md">
        <Group justify="space-between">
          <Stack gap="xs">
            <Skeleton height={32} width={300} />
            <Skeleton height={16} width={500} />
          </Stack>
          <Skeleton height={36} width={120} />
        </Group>
      </Stack>

      {/* Stats Grid Skeleton */}
      <SimpleGrid cols={{ base: 1, lg: 4, sm: 2 }} spacing="lg">
        {Array.from({ length: 4 }, (_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </SimpleGrid>

      {/* Management Sections Skeleton */}
      <SimpleGrid cols={{ base: 1, lg: 3, md: 2 }} spacing="lg">
        {Array.from({ length: 3 }, (_, i) => (
          <Card key={i} shadow="sm" withBorder padding="lg">
            <Stack gap="md">
              <Group justify="space-between">
                <Group gap="sm">
                  <Skeleton height={48} width={48} radius="md" />
                  <Stack gap="xs">
                    <Skeleton height={18} width={150} />
                    <Skeleton height={14} width={200} />
                  </Stack>
                </Group>
                <Skeleton height={32} width={32} radius="sm" />
              </Group>

              <SimpleGrid cols={3} spacing="xs">
                {Array.from({ length: 3 }, (_, j) => (
                  <Box key={j} style={{ textAlign: 'center' }}>
                    <Skeleton height={20} width={40} mx="auto" mb={4} />
                    <Skeleton height={12} width={60} mx="auto" />
                  </Box>
                ))}
              </SimpleGrid>

              <Group gap="xs">
                {Array.from({ length: 3 }, (_, j) => (
                  <Skeleton key={j} height={32} width={32} radius="sm" />
                ))}
                <Skeleton height={32} width={80} radius="sm" ml="auto" />
              </Group>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
}

export function FormSkeleton() {
  return (
    <Stack gap="lg">
      {/* Progress bar skeleton */}
      <Skeleton height={8} />

      {/* Form sections */}
      <Card withBorder p="lg">
        <Stack gap="md">
          <Skeleton height={20} width={120} />
          <Stack gap="sm">
            <Skeleton height={32} />
            <Skeleton height={32} />
            <Skeleton height={80} />
          </Stack>
        </Stack>
      </Card>

      <Card withBorder p="lg">
        <Stack gap="md">
          <Skeleton height={20} width={100} />
          <SimpleGrid cols={2} spacing="sm">
            {Array.from({ length: 6 }, (_, i) => (
              <Card key={i} p="sm" withBorder>
                <Group gap="sm">
                  <Skeleton height={24} width={24} radius="sm" />
                  <Stack gap={2} style={{ flex: 1 }}>
                    <Skeleton height={14} width="70%" />
                    <Skeleton height={12} width="90%" />
                  </Stack>
                  <Skeleton height={16} width={40} radius="sm" />
                </Group>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>
      </Card>

      {/* Action buttons */}
      <Group justify="flex-end">
        <Skeleton height={36} width={80} />
        <Skeleton height={36} width={120} />
      </Group>
    </Stack>
  );
}

export function UserProfileSkeleton() {
  return (
    <Stack gap="lg">
      <Card withBorder p="lg">
        <Group>
          <Skeleton height={80} width={80} radius="xl" />
          <Stack gap="xs" style={{ flex: 1 }}>
            <Group gap="sm">
              <Skeleton height={24} width={200} />
              <Skeleton height={20} width={60} radius="sm" />
            </Group>
            <Skeleton height={16} width={250} />
            <Group gap="xs">
              <Skeleton height={16} width={80} />
              <Skeleton height={16} width={100} />
            </Group>
          </Stack>
        </Group>
      </Card>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <Card withBorder p="lg">
          <Stack gap="md">
            <Skeleton height={20} width={120} />
            {Array.from({ length: 4 }, (_, i) => (
              <Group key={i} justify="space-between">
                <Skeleton height={14} width={100} />
                <Skeleton height={14} width={150} />
              </Group>
            ))}
          </Stack>
        </Card>

        <Card withBorder p="lg">
          <Stack gap="md">
            <Skeleton height={20} width={100} />
            {Array.from({ length: 3 }, (_, i) => (
              <Group key={i} gap="sm">
                <Skeleton height={32} width={32} radius="md" />
                <Stack gap={2} style={{ flex: 1 }}>
                  <Skeleton height={14} width="70%" />
                  <Skeleton height={12} width="90%" />
                </Stack>
              </Group>
            ))}
          </Stack>
        </Card>
      </SimpleGrid>
    </Stack>
  );
}
