import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@repo/design-system/uix';

import type { Meta, StoryObj } from '@storybook/react';

/**
 * A drawer component for React.
 */
const meta: Meta<typeof Drawer> = {
  argTypes: {},
  component: Drawer,
  parameters: {
    layout: 'centered',
  },
  render: (args: any) => (
    <Drawer {...args}>
      <DrawerTrigger>Open</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Are you sure absolutely sure?</DrawerTitle>
          <DrawerDescription>This action cannot be undone.</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <button className="rounded bg-primary px-4 py-2 text-primary-foreground" type="button">
            Submit
          </button>
          <DrawerClose>
            <button className="hover:underline" type="button">
              Cancel
            </button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
  tags: ['autodocs'],
  title: 'uix/ui/Drawer',
};

export default meta;

type Story = StoryObj<typeof Drawer>;

/**
 * The default form of the drawer.
 */
export const Default: Story = {
  args: {},
};
