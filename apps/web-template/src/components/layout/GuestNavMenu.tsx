'use client';

import {
  Avatar,
  Button,
  Group,
  Menu,
  Text,
  UnstyledButton,
  useMantineTheme,
  Skeleton,
} from '@mantine/core';
import {
  IconChevronDown,
  IconCreditCard,
  IconHeart,
  IconKey,
  IconLogin,
  IconLogout,
  IconPackage,
  IconUser,
  IconAlertTriangle,
} from '@tabler/icons-react';
import Link from 'next/link';
import { type FC, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';

import { useAuthContext, authClient } from '@repo/auth/client/next';
import { ErrorBoundary } from '@/components/ErrorBoundary';

import classes from './GuestNavMenu.module.css';

interface GuestNavMenuProps {
  dict?: {
    account?: string;
    help?: string;
    login?: string;
    logout?: string;
    orders?: string;
    wishlist?: string;
  };
  locale?: string;
  user?: null | {
    avatar?: string;
    email?: string;
    name?: string;
  };
  loading?: boolean;
  error?: string;
  'data-testid'?: string;
}

// Loading skeleton for GuestNavMenu
function GuestNavMenuSkeleton({ testId }: { testId?: string }) {
  return (
    <div data-testid={testId}>
      <Skeleton height={36} width={120} radius="sm" />
    </div>
  );
}

// Error state for GuestNavMenu
function GuestNavMenuError({ error, testId }: { error: string; testId?: string }) {
  return (
    <Button
      leftSection={<IconAlertTriangle size={16} />}
      radius="sm"
      size="md"
      variant="subtle"
      color="red"
      disabled
      data-testid={testId}
    >
      Menu Error
    </Button>
  );
}

const GuestNavMenu: FC<GuestNavMenuProps> = ({
  dict = {},
  locale = 'en',
  user: userProp,
  loading = false,
  error,
  'data-testid': testId = 'guest-nav-menu',
}) => {
  const theme = useMantineTheme();
  const router = useRouter();
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <GuestNavMenuSkeleton testId={testId} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <GuestNavMenuError error={currentError} testId={testId} />;
  }

  try {
    // Use Better Auth context to get real user data
    const { user: authUser, isLoading } = useAuthContext();

    // Use auth user if available, fallback to prop
    const user = authUser || userProp;

    // Show loading while auth is checking
    if (isLoading) {
      return <GuestNavMenuSkeleton testId={testId} />;
    }

    const handleLogout = async () => {
      try {
        await authClient.signOut();

        notifications.show({
          title: 'Logged out',
          message: 'You have been successfully logged out.',
          color: 'green',
        });

        // Redirect to home or login page
        router.push(`/${locale}/login`);
      } catch (error) {
        console.error('Logout error:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to logout. Please try again.',
          color: 'red',
        });
        setInternalError('Failed to logout');
      }
    };

    if (!user) {
      return (
        <ErrorBoundary fallback={<GuestNavMenuError error="Login button failed" testId={testId} />}>
          <Button
            component={Link}
            href={`/${locale}/login`}
            leftSection={<IconLogin size={16} />}
            radius="sm"
            size="md"
            variant="subtle"
            data-testid={testId}
          >
            {dict.login || 'Login'}
          </Button>
        </ErrorBoundary>
      );
    }

    return (
      <ErrorBoundary fallback={<GuestNavMenuError error="Menu failed to render" testId={testId} />}>
        <Menu
          closeDelay={300}
          openDelay={100}
          position="bottom-end"
          transitionProps={{ transition: 'pop-top-right' }}
          trigger="hover"
          width={260}
          withinPortal
          data-testid={testId}
        >
          <Menu.Target>
            <UnstyledButton className={classes.user}>
              <Group gap={7}>
                <Avatar
                  alt={user.name}
                  radius="xl"
                  size={20}
                  src={'image' in user ? user.image : 'avatar' in user ? user.avatar : null}
                />
                <Text fw={500} lh={1} mr={3} size="md">
                  {user.name}
                </Text>
                <IconChevronDown size={12} stroke={1.5} />
              </Group>
            </UnstyledButton>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>My Account</Menu.Label>

            <Menu.Item
              component={Link}
              href={`/${locale}/account`}
              leftSection={<IconUser size={16} stroke={1.5} />}
            >
              Account Settings
            </Menu.Item>

            <Menu.Item
              component={Link}
              href={`/${locale}/account-wishlists`}
              leftSection={<IconHeart color={theme.colors.red[6]} size={16} stroke={1.5} />}
            >
              My Favorites
            </Menu.Item>

            <Menu.Item
              component={Link}
              href={`/${locale}/orders`}
              leftSection={<IconPackage size={16} stroke={1.5} />}
            >
              Order History
            </Menu.Item>

            <Menu.Item
              component={Link}
              href={`/${locale}/account-password`}
              leftSection={<IconKey size={16} stroke={1.5} />}
            >
              Change Password
            </Menu.Item>

            <Menu.Item
              component={Link}
              href={`/${locale}/account-billing`}
              leftSection={<IconCreditCard size={16} stroke={1.5} />}
            >
              Billing & Payment
            </Menu.Item>

            <Menu.Divider />

            <Menu.Item leftSection={<IconLogout size={16} stroke={1.5} />} onClick={handleLogout}>
              {dict.logout || 'Logout'}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </ErrorBoundary>
    );
  } catch (err) {
    console.error('GuestNavMenu error:', err);
    setInternalError('Failed to render menu');
    return <GuestNavMenuError error="Failed to render menu" testId={testId} />;
  }
};

export default GuestNavMenu;
