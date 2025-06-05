'use client';

import { Badge, Box, Card, Group, List, Stack, Table, Text, Title } from '@mantine/core';
import React from 'react';

import { adminRoles } from '@repo/auth-new/admin-permissions';

export default function RolesPage() {
  const roles = Object.entries(adminRoles);

  const getRoleBadgeColor = (role: string): string => {
    switch (role) {
      case 'admin':
      case 'super-admin':
        return 'red';
      case 'moderator':
        return 'blue';
      case 'support':
        return 'gray';
      default:
        return 'gray';
    }
  };

  interface RoleConfig {
    [key: string]: unknown;
    statements?: Record<string, string[]>;
  }

  const getPermissionsList = (roleConfig: RoleConfig): Record<string, string[]> => {
    // Extract permissions from the role configuration

    if (roleConfig.statements) {
      return roleConfig.statements;
    }

    // For roles created with newRole(), the permissions are stored directly
    return roleConfig as unknown as Record<string, string[]>;
  };

  return (
    <Stack gap="lg">
      <div>
        <Title order={1}>Role Management</Title>
        <Text c="dimmed">View and manage system roles and permissions</Text>
      </div>

      <Stack gap="md">
        {roles.map(([roleName, roleConfig]) => {
          const _permissions = getPermissionsList(roleConfig);

          return (
            <Card key={roleName} shadow="sm" withBorder radius="md">
              <Card.Section withBorder inheritPadding py="xs">
                <Group justify="space-between">
                  <Title order={3} tt="capitalize">
                    {roleName.replace('-', ' ')}
                  </Title>
                  <Badge color={getRoleBadgeColor(roleName)}>{roleName}</Badge>
                </Group>
                <Text c="dimmed" size="sm">
                  Permissions and access levels for {roleName} role
                </Text>
              </Card.Section>

              <Card.Section inheritPadding py="md">
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Resource</Table.Th>
                      <Table.Th>Permissions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {Object.entries(_permissions).map(([resource, actions]) => (
                      <Table.Tr key={resource}>
                        <Table.Td fw={500} tt="capitalize">
                          {resource}
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            {actions.map((action) => (
                              <Badge key={action} color="gray" size="xs" variant="light">
                                {action}
                              </Badge>
                            ))}
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Card.Section>
            </Card>
          );
        })}
      </Stack>

      <Card shadow="sm" withBorder radius="md">
        <Card.Section withBorder inheritPadding py="xs">
          <Title order={3}>Role Information</Title>
          <Text c="dimmed" size="sm">
            Understanding the role hierarchy and permissions
          </Text>
        </Card.Section>

        <Card.Section inheritPadding py="md">
          <Stack gap="lg">
            <Box>
              <Title order={4} mb="sm">
                Role Hierarchy
              </Title>
              <List size="sm">
                <List.Item>
                  <Text fw={600} span>
                    Super Admin:
                  </Text>{' '}
                  Full system access with all permissions
                </List.Item>
                <List.Item>
                  <Text fw={600} span>
                    Admin:
                  </Text>{' '}
                  Comprehensive access with some restrictions
                </List.Item>
                <List.Item>
                  <Text fw={600} span>
                    Moderator:
                  </Text>{' '}
                  Can manage users and content moderation
                </List.Item>
                <List.Item>
                  <Text fw={600} span>
                    Support:
                  </Text>{' '}
                  Limited to support-related functions
                </List.Item>
                <List.Item>
                  <Text fw={600} span>
                    User:
                  </Text>{' '}
                  Basic user permissions
                </List.Item>
              </List>
            </Box>

            <Box>
              <Title order={4} mb="sm">
                Common Permissions
              </Title>
              <List size="sm">
                <List.Item>
                  <Text fw={600} span>
                    create:
                  </Text>{' '}
                  Can create new resources
                </List.Item>
                <List.Item>
                  <Text fw={600} span>
                    read/list:
                  </Text>{' '}
                  Can view resources
                </List.Item>
                <List.Item>
                  <Text fw={600} span>
                    update:
                  </Text>{' '}
                  Can modify existing resources
                </List.Item>
                <List.Item>
                  <Text fw={600} span>
                    delete:
                  </Text>{' '}
                  Can remove resources
                </List.Item>
                <List.Item>
                  <Text fw={600} span>
                    ban:
                  </Text>{' '}
                  Can ban/unban users
                </List.Item>
                <List.Item>
                  <Text fw={600} span>
                    impersonate:
                  </Text>{' '}
                  Can impersonate other users
                </List.Item>
              </List>
            </Box>
          </Stack>
        </Card.Section>
      </Card>
    </Stack>
  );
}
