import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design-system/uix';

import type { Meta, StoryObj } from '@storybook/react';

/**
 * A set of layered sections of content—known as tab panels—that are displayed
 * one at a time.
 */
const meta = {
  args: {
    className: 'w-96',
    defaultValue: 'account',
  },
  argTypes: {},
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  render: (args: any) => (
    <Tabs {...args}>
      <TabsList className="grid grid-cols-2">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">Make changes to your account here.</TabsContent>
      <TabsContent value="password">Change your password here.</TabsContent>
    </Tabs>
  ),
  tags: ['autodocs'],
  title: 'uix/ui/Tabs',
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the tabs.
 */
export const Default: Story = {};
