import {
  Avatar,
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Stack,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import {
  IconBriefcase,
  IconCalendar,
  IconMail,
  IconPhone,
} from "@tabler/icons-react";
import Link from "next/link";

interface UserPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserPage({ params }: UserPageProps) {
  const { id } = await params;

  // Mock user data
  const user = {
    id,
    name: "John Doe",
    avatar: "JD",
    bio: "Passionate software engineer with expertise in React, Node.js, and cloud technologies.",
    department: "Engineering",
    email: "john.doe@example.com",
    joinDate: "2023-01-15",
    phone: "+1 234 567 8900",
    projects: [
      { name: "Project Alpha", status: "completed" },
      { name: "Project Beta", status: "in-progress" },
      { name: "Project Gamma", status: "planning" },
    ],
    role: "Senior Engineer",
    skills: ["React", "TypeScript", "Node.js", "AWS", "Docker"],
    status: "active",
  };

  return (
    <Container py="xl" size="lg">
      <Link href="/users">
        <Button mb="md" variant="subtle">
          ← Back to Team
        </Button>
      </Link>

      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder>
            <Stack align="center">
              <Avatar color="blue" radius="xl" size={120}>
                {user.avatar}
              </Avatar>
              <Title order={2}>{user.name}</Title>
              <Text c="dimmed">{user.role}</Text>
              <Badge
                color={user.status === "active" ? "green" : "gray"}
                size="lg"
                variant="light"
              >
                {user.status}
              </Badge>
            </Stack>

            <Stack gap="sm" mt="xl">
              <Group>
                <IconMail size={20} />
                <Text size="sm">{user.email}</Text>
              </Group>
              <Group>
                <IconPhone size={20} />
                <Text size="sm">{user.phone}</Text>
              </Group>
              <Group>
                <IconBriefcase size={20} />
                <Text size="sm">{user.department}</Text>
              </Group>
              <Group>
                <IconCalendar size={20} />
                <Text size="sm">
                  Joined {new Date(user.joinDate).toLocaleDateString()}
                </Text>
              </Group>
            </Stack>

            <Group grow mt="xl">
              <Button>Message</Button>
              <Button variant="outline">Email</Button>
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card withBorder>
            <Tabs defaultValue="about">
              <Tabs.List>
                <Tabs.Tab value="about">About</Tabs.Tab>
                <Tabs.Tab value="projects">Projects</Tabs.Tab>
                <Tabs.Tab value="activity">Activity</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel pt="md" value="about">
                <Stack>
                  <div>
                    <Title order={4} mb="xs">
                      Bio
                    </Title>
                    <Text>{user.bio}</Text>
                  </div>

                  <div>
                    <Title order={4} mb="xs">
                      Skills
                    </Title>
                    <Group gap="xs">
                      {user.skills.map((skill) => (
                        <Badge key={skill} variant="light">
                          {skill}
                        </Badge>
                      ))}
                    </Group>
                  </div>
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel pt="md" value="projects">
                <Stack>
                  {user.projects.map((project) => (
                    <Card key={project.name} withBorder>
                      <Group justify="space-between">
                        <Text fw={500}>{project.name}</Text>
                        <Badge
                          color={
                            project.status === "completed"
                              ? "green"
                              : project.status === "in-progress"
                                ? "blue"
                                : "gray"
                          }
                          variant="light"
                        >
                          {project.status}
                        </Badge>
                      </Group>
                    </Card>
                  ))}
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel pt="md" value="activity">
                <Text c="dimmed">No recent activity</Text>
              </Tabs.Panel>
            </Tabs>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
