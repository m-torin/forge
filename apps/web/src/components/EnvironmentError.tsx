"use client";

import {
  Container,
  Title,
  Text,
  Alert,
  Stack,
  Center,
  Code,
  List,
  Button,
  Group,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconRefresh,
  IconExternalLink,
} from "@tabler/icons-react";

interface EnvironmentErrorProps {
  error: string;
  showDetails?: boolean;
}

/**
 * Component to display environment configuration errors
 * in a user-friendly way instead of white screens
 */
export function EnvironmentError({
  error,
  showDetails = false,
}: EnvironmentErrorProps) {
  const handleRefresh = () => {
    window.location.reload();
  };

  const isDevelopment = process.env.NEXT_PUBLIC_NODE_ENV === "development";

  return (
    <Container size="sm" py="xl">
      <Center>
        <Stack align="center" gap="lg" maw={700}>
          <IconAlertCircle size={64} color="var(--mantine-color-orange-6)" />

          <Stack align="center" gap="sm">
            <Title order={1} ta="center" c="orange">
              Configuration Issue
            </Title>
            <Text ta="center" c="dimmed" size="lg">
              The application detected a configuration problem that needs to be
              resolved.
            </Text>
          </Stack>

          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Environment Configuration Error"
            color="orange"
            variant="light"
            w="100%"
          >
            <Text size="sm" mb="md">
              Some environment variables are missing or invalid. The application
              can still run with default values, but some features may not work
              correctly.
            </Text>

            {(showDetails || isDevelopment) && (
              <details className="mt-3">
                <summary className="cursor-pointer text-sm mb-2 font-medium">
                  Error Details
                </summary>
                <Code block className="text-xs overflow-auto max-h-40">
                  {error}
                </Code>
              </details>
            )}
          </Alert>

          {isDevelopment && (
            <Alert
              title="Development Mode - Quick Fix"
              color="blue"
              variant="light"
              w="100%"
            >
              <Text size="sm" mb="md">
                You&apos;re in development mode. Here&apos;s how to fix this:
              </Text>

              <List size="sm" spacing="xs">
                <List.Item>
                  Create a <Code>.env.local</Code> file in the root directory
                </List.Item>
                <List.Item>
                  Add the required environment variables (see{" "}
                  <Code>env.ts</Code> for details)
                </List.Item>
                <List.Item>
                  Or set <Code>SKIP_ENV_VALIDATION=true</Code> to use defaults
                </List.Item>
                <List.Item>
                  Restart the development server after making changes
                </List.Item>
              </List>
            </Alert>
          )}

          <Group gap="md">
            <Button
              leftSection={<IconRefresh size={16} />}
              onClick={handleRefresh}
              variant="filled"
              size="md"
            >
              Refresh page
            </Button>

            {isDevelopment && (
              <Button
                leftSection={<IconExternalLink size={16} />}
                component="a"
                href="https://github.com/t3-oss/t3-env"
                target="_blank"
                variant="outline"
                size="md"
              >
                Learn about env setup
              </Button>
            )}
          </Group>

          <Text size="xs" c="dimmed" ta="center" maw={500}>
            The application will continue to work with fallback values, but some
            features like authentication or database connections may not
            function properly until the environment is configured correctly.
          </Text>
        </Stack>
      </Center>
    </Container>
  );
}
