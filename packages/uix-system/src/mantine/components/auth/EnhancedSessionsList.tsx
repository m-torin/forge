'use client';

import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Center,
  Checkbox,
  Divider,
  Drawer,
  Group,
  LoadingOverlay,
  Menu,
  Modal,
  MultiSelect,
  Pagination,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconAlertCircle,
  IconClock,
  IconDeviceLaptop,
  IconDeviceMobile,
  IconDeviceTablet,
  IconDotsVertical,
  IconEye,
  IconFilter,
  IconMapPin,
  IconRefresh,
  IconSearch,
  IconShieldX,
  IconTrash,
} from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';
import { BulkActionResult, EnhancedSession, SessionFilters } from './types/session';

export interface EnhancedSessionsListProps {
  sessions?: EnhancedSession[];
  loading?: boolean;
  error?: string | null;
  title?: string;
  subtitle?: string;
  showBulkActions?: boolean;
  pageSize?: number;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  filtersTitle?: string;
  sessionDetailsTitle?: string;
  selectAllLabel?: string;
  clearSelectionLabel?: string;
  revokeSelectedLabel?: string;
  revokeAllOthersLabel?: string;
  actionsLabel?: string;
  refreshLabel?: string;
  filtersLabel?: string;
  // Callback props
  onSessionRevoke: (session: EnhancedSession) => Promise<void>;
  onBulkRevoke: (sessionIds: string[]) => Promise<BulkActionResult>;
  onRevokeAllOthers: () => Promise<BulkActionResult>;
  onSessionsLoad: () => Promise<EnhancedSession[]>;
  onSessionRevoked?: () => void;
  onError?: (error: Error) => void;
  // Customization
  formatDate?: (dateString: string) => string;
  getRiskColor?: (level: string) => string;
  renderCustomSessionCard?: (
    session: EnhancedSession,
    defaultCard: React.ReactNode,
  ) => React.ReactNode;
  renderCustomDetailsModal?: (session: EnhancedSession, onClose: () => void) => React.ReactNode;
}

export function EnhancedSessionsList({
  sessions: propSessions,
  loading: propLoading = false,
  error = null,
  title = 'Sessions',
  subtitle,
  showBulkActions = true,
  pageSize = 10,
  emptyStateTitle = 'No sessions found',
  emptyStateDescription = 'Try adjusting your filters or refresh the list',
  filtersTitle = 'Filter Sessions',
  sessionDetailsTitle = 'Session Details',
  selectAllLabel = 'Select all on page',
  clearSelectionLabel = 'Clear selection',
  revokeSelectedLabel = 'Revoke selected',
  revokeAllOthersLabel = 'Revoke all other sessions',
  actionsLabel = 'Actions',
  refreshLabel = 'Refresh',
  filtersLabel = 'Filters',
  onSessionRevoke,
  onBulkRevoke,
  onRevokeAllOthers,
  onSessionsLoad,
  onSessionRevoked,
  onError,
  formatDate,
  getRiskColor,
  renderCustomSessionCard,
  renderCustomDetailsModal,
}: EnhancedSessionsListProps) {
  const [loading, setLoading] = useState(propLoading);
  const [sessions, setSessions] = useState<EnhancedSession[]>(propSessions || []);
  const [filteredSessions, setFilteredSessions] = useState<EnhancedSession[]>([]);
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<SessionFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const [filtersOpened, { open: openFilters, close: closeFilters }] = useDisclosure(false);
  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [selectedSession, setSelectedSession] = useState<EnhancedSession | null>(null);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await onSessionsLoad();
      setSessions(result);
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
    } finally {
      setLoading(false);
    }
  }, [onSessionsLoad, onError]);

  useEffect(() => {
    if (propSessions) {
      setSessions(propSessions);
    } else {
      loadSessions();
    }
  }, [propSessions, loadSessions]);

  const defaultFormatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const defaultGetRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'green';
      case 'medium':
        return 'yellow';
      case 'high':
        return 'orange';
      case 'critical':
        return 'red';
      default:
        return 'gray';
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...sessions];

    if (filters.device?.length) {
      filtered = filtered.filter(s => filters.device?.includes(s.device.type));
    }

    if (filters.riskLevel?.length) {
      filtered = filtered.filter(s => filters.riskLevel?.includes(s.security.riskLevel));
    }

    if (filters.isActive !== undefined) {
      filtered = filtered.filter(s => s.isActive === filters.isActive);
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        s =>
          s.device.browser?.toLowerCase().includes(query) ||
          s.device.os?.toLowerCase().includes(query) ||
          s.location.city?.toLowerCase().includes(query) ||
          s.location.country?.toLowerCase().includes(query) ||
          s.location.ip.includes(query),
      );
    }

    setFilteredSessions(filtered);
    setCurrentPage(1);
  }, [sessions, filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleSelectSession = (sessionId: string) => {
    const newSelected = new Set(selectedSessions);
    if (newSelected.has(sessionId)) {
      newSelected.delete(sessionId);
    } else {
      newSelected.add(sessionId);
    }
    setSelectedSessions(newSelected);
  };

  const handleSelectAll = () => {
    const currentPageSessions = getPaginatedSessions();
    const allSelected = currentPageSessions.every(s => selectedSessions.has(s.id));

    if (allSelected) {
      const newSelected = new Set(selectedSessions);
      currentPageSessions.forEach(s => newSelected.delete(s.id));
      setSelectedSessions(newSelected);
    } else {
      const newSelected = new Set(selectedSessions);
      currentPageSessions.forEach(s => newSelected.add(s.id));
      setSelectedSessions(newSelected);
    }
  };

  const handleBulkRevoke = async () => {
    const sessionIds = Array.from(selectedSessions);
    const currentSessionIncluded = sessionIds.some(
      id => sessions.find(s => s.id === id)?.isCurrent,
    );

    if (currentSessionIncluded && onError) {
      onError(new Error('Cannot revoke current session'));
      return;
    }

    try {
      setProcessingIds(new Set(sessionIds));
      const _result = await onBulkRevoke(sessionIds);

      setSessions(sessions.filter(s => !sessionIds.includes(s.id)));
      setSelectedSessions(new Set());

      if (onSessionRevoked) {
        onSessionRevoked();
      }
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
    } finally {
      setProcessingIds(new Set());
    }
  };

  const handleRevokeAll = async () => {
    try {
      setLoading(true);
      const _result = await onRevokeAllOthers();
      await loadSessions();

      if (onSessionRevoked) {
        onSessionRevoked();
      }
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (session: EnhancedSession) => {
    if (session.isCurrent && onError) {
      onError(new Error('Cannot revoke current session'));
      return;
    }

    try {
      setProcessingIds(prev => new Set(prev).add(session.id));
      await onSessionRevoke(session);
      setSessions(sessions.filter(s => s.id !== session.id));

      if (onSessionRevoked) {
        onSessionRevoked();
      }
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(session.id);
        return newSet;
      });
    }
  };

  const viewSessionDetails = (session: EnhancedSession) => {
    setSelectedSession(session);
    openDetails();
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile':
        return <IconDeviceMobile size={20} />;
      case 'tablet':
        return <IconDeviceTablet size={20} />;
      default:
        return <IconDeviceLaptop size={20} />;
    }
  };

  const formatDateString = formatDate || defaultFormatDate;
  const getRiskColorFn = getRiskColor || defaultGetRiskColor;

  const getPaginatedSessions = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredSessions.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredSessions.length / pageSize);
  const currentPageSessions = getPaginatedSessions();

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <div>
          <Title order={3}>{title}</Title>
          {subtitle && (
            <Text size="sm" c="dimmed">
              {subtitle}
            </Text>
          )}
          <Text size="sm" c="dimmed">
            {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''} found
          </Text>
        </div>

        <Group>
          <Button variant="subtle" leftSection={<IconFilter size={16} />} onClick={openFilters}>
            {filtersLabel}
          </Button>

          <Tooltip label={refreshLabel}>
            <ActionIcon variant="subtle" onClick={loadSessions} loading={loading}>
              <IconRefresh size={16} />
            </ActionIcon>
          </Tooltip>

          {showBulkActions && (
            <Menu>
              <Menu.Target>
                <Button variant="subtle" leftSection={<IconDotsVertical size={16} />}>
                  {actionsLabel}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconTrash size={14} />}
                  color="red"
                  onClick={handleRevokeAll}
                >
                  {revokeAllOthersLabel}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>
      </Group>

      {showBulkActions && selectedSessions.size > 0 && (
        <Card withBorder p="sm">
          <Group justify="space-between">
            <Text size="sm">
              {selectedSessions.size} session{selectedSessions.size !== 1 ? 's' : ''} selected
            </Text>
            <Group>
              <Button size="xs" variant="subtle" onClick={() => setSelectedSessions(new Set())}>
                {clearSelectionLabel}
              </Button>
              <Button
                size="xs"
                color="red"
                leftSection={<IconTrash size={14} />}
                onClick={handleBulkRevoke}
              >
                {revokeSelectedLabel}
              </Button>
            </Group>
          </Group>
        </Card>
      )}

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
          {error}
        </Alert>
      )}

      <Card withBorder pos="relative">
        <LoadingOverlay visible={loading} />

        {currentPageSessions.length === 0 ? (
          <Center py={40}>
            <Stack align="center" gap="md">
              <ThemeIcon size={60} color="gray" variant="light">
                <IconDeviceLaptop size={30} />
              </ThemeIcon>
              <div style={{ textAlign: 'center' }}>
                <Text fw={500}>{emptyStateTitle}</Text>
                <Text c="dimmed" size="sm">
                  {emptyStateDescription}
                </Text>
              </div>
            </Stack>
          </Center>
        ) : (
          <Stack gap="xs">
            {showBulkActions && (
              <Group p="sm" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
                <Checkbox
                  checked={
                    currentPageSessions.length > 0 &&
                    currentPageSessions.every(s => selectedSessions.has(s.id))
                  }
                  indeterminate={
                    currentPageSessions.some(s => selectedSessions.has(s.id)) &&
                    !currentPageSessions.every(s => selectedSessions.has(s.id))
                  }
                  onChange={handleSelectAll}
                />
                <Text size="sm" fw={500}>
                  {selectAllLabel}
                </Text>
              </Group>
            )}

            {currentPageSessions.map(session => {
              const defaultCard = (
                <Card key={session.id} withBorder p="md" pos="relative">
                  <LoadingOverlay visible={processingIds.has(session.id)} />

                  <Group justify="space-between" align="flex-start">
                    <Group align="flex-start">
                      {showBulkActions && !session.isCurrent && (
                        <Checkbox
                          checked={selectedSessions.has(session.id)}
                          onChange={() => handleSelectSession(session.id)}
                          mt={4}
                        />
                      )}

                      <ThemeIcon size="lg" variant="light">
                        {getDeviceIcon(session.device.type)}
                      </ThemeIcon>

                      <div>
                        <Group gap="xs" mb={4}>
                          <Text fw={500}>
                            {session.device.browser} on {session.device.os}
                          </Text>
                          {session.isCurrent && (
                            <Badge color="green" size="sm" variant="light">
                              Current
                            </Badge>
                          )}
                          <Badge
                            color={getRiskColorFn(session.security.riskLevel)}
                            size="sm"
                            variant="light"
                          >
                            {session.security.riskLevel} risk
                          </Badge>
                        </Group>

                        <Group gap="xs" align="center">
                          <Group gap={4}>
                            <IconMapPin size={14} style={{ opacity: 0.5 }} />
                            <Text size="xs" c="dimmed">
                              {session.location.city}, {session.location.country}
                            </Text>
                          </Group>
                          <Text size="xs" c="dimmed">
                            •
                          </Text>
                          <Group gap={4}>
                            <IconClock size={14} style={{ opacity: 0.5 }} />
                            <Text size="xs" c="dimmed">
                              {formatDateString(session.lastActiveAt)}
                            </Text>
                          </Group>
                          <Text size="xs" c="dimmed">
                            •
                          </Text>
                          <Text size="xs" c="dimmed">
                            {session.location.ip}
                          </Text>
                        </Group>

                        {session.security.riskFactors.length > 0 && (
                          <Group gap={4} mt={4}>
                            <IconShieldX size={14} color="red" />
                            <Text size="xs" c="red">
                              {session.security.riskFactors.join(', ')}
                            </Text>
                          </Group>
                        )}
                      </div>
                    </Group>

                    <Group>
                      <Tooltip label="View details">
                        <ActionIcon variant="subtle" onClick={() => viewSessionDetails(session)}>
                          <IconEye size={16} />
                        </ActionIcon>
                      </Tooltip>

                      {!session.isCurrent && (
                        <Tooltip label="Revoke session">
                          <ActionIcon
                            color="red"
                            variant="subtle"
                            onClick={() => handleRevokeSession(session)}
                            loading={processingIds.has(session.id)}
                            data-testid={`revoke-session-${session.id}`}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </Group>
                  </Group>
                </Card>
              );

              return renderCustomSessionCard
                ? renderCustomSessionCard(session, defaultCard)
                : defaultCard;
            })}
          </Stack>
        )}

        {totalPages > 1 && (
          <Group justify="center" mt="md">
            <Pagination
              value={currentPage}
              onChange={setCurrentPage}
              total={totalPages}
              size="sm"
            />
          </Group>
        )}
      </Card>

      <Drawer
        opened={filtersOpened}
        onClose={closeFilters}
        title={filtersTitle}
        position="right"
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="Search"
            placeholder="Search by browser, OS, location, or IP..."
            leftSection={<IconSearch size={16} />}
            value={filters.searchQuery || ''}
            onChange={e => setFilters({ ...filters, searchQuery: e.target.value })}
          />

          <MultiSelect
            label="Device Type"
            placeholder="Select device types"
            data={[
              { value: 'desktop', label: 'Desktop' },
              { value: 'mobile', label: 'Mobile' },
              { value: 'tablet', label: 'Tablet' },
              { value: 'unknown', label: 'Unknown' },
            ]}
            value={filters.device || []}
            onChange={value => setFilters({ ...filters, device: value as any })}
          />

          <MultiSelect
            label="Risk Level"
            placeholder="Select risk levels"
            data={[
              { value: 'low', label: 'Low Risk' },
              { value: 'medium', label: 'Medium Risk' },
              { value: 'high', label: 'High Risk' },
              { value: 'critical', label: 'Critical Risk' },
            ]}
            value={filters.riskLevel || []}
            onChange={value => setFilters({ ...filters, riskLevel: value as any })}
          />

          <Select
            label="Status"
            placeholder="All sessions"
            data={[
              { value: '', label: 'All sessions' },
              { value: 'true', label: 'Active only' },
              { value: 'false', label: 'Inactive only' },
            ]}
            value={filters.isActive === undefined ? '' : String(filters.isActive)}
            onChange={value =>
              setFilters({
                ...filters,
                isActive: value === '' ? undefined : value === 'true',
              })
            }
          />

          <Group grow>
            <Button
              variant="outline"
              onClick={() => {
                setFilters({});
                closeFilters();
              }}
            >
              Clear Filters
            </Button>
            <Button onClick={closeFilters}>Apply Filters</Button>
          </Group>
        </Stack>
      </Drawer>

      <Modal opened={detailsOpened} onClose={closeDetails} title={sessionDetailsTitle} size="lg">
        {selectedSession &&
          (renderCustomDetailsModal ? (
            renderCustomDetailsModal(selectedSession, closeDetails)
          ) : (
            <Stack gap="md">
              <Group>
                <ThemeIcon size="xl" variant="light">
                  {getDeviceIcon(selectedSession.device.type)}
                </ThemeIcon>
                <div>
                  <Text fw={500} size="lg">
                    {selectedSession.device.browser} on {selectedSession.device.os}
                  </Text>
                  <Text size="sm" c="dimmed">
                    Session ID: {selectedSession.id}
                  </Text>
                </div>
              </Group>

              <Divider />

              <SimpleGrid cols={2} spacing="md">
                <div>
                  <Text size="sm" fw={500} mb={4}>
                    Device Information
                  </Text>
                  <Stack gap="xs">
                    <Text size="xs">
                      <strong>Type:</strong> {selectedSession.device.type}
                    </Text>
                    <Text size="xs">
                      <strong>Browser:</strong> {selectedSession.device.browser}{' '}
                      {selectedSession.device.browserVersion}
                    </Text>
                    <Text size="xs">
                      <strong>OS:</strong> {selectedSession.device.os}{' '}
                      {selectedSession.device.osVersion}
                    </Text>
                  </Stack>
                </div>

                <div>
                  <Text size="sm" fw={500} mb={4}>
                    Location
                  </Text>
                  <Stack gap="xs">
                    <Text size="xs">
                      <strong>IP:</strong> {selectedSession.location.ip}
                    </Text>
                    <Text size="xs">
                      <strong>City:</strong> {selectedSession.location.city}
                    </Text>
                    <Text size="xs">
                      <strong>Country:</strong> {selectedSession.location.country}
                    </Text>
                    <Text size="xs">
                      <strong>Timezone:</strong> {selectedSession.location.timezone}
                    </Text>
                  </Stack>
                </div>

                <div>
                  <Text size="sm" fw={500} mb={4}>
                    Security
                  </Text>
                  <Stack gap="xs">
                    <Group gap="xs">
                      <Text size="xs">
                        <strong>Risk Level:</strong>
                      </Text>
                      <Badge color={getRiskColorFn(selectedSession.security.riskLevel)} size="xs">
                        {selectedSession.security.riskLevel}
                      </Badge>
                    </Group>
                    <Text size="xs">
                      <strong>Risk Score:</strong> {selectedSession.security.riskScore}/100
                    </Text>
                    <Text size="xs">
                      <strong>Trusted Device:</strong>{' '}
                      {selectedSession.security.isTrustedDevice ? 'Yes' : 'No'}
                    </Text>
                  </Stack>
                </div>

                <div>
                  <Text size="sm" fw={500} mb={4}>
                    Activity
                  </Text>
                  <Stack gap="xs">
                    <Text size="xs">
                      <strong>Created:</strong>{' '}
                      {new Date(selectedSession.createdAt).toLocaleString()}
                    </Text>
                    <Text size="xs">
                      <strong>Last Active:</strong>{' '}
                      {new Date(selectedSession.lastActiveAt).toLocaleString()}
                    </Text>
                    <Text size="xs">
                      <strong>Duration:</strong>{' '}
                      {Math.round(selectedSession.metrics.duration / 3600)}h
                    </Text>
                  </Stack>
                </div>
              </SimpleGrid>

              {selectedSession.security.riskFactors.length > 0 && (
                <div>
                  <Divider />
                  <Alert
                    icon={<IconShieldX size={16} />}
                    color="red"
                    variant="light"
                    title="Security Concerns"
                  >
                    <Text size="sm">{selectedSession.security.riskFactors.join(', ')}</Text>
                  </Alert>
                </div>
              )}
            </Stack>
          ))}
      </Modal>
    </Stack>
  );
}
