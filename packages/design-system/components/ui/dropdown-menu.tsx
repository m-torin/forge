'use client';

// Export Mantine Menu as DropdownMenu
import { Menu, type MenuProps } from '@mantine/core';

export const DropdownMenu = Menu;
export type DropdownMenuProps = MenuProps;

// For compatibility, re-export Menu sub-components
export const DropdownMenuTrigger = Menu.Target;
export const DropdownMenuContent = ({ children }: { children: React.ReactNode }) => children;
export const DropdownMenuItem = Menu.Item;
export const DropdownMenuLabel = Menu.Label;
export const DropdownMenuSeparator = Menu.Divider;
export const DropdownMenuGroup = ({ children }: { children: React.ReactNode }) => children;
export const DropdownMenuSub = Menu;
export const DropdownMenuSubTrigger = Menu.Target;
export const DropdownMenuSubContent = Menu.Dropdown;
