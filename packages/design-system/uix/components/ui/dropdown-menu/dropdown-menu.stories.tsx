import type { Meta, StoryObj } from '@storybook/react';
import { IconMail, IconPlus, IconCirclePlus, IconSearch, IconUserPlus } from '@tabler/icons-react';
import { Menu } from '@mantine/core';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@repo/design-system/uix';

/**
 * Displays a menu to the user — such as a set of actions or functions —
 * triggered by a button.
 */
const meta = {
  title: 'uix/ui/DropdownMenu',
  component: DropdownMenu,
  tags: ['autodocs'],
  argTypes: {},
  render: (args: any) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      <Menu.Dropdown>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuItem>Team</DropdownMenuItem>
        <DropdownMenuItem>Subscription</DropdownMenuItem>
      </Menu.Dropdown>
    </DropdownMenu>
  ),
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof DropdownMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the dropdown menu.
 */
export const Default: Story = {};

/**
 * A dropdown menu with shortcuts.
 */
export const WithShortcuts: Story = {
  render: (args: any) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      <Menu.Dropdown>
        <DropdownMenuLabel>Controls</DropdownMenuLabel>
        <DropdownMenuItem>
          Back
          <DropdownMenuShortcut>⌘[</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          Forward
          <DropdownMenuShortcut>⌘]</DropdownMenuShortcut>
        </DropdownMenuItem>
      </Menu.Dropdown>
    </DropdownMenu>
  ),
};

/**
 * A dropdown menu with submenus.
 */
export const WithSubmenus: Story = {
  render: (args: any) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      <Menu.Dropdown>
        <DropdownMenuItem>
          <IconSearch className="mr-2 size-4" />
          <span>Search</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <IconPlus className="mr-2 size-4" />
            <span>New Team</span>
            <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <IconUserPlus className="mr-2 size-4" />
              <span>Invite users</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem>
                  <IconMail className="mr-2 size-4" />
                  <span>Email</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <IconCirclePlus className="mr-2 size-4" />
                  <span>More...</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </Menu.Dropdown>
    </DropdownMenu>
  ),
};

/**
 * A dropdown menu with radio items.
 */
export const WithRadioItems: Story = {
  render: (args: any) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      <Menu.Dropdown>
        <DropdownMenuLabel>Status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Info</DropdownMenuItem>
        <DropdownMenuItem>Warning</DropdownMenuItem>
        <DropdownMenuItem>Error</DropdownMenuItem>
      </Menu.Dropdown>
    </DropdownMenu>
  ),
};

/**
 * A dropdown menu with checkboxes.
 */
export const WithCheckboxes: Story = {
  render: (args: any) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      <Menu.Dropdown>
        <DropdownMenuItem>
          Autosave
          <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>Show Comments</DropdownMenuItem>
      </Menu.Dropdown>
    </DropdownMenu>
  ),
};
