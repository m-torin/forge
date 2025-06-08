"use client";

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Center,
  Checkbox,
  Code,
  DatePickerInput,
  Group,
  Loader,
  Menu,
  Pagination,
  rem,
  RingProgress,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  ThemeIcon,
  UnstyledButton,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconCalendar,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconDevices,
  IconDots,
  IconEye,
  IconScan,
  IconSearch,
  IconSelector,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";

import { getScanHistory } from "../actions";

import type { ScanHistory } from "@repo/database/prisma";

interface ScanHistoryWithRelations extends ScanHistory {
  product: {
    id: string;
    name: string;
    sku: string;
  } | null;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface ThProps {
  children: React.ReactNode;
  onSort(): void;
  reversed: boolean;
  sorted: boolean;
}

function Th({ children, onSort, reversed, sorted }: ThProps) {
  const Icon = sorted
    ? reversed
      ? IconChevronUp
      : IconChevronDown
    : IconSelector;
  return (
    <Table.Th>
      <UnstyledButton onClick={onSort} style={{ width: "100%" }}>
        <Group justify="space-between">
          <Text fw={500} fz="sm">
            {children}
          </Text>
          <Center>
            <Icon stroke={1.5} style={{ width: rem(16), height: rem(16) }} />
          </Center>
        </Group>
      </UnstyledButton>
    </Table.Th>
  );
}

export function ScanHistoryTable() {
  const [scans, setScans] = useState<ScanHistoryWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [successFilter, setSuccessFilter] = useState<
    "all" | "success" | "failed"
  >("all");
  const [platformFilter, setPlatformFilter] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [sortBy, setSortBy] = useState<keyof ScanHistoryWithRelations | null>(
    null,
  );
  const [reverseSortDirection, setReverseSortDirection] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Stats state
  const [stats, setStats] = useState({
    successfulScans: 0,
    successRate: 0,
    totalScans: 0,
    uniquePlatforms: 0,
    uniqueUsers: 0,
  });

  const loadScanHistory = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getScanHistory({
        ...(search && { productId: undefined }), // Would need to search by barcode or product name
        endDate: endDate || undefined,
        limit: 20,
        page,
        startDate: startDate || undefined,
        success:
          successFilter === "all" ? undefined : successFilter === "success",
      });

      if (result.success && result.data) {
        setScans(result.data);
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages);
        }

        // Calculate stats
        const totalScans = result.data.length;
        const successfulScans = result.data.filter(
          (scan) => scan.success,
        ).length;
        const uniqueUsers = new Set(
          result.data.map((scan) => scan.userId).filter(Boolean),
        ).size;
        const uniquePlatforms = new Set(
          result.data.map((scan) => scan.platform).filter(Boolean),
        ).size;

        setStats({
          successfulScans,
          successRate:
            totalScans > 0 ? (successfulScans / totalScans) * 100 : 0,
          totalScans,
          uniquePlatforms,
          uniqueUsers,
        });
      } else {
        notifications.show({
          color: "red",
          message: result.error || "Failed to load scan history",
          title: "Error",
        });
      }
    } catch (error) {
      notifications.show({
        color: "red",
        message: "Failed to load scan history",
        title: "Error",
      });
    } finally {
      setLoading(false);
    }
  }, [search, successFilter, platformFilter, startDate, endDate, page]);

  useEffect(() => {
    loadScanHistory();
  }, [loadScanHistory]);

  const setSorting = (field: keyof ScanHistoryWithRelations) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
      second: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  };

  const getPlatformColor = (platform?: string | null) => {
    switch (platform?.toLowerCase()) {
      case "ios":
        return "blue";
      case "android":
        return "green";
      case "web":
        return "violet";
      case "api":
        return "orange";
      default:
        return "gray";
    }
  };

  const sortedData = sortBy
    ? [...scans].sort((a, b) => {
        if (!sortBy) return 0;
        const aValue = a[sortBy];
        const bValue = b[sortBy];

        if (typeof aValue === "string" && typeof bValue === "string") {
          return reverseSortDirection
            ? bValue.localeCompare(aValue)
            : aValue.localeCompare(bValue);
        }

        if (typeof aValue === "boolean" && typeof bValue === "boolean") {
          return reverseSortDirection
            ? (bValue ? 1 : 0) - (aValue ? 1 : 0)
            : (aValue ? 1 : 0) - (bValue ? 1 : 0);
        }

        if (aValue instanceof Date && bValue instanceof Date) {
          return reverseSortDirection
            ? bValue.getTime() - aValue.getTime()
            : aValue.getTime() - bValue.getTime();
        }

        return 0;
      })
    : scans;

  const rows = sortedData.map((scan) => {
    const selected = selectedRows.includes(scan.id);
    return (
      <Table.Tr key={scan.id} bg={selected ? "blue.0" : undefined}>
        <Table.Td>
          <Checkbox
            onChange={(event) => {
              if (event.currentTarget.checked) {
                setSelectedRows([...selectedRows, scan.id]);
              } else {
                setSelectedRows(selectedRows.filter((id) => id !== scan.id));
              }
            }}
            checked={selected}
          />
        </Table.Td>
        <Table.Td>
          <Code ff="monospace" fz="sm">
            {scan.barcode}
          </Code>
        </Table.Td>
        <Table.Td>
          {scan.product ? (
            <Group gap="sm">
              <div>
                <Text fw={500} fz="sm">
                  {scan.product.name}
                </Text>
                <Text c="dimmed" fz="xs">
                  SKU: {scan.product.sku}
                </Text>
              </div>
            </Group>
          ) : (
            <Text c="dimmed" fz="sm">
              No product found
            </Text>
          )}
        </Table.Td>
        <Table.Td>
          {scan.user ? (
            <div>
              <Text fw={500} fz="sm">
                {scan.user.name}
              </Text>
              <Text c="dimmed" fz="xs">
                {scan.user.email}
              </Text>
            </div>
          ) : (
            <Text c="dimmed" fz="sm">
              Anonymous
            </Text>
          )}
        </Table.Td>
        <Table.Td>
          {scan.platform && (
            <Badge color={getPlatformColor(scan.platform)} variant="light">
              {scan.platform}
            </Badge>
          )}
        </Table.Td>
        <Table.Td>
          <Badge
            color={scan.success ? "green" : "red"}
            leftSection={
              scan.success ? <IconCheck size={12} /> : <IconX size={12} />
            }
            variant="light"
          >
            {scan.success ? "Success" : "Failed"}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Text c="dimmed" fz="sm">
            {formatDate(scan.scannedAt)}
          </Text>
        </Table.Td>
        <Table.Td>
          <Group gap={0} justify="flex-end">
            <ActionIcon
              color="gray"
              onClick={() => {
                // Could open scan details modal
              }}
              variant="subtle"
            >
              <IconEye style={{ width: rem(16), height: rem(16) }} />
            </ActionIcon>
            <Menu position="bottom-end" shadow="sm" withinPortal>
              <Menu.Target>
                <ActionIcon color="gray" variant="subtle">
                  <IconDots style={{ width: rem(16), height: rem(16) }} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item
                  leftSection={
                    <IconEye style={{ width: rem(14), height: rem(14) }} />
                  }
                  onClick={() => {
                    // View scan details
                  }}
                >
                  View Details
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Stack>
      {/* Stats Cards */}
      <SimpleGrid cols={{ base: 1, lg: 4, sm: 2 }}>
        <Card withBorder>
          <Group justify="space-between">
            <div>
              <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                Total Scans
              </Text>
              <Text fw={700} size="xl">
                {stats.totalScans.toLocaleString()}
              </Text>
            </div>
            <ThemeIcon color="blue" radius="md" size="xl" variant="light">
              <IconScan stroke={1.5} size="1.8rem" />
            </ThemeIcon>
          </Group>
        </Card>

        <Card withBorder>
          <Group justify="space-between">
            <div>
              <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                Success Rate
              </Text>
              <Text fw={700} size="xl">
                {stats.successRate.toFixed(1)}%
              </Text>
            </div>
            <RingProgress
              sections={[{ color: "green", value: stats.successRate }]}
              size={60}
              thickness={8}
            />
          </Group>
        </Card>

        <Card withBorder>
          <Group justify="space-between">
            <div>
              <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                Unique Users
              </Text>
              <Text fw={700} size="xl">
                {stats.uniqueUsers}
              </Text>
            </div>
            <ThemeIcon color="violet" radius="md" size="xl" variant="light">
              <IconUsers stroke={1.5} size="1.8rem" />
            </ThemeIcon>
          </Group>
        </Card>

        <Card withBorder>
          <Group justify="space-between">
            <div>
              <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                Platforms
              </Text>
              <Text fw={700} size="xl">
                {stats.uniquePlatforms}
              </Text>
            </div>
            <ThemeIcon color="orange" radius="md" size="xl" variant="light">
              <IconDevices stroke={1.5} size="1.8rem" />
            </ThemeIcon>
          </Group>
        </Card>
      </SimpleGrid>

      {/* Filters */}
      <Group justify="space-between">
        <Group>
          <TextInput
            leftSection={
              <IconSearch style={{ width: rem(16), height: rem(16) }} />
            }
            onChange={(e) => setSearch(e.currentTarget.value)}
            placeholder="Search barcodes..."
            style={{ width: rem(250) }}
            value={search}
          />
          <Select
            onChange={(value) =>
              setSuccessFilter(value as "all" | "success" | "failed")
            }
            placeholder="Filter by status"
            style={{ width: rem(150) }}
            data={[
              { label: "All scans", value: "all" },
              { label: "Successful only", value: "success" },
              { label: "Failed only", value: "failed" },
            ]}
            value={successFilter}
          />
          <TextInput
            onChange={(e) => setPlatformFilter(e.currentTarget.value)}
            placeholder="Filter by platform"
            style={{ width: rem(150) }}
            value={platformFilter}
          />
          <DatePickerInput
            leftSection={<IconCalendar size={16} />}
            onChange={setStartDate}
            placeholder="Pick start date"
            clearable
            label="Start Date"
            value={startDate}
          />
          <DatePickerInput
            leftSection={<IconCalendar size={16} />}
            onChange={setEndDate}
            placeholder="Pick end date"
            clearable
            label="End Date"
            value={endDate}
          />
        </Group>
        <Group>
          {selectedRows.length > 0 && (
            <Group>
              <Text c="dimmed" size="sm">
                {selectedRows.length} selected
              </Text>
              <Button
                onClick={() => {
                  // Could implement bulk export or other actions
                }}
                size="sm"
                variant="light"
              >
                Export Selected
              </Button>
            </Group>
          )}
          <Button
            onClick={() => {
              setSearch("");
              setSuccessFilter("all");
              setPlatformFilter("");
              setStartDate(null);
              setEndDate(null);
              setPage(1);
            }}
            variant="light"
          >
            Clear Filters
          </Button>
        </Group>
      </Group>

      <ScrollArea>
        <Table highlightOnHover striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: rem(40) }}>
                <Checkbox
                  onChange={(event) => {
                    if (event.currentTarget.checked) {
                      setSelectedRows(scans.map((s) => s.id));
                    } else {
                      setSelectedRows([]);
                    }
                  }}
                  checked={
                    selectedRows.length === scans.length && scans.length > 0
                  }
                  indeterminate={
                    selectedRows.length > 0 &&
                    selectedRows.length < scans.length
                  }
                />
              </Table.Th>
              <Th
                onSort={() => setSorting("barcode")}
                sorted={sortBy === "barcode"}
                reversed={reverseSortDirection}
              >
                Barcode
              </Th>
              <Table.Th>Product</Table.Th>
              <Table.Th>User</Table.Th>
              <Th
                onSort={() => setSorting("platform")}
                sorted={sortBy === "platform"}
                reversed={reverseSortDirection}
              >
                Platform
              </Th>
              <Th
                onSort={() => setSorting("success")}
                sorted={sortBy === "success"}
                reversed={reverseSortDirection}
              >
                Status
              </Th>
              <Th
                onSort={() => setSorting("scannedAt")}
                sorted={sortBy === "scannedAt"}
                reversed={reverseSortDirection}
              >
                Scanned At
              </Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {loading ? (
              <Table.Tr>
                <Table.Td colSpan={8}>
                  <Center py="xl">
                    <Loader />
                  </Center>
                </Table.Td>
              </Table.Tr>
            ) : rows.length > 0 ? (
              rows
            ) : (
              <Table.Tr>
                <Table.Td colSpan={8}>
                  <Text c="dimmed" fw={500} py="xl" ta="center">
                    No scan history found
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      {totalPages > 1 && (
        <Group justify="center" mt="xl">
          <Pagination
            boundaries={1}
            onChange={setPage}
            total={totalPages}
            siblings={1}
            value={page}
          />
        </Group>
      )}
    </Stack>
  );
}
