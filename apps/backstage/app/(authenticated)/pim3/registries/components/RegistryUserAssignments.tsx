'use client';

import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Card,
  Group,
  Select,
  Stack,
  Table,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconCrown, IconEdit, IconEye, IconPlus, IconTrash, IconUser } from '@tabler/icons-react';
import { useState } from 'react';

import { showErrorNotification, showSuccessNotification } from '../../utils/pim-helpers';
import { removeRegistryUser, updateRegistryUserRole } from '../actions';

import { UserSelect } from './UserSelect';

import type { RegistryUserRole } from '@repo/database/prisma';

interface RegistryUser {
  id: string;
  role: RegistryUserRole;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

interface RegistryUserAssignmentsProps {
  'data-testid'?: string;
  editable?: boolean;
  onRefresh?: () => void;
  registryId?: string;
  users: RegistryUser[];
}

const ROLE_OPTIONS = [
  { label: 'Owner', value: 'OWNER' },
  { label: 'Editor', value: 'EDITOR' },
  { label: 'Viewer', value: 'VIEWER' },
];

const ROLE_COLORS: Record<RegistryUserRole, string> = {
  EDITOR: 'blue',
  OWNER: 'orange',
  VIEWER: 'gray',
};

const ROLE_ICONS: Record<RegistryUserRole, React.ReactNode> = {
  EDITOR: <IconEdit size={14} />,
  OWNER: <IconCrown size={14} />,
  VIEWER: <IconEye size={14} />,
};

const ROLE_DESCRIPTIONS: Record<RegistryUserRole, string> = {
  EDITOR: 'Can add/remove items and edit details',
  OWNER: 'Can edit all aspects of the registry and delete it',
  VIEWER: 'Can only view the registry',
};

/**
 * RegistryUserAssignments component for managing user access to registries
 * Allows adding users with specific roles and updating existing assignments
 */
export function RegistryUserAssignments({
  'data-testid': testId = 'registry-user-assignments',
  editable = false,
  onRefresh,
  registryId,
  users,
}: RegistryUserAssignmentsProps) {
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<RegistryUserRole>('VIEWER');
  const [loading, setLoading] = useState(false);

  const handleAddUsers = async () => {
    if (!registryId || selectedUsers.length === 0) return;

    setLoading(true);
    try {
      // Add each selected user with the chosen role
      const promises = selectedUsers.map((userId) =>
        updateRegistryUserRole({
          registryId,
          role: selectedRole,
          userId,
        }),
      );

      const results = await Promise.all(promises);
      const failedCount = results.filter((result) => !result.success).length;

      if (failedCount === 0) {
        showSuccessNotification(`Added ${selectedUsers.length} user(s) to registry successfully`);
        setSelectedUsers([]);
        setSelectedRole('VIEWER');
        setIsAddingUser(false);
        onRefresh?.();
      } else {
        showErrorNotification(
          `Failed to add ${failedCount} user(s). Some users may have been added successfully.`,
        );
        onRefresh?.();
      }
    } catch (error) {
      showErrorNotification('Failed to add users to registry');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: RegistryUserRole) => {
    if (!registryId) return;

    try {
      const result = await updateRegistryUserRole({
        registryId,
        role: newRole,
        userId,
      });

      if (result.success) {
        showSuccessNotification('User role updated successfully');
        onRefresh?.();
      } else {
        showErrorNotification(result.error || 'Failed to update user role');
      }
    } catch (error) {
      showErrorNotification('Failed to update user role');
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!registryId) return;

    try {
      const result = await removeRegistryUser(registryId, userId);

      if (result.success) {
        showSuccessNotification('User removed from registry successfully');
        onRefresh?.();
      } else {
        showErrorNotification(result.error || 'Failed to remove user from registry');
      }
    } catch (error) {
      showErrorNotification('Failed to remove user from registry');
    }
  };

  const rows = users.map((userJoin) => (
    <Table.Tr key={userJoin.id}>
      <Table.Td>
        <Group gap="sm">
          <Avatar alt={userJoin.user.name} radius="xl" size="sm" src={userJoin.user.image}>
            {userJoin.user.name.charAt(0)}
          </Avatar>
          <div>
            <Text fw={500} size="sm">
              {userJoin.user.name}
            </Text>
            <Text c="dimmed" size="xs">
              {userJoin.user.email}
            </Text>
          </div>
        </Group>
      </Table.Td>

      <Table.Td>
        {editable ? (
          <Select
            onChange={(value) =>
              value && handleUpdateRole(userJoin.user.id, value as RegistryUserRole)
            }
            data={ROLE_OPTIONS}
            size="sm"
            value={userJoin.role}
            w={120}
          />
        ) : (
          <Tooltip label={ROLE_DESCRIPTIONS[userJoin.role]}>
            <Badge
              color={ROLE_COLORS[userJoin.role]}
              leftSection={ROLE_ICONS[userJoin.role]}
              size="sm"
            >
              {userJoin.role}
            </Badge>
          </Tooltip>
        )}
      </Table.Td>

      {editable && (
        <Table.Td>
          <Tooltip label="Remove user from registry">
            <ActionIcon
              color="red"
              onClick={() => handleRemoveUser(userJoin.user.id)}
              variant="subtle"
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        </Table.Td>
      )}
    </Table.Tr>
  ));

  return (
    <Card data-testid={testId} withBorder radius="md">
      <Stack gap="md">
        <Group justify="space-between">
          <div>
            <Title order={4}>User Access</Title>
            <Text c="dimmed" size="sm">
              Manage who can access this registry and their permissions
            </Text>
          </div>
          {editable && (
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setIsAddingUser(!isAddingUser)}
              size="sm"
              variant="light"
            >
              Add Users
            </Button>
          )}
        </Group>

        {isAddingUser && editable && (
          <Card withBorder bg="gray.0" p="md">
            <Stack gap="md">
              <Text fw={500} size="sm">
                Add New Users
              </Text>

              <UserSelect
                data-testid="user-assignment-select"
                onChange={setSelectedUsers}
                placeholder="Search and select users..."
                value={selectedUsers}
              />

              <Select
                description="Select the access level for the selected users"
                onChange={(value) => value && setSelectedRole(value as RegistryUserRole)}
                data={ROLE_OPTIONS.map((option) => ({
                  ...option,
                  description: ROLE_DESCRIPTIONS[option.value as RegistryUserRole],
                }))}
                label="Role"
                value={selectedRole}
              />

              <Group justify="flex-end">
                <Button
                  onClick={() => {
                    setIsAddingUser(false);
                    setSelectedUsers([]);
                    setSelectedRole('VIEWER');
                  }}
                  variant="subtle"
                >
                  Cancel
                </Button>
                <Button
                  loading={loading}
                  onClick={handleAddUsers}
                  disabled={selectedUsers.length === 0}
                >
                  Add {selectedUsers.length > 0 ? `${selectedUsers.length} ` : ''}User
                  {selectedUsers.length !== 1 ? 's' : ''}
                </Button>
              </Group>
            </Stack>
          </Card>
        )}

        {users.length > 0 ? (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>User</Table.Th>
                <Table.Th>Role</Table.Th>
                {editable && <Table.Th style={{ width: 60 }}>Actions</Table.Th>}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        ) : (
          <Group justify="center" py="xl">
            <Stack align="center" gap="sm">
              <IconUser color="var(--mantine-color-gray-5)" size={32} />
              <Text c="dimmed" size="sm">
                No users assigned to this registry
              </Text>
              {editable && (
                <Text c="dimmed" size="xs">
                  Click "Add Users" to assign users with specific roles
                </Text>
              )}
            </Stack>
          </Group>
        )}
      </Stack>
    </Card>
  );
}
