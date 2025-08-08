'use client';

import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Group,
  LoadingOverlay,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconBuilding,
  IconCheck,
  IconClock,
  IconMail,
  IconUsers,
  IconX,
} from '@tabler/icons-react';
import React, { useCallback } from 'react';

// Types
export interface InvitationOrganization {
  id: string;
  name: string;
  slug?: string;
  logo?: string;
  memberCount?: number;
}

export interface InvitationInviter {
  id: string;
  name?: string;
  email: string;
  image?: string;
}

export interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  organizationId: string;
  organization: InvitationOrganization;
  inviter: InvitationInviter;
}

export interface OrganizationInvitationProps {
  invitationId?: string;
  invitation?: Invitation;
  loading?: boolean;
  error?: string | null;
  // Status control
  status?: 'loading' | 'found' | 'error' | 'accepted' | 'rejected';
  // Callback props
  onLoadInvitation?: (invitationId: string) => Promise<Invitation>;
  onAccept: (invitation: Invitation) => Promise<void>;
  onReject: (invitation: Invitation) => Promise<void>;
  onError?: (error: Error) => void;
  onNavigate?: (path: string) => void;
  // Customization
  loadingTitle?: string;
  loadingSubtitle?: string;
  acceptedTitle?: string;
  acceptedSubtitle?: string;
  rejectedTitle?: string;
  rejectedSubtitle?: string;
  errorTitle?: string;
  errorSubtitle?: string;
  invitationTitle?: string;
  acceptButtonText?: string;
  rejectButtonText?: string;
  goToOrganizationText?: string;
  backToDashboardText?: string;
  expiredAlertText?: string;
  formatExpirationDate?: (expiresAt: string) => string;
  getInitials?: (name?: string, email?: string) => string;
  renderCustomContent?: (
    invitation: Invitation,
    defaultContent: React.ReactNode,
  ) => React.ReactNode;
}

export function OrganizationInvitation({
  invitationId,
  invitation: propInvitation,
  loading = false,
  error = null,
  status = 'loading',
  onLoadInvitation,
  onAccept,
  onReject,
  onError,
  onNavigate,
  loadingTitle = 'Loading invitation...',
  loadingSubtitle = 'Please wait while we fetch the invitation details',
  acceptedTitle = 'Welcome to {{organizationName}}!',
  acceptedSubtitle = "You've successfully joined the organization. You will be redirected shortly...",
  rejectedTitle = 'Invitation declined',
  rejectedSubtitle = "You've declined the invitation to join {{organizationName}}.",
  errorTitle = 'Invalid invitation',
  errorSubtitle = 'This invitation link is invalid or has expired',
  invitationTitle = "You're invited to join",
  acceptButtonText = 'Accept Invitation',
  rejectButtonText = 'Decline',
  goToOrganizationText = 'Go to Organization',
  backToDashboardText = 'Back to Dashboard',
  expiredAlertText = 'This invitation has expired and can no longer be accepted.',
  formatExpirationDate,
  getInitials,
  renderCustomContent,
}: OrganizationInvitationProps) {
  const [invitation, setInvitation] = React.useState<Invitation | null>(propInvitation || null);
  const [currentStatus, setCurrentStatus] = React.useState(status);
  const [currentError, setCurrentError] = React.useState(error);
  const [isLoading, setIsLoading] = React.useState(loading);

  const loadInvitation = useCallback(async () => {
    if (!invitationId || !onLoadInvitation) return;

    setIsLoading(true);
    setCurrentError(null);

    try {
      const result = await onLoadInvitation(invitationId);
      setInvitation(result);
      setCurrentStatus('found');
    } catch (err) {
      setCurrentStatus('error');
      setCurrentError('Failed to load invitation details');
      if (onError) {
        onError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      setIsLoading(false);
    }
  }, [invitationId, onLoadInvitation, onError]);

  React.useEffect(() => {
    if (invitationId && !propInvitation && onLoadInvitation) {
      loadInvitation();
    }
  }, [invitationId, propInvitation, onLoadInvitation, loadInvitation]);

  const defaultFormatExpirationDate = (expiresAt: string) => {
    const expirationDate = new Date(expiresAt);
    const now = new Date();
    const diffInHours = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 0) {
      return 'Expired';
    } else if (diffInHours < 24) {
      return `Expires in ${diffInHours} hour${diffInHours !== 1 ? 's' : ''}`;
    } else {
      const diffInDays = Math.ceil(diffInHours / 24);
      return `Expires in ${diffInDays} day${diffInDays !== 1 ? 's' : ''}`;
    }
  };

  const defaultGetInitials = (name?: string, email?: string) => {
    return (name || email || '?').charAt(0).toUpperCase();
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const handleAccept = async () => {
    if (!invitation) return;

    setIsLoading(true);
    setCurrentError(null);

    try {
      await onAccept(invitation);
      setCurrentStatus('accepted');
    } catch (err) {
      setCurrentError('Failed to accept invitation');
      if (onError) {
        onError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!invitation) return;

    setIsLoading(true);
    setCurrentError(null);

    try {
      await onReject(invitation);
      setCurrentStatus('rejected');
    } catch (err) {
      setCurrentError('Failed to reject invitation');
      if (onError) {
        onError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    }
  };

  const formatDate = formatExpirationDate || defaultFormatExpirationDate;
  const getUserInitials = getInitials || defaultGetInitials;

  if (currentStatus === 'loading' || isLoading) {
    return (
      <Paper withBorder shadow="md" p={30} radius="md" pos="relative">
        <LoadingOverlay visible />
        <Center>
          <Stack align="center" gap="md">
            <ThemeIcon size={60} color="blue" variant="light">
              <IconBuilding size={30} />
            </ThemeIcon>
            <div style={{ textAlign: 'center' }}>
              <Title order={3}>{loadingTitle}</Title>
              <Text c="dimmed" size="sm" mt="sm">
                {loadingSubtitle}
              </Text>
            </div>
          </Stack>
        </Center>
      </Paper>
    );
  }

  if (currentStatus === 'accepted') {
    return (
      <Paper withBorder shadow="md" p={30} radius="md">
        <Center>
          <Stack align="center" gap="md">
            <ThemeIcon size={60} color="green" variant="light">
              <IconCheck size={30} />
            </ThemeIcon>

            <div style={{ textAlign: 'center' }}>
              <Title order={2}>
                {acceptedTitle.replace('{{organizationName}}', invitation?.organization.name || '')}
              </Title>
              <Text c="dimmed" size="sm" mt="sm">
                {acceptedSubtitle.replace(
                  '{{organizationName}}',
                  invitation?.organization.name || '',
                )}
              </Text>
            </div>

            <Button
              fullWidth
              mt="md"
              onClick={() =>
                handleNavigate(
                  `/dashboard?org=${invitation?.organization.slug || invitation?.organizationId}`,
                )
              }
              data-testid="go-to-organization"
            >
              {goToOrganizationText}
            </Button>
          </Stack>
        </Center>
      </Paper>
    );
  }

  if (currentStatus === 'rejected') {
    return (
      <Paper withBorder shadow="md" p={30} radius="md">
        <Center>
          <Stack align="center" gap="md">
            <ThemeIcon size={60} color="orange" variant="light">
              <IconX size={30} />
            </ThemeIcon>

            <div style={{ textAlign: 'center' }}>
              <Title order={2}>{rejectedTitle}</Title>
              <Text c="dimmed" size="sm" mt="sm">
                {rejectedSubtitle.replace(
                  '{{organizationName}}',
                  invitation?.organization.name || '',
                )}
              </Text>
            </div>

            <Button
              fullWidth
              mt="md"
              onClick={() => handleNavigate('/dashboard')}
              data-testid="go-to-dashboard"
            >
              {backToDashboardText}
            </Button>
          </Stack>
        </Center>
      </Paper>
    );
  }

  if (currentStatus === 'error' || !invitation) {
    return (
      <Paper withBorder shadow="md" p={30} radius="md">
        <Center>
          <Stack align="center" gap="md">
            <ThemeIcon size={60} color="red" variant="light">
              <IconAlertCircle size={30} />
            </ThemeIcon>

            <div style={{ textAlign: 'center' }}>
              <Title order={2}>{errorTitle}</Title>
              <Text c="dimmed" size="sm" mt="sm">
                {currentError || errorSubtitle}
              </Text>
            </div>

            <Button
              fullWidth
              mt="md"
              onClick={() => handleNavigate('/dashboard')}
              data-testid="back-to-dashboard"
            >
              {backToDashboardText}
            </Button>
          </Stack>
        </Center>
      </Paper>
    );
  }

  const expired = isExpired(invitation.expiresAt);
  const expirationText = formatDate(invitation.expiresAt);

  const defaultContent = (
    <Paper withBorder shadow="md" p={30} radius="md" pos="relative">
      <LoadingOverlay visible={isLoading} />

      <Stack gap="lg">
        <Center>
          <ThemeIcon size={60} color="blue" variant="light">
            <IconBuilding size={30} />
          </ThemeIcon>
        </Center>

        <div style={{ textAlign: 'center' }}>
          <Title order={2}>{invitationTitle}</Title>
          <Title order={1} c="blue" mt="xs">
            {invitation.organization.name}
          </Title>
        </div>

        {currentError && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
            {currentError}
          </Alert>
        )}

        {expired && (
          <Alert icon={<IconClock size={16} />} color="red" variant="light">
            {expiredAlertText}
          </Alert>
        )}

        <Card withBorder>
          <Stack gap="md">
            <Group>
              <Avatar
                src={invitation.inviter.image}
                alt={invitation.inviter.name || invitation.inviter.email}
                size="md"
              >
                {getUserInitials(invitation.inviter.name, invitation.inviter.email)}
              </Avatar>
              <div>
                <Text fw={500}>{invitation.inviter.name || invitation.inviter.email}</Text>
                <Group gap="xs" align="center">
                  <IconMail size={14} />
                  <Text size="sm" c="dimmed">
                    {invitation.inviter.email}
                  </Text>
                </Group>
              </div>
            </Group>

            <Group justify="space-between">
              <div>
                <Text size="sm" c="dimmed">
                  Role
                </Text>
                <Badge variant="light" color="blue">
                  {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
                </Badge>
              </div>

              {invitation.organization.memberCount && (
                <div style={{ textAlign: 'right' }}>
                  <Text size="sm" c="dimmed">
                    Members
                  </Text>
                  <Group gap="xs" justify="flex-end">
                    <IconUsers size={14} />
                    <Text size="sm" fw={500}>
                      {invitation.organization.memberCount}
                    </Text>
                  </Group>
                </div>
              )}
            </Group>

            <Box>
              <Group gap="xs" align="center">
                <IconClock size={14} color={expired ? 'red' : 'orange'} />
                <Text size="sm" c={expired ? 'red' : 'orange'}>
                  {expirationText}
                </Text>
              </Group>
            </Box>
          </Stack>
        </Card>

        {!expired && (
          <Group grow>
            <Button
              variant="subtle"
              color="gray"
              onClick={handleReject}
              disabled={isLoading}
              data-testid="reject-invitation"
            >
              {rejectButtonText}
            </Button>
            <Button onClick={handleAccept} disabled={isLoading} data-testid="accept-invitation">
              {acceptButtonText}
            </Button>
          </Group>
        )}
      </Stack>
    </Paper>
  );

  return renderCustomContent ? renderCustomContent(invitation, defaultContent) : defaultContent;
}

// Standalone alert component for showing pending invitations
export interface InvitationAlert {
  id: string;
  organizationName: string;
  inviterName?: string;
  role: string;
  expiresAt: string;
}

export interface OrganizationInvitationAlertProps {
  invitations: InvitationAlert[];
  title?: string;
  alertColor?: string;
  viewButtonText?: string;
  onViewInvitation?: (invitationId: string) => void;
  onDismiss?: (invitationId: string) => void;
  renderCustomAlert?: (
    invitation: InvitationAlert,
    defaultAlert: React.ReactNode,
  ) => React.ReactNode;
}

export function OrganizationInvitationAlert({
  invitations,
  title = 'Organization invitation',
  alertColor = 'blue',
  viewButtonText = 'View invitation',
  onViewInvitation,
  onDismiss,
  renderCustomAlert,
}: OrganizationInvitationAlertProps) {
  if (invitations.length === 0) return null;

  return (
    <Stack gap="sm">
      {invitations.map(invitation => {
        const defaultAlert = (
          <Alert
            key={invitation.id}
            icon={<IconBuilding size={16} />}
            title={title}
            color={alertColor}
            variant="light"
            withCloseButton={!!onDismiss}
            onClose={() => onDismiss?.(invitation.id)}
          >
            <Stack gap="xs">
              <Text size="sm">
                {invitation.inviterName ? (
                  <>
                    <strong>{invitation.inviterName}</strong> invited you to join{' '}
                    <strong>{invitation.organizationName}</strong> as a{' '}
                    <strong>{invitation.role}</strong>.
                  </>
                ) : (
                  <>
                    You've been invited to join <strong>{invitation.organizationName}</strong> as a{' '}
                    <strong>{invitation.role}</strong>.
                  </>
                )}
              </Text>

              {onViewInvitation && (
                <Button
                  size="xs"
                  variant="subtle"
                  onClick={() => onViewInvitation(invitation.id)}
                  data-testid={`view-invitation-${invitation.id}`}
                >
                  {viewButtonText}
                </Button>
              )}
            </Stack>
          </Alert>
        );

        return renderCustomAlert ? renderCustomAlert(invitation, defaultAlert) : defaultAlert;
      })}
    </Stack>
  );
}
