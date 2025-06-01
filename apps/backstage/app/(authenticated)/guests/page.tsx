'use client';

import { Alert, Box, Button, Card, Group, Stack, Tabs, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconUserCheck } from '@tabler/icons-react';
import React, { useState } from 'react';

import { stopImpersonating } from '@repo/auth';
import { CreateUserDialog, UserDetails, UserList } from '@repo/design-system/uix';

interface User {
  banExpires?: string;
  banned: boolean;
  banReason?: string;
  createdAt: string;
  email: string;
  emailVerified: boolean;
  id: string;
  name: string;
  role: string;
}

export default function UsersPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isImpersonating, setIsImpersonating] = useState(false);

  // Check if currently impersonating - this would ideally come from the session
  React.useEffect(() => {
    // Check if there's an active impersonation session
    const checkImpersonation = async () => {
      // This would normally check the session for impersonatedBy field
      // For now, we'll use a simple flag
      const impersonating = sessionStorage.getItem('impersonating') === 'true';
      setIsImpersonating(impersonating);
    };

    checkImpersonation();
  }, []);

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
  };

  const handleUserCreate = () => {
    setRefreshKey((prev) => prev + 1);
    setSelectedUser(null);
  };

  const handleUserUpdate = () => {
    setRefreshKey((prev) => prev + 1);
    if (selectedUser) {
      // Refresh the selected user data
      setSelectedUser(null);
    }
  };

  const handleStopImpersonating = async () => {
    try {
      const response = await stopImpersonating();
      if (!response.success) {
        throw new Error(response.error || 'Failed to stop impersonating');
      }
      sessionStorage.removeItem('impersonating');
      notifications.show({
        color: 'green',
        message: 'Stopped impersonating user',
        title: 'Success',
      });
      window.location.href = '/guests';
    } catch (error) {
      console.error('Failed to stop impersonating:', error);
      notifications.show({ color: 'red', message: 'Failed to stop impersonating', title: 'Error' });
    }
  };

  return (
    <Stack gap="lg">
      <div>
        <Title order={1}>User Management</Title>
        <Text c="dimmed">Manage user accounts, roles, and permissions</Text>
      </div>

      {isImpersonating && (
        <Alert
          color="yellow"
          icon={<IconUserCheck size={16} />}
          styles={{
            body: { flex: 1 },
            root: { alignItems: 'center', display: 'flex' },
          }}
          variant="light"
        >
          <Group style={{ width: '100%' }} justify="space-between">
            <Text>You are currently impersonating a user</Text>
            <Button onClick={handleStopImpersonating} size="xs" variant="outline">
              Stop Impersonating
            </Button>
          </Group>
        </Alert>
      )}

      <Tabs defaultValue="list">
        <Tabs.List>
          <Tabs.Tab value="list">User List</Tabs.Tab>
          {selectedUser && <Tabs.Tab value="details">User Details</Tabs.Tab>}
        </Tabs.List>

        <Box mt="md">
          <Tabs.Panel value="list">
            <Card shadow="sm" withBorder radius="md">
              <Card.Section withBorder inheritPadding py="xs">
                <Group justify="space-between">
                  <div>
                    <Title order={3}>All Users</Title>
                    <Text c="dimmed" size="sm">
                      View and manage all registered users
                    </Text>
                  </div>
                  <CreateUserDialog onSuccess={handleUserCreate} />
                </Group>
              </Card.Section>

              <Card.Section inheritPadding py="md">
                <UserList
                  key={refreshKey}
                  onCreateUser={handleUserCreate}
                  onUserSelect={handleUserSelect}
                />
              </Card.Section>
            </Card>
          </Tabs.Panel>

          {selectedUser && (
            <Tabs.Panel value="details">
              <Card shadow="sm" withBorder radius="md">
                <Card.Section withBorder inheritPadding py="xs">
                  <Title order={3}>{selectedUser.name}</Title>
                  <Text c="dimmed" size="sm">
                    {selectedUser.email}
                  </Text>
                </Card.Section>

                <Card.Section inheritPadding py="md">
                  <UserDetails onUpdate={handleUserUpdate} user={selectedUser} />
                </Card.Section>
              </Card>
            </Tabs.Panel>
          )}
        </Box>
      </Tabs>
    </Stack>
  );
}
