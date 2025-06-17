'use client';

import { Card, Title, Stack, Group, Button, Text, Badge, ActionIcon } from '@mantine/core';
import { IconDeviceLaptop, IconDeviceMobile, IconDeviceTablet, IconX, IconClock } from '@tabler/icons-react';
import { useAuth, authClient } from '@repo/auth/client/next';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface Session {
  id: string;
  userId: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
  expiresAt: Date;
  token: string;
}

export function SessionManager() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);

  // Get current session ID from cookies/storage
  const currentSessionId = typeof window !== 'undefined' 
    ? document.cookie.match(/better-auth\.session_token=([^;]+)/)?.[1]
    : null;

  const loadSessions = async () => {
    try {
      setLoading(true);
      const { data } = await authClient.session.list();
      if (data) {
        setSessions(data as Session[]);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load active sessions',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    try {
      setRevoking(sessionId);
      
      await authClient.session.revoke({
        sessionId,
      });
      
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      notifications.show({
        title: 'Session revoked',
        message: 'The session has been terminated successfully.',
        color: 'green',
      });
    } catch (error) {
      console.error('Failed to revoke session:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to revoke session. Please try again.',
        color: 'red',
      });
    } finally {
      setRevoking(null);
    }
  };

  const getDeviceIcon = (userAgent?: string) => {
    if (!userAgent) return IconDeviceLaptop;
    
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile')) return IconDeviceMobile;
    if (ua.includes('tablet')) return IconDeviceTablet;
    return IconDeviceLaptop;
  };

  const getDeviceName = (userAgent?: string) => {
    if (!userAgent) return 'Unknown device';
    
    // Simple parsing - in production, use a proper UA parser
    const ua = userAgent.toLowerCase();
    if (ua.includes('chrome')) return 'Chrome';
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('safari')) return 'Safari';
    if (ua.includes('edge')) return 'Edge';
    return 'Unknown browser';
  };

  React.useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  if (!user) return null;

  return (
    <Card shadow="sm" radius="md" withBorder>
      <Group justify="space-between" mb="md">
        <Title order={3}>Active Sessions</Title>
        <Button 
          variant="subtle" 
          size="sm"
          onClick={loadSessions}
          loading={loading}
        >
          Refresh
        </Button>
      </Group>
      
      <Text size="sm" color="dimmed" mb="lg">
        Manage devices where you're currently logged in
      </Text>
      
      <Stack gap="sm">
        {sessions.length === 0 && !loading && (
          <Text color="dimmed" ta="center" py="xl">
            No active sessions found
          </Text>
        )}
        
        {sessions.map((session) => {
          const DeviceIcon = getDeviceIcon(session.userAgent);
          const isCurrent = session.token === currentSessionId;
          
          return (
            <Group 
              key={session.id} 
              justify="space-between" 
              p="sm" 
              className={`border rounded-lg ${isCurrent ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}
            >
              <Group>
                <DeviceIcon size={24} />
                <div>
                  <Group gap="xs">
                    <Text fw={500}>{getDeviceName(session.userAgent)}</Text>
                    {isCurrent && (
                      <Badge size="xs" color="blue">Current</Badge>
                    )}
                  </Group>
                  <Group gap="xs">
                    <Text size="xs" color="dimmed">
                      {session.ipAddress || 'Unknown IP'}
                    </Text>
                    <Text size="xs" color="dimmed">•</Text>
                    <Text size="xs" color="dimmed">
                      Active {formatDistanceToNow(new Date(session.createdAt))} ago
                    </Text>
                  </Group>
                </div>
              </Group>
              
              {!isCurrent && (
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={() => revokeSession(session.id)}
                  loading={revoking === session.id}
                  disabled={revoking !== null}
                  title="Revoke session"
                >
                  <IconX size={18} />
                </ActionIcon>
              )}
            </Group>
          );
        })}
      </Stack>

      <Card bg="blue.1" mt="md" p="md">
        <Group gap="xs">
          <IconClock size={16} />
          <Text size="sm">
            Sessions expire after 30 days of inactivity
          </Text>
        </Group>
      </Card>
    </Card>
  );
}