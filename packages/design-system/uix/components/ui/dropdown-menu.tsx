'use client';

// Export Mantine Menu as DropdownMenu
import { Menu, type MenuProps, type MenuTargetProps, type MenuDropdownProps, type MenuItemProps, type MenuLabelProps, type MenuDividerProps } from '@mantine/core';
import type React from 'react';

export const DropdownMenu: React.FC<MenuProps> = Menu;
export type DropdownMenuProps = MenuProps;

// For compatibility, re-export Menu sub-components
export const DropdownMenuTrigger: React.FC<MenuTargetProps> = Menu.Target;
export const DropdownMenuContent: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;
export const DropdownMenuItem: React.FC<MenuItemProps> = Menu.Item;
export const DropdownMenuLabel: React.FC<MenuLabelProps> = Menu.Label;
export const DropdownMenuSeparator: React.FC<MenuDividerProps> = Menu.Divider;
export const DropdownMenuGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;
export const DropdownMenuSub: React.FC<MenuProps> = Menu;
export const DropdownMenuSubTrigger: React.FC<MenuTargetProps> = Menu.Target;
export const DropdownMenuSubContent: React.FC<MenuDropdownProps> = Menu.Dropdown;
export const DropdownMenuCheckboxItem: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;
export const DropdownMenuPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;
export const DropdownMenuRadioGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;
export const DropdownMenuRadioItem: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;
export const DropdownMenuShortcut: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ marginLeft: 'auto', fontSize: '0.8em', opacity: 0.6 }}>{children}</span>
);
