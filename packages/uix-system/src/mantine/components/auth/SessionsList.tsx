'use client';

import {
  ActionIcon,
  Alert,
  Badge,
  Card,
  Center,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconClock,
  IconDeviceLaptop,
  IconDeviceMobile,
  IconDeviceTablet,
  IconMapPin,
  IconShieldCheck,
  IconTrash,
} from '@tabler/icons-react';

// Types
export interface Session {
  id: string;
  userAgent?: string;
  ipAddress?: string;
  location?: string;
  createdAt: string;
  lastActiveAt: string;
  isCurrent: boolean;
  device?: {
    type: 'desktop' | 'mobile' | 'tablet';
    browser?: string;
    os?: string;
  };
}

export interface SessionsListProps {
  sessions?: Session[];
  loading?: boolean;
  error?: string | null;
  title?: string;
  subtitle?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  securityNoticeText?: string;
  showSecurityNotice?: boolean;
  currentSessionLabel?: string;
  revokeButtonLabel?: string;
  onSessionRevoke: (session: Session) => Promise<void> | void;
  onSessionRevoked?: () => void;
  onError?: (error: Error) => void;
  formatDate?: (dateString: string) => string;
  renderCustomSessionCard?: (session: Session, defaultCard: React.ReactNode) => React.ReactNode;
}

export function SessionsList({
  sessions = [],
  loading = false,
  error = null,
  title = 'Active Sessions',
  subtitle = 'Manage your active sessions and sign out from other devices',
  emptyStateTitle = 'No active sessions',
  emptyStateDescription = "You don't have any active sessions",
  securityNoticeText = 'If you notice any unfamiliar sessions, revoke them immediately and change your password.',
  showSecurityNotice = true,
  currentSessionLabel = 'Current',
  revokeButtonLabel = 'Revoke session',
  onSessionRevoke,
  onSessionRevoked,
  onError,
  formatDate,
  renderCustomSessionCard,
}: SessionsListProps) {
  const defaultFormatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDeviceIcon = (type?: string) => {
    switch (type) {
      case 'mobile':
        return <IconDeviceMobile size={20} />;
      case 'tablet':
        return <IconDeviceTablet size={20} />;
      default:
        return <IconDeviceLaptop size={20} />;
    }
  };

  const handleRevoke = async (session: Session) => {
    if (session.isCurrent) {
      if (onError) {
        onError(new Error('Cannot revoke current session'));
      }
      return;
    }

    try {
      await onSessionRevoke(session);
      if (onSessionRevoked) {
        onSessionRevoked();
      }
    } catch (err) {
      if (onError) {
        onError(err instanceof Error ? err : new Error(String(err)));
      }
    }
  };

  const formatDateString = formatDate || defaultFormatDate;

  return (
    <Card withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <div>
            <Title order={4}>{title}</Title>
            <Text size="sm" c="dimmed" mt={4}>
              {subtitle}
            </Text>
          </div>
        </Group>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
            {error}
          </Alert>
        )}

        {sessions.length === 0 ? (
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
            {sessions.map(session => {
              const defaultCard = (
                <Card key={session.id} withBorder p="md">
                  <Group justify="space-between">
                    <Group>
                      <ThemeIcon size="lg" variant="light">
                        {getDeviceIcon(session.device?.type)}
                      </ThemeIcon>
                      <div>
                        <Group gap="xs">
                          <Text fw={500}>
                            {session.device?.browser || 'Unknown Browser'} on{' '}
                            {session.device?.os || 'Unknown OS'}
                          </Text>
                          {session.isCurrent && (
                            <Badge color="green" size="sm" variant="light">
                              {currentSessionLabel}
                            </Badge>
                          )}
                        </Group>
                        <Group gap="xs" mt={4}>
                          {session.location && (
                            <Group gap={4}>
                              <IconMapPin size={14} style={{ opacity: 0.5 }} />
                              <Text size="xs" c="dimmed">
                                {session.location}
                              </Text>
                            </Group>
                          )}
                          <Text size="xs" c="dimmed">
                            •
                          </Text>
                          <Group gap={4}>
                            <IconClock size={14} style={{ opacity: 0.5 }} />
                            <Text size="xs" c="dimmed">
                              {formatDateString(session.lastActiveAt)}
                            </Text>
                          </Group>
                        </Group>
                      </div>
                    </Group>

                    {!session.isCurrent && (
                      <Tooltip label={revokeButtonLabel}>
                        <ActionIcon
                          color="red"
                          variant="subtle"
                          onClick={() => handleRevoke(session)}
                          loading={loading}
                          data-testid={`revoke-session-${session.id}`}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </Group>
                </Card>
              );

              return renderCustomSessionCard
                ? renderCustomSessionCard(session, defaultCard)
                : defaultCard;
            })}
          </Stack>
        )}

        {showSecurityNotice && (
          <Alert icon={<IconShieldCheck size={16} />} variant="light">
            <Text size="sm">{securityNoticeText}</Text>
          </Alert>
        )}
      </Stack>
    </Card>
  );
}
