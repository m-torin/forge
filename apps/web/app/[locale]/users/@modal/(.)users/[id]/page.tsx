"use client";

import {
  Avatar,
  Badge,
  Button,
  Group,
  Modal,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconBriefcase, IconMail, IconPhone } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface InterceptedUserPageProps {
  params: Promise<{ id: string }>;
}

export default function InterceptedUserPage({
  params,
}: InterceptedUserPageProps) {
  const router = useRouter();
  const [id, setId] = useState<string>("");

  useEffect(() => {
    params
      .then((p) => {
        setId(p.id);
        return p;
      })
      .catch((error) => {
        console.error("Error resolving params:", error);
      });
  }, [params]);

  // Mock user data
  const user = {
    id,
    name: "John Doe",
    avatar: "JD",
    department: "Engineering",
    email: "john.doe@example.com",
    phone: "+1 234 567 8900",
    role: "Senior Engineer",
    status: "active",
  };

  return (
    <Modal
      onClose={() => router.back()}
      opened={true}
      centered
      size="md"
      title="User Profile"
    >
      <Stack align="center">
        <Avatar color="blue" radius="xl" size={100}>
          {user.avatar}
        </Avatar>
        <Title order={3}>{user.name}</Title>
        <Badge
          color={user.status === "active" ? "green" : "gray"}
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
          <div>
            <Text size="sm">{user.role}</Text>
            <Text c="dimmed" size="xs">
              {user.department}
            </Text>
          </div>
        </Group>
      </Stack>

      <Group grow mt="xl">
        <Button variant="light">Send Message</Button>
        <Button
          onClick={() => {
            router.push(`/users/${id}` as any);
          }}
          variant="outline"
        >
          View Full Profile
        </Button>
      </Group>
    </Modal>
  );
}
