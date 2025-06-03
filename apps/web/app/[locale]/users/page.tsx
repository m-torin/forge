import {
  Avatar,
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Text,
  Title,
} from "@mantine/core";
import Link from "next/link";

const mockUsers = [
  {
    id: "1",
    name: "John Doe",
    avatar: "JD",
    department: "Engineering",
    role: "Admin",
    status: "active",
  },
  {
    id: "2",
    name: "Jane Smith",
    avatar: "JS",
    department: "Marketing",
    role: "User",
    status: "active",
  },
  {
    id: "3",
    name: "Bob Johnson",
    avatar: "BJ",
    department: "Sales",
    role: "Manager",
    status: "inactive",
  },
  {
    id: "4",
    name: "Alice Williams",
    avatar: "AW",
    department: "HR",
    role: "User",
    status: "active",
  },
  {
    id: "5",
    name: "Charlie Brown",
    avatar: "CB",
    department: "Engineering",
    role: "Admin",
    status: "active",
  },
  {
    id: "6",
    name: "Diana Prince",
    avatar: "DP",
    department: "Design",
    role: "User",
    status: "active",
  },
];

export default function UsersPage() {
  return (
    <Container py="xl" size="xl">
      <Title order={1} mb="xl">
        Team Members
      </Title>

      <Grid>
        {mockUsers.map((user) => (
          <Grid.Col key={user.id} span={{ base: 12, md: 4, sm: 6 }}>
            <Card
              href={`/users/${user.id}` as any}
              component={Link}
              withBorder
              style={{ cursor: "pointer" }}
              padding="lg"
              radius="md"
            >
              <Group>
                <Avatar color="blue" radius="xl" size="lg">
                  {user.avatar}
                </Avatar>
                <div style={{ flex: 1 }}>
                  <Text fw={500} size="lg">
                    {user.name}
                  </Text>
                  <Text c="dimmed" size="sm">
                    {user.department}
                  </Text>
                </div>
              </Group>

              <Group justify="space-between" mt="md">
                <Badge
                  color={
                    user.role === "Admin"
                      ? "red"
                      : user.role === "Manager"
                        ? "orange"
                        : "blue"
                  }
                  variant="light"
                >
                  {user.role}
                </Badge>
                <Badge
                  color={user.status === "active" ? "green" : "gray"}
                  variant="light"
                >
                  {user.status}
                </Badge>
              </Group>

              <Button fullWidth mt="md" variant="light">
                View Profile
              </Button>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
}
