'use client';

import {
  ActionIcon,
  Avatar,
  Button,
  Card,
  Group,
  LoadingOverlay,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconBuilding, IconClock, IconMail, IconRefresh } from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';
import { Invitation } from './OrganizationInvitation';

export interface InvitationsDashboardProps {
  invitations?: Invitation[];
  organizationId?: string;
  loading?: boolean;
  error?: string | null;
  title?: string;
  subtitle?: string;
  emptyStateTitle?: string;
  emptyStateSubtitle?: string;
  loadingText?: string;
  acceptButtonText?: string;
  rejectButtonText?: string;
  refreshLabel?: string;
  // Callback props
  onLoadInvitations?: (organizationId?: string) => Promise<Invitation[]>;
  onAcceptInvitation: (invitation: Invitation) => Promise<void>;
  onRejectInvitation: (invitation: Invitation) => Promise<void>;
  onInvitationUpdate?: () => void;
  onError?: (error: Error) => void;
  // Customization
  formatExpirationDate?: (expiresAt: string) => string;
  isExpired?: (expiresAt: string) => boolean;
  getInitials?: (name?: string, email?: string) => string;
  renderCustomInvitationCard?: (
    invitation: Invitation,
    defaultCard: React.ReactNode,
  ) => React.ReactNode;
  renderCustomEmptyState?: (defaultEmptyState: React.ReactNode) => React.ReactNode;
}

export function InvitationsDashboard({
  invitations: propInvitations,
  organizationId,
  loading: propLoading = false,
  error: _error = null,
  title = 'Pending Invitations',
  subtitle,
  emptyStateTitle = 'No pending invitations',
  emptyStateSubtitle = "You don't have any pending organization invitations.",
  loadingText = 'Loading invitations...',
  acceptButtonText = 'Accept',
  rejectButtonText = 'Decline',
  refreshLabel = 'Refresh',
  onLoadInvitations,
  onAcceptInvitation,
  onRejectInvitation,
  onInvitationUpdate,
  onError,
  formatExpirationDate,
  isExpired,
  getInitials,
  renderCustomInvitationCard,
  renderCustomEmptyState,
}: InvitationsDashboardProps) {
  const [loading, setLoading] = useState(propLoading);
  const [invitations, setInvitations] = useState<Invitation[]>(propInvitations || []);
  const [processingInvitations, setProcessingInvitations] = useState<Set<string>>(new Set());

  const defaultFormatExpirationDate = (expiresAt: string) => {
    const expirationDate = new Date(expiresAt);
    const now = new Date();
    const diffInHours = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 0) {
      return 'Expired';
    } else if (diffInHours < 24) {
      return `${diffInHours}h left`;
    } else {
      const diffInDays = Math.ceil(diffInHours / 24);
      return `${diffInDays}d left`;
    }
  };

  const defaultIsExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const defaultGetInitials = (name?: string, email?: string) => {
    return (name || email || '?').charAt(0).toUpperCase();
  };

  const loadInvitations = useCallback(async () => {
    if (!onLoadInvitations) return;

    setLoading(true);

    try {
      const result = await onLoadInvitations(organizationId);

      // Filter for pending invitations only
      const isExpiredFn = isExpired || defaultIsExpired;
      const pendingInvitations = result.filter(
        (inv: Invitation) => inv.status === 'pending' && !isExpiredFn(inv.expiresAt),
      );
      setInvitations(pendingInvitations);
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
    } finally {
      setLoading(false);
    }
  }, [organizationId, onLoadInvitations, isExpired, onError]);

  useEffect(() => {
    if (propInvitations) {
      setInvitations(propInvitations);
    } else if (onLoadInvitations) {
      loadInvitations();
    }
  }, [propInvitations, loadInvitations, onLoadInvitations]);

  const handleAcceptInvitation = async (invitation: Invitation) => {
    setProcessingInvitations(prev => new Set(prev).add(invitation.id));

    try {
      await onAcceptInvitation(invitation);

      // Remove from local state
      setInvitations(prev => prev.filter(inv => inv.id !== invitation.id));

      if (onInvitationUpdate) {
        onInvitationUpdate();
      }
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
    } finally {
      setProcessingInvitations(prev => {
        const newSet = new Set(prev);
        newSet.delete(invitation.id);
        return newSet;
      });
    }
  };

  const handleRejectInvitation = async (invitation: Invitation) => {
    setProcessingInvitations(prev => new Set(prev).add(invitation.id));

    try {
      await onRejectInvitation(invitation);

      // Remove from local state
      setInvitations(prev => prev.filter(inv => inv.id !== invitation.id));

      if (onInvitationUpdate) {
        onInvitationUpdate();
      }
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
    } finally {
      setProcessingInvitations(prev => {
        const newSet = new Set(prev);
        newSet.delete(invitation.id);
        return newSet;
      });
    }
  };

  const formatDate = formatExpirationDate || defaultFormatExpirationDate;
  const getUserInitials = getInitials || defaultGetInitials;

  if (loading) {
    return (
      <Card withBorder pos="relative" mih={200}>
        <LoadingOverlay visible />
        <Stack align="center" justify="center" h={160}>
          <ThemeIcon size="lg" variant="light">
            <IconBuilding size={24} />
          </ThemeIcon>
          <Text c="dimmed">{loadingText}</Text>
        </Stack>
      </Card>
    );
  }

  if (invitations.length === 0) {
    const defaultEmptyState = (
      <Card withBorder>
        <Stack align="center" py="xl">
          <ThemeIcon size="xl" variant="light" color="gray">
            <IconBuilding size={32} />
          </ThemeIcon>
          <div style={{ textAlign: 'center' }}>
            <Title order={4} c="dimmed">
              {emptyStateTitle}
            </Title>
            <Text size="sm" c="dimmed" mt="xs">
              {emptyStateSubtitle}
            </Text>
          </div>
        </Stack>
      </Card>
    );

    return renderCustomEmptyState ? renderCustomEmptyState(defaultEmptyState) : defaultEmptyState;
  }

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
            {invitations.length} pending invitation{invitations.length !== 1 ? 's' : ''}
          </Text>
        </div>

        {onLoadInvitations && (
          <Tooltip label={refreshLabel}>
            <ActionIcon variant="subtle" onClick={loadInvitations} loading={loading}>
              <IconRefresh size={16} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>

      <Stack gap="sm">
        {invitations.map(invitation => {
          const defaultCard = (
            <Card key={invitation.id} withBorder pos="relative">
              <LoadingOverlay visible={processingInvitations.has(invitation.id)} />

              <Stack gap="md">
                <Group justify="space-between" align="flex-start">
                  <Group>
                    <ThemeIcon size="lg" variant="light" color="blue">
                      <IconBuilding size={20} />
                    </ThemeIcon>
                    <div>
                      <Text fw={600}>{invitation.organization.name}</Text>
                      <Text size="sm" c="dimmed">
                        Invited as {invitation.role}
                      </Text>
                    </div>
                  </Group>

                  <Group gap="xs" align="center">
                    <IconClock size={14} />
                    <Text size="xs" c="orange">
                      {formatDate(invitation.expiresAt)}
                    </Text>
                  </Group>
                </Group>

                <Group>
                  <Avatar
                    src={invitation.inviter.image}
                    alt={invitation.inviter.name || invitation.inviter.email}
                    size="sm"
                  >
                    {getUserInitials(invitation.inviter.name, invitation.inviter.email)}
                  </Avatar>
                  <div>
                    <Text size="sm">From {invitation.inviter.name || 'Unknown'}</Text>
                    <Group gap="xs" align="center">
                      <IconMail size={12} />
                      <Text size="xs" c="dimmed">
                        {invitation.inviter.email}
                      </Text>
                    </Group>
                  </div>
                </Group>

                <Group grow>
                  <Button
                    variant="subtle"
                    color="gray"
                    size="sm"
                    onClick={() => handleRejectInvitation(invitation)}
                    disabled={processingInvitations.has(invitation.id)}
                    data-testid={`reject-invitation-${invitation.id}`}
                  >
                    {rejectButtonText}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleAcceptInvitation(invitation)}
                    disabled={processingInvitations.has(invitation.id)}
                    data-testid={`accept-invitation-${invitation.id}`}
                  >
                    {acceptButtonText}
                  </Button>
                </Group>
              </Stack>
            </Card>
          );

          return renderCustomInvitationCard
            ? renderCustomInvitationCard(invitation, defaultCard)
            : defaultCard;
        })}
      </Stack>
    </Stack>
  );
}
