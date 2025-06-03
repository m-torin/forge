import {
  Avatar,
  Badge,
  Card,
  Group,
  Text,
  Timeline,
  Title,
} from "@mantine/core";
import {
  IconBell,
  IconFileDownload,
  IconLogin,
  IconMessage,
  IconSettings,
  IconShoppingCart,
  IconStar,
  IconUserPlus,
} from "@tabler/icons-react";

const activities = [
  {
    color: "blue",
    description: "John Doe created an account",
    icon: <IconUserPlus size={16} />,
    time: "2 minutes ago",
    title: "New user registered",
  },
  {
    color: "green",
    description: "Order #12345 - $299.00",
    icon: <IconShoppingCart size={16} />,
    time: "15 minutes ago",
    title: "New order placed",
  },
  {
    color: "orange",
    description: "Sarah commented on Product X",
    icon: <IconMessage size={16} />,
    time: "1 hour ago",
    title: "New comment",
  },
  {
    color: "yellow",
    description: "5-star review on Product Y",
    icon: <IconStar size={16} />,
    time: "2 hours ago",
    title: "New review",
  },
  {
    color: "violet",
    description: "Admin user logged in from new device",
    icon: <IconLogin size={16} />,
    time: "3 hours ago",
    title: "User login",
  },
  {
    color: "pink",
    description: "Monthly sales report exported",
    icon: <IconFileDownload size={16} />,
    time: "5 hours ago",
    title: "Report downloaded",
  },
  {
    color: "gray",
    description: "Email preferences changed",
    icon: <IconSettings size={16} />,
    time: "1 day ago",
    title: "Settings updated",
  },
  {
    color: "indigo",
    description: "Marketing campaign launched",
    icon: <IconBell size={16} />,
    time: "2 days ago",
    title: "Notification sent",
  },
];

export default function ActivityFeed() {
  return (
    <Card withBorder>
      <Group justify="space-between" mb="lg">
        <Title order={2}>Recent Activity</Title>
        <Badge variant="light">Live</Badge>
      </Group>

      <Timeline lineWidth={2} bulletSize={30}>
        {activities.map((activity) => (
          <Timeline.Item
            key={`${activity.title}-${activity.time}`}
            bullet={
              <Avatar color={activity.color} radius="xl" size={30}>
                {activity.icon}
              </Avatar>
            }
            title={activity.title}
          >
            <Text c="dimmed" size="sm">
              {activity.description}
            </Text>
            <Text c="dimmed" mt={4} size="xs">
              {activity.time}
            </Text>
          </Timeline.Item>
        ))}
      </Timeline>

      <Group justify="center" mt="md">
        <Text c="dimmed" size="sm">
          Showing last 8 activities
        </Text>
      </Group>
    </Card>
  );
}
