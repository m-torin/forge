import type { Meta, StoryObj } from '@storybook/nextjs';
import { IconBellRinging } from '@tabler/icons-react';
import { Card, Title, Text, Button, Group, Stack, Box } from '@mantine/core';

const notifications = [
  {
    title: 'Your call has been confirmed.',
    description: '1 hour ago',
  },
  {
    title: 'You have a new message!',
    description: '1 hour ago',
  },
  {
    title: 'Your subscription is expiring soon!',
    description: '2 hours ago',
  },
];

/**
 * Displays a card with header, content, and footer using Mantine.
 */
const meta = {
  title: 'ui/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    shadow: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    radius: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    withBorder: {
      control: 'boolean',
    },
  },
  args: {
    shadow: 'sm',
    radius: 'md',
    withBorder: true,
    p: 'lg',
    w: 384,
  },
  render: (args) => (
    <Card {...args}>
      <Card.Section p="lg" pb="md">
        <Title order={3}>Notifications</Title>
        <Text size="sm" c="dimmed">
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
              <Text size="sm" fw={500}>
                {notification.title}
              </Text>
              <Text size="xs" c="dimmed">
                {notification.description}
              </Text>
            </Box>
          </Group>
        ))}
      </Stack>

      <Card.Section p="lg" pt="md">
        <Button variant="subtle" fullWidth>
          Close
        </Button>
      </Card.Section>
    </Card>
  ),
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the card.
 */
export const Default: Story = {};
