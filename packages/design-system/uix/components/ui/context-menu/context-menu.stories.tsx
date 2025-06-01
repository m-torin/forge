import type { Meta, StoryObj } from '@storybook/react';

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@repo/design-system/uix';

/**
 * Displays a menu to the user — such as a set of actions or functions —
 * triggered by a button.
 */
const meta = {
  title: 'uix/ui/ContextMenu',
  component: ContextMenu,
  tags: ['autodocs'],
  argTypes: {},
  args: {},
  render: (args: any) => (
    <ContextMenu {...args}>
      <ContextMenuTrigger>
        <div className="flex h-48 w-96 items-center justify-center rounded-md border border-dashed bg-accent text-sm">
          Right click here
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Profile</ContextMenuItem>
        <ContextMenuItem>Billing</ContextMenuItem>
        <ContextMenuItem>Team</ContextMenuItem>
        <ContextMenuItem>Subscription</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ContextMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the context menu.
 */
export const Default: Story = {};

/**
 * A context menu with shortcuts.
 */
export const WithShortcuts: Story = {
  render: (args: any) => (
    <ContextMenu {...args}>
      <ContextMenuTrigger>
        <div className="flex h-48 w-96 items-center justify-center rounded-md border border-dashed bg-accent text-sm">
          Right click here
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>
          Back
          <ContextMenuShortcut>⌘[</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem disabled>
          Forward
          <ContextMenuShortcut>⌘]</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          Reload
          <ContextMenuShortcut>⌘R</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

/**
 * A context menu with a submenu.
 */
export const WithSubmenu: Story = {
  render: (args: any) => (
    <ContextMenu {...args}>
      <ContextMenuTrigger>
        <div className="flex h-48 w-96 items-center justify-center rounded-md border border-dashed bg-accent text-sm">
          Right click here
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>
          New Tab
          <ContextMenuShortcut>⌘N</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>More Tools</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>
              Save Page As...
              <ContextMenuShortcut>⇧⌘S</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem>Create Shortcut...</ContextMenuItem>
            <ContextMenuItem>Name Window...</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>Developer Tools</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

/**
 * A context menu with checkboxes.
 */
export const WithCheckboxes: Story = {
  render: (args: any) => (
    <ContextMenu {...args}>
      <ContextMenuTrigger>
        <div className="flex h-48 w-96 items-center justify-center rounded-md border border-dashed bg-accent text-sm">
          Right click here
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>
          <ContextMenuCheckboxItem checked label="Show Comments" />
          <ContextMenuShortcut>⌘⇧C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          <ContextMenuCheckboxItem label="Show Preview" />
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

/**
 * A context menu with a radio group.
 */
export const WithRadioGroup: Story = {
  render: (args: any) => (
    <ContextMenu {...args}>
      <ContextMenuTrigger>
        <div className="flex h-48 w-96 items-center justify-center rounded-md border border-dashed bg-accent text-sm">
          Right click here
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuLabel>Theme</ContextMenuLabel>
        <ContextMenuRadioGroup value="light">
          <ContextMenuItem>
            <ContextMenuRadioItem value="light" label="Light" />
          </ContextMenuItem>
          <ContextMenuItem>
            <ContextMenuRadioItem value="dark" label="Dark" />
          </ContextMenuItem>
        </ContextMenuRadioGroup>
      </ContextMenuContent>
    </ContextMenu>
  ),
};
