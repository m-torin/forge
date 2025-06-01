'use client';

import { Alert, Badge, Button, Card, Center, Loader, Stack, Text, Title } from '@mantine/core';
import { useEffect, useState } from 'react';

import { getInvitation } from '@repo/auth/client';

interface InvitationPreviewProps {
  invitationId: string;
  onAccept?: () => void;
}

export const InvitationPreview = ({ invitationId, onAccept }: InvitationPreviewProps) => {
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const inviteData = await getInvitation({
          query: { id: invitationId },
        });
        setInvitation(inviteData);
      } catch {
        setError('Invalid or expired invitation');
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [invitationId]);

  if (loading) {
    return (
      <Card withBorder p="xl" radius="md">
        <Center>
          <Loader />
        </Center>
      </Card>
    );
  }

  if (error || !invitation) {
    return (
      <Card withBorder p="xl" radius="md">
        <Alert color="red" variant="light">
          {error || 'Invitation not found'}
        </Alert>
      </Card>
    );
  }

  return (
    <Card shadow="sm" withBorder maw={400} mx="auto" p="xl" radius="md">
      <Title order={2} mb="lg">
        Organization Invitation
      </Title>

      <Stack gap="md">
        <div>
          <Text c="dimmed" size="sm">
            You've been invited to join:
          </Text>
          <Text fw={600} size="lg">
            {invitation.organization?.name}
          </Text>
        </div>

        <div>
          <Text c="dimmed" size="sm">
            Invited by:
          </Text>
          <Text size="lg">{invitation.inviter?.name || invitation.inviter?.email}</Text>
        </div>

        <div>
          <Text c="dimmed" size="sm">
            Role:
          </Text>
          <Badge size="lg" variant="light">
            {invitation.role}
          </Badge>
        </div>

        {invitation.team && (
          <div>
            <Text c="dimmed" size="sm">
              Team:
            </Text>
            <Text size="lg">{invitation.team.name}</Text>
          </div>
        )}
      </Stack>

      {onAccept && (
        <Button fullWidth onClick={onAccept} mt="xl" size="md">
          Accept Invitation
        </Button>
      )}
    </Card>
  );
};
