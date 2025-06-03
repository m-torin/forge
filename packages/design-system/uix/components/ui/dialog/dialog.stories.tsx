import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/uix';

import type { Meta, StoryObj } from '@storybook/react';

/**
 * A window overlaid on either the primary window or another dialog window,
 * rendering the content underneath inert.
 */
const meta = {
  args: {
    onClose: () => {},
    opened: true,
  },
  argTypes: {},
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  render: (args: any) => (
    <Dialog {...args}>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account and remove your
            data from our servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button className="hover:underline" type="button">
            Cancel
          </button>
          <DialogClose>
            <button className="rounded bg-primary px-4 py-2 text-primary-foreground" type="button">
              Continue
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  tags: ['autodocs'],
  title: 'uix/ui/Dialog',
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the dialog.
 */
export const Default: Story = {};
