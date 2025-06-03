import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Card,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconBell,
  IconCheck,
  IconInfoCircle,
  IconX,
} from "@tabler/icons-react";

const notifications = [
  {
    id: "1",
    type: "info",
    message: "Scheduled maintenance tonight at 2 AM",
    read: false,
    time: "5 min ago",
    title: "System Update",
  },
  {
    id: "2",
    type: "success",
    message: "Payment of $1,234 has been processed",
    read: false,
    time: "1 hour ago",
    title: "Payment Received",
  },
  {
    id: "3",
    type: "warning",
    message: "Product X is running low on inventory",
    read: true,
    time: "3 hours ago",
    title: "Low Stock Alert",
  },
  {
    id: "4",
    type: "info",
    message: "Check out our new analytics dashboard",
    read: true,
    time: "1 day ago",
    title: "New Feature Available",
  },
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "success":
      return <IconCheck size={16} />;
    case "warning":
      return <IconAlertTriangle size={16} />;
    case "info":
    default:
      return <IconInfoCircle size={16} />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case "success":
      return "green";
    case "warning":
      return "orange";
    case "info":
    default:
      return "blue";
  }
};

export default function NotificationsPanel() {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Stack gap="lg">
      <Card withBorder>
        <Group justify="space-between" mb="lg">
          <Group>
            <Title order={3}>Notifications</Title>
            {unreadCount > 0 && (
              <Badge color="red" circle size="lg">
                {unreadCount}
              </Badge>
            )}
          </Group>
          <Button size="xs" variant="subtle">
            Mark all read
          </Button>
        </Group>

        <Stack gap="sm">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              withBorder
              style={{
                backgroundColor: notification.read
                  ? "transparent"
                  : "var(--mantine-color-blue-light)",
              }}
              padding="sm"
            >
              <Group justify="space-between" wrap="nowrap">
                <Group gap="sm" wrap="nowrap">
                  <Avatar
                    color={getNotificationColor(notification.type)}
                    radius="xl"
                    size="sm"
                  >
                    {getNotificationIcon(notification.type)}
                  </Avatar>
                  <div style={{ flex: 1 }}>
                    <Text fw={500} size="sm">
                      {notification.title}
                    </Text>
                    <Text c="dimmed" size="xs">
                      {notification.message}
                    </Text>
                    <Text c="dimmed" mt={4} size="xs">
                      {notification.time}
                    </Text>
                  </div>
                </Group>
                <ActionIcon size="sm" variant="subtle">
                  <IconX size={14} />
                </ActionIcon>
              </Group>
            </Card>
          ))}
        </Stack>

        <Button fullWidth mt="md" variant="subtle">
          View all notifications
        </Button>
      </Card>

      <Card withBorder>
        <Title order={3} mb="md">
          Quick Actions
        </Title>
        <Stack gap="xs">
          <Button
            fullWidth
            leftSection={<IconBell size={16} />}
            variant="light"
          >
            Notification Settings
          </Button>
          <Button fullWidth variant="light">
            Download Reports
          </Button>
          <Button fullWidth variant="light">
            Invite Team Member
          </Button>
          <Button fullWidth variant="light">
            View Documentation
          </Button>
        </Stack>
      </Card>
    </Stack>
  );
}
