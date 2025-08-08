'use client';

import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Divider,
  Group,
  Loader,
  Menu,
  Stack,
  Text,
} from '@mantine/core';
import {
  IconCheck,
  IconChevronDown,
  IconLogout,
  IconPlus,
  IconSwitchHorizontal,
  IconUser,
} from '@tabler/icons-react';

// Types
export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

export interface UserSession {
  id: string;
  user: User;
  active?: boolean;
}

export interface AccountSwitcherProps {
  currentUser: User;
  otherSessions?: UserSession[];
  compact?: boolean;
  showAddAccount?: boolean;
  addAccountLabel?: string;
  manageAccountsLabel?: string;
  signOutLabel?: string;
  signOutAllLabel?: string;
  switchAccountLabel?: string;
  currentAccountLabel?: string;
  otherAccountsLabel?: string;
  activeLabel?: string;
  loading?: boolean;
  switchingSessionId?: string | null;
  onSwitchAccount: (sessionId: string) => Promise<void> | void;
  onAddAccount: () => void;
  onSignOut: () => Promise<void> | void;
  onManageAccounts?: () => void;
  onError?: (error: Error) => void;
  getInitials?: (name?: string, email?: string) => string;
  renderCustomAvatar?: (user: User, size: string) => React.ReactNode;
  renderCustomUserInfo?: (user: User) => React.ReactNode;
}

export function AccountSwitcher({
  currentUser,
  otherSessions = [],
  compact = false,
  showAddAccount = true,
  addAccountLabel = 'Add another account',
  manageAccountsLabel = 'Manage accounts',
  signOutLabel = 'Sign out',
  signOutAllLabel = 'Sign out all accounts',
  switchAccountLabel = 'Switch account',
  currentAccountLabel = 'Current account',
  otherAccountsLabel = 'Other accounts',
  activeLabel = 'Active',
  loading = false,
  switchingSessionId = null,
  onSwitchAccount,
  onAddAccount,
  onSignOut,
  onManageAccounts,
  onError,
  getInitials,
  renderCustomAvatar,
  renderCustomUserInfo,
}: AccountSwitcherProps) {
  const defaultGetInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email?.charAt(0).toUpperCase() || '?';
  };

  const handleSwitchAccount = async (sessionId: string) => {
    if (sessionId === currentUser.id) return;

    try {
      await onSwitchAccount(sessionId);
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await onSignOut();
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
    }
  };

  const handleManageAccounts = () => {
    if (onManageAccounts) {
      onManageAccounts();
    }
  };

  const getUserInitials = getInitials || defaultGetInitials;

  const renderAvatar = (user: User, size: string) => {
    if (renderCustomAvatar) {
      return renderCustomAvatar(user, size);
    }
    return (
      <Avatar src={user.image} alt={user.name || user.email} size={size}>
        {getUserInitials(user.name, user.email)}
      </Avatar>
    );
  };

  const renderUserInfo = (user: User) => {
    if (renderCustomUserInfo) {
      return renderCustomUserInfo(user);
    }
    return (
      <div style={{ textAlign: 'left' }}>
        <Text size="sm" fw={500}>
          {user.name || 'User'}
        </Text>
        <Text size="xs" c="dimmed">
          {user.email}
        </Text>
      </div>
    );
  };

  if (compact) {
    return (
      <Menu shadow="md" width={300} position="bottom-end" withinPortal>
        <Menu.Target>
          <ActionIcon variant="subtle" size="lg">
            {renderAvatar(currentUser, 'sm')}
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          <Stack gap={0}>
            <Stack gap="xs" p="xs">
              <Group gap="xs">
                {renderAvatar(currentUser, 'md')}
                <div style={{ flex: 1 }}>
                  <Text size="sm" fw={500}>
                    {currentUser.name || 'User'}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {currentUser.email}
                  </Text>
                </div>
                <IconCheck size={16} color="var(--mantine-color-green-6)" />
              </Group>
            </Stack>

            {otherSessions.length > 0 && (
              <>
                <Divider />
                <Stack gap={0} p="xs">
                  <Text size="xs" c="dimmed" mb="xs">
                    {switchAccountLabel}
                  </Text>
                  {otherSessions.map(session => (
                    <Menu.Item
                      key={session.id}
                      onClick={() => handleSwitchAccount(session.id)}
                      disabled={switchingSessionId === session.id}
                    >
                      <Group gap="xs">
                        {switchingSessionId === session.id ? (
                          <Loader size="sm" />
                        ) : (
                          renderAvatar(session.user, 'sm')
                        )}
                        <div style={{ flex: 1 }}>
                          <Text size="sm">{session.user.name || 'User'}</Text>
                          <Text size="xs" c="dimmed">
                            {session.user.email}
                          </Text>
                        </div>
                      </Group>
                    </Menu.Item>
                  ))}
                </Stack>
              </>
            )}

            <Divider />

            {showAddAccount && (
              <Menu.Item leftSection={<IconPlus size={16} />} onClick={onAddAccount}>
                {addAccountLabel}
              </Menu.Item>
            )}

            <Menu.Item leftSection={<IconLogout size={16} />} onClick={handleSignOut} color="red">
              {signOutLabel}
            </Menu.Item>
          </Stack>
        </Menu.Dropdown>
      </Menu>
    );
  }

  // Full view
  return (
    <Menu shadow="md" width={320} position="bottom-end" withinPortal>
      <Menu.Target>
        <Button
          variant="subtle"
          rightSection={<IconChevronDown size={16} />}
          leftSection={renderAvatar(currentUser, 'sm')}
          loading={loading}
        >
          {renderUserInfo(currentUser)}
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Stack gap={0}>
          <Stack gap="xs" p="md">
            <Text size="sm" fw={600} c="dimmed">
              {currentAccountLabel}
            </Text>
            <Group gap="sm">
              {renderAvatar(currentUser, 'lg')}
              <div style={{ flex: 1 }}>
                <Text fw={500}>{currentUser.name || 'User'}</Text>
                <Text size="sm" c="dimmed">
                  {currentUser.email}
                </Text>
              </div>
              <Badge color="green" variant="light" size="sm">
                {activeLabel}
              </Badge>
            </Group>
          </Stack>

          {otherSessions.length > 0 && (
            <>
              <Divider />
              <Stack gap="xs" p="md">
                <Text size="sm" fw={600} c="dimmed">
                  {otherAccountsLabel}
                </Text>
                {otherSessions.map(session => (
                  <Button
                    key={session.id}
                    variant="subtle"
                    fullWidth
                    justify="flex-start"
                    onClick={() => handleSwitchAccount(session.id)}
                    disabled={switchingSessionId === session.id}
                    leftSection={
                      switchingSessionId === session.id ? (
                        <Loader size="sm" />
                      ) : (
                        renderAvatar(session.user, 'sm')
                      )
                    }
                    rightSection={<IconSwitchHorizontal size={16} />}
                  >
                    <div style={{ textAlign: 'left', flex: 1 }}>
                      <Text size="sm">{session.user.name || 'User'}</Text>
                      <Text size="xs" c="dimmed">
                        {session.user.email}
                      </Text>
                    </div>
                  </Button>
                ))}
              </Stack>
            </>
          )}

          <Divider />

          <Stack gap={0}>
            {showAddAccount && (
              <Menu.Item leftSection={<IconPlus size={16} />} onClick={onAddAccount}>
                {addAccountLabel}
              </Menu.Item>
            )}

            {onManageAccounts && (
              <Menu.Item leftSection={<IconUser size={16} />} onClick={handleManageAccounts}>
                {manageAccountsLabel}
              </Menu.Item>
            )}

            <Menu.Item leftSection={<IconLogout size={16} />} onClick={handleSignOut} color="red">
              {signOutAllLabel}
            </Menu.Item>
          </Stack>
        </Stack>
      </Menu.Dropdown>
    </Menu>
  );
}
