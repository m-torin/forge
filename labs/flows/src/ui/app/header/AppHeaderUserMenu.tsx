'use client';

import React, { forwardRef, useMemo, useState } from 'react';
import {
  Group,
  Text,
  Menu,
  rem,
  useMantineTheme,
  useMantineColorScheme,
  MantineColorScheme,
  useComputedColorScheme,
  UnstyledButton,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import Link from 'next/link';
import {
  IconLogout,
  IconLayersIntersect,
  IconSettings,
  IconSwitchHorizontal,
  IconSun,
  IconMoon,
  TablerIcon,
} from '@tabler/icons-react';
import { Avatar } from '#/ui/shared';
// getBaseUrl removed - no longer needed

interface UserButtonProps extends React.ComponentPropsWithoutRef<'div'> {
  image: string;
  name: string;
  email: string;
  animate?: boolean;
  icon?: React.ReactNode;
}

interface MenuItemData {
  id: string;
  icon: TablerIcon;
  label: string;
  stroke?: number;
  href?: string;
  divider?: boolean;
  isDanger?: boolean;
  color?: string;
  colorShade?: number;
  onClick?: () => void;
}

const UserButton = forwardRef<HTMLDivElement, UserButtonProps>(
  ({ image, name, email, animate, ...others }, ref) => {
    const theme = useMantineTheme();
    const _isSmallScreen = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);

    return (
      <div ref={ref} {...others}>
        <Group>
          <UnstyledButton component={Link} href="/me">
            <Avatar
              imgUri={image}
              altTag={name}
              className={animate ? 'animate-avatar' : ''}
            >
              <div style={{ flex: 1 }}>
                <Text
                  size="sm"
                  fw={500}
                  style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {name}
                </Text>
                <Text
                  c="dimmed"
                  size="xs"
                  style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {email}
                </Text>
              </div>
            </Avatar>
          </UnstyledButton>
        </Group>
      </div>
    );
  },
);

const getMenuItemData = (
  colorScheme: MantineColorScheme | 'light' | 'dark',
  toggleColorScheme: () => void,
): MenuItemData[] => [
  {
    id: 'toggleColorScheme',
    icon: colorScheme === 'dark' ? IconSun : IconMoon,
    label:
      colorScheme === 'dark' ? 'Change to Light mode' : 'Change to Dark mode',
    stroke: 1.5,
    onClick: toggleColorScheme,
  },
  {
    id: 'accountSettings',
    icon: IconSettings,
    label: 'Account settings',
    stroke: 1.5,
    href: '/me',
  },
  {
    id: 'changeAccount',
    icon: IconSwitchHorizontal,
    label: 'Change instance',
    stroke: 1.5,
  },
  {
    id: 'manageInstances',
    icon: IconLayersIntersect,
    label: 'Manage instances',
    stroke: 1.5,
    color: 'cyan',
    divider: true,
    href: '/instances',
  },
  {
    id: 'logout',
    icon: IconLogout,
    label: 'Logout',
    stroke: 1.5,
    isDanger: true,
    divider: true,
    href: '/logout',
  },
];

export const AppHeaderUserMenu: React.FC = () => {
  const theme = useMantineTheme();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const effectiveColorScheme = colorScheme === 'auto' ? computedColorScheme : colorScheme;

  const iconStyles = useMemo(() => ({ width: rem(16), height: rem(16) }), []);
  const toggleIconColor = `var(${effectiveColorScheme === 'dark' ? '--mantine-color-yellow-2' : '--mantine-color-blue-9'})`;

  const menuItemData = useMemo(
    () => getMenuItemData(effectiveColorScheme, toggleColorScheme),
    [effectiveColorScheme, toggleColorScheme],
  );

  const renderedMenuItems = useMemo(
    () =>
      menuItemData.map((item) => (
        <React.Fragment key={item.id}>
          {item.divider && <Menu.Divider />}
          <Menu.Item
            {...(item.href ? {} : { component: 'div' })}
            {...(item.onClick && { onClick: item.onClick })}
            {...(item.isDanger && { color: 'red' })}
            leftSection={
              <item.icon
                style={iconStyles}
                color={
                  item.id === 'toggleColorScheme'
                    ? toggleIconColor
                    : item.color
                      ? theme.colors[item.color]?.[item.colorShade ?? 6]
                      : undefined
                }
                stroke={item.stroke ?? 1.5}
              />
            }
            aria-label={item.label}
            py="sm"
          >
            {item.href ? (
              <Link
                href={item.href}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                {item.label}
              </Link>
            ) : (
              item.label
            )}
          </Menu.Item>
        </React.Fragment>
      )),
    [menuItemData, theme.colors, iconStyles, toggleIconColor],
  );

  const [animate, setAnimate] = useState(false);

  const handleMenuOpen = () => {
    setAnimate(true);
  };

  const handleMenuClose = () => {
    setAnimate(false);
  };

  const isSmallScreen = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);

  return (
    <Menu
      withArrow
      trigger={isSmallScreen ? 'click' : 'hover'}
      onOpen={handleMenuOpen}
      onClose={handleMenuClose}
    >
      <Menu.Target>
        <UserButton
          image="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-8.png"
          name="Sydney Bristow"
          email="Role: Project Leader"
          animate={animate}
        />
      </Menu.Target>
      <Menu.Dropdown>{renderedMenuItems}</Menu.Dropdown>
    </Menu>
  );
};
