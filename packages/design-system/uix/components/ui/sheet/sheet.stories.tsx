import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '@mantine/core';

import { Sheet } from '@repo/design-system/uix';

/**
 * Extends the Dialog component to display content that complements the main
 * content of the screen.
 */
const meta = {
  title: 'uix/ui/Sheet',
  component: Sheet,
  tags: ['autodocs'],
  argTypes: {
    position: {
      options: ['top', 'bottom', 'left', 'right'],
      control: {
        type: 'radio',
      },
    },
  },
  args: {
    position: 'right',
  },
  render: function Render(args: any) {
    const [opened, setOpened] = useState(false);
    return (
      <>
        <Button onClick={() => setOpened(true)}>Open drawer</Button>
        <Sheet {...args} opened={opened} onClose={() => setOpened(false)} title="Are you absolutely sure?">
          <div>
            <p style={{ marginBottom: '1rem', color: 'var(--mantine-color-dimmed)' }}>
              This action cannot be undone. This will permanently delete your account and remove your
              data from our servers.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <Button variant="subtle" onClick={() => setOpened(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpened(false)}>
                Submit
              </Button>
            </div>
          </div>
        </Sheet>
      </>
    );
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Sheet>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the sheet.
 */
export const Default: Story = {
  args: {
    opened: false,
    onClose: () => {},
  },
};

/**
 * Sheet positioned at the top.
 */
export const Top: Story = {
  args: {
    opened: false,
    onClose: () => {},
  },
  render: function Render(args: any) {
    const [opened, setOpened] = useState(false);
    return (
      <>
        <Button onClick={() => setOpened(true)}>Open top drawer</Button>
        <Sheet opened={opened} onClose={() => setOpened(false)} title="Are you absolutely sure?" position="top">
          <div>
            <p style={{ marginBottom: '1rem', color: 'var(--mantine-color-dimmed)' }}>
              This action cannot be undone. This will permanently delete your account and remove your
              data from our servers.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <Button variant="subtle" onClick={() => setOpened(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpened(false)}>
                Submit
              </Button>
            </div>
          </div>
        </Sheet>
      </>
    );
  },
};

/**
 * Sheet positioned at the bottom.
 */
export const Bottom: Story = {
  args: {
    opened: false,
    onClose: () => {},
  },
  render: function Render(args: any) {
    const [opened, setOpened] = useState(false);
    return (
      <>
        <Button onClick={() => setOpened(true)}>Open bottom drawer</Button>
        <Sheet opened={opened} onClose={() => setOpened(false)} title="Are you absolutely sure?" position="bottom">
          <div>
            <p style={{ marginBottom: '1rem', color: 'var(--mantine-color-dimmed)' }}>
              This action cannot be undone. This will permanently delete your account and remove your
              data from our servers.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <Button variant="subtle" onClick={() => setOpened(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpened(false)}>
                Submit
              </Button>
            </div>
          </div>
        </Sheet>
      </>
    );
  },
};

/**
 * Sheet positioned at the left.
 */
export const Left: Story = {
  args: {
    opened: false,
    onClose: () => {},
  },
  render: function Render(args: any) {
    const [opened, setOpened] = useState(false);
    return (
      <>
        <Button onClick={() => setOpened(true)}>Open left drawer</Button>
        <Sheet opened={opened} onClose={() => setOpened(false)} title="Are you absolutely sure?" position="left">
          <div>
            <p style={{ marginBottom: '1rem', color: 'var(--mantine-color-dimmed)' }}>
              This action cannot be undone. This will permanently delete your account and remove your
              data from our servers.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <Button variant="subtle" onClick={() => setOpened(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpened(false)}>
                Submit
              </Button>
            </div>
          </div>
        </Sheet>
      </>
    );
  },
};
