'use client';

// Use Mantine Menu for menubar functionality
import { Group, Menu } from '@mantine/core';

export const Menubar = ({ children }: { children: React.ReactNode }) => (
  <Group gap="xs">{children}</Group>
);

export const MenubarMenu = Menu;
export const MenubarTrigger = Menu.Target;
export const MenubarContent = Menu.Dropdown;
export const MenubarItem = Menu.Item;
export const MenubarSeparator = Menu.Divider;
export const MenubarLabel = Menu.Label;
