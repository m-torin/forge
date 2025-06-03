import { Box, Button, Card, Group, Stack, Text, Title } from '@mantine/core';
import { IconBellRinging } from '@tabler/icons-react';

import type { Meta, StoryObj } from '@storybook/react';

const notifications = [
  {
    description: '1 hour ago',
    title: 'Your call has been confirmed.',
  },
  {
    description: '1 hour ago',
    title: 'You have a new message!',
  },
  {
    description: '2 hours ago',
    title: 'Your subscription is expiring soon!',
  },
];

/**
 * Displays a card with header, content, and footer using Mantine.
 */
const meta = {
  args: {
    p: 'lg',
    radius: 'md',
    shadow: 'sm',
    w: 384,
    withBorder: true,
  },
  argTypes: {
    radius: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    shadow: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    withBorder: {
      control: 'boolean',
    },
  },
  component: Card,
  parameters: {
    layout: 'centered',
  },
  render: (args: any) => (
    <Card {...args}>
      <Card.Section p="lg" pb="md">
        <Title order={3}>Notifications</Title>
        <Text c="dimmed" size="sm">
          You have 3 unread messages.
        </Text>
      </Card.Section>

      <Stack gap="md">
        {notifications.map((notification, index) => (
          <Group key={index} align="flex-start">
            <Box c="blue">
              <IconBellRinging size={24} />
            </Box>
            <Box style={{ flex: 1 }}>
              <Text fw={500} size="sm">
                {notification.title}
              </Text>
              <Text c="dimmed" size="xs">
                {notification.description}
              </Text>
            </Box>
          </Group>
        ))}
      </Stack>

      <Card.Section p="lg" pt="md">
        <Button fullWidth variant="subtle">
          Close
        </Button>
      </Card.Section>
    </Card>
  ),
  tags: ['autodocs'],
  title: 'uix/ui/Card',
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the card.
 */
export const Default: Story = {};
