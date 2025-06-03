import { Button } from '@mantine/core';
import { useState } from 'react';

import { Sheet } from '@repo/design-system/uix';

import type { Meta, StoryObj } from '@storybook/react';

/**
 * Extends the Dialog component to display content that complements the main
 * content of the screen.
 */
const meta = {
  args: {
    position: 'right',
  },
  argTypes: {
    position: {
      control: {
        type: 'radio',
      },
      options: ['top', 'bottom', 'left', 'right'],
    },
  },
  component: Sheet,
  parameters: {
    layout: 'centered',
  },
  render: function Render(args: any) {
    const [opened, setOpened] = useState(false);
    return (
      <>
        <Button onClick={() => setOpened(true)}>Open drawer</Button>
        <Sheet
          {...args}
          onClose={() => setOpened(false)}
          opened={opened}
          title="Are you absolutely sure?"
        >
          <div>
            <p style={{ color: 'var(--mantine-color-dimmed)', marginBottom: '1rem' }}>
              This action cannot be undone. This will permanently delete your account and remove
              your data from our servers.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <Button onClick={() => setOpened(false)} variant="subtle">
                Cancel
              </Button>
              <Button onClick={() => setOpened(false)}>Submit</Button>
            </div>
          </div>
        </Sheet>
      </>
    );
  },
  tags: ['autodocs'],
  title: 'uix/ui/Sheet',
} satisfies Meta<typeof Sheet>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the sheet.
 */
export const Default: Story = {
  args: {
    onClose: () => {},
    opened: false,
  },
};

/**
 * Sheet positioned at the top.
 */
export const Top: Story = {
  args: {
    onClose: () => {},
    opened: false,
  },
  render: function Render(args: any) {
    const [opened, setOpened] = useState(false);
    return (
      <>
        <Button onClick={() => setOpened(true)}>Open top drawer</Button>
        <Sheet
          onClose={() => setOpened(false)}
          opened={opened}
          position="top"
          title="Are you absolutely sure?"
        >
          <div>
            <p style={{ color: 'var(--mantine-color-dimmed)', marginBottom: '1rem' }}>
              This action cannot be undone. This will permanently delete your account and remove
              your data from our servers.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <Button onClick={() => setOpened(false)} variant="subtle">
                Cancel
              </Button>
              <Button onClick={() => setOpened(false)}>Submit</Button>
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
    onClose: () => {},
    opened: false,
  },
  render: function Render(args: any) {
    const [opened, setOpened] = useState(false);
    return (
      <>
        <Button onClick={() => setOpened(true)}>Open bottom drawer</Button>
        <Sheet
          onClose={() => setOpened(false)}
          opened={opened}
          position="bottom"
          title="Are you absolutely sure?"
        >
          <div>
            <p style={{ color: 'var(--mantine-color-dimmed)', marginBottom: '1rem' }}>
              This action cannot be undone. This will permanently delete your account and remove
              your data from our servers.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <Button onClick={() => setOpened(false)} variant="subtle">
                Cancel
              </Button>
              <Button onClick={() => setOpened(false)}>Submit</Button>
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
    onClose: () => {},
    opened: false,
  },
  render: function Render(args: any) {
    const [opened, setOpened] = useState(false);
    return (
      <>
        <Button onClick={() => setOpened(true)}>Open left drawer</Button>
        <Sheet
          onClose={() => setOpened(false)}
          opened={opened}
          position="left"
          title="Are you absolutely sure?"
        >
          <div>
            <p style={{ color: 'var(--mantine-color-dimmed)', marginBottom: '1rem' }}>
              This action cannot be undone. This will permanently delete your account and remove
              your data from our servers.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <Button onClick={() => setOpened(false)} variant="subtle">
                Cancel
              </Button>
              <Button onClick={() => setOpened(false)}>Submit</Button>
            </div>
          </div>
        </Sheet>
      </>
    );
  },
};
