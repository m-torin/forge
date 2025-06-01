'use client';

import {
  Alert,
  Button,
  Center,
  Container,
  Loader,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { IconAlertTriangle, IconCheck } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { acceptInvitation, useSession } from '@repo/auth/client';

import type { Route } from 'next';

interface AcceptInvitationProps {
  invitationId: string;
  redirectUrl?: string;
}

export const AcceptInvitation = ({ invitationId, redirectUrl = '/' }: AcceptInvitationProps) => {
  const { data: session, isPending: sessionLoading } = useSession();
  const [status, setStatus] = useState<'idle' | 'accepting' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleInvitation = async () => {
      // Wait for session to load
      if (sessionLoading) return;

      // User must be logged in to accept invitation
      if (!session?.user) {
        // Redirect to sign-in with return URL
        router.push(`/sign-in?returnUrl=/accept-invitation/${invitationId}` as Route);
        return;
      }

      // Only try to accept if we haven't already
      if (status !== 'idle') return;

      setStatus('accepting');
      try {
        await acceptInvitation({ invitationId });
        setStatus('success');

        // Redirect after successful acceptance
        setTimeout(() => {
          router.push(redirectUrl as Route);
        }, 1500);
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Failed to accept invitation');
      }
    };

    handleInvitation();
  }, [invitationId, session, sessionLoading, status, router, redirectUrl]);

  if (sessionLoading || status === 'idle') {
    return (
      <Container style={{ alignItems: 'center', display: 'flex', minHeight: '100vh' }} size="xs">
        <Center w="100%">
          <Stack align="center">
            <Loader size="md" />
            <Text>Loading...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  if (status === 'accepting') {
    return (
      <Container style={{ alignItems: 'center', display: 'flex', minHeight: '100vh' }} size="xs">
        <Center w="100%">
          <Stack align="center">
            <Loader size="md" />
            <Text>Accepting invitation...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  if (status === 'error') {
    return (
      <Container style={{ alignItems: 'center', display: 'flex', minHeight: '100vh' }} size="xs">
        <Center w="100%">
          <Stack align="center" maw={400}>
            <ThemeIcon color="red" radius="xl" size={48} variant="light">
              <IconAlertTriangle size={24} />
            </ThemeIcon>
            <Title order={2}>Failed to Accept Invitation</Title>
            <Alert color="red" variant="light" w="100%">
              {error}
            </Alert>
            <Button onClick={() => router.push('/' as Route)}>Go to Home</Button>
          </Stack>
        </Center>
      </Container>
    );
  }

  return (
    <Container style={{ alignItems: 'center', display: 'flex', minHeight: '100vh' }} size="xs">
      <Center w="100%">
        <Stack align="center">
          <ThemeIcon color="green" radius="xl" size={48} variant="light">
            <IconCheck size={24} />
          </ThemeIcon>
          <Title order={2}>Invitation Accepted!</Title>
          <Text c="dimmed">Redirecting you to the organization...</Text>
        </Stack>
      </Center>
    </Container>
  );
};
