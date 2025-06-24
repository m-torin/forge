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
} from "@mantine/core";
import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary for locale-specific routes
 *
 * This provides a user-friendly error page with recovery options
 * when something goes wrong during rendering.
 *
 * Note: Error boundaries must be client components and cannot use async data.
 * We use hardcoded fallback text that works for all locales.
 */
export default function ErrorPage({
  error,
  reset,
}: ErrorPageProps): React.JSX.Element {
  useEffect(() => {
    // Log the error to monitoring service
    console.error("Error in locale page:", error);
  }, [error]);

  return (
    <Container size="sm" py="xl">
      <Center>
        <Stack align="center" gap="lg" maw={500}>
          <IconAlertTriangle size={64} color="var(--mantine-color-red-6)" />

          <Stack align="center" gap="sm">
            <Title order={1} ta="center" c="red">
              Something went wrong
            </Title>
            <Text ta="center" c="dimmed">
              We encountered an unexpected error. Please try refreshing the
              page.
            </Text>
          </Stack>

          <Alert
            icon={<IconAlertTriangle size={16} />}
            title="Error Details"
            color="red"
            variant="light"
            w="100%"
          >
            <Text size="sm" ff="monospace">
              {error.message || "An unknown error occurred"}
            </Text>
            {error.digest && (
              <Text size="xs" c="dimmed" mt="xs">
                Error ID: {error.digest}
              </Text>
            )}
          </Alert>

          <Button
            leftSection={<IconRefresh size={16} />}
            onClick={reset}
            variant="filled"
            size="md"
          >
            Try again
          </Button>
        </Stack>
      </Center>
    </Container>
  );
}
