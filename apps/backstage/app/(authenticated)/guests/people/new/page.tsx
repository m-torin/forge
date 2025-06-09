'use client';

import {
  Button,
  Group,
  Stack,
  TextInput,
  Select,
  Container,
  Card,
} from '@mantine/core';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { IconArrowLeft } from '@tabler/icons-react';

export default function NewUserPage() {
  const router = useRouter();
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [loading, setLoading] = useState(false);

  const handleCreateUser = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: 'User created successfully',
          color: 'green',
        });
        router.push('/guests?tab=people');
      } else {
        const error = await response.json();
        notifications.show({
          title: 'Error',
          message: error.message || 'Failed to create user',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to create user',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <Button variant="subtle" leftSection={<IconArrowLeft size={16} />} onClick={() => router.back()}>
            Back to Users
          </Button>
        </Group>

        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <Stack gap="md">
            <h2>Create New User</h2>
            <TextInput
              label="Name"
              placeholder="Enter user name"
              value={newUser.name}
              onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
              required
            />
            <TextInput
              label="Email"
              placeholder="Enter email address"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
              required
            />
            <TextInput
              label="Password"
              placeholder="Enter password (optional)"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
            />
            <Select
              label="Role"
              placeholder="Select user role"
              value={newUser.role}
              onChange={(value) => setNewUser(prev => ({ ...prev, role: value || 'user' }))}
              data={[
                { value: 'user', label: 'User' },
                { value: 'moderator', label: 'Moderator' },
                { value: 'admin', label: 'Admin' },
                { value: 'super-admin', label: 'Super Admin' },
              ]}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={() => router.push('/guests?tab=people')}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateUser}
                disabled={!newUser.name || !newUser.email}
                loading={loading}
              >
                Create User
              </Button>
            </Group>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}