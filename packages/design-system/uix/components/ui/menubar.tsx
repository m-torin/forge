'use client';

// Use Mantine Menu for menubar functionality
import {
  Group,
  Menu,
  type MenuDividerProps,
  type MenuDropdownProps,
  type MenuItemProps,
  type MenuLabelProps,
  type MenuProps,
  type MenuTargetProps,
} from '@mantine/core';

import type React from 'react';

export const Menubar: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Group gap="xs">{children}</Group>
);

export const MenubarMenu: React.FC<MenuProps> = Menu;
export const MenubarTrigger: React.FC<MenuTargetProps> = Menu.Target;
export const MenubarContent: React.FC<MenuDropdownProps> = Menu.Dropdown;
export const MenubarItem: React.FC<MenuItemProps> = Menu.Item;
export const MenubarSeparator: React.FC<MenuDividerProps> = Menu.Divider;
export const MenubarLabel: React.FC<MenuLabelProps> = Menu.Label;

// Additional menubar components
export const MenubarCheckboxItem: React.FC<{
  children?: React.ReactNode;
  checked?: boolean;
  [key: string]: any;
}> = ({ checked, children, ...props }) => (
  <Menu.Item {...props}>
    {checked && '✓ '}
    {children}
  </Menu.Item>
);

export const MenubarGroup: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);

export const MenubarRadioGroup: React.FC<{ children?: React.ReactNode; value?: string }> = ({
  children,
}) => <>{children}</>;

export const MenubarRadioItem: React.FC<{
  children?: React.ReactNode;
  value?: string;
  [key: string]: any;
}> = ({ children, value, ...props }) => <Menu.Item {...props}>{children}</Menu.Item>;

export const MenubarShortcut: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <span style={{ fontSize: '0.75rem', marginLeft: 'auto', opacity: 0.6 }}>{children}</span>
);

export const MenubarSub: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);

export const MenubarSubContent: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <Menu.Dropdown>{children}</Menu.Dropdown>
);

export const MenubarSubTrigger: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <Menu.Item>{children}</Menu.Item>
);
