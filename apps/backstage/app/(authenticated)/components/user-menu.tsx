'use client';

import { Avatar, Group, Menu, Text, UnstyledButton } from '@mantine/core';
import { IconLogout, IconSettings, IconUser } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

import { signOut } from '@repo/auth-new/client';

import type { User } from '@repo/database/prisma';

interface UserMenuProps {
  user: User;
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-in');
  };

  return (
    <Menu width={200} shadow="md">
      <Menu.Target>
        <UnstyledButton>
          <Group gap="xs">
            <Avatar radius="xl" size="sm">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <div>
              <Text fw={500} size="sm">
                {user.name || 'User'}
              </Text>
              <Text c="dimmed" size="xs">
                {user.email}
              </Text>
            </div>
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Account</Menu.Label>
        <Menu.Item
          leftSection={<IconUser size={14} />}
          onClick={() => router.push('/settings' as any)}
        >
          Profile
        </Menu.Item>
        <Menu.Item
          leftSection={<IconSettings size={14} />}
          onClick={() => router.push('/settings/security' as any)}
        >
          Security Settings
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item color="red" leftSection={<IconLogout size={14} />} onClick={handleSignOut}>
          Sign out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
