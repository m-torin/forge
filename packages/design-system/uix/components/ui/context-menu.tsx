'use client';

// Use Mantine Menu for context menu functionality
import { Menu, Checkbox, Radio, type MenuProps, type MenuTargetProps, type MenuDropdownProps, type MenuItemProps, type MenuDividerProps, type MenuLabelProps, type CheckboxProps, type RadioProps, type RadioGroupProps } from '@mantine/core';
import type React from 'react';

export const ContextMenu: React.FC<MenuProps> = Menu;
export const ContextMenuTrigger: React.FC<MenuTargetProps> = Menu.Target;
export const ContextMenuContent: React.FC<MenuDropdownProps> = Menu.Dropdown;
export const ContextMenuItem: React.FC<MenuItemProps> = Menu.Item;
export const ContextMenuSeparator: React.FC<MenuDividerProps> = Menu.Divider;
export const ContextMenuLabel: React.FC<MenuLabelProps> = Menu.Label;
export const ContextMenuShortcut: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ marginLeft: 'auto', fontSize: '0.8em', opacity: 0.6 }}>{children}</span>
);
export const ContextMenuCheckboxItem: React.FC<CheckboxProps> = Checkbox;
export const ContextMenuRadioItem: React.FC<RadioProps> = Radio;
export const ContextMenuRadioGroup: React.FC<RadioGroupProps> = Radio.Group;
export const ContextMenuSub: React.FC<MenuProps> = Menu;
export const ContextMenuSubTrigger: React.FC<MenuTargetProps> = Menu.Target;
export const ContextMenuSubContent: React.FC<MenuDropdownProps> = Menu.Dropdown;
