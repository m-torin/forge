"use client";

import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Center,
  Group,
} from "@mantine/core";
import { IconHome, IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";

/**
 * 404 Not Found page
 *
 * This page is shown when a route doesn't exist.
 * It provides helpful navigation options to get users back on track.
 */
export default function NotFound(): React.JSX.Element {
  return (
    <Container size="sm" py="xl">
      <Center>
        <Stack align="center" gap="lg" maw={500}>
          <div
            style={{
              fontSize: "120px",
              fontWeight: "bold",
              color: "var(--mantine-color-blue-6)",
              lineHeight: 1,
              textAlign: "center",
            }}
          >
            404
          </div>

          <Stack align="center" gap="sm">
            <Title order={1} ta="center">
              Page Not Found
            </Title>
            <Text ta="center" c="dimmed" size="lg">
              The page you&apos;re looking for doesn&apos;t exist or has been
              moved.
            </Text>
          </Stack>

          <Group gap="md">
            <Button
              component={Link}
              href="/"
              leftSection={<IconHome size={16} />}
              variant="filled"
              size="md"
            >
              Go home
            </Button>

            <Button
              onClick={() => window.history.back()}
              leftSection={<IconArrowLeft size={16} />}
              variant="outline"
              size="md"
            >
              Go back
            </Button>
          </Group>

          <Text size="xs" c="dimmed" ta="center">
            If you believe this is an error, please contact support or try
            navigating from the homepage.
          </Text>
        </Stack>
      </Center>
    </Container>
  );
}
