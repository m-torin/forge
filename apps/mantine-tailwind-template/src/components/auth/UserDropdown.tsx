/**
 * User Dropdown Component
 *
 * Mantine-based dropdown for authenticated users with harmony styling
 */

'use client';

import type { User } from '#/lib/auth-context';
import type { Locale } from '#/lib/i18n';
import { ActionIcon, Avatar, Badge, Group, Menu, Text } from '@mantine/core';
import { signOut } from '@repo/auth/client/next';
import { logWarn } from '@repo/observability';
import { IconChevronDown, IconLogout, IconSettings, IconUser } from '@tabler/icons-react';
import type { Route } from 'next';
import Link from 'next/link';
import { useState } from 'react';

interface UserDropdownProps {
  user: User;
  locale: Locale;
}

export function UserDropdown({ user, locale }: UserDropdownProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      // Better Auth client handles redirect and state updates automatically
    } catch (error) {
      logWarn('[UserDropdown] Sign out failed', { error });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <Menu shadow="md" width={280} position="bottom-end">
      <Menu.Target>
        <ActionIcon.Group>
          <Group
            gap="xs"
            className="harmony-transition hover:harmony-bg-surface cursor-pointer rounded-md px-2 py-1"
          >
            <Avatar
              src={user.image}
              alt={user.name}
              size="sm"
              radius="xl"
              className="harmony-border"
            >
              <IconUser size={16} />
            </Avatar>
            <Text size="sm" fw={500} className="harmony-text-primary hidden sm:block">
              {user.name}
            </Text>
            <IconChevronDown size={14} className="harmony-text-secondary" />
          </Group>
        </ActionIcon.Group>
      </Menu.Target>

      <Menu.Dropdown className="harmony-bg-surface harmony-border">
        {/* User Info Header */}
        <div className="harmony-border-b px-3 py-3">
          <Group gap="sm">
            <Avatar
              src={user.image}
              alt={user.name}
              size="md"
              radius="xl"
              className="harmony-border"
            >
              <IconUser size={18} />
            </Avatar>
            <div>
              <Text size="sm" fw={500} className="harmony-text-primary">
                {user.name}
              </Text>
              <Text size="xs" className="harmony-text-secondary">
                {user.email}
              </Text>
              {user.role === 'admin' && (
                <Badge variant="light" color="violet" size="xs" mt={2}>
                  Administrator
                </Badge>
              )}
            </div>
          </Group>
        </div>

        <Menu.Divider />

        {/* Menu Items */}
        <Menu.Item
          component={Link}
          href={`/${locale}/profile` as Route}
          leftSection={<IconUser size={16} />}
          className="harmony-transition"
        >
          Your Profile
        </Menu.Item>

        <Menu.Item
          component={Link}
          href={`/${locale}/settings` as Route}
          leftSection={<IconSettings size={16} />}
          className="harmony-transition"
        >
          Settings
        </Menu.Item>

        <Menu.Divider />

        {/* Sign Out */}
        <Menu.Item
          onClick={handleSignOut}
          leftSection={<IconLogout size={16} />}
          className="harmony-transition"
          color="red"
          disabled={isSigningOut}
        >
          {isSigningOut ? 'Signing out...' : 'Sign out'}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
