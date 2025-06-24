"use client";

import { useEffect } from "react";
import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Alert,
  Center,
  Group,
  Code,
} from "@mantine/core";
import { IconAlertTriangle, IconRefresh, IconHome } from "@tabler/icons-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error page for route-level errors
 *
 * This provides a user-friendly error page with recovery options
 * when something goes wrong during page rendering.
 */
export default function ErrorPage({
  error,
  reset,
}: ErrorPageProps): React.JSX.Element {
  useEffect(() => {
    // Log the error to monitoring service
    console.error("Page error:", error);
  }, [error]);

  const isDevelopment = process.env.NEXT_PUBLIC_NODE_ENV === "development";

  return (
    <Container size="sm" py="xl">
      <Center>
        <Stack align="center" gap="lg" maw={600}>
          <IconAlertTriangle size={64} color="var(--mantine-color-red-6)" />

          <Stack align="center" gap="sm">
            <Title order={1} ta="center" c="red">
              Oops! Something went wrong
            </Title>
            <Text ta="center" c="dimmed" size="lg">
              We encountered an unexpected error while loading this page.
              Don&apos;t worry, the rest of the application is still working.
            </Text>
          </Stack>

          <Alert
            icon={<IconAlertTriangle size={16} />}
            title="Error Information"
            color="red"
            variant="light"
            w="100%"
          >
            <Text size="sm" fw={500} mb="xs">
              {error.message || "An unknown error occurred"}
            </Text>

            {error.digest && (
              <Text size="xs" c="dimmed" mb="xs">
                Error ID: <Code component="span">{error.digest}</Code>
              </Text>
            )}

            {isDevelopment && error.stack && (
              <details className="mt-3">
                <summary className="cursor-pointer text-sm mb-2 font-medium">
                  Stack Trace (Development Mode)
                </summary>
                <Code block className="text-xs overflow-auto max-h-40">
                  {error.stack}
                </Code>
              </details>
            )}
          </Alert>

          <Group gap="md">
            <Button
              leftSection={<IconRefresh size={16} />}
              onClick={reset}
              variant="filled"
              size="md"
            >
              Try again
            </Button>

            <Button
              leftSection={<IconHome size={16} />}
              onClick={() => (window.location.href = "/")}
              variant="outline"
              size="md"
            >
              Go home
            </Button>
          </Group>

          <Text size="xs" c="dimmed" ta="center" maw={400}>
            If this problem continues, please try refreshing the page or
            navigating to a different section of the application.
          </Text>
        </Stack>
      </Center>
    </Container>
  );
}
