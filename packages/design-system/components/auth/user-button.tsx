'use client';

import { Avatar, Group, Menu, Text, UnstyledButton } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';

import { signOut, useSession } from '@repo/auth/client';

interface UserButtonProps {
  _appearance?: {
    elements?: {
      rootBox?: string;
      userButtonBox?: string;
      userButtonOuterIdentifier?: string;
    };
  };
  showName?: boolean;
}

export function UserButton({ _appearance, showName = false }: UserButtonProps) {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  const initials =
    session.user.name
      ?.split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase() ||
    session.user.email?.[0]?.toUpperCase() ||
    'U';

  return (
    <Menu position="bottom-end">
      <Menu.Target>
        <UnstyledButton>
          <Group gap="xs">
            <Avatar
              alt={session.user.name || ''}
              radius="xl"
              size={showName ? 'md' : 'sm'}
              src={session.user.image || undefined}
            >
              {initials}
            </Avatar>
            {showName && <Text size="sm">{session.user.name || session.user.email}</Text>}
          </Group>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>{session.user.name || session.user.email}</Menu.Label>
        <Menu.Item color="dimmed" fz="sm">
          {session.user.email}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item color="red" leftSection={<IconLogout size={16} />} onClick={() => signOut()}>
          Sign out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
