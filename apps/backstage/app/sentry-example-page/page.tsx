'use client';

import { Button, Container, Paper, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useObservability } from '@repo/observability/client/next';
import { useState } from 'react';

export default function SentryExamplePage() {
  const observability = useObservability();
  const [isLoading, setIsLoading] = useState(false);

  const handleTestError = async () => {
    setIsLoading(true);
    try {
      // Create a test error
      const error = new Error('Test error from Backstage admin panel');
      error.name = 'BackstageTestError';

      // Capture with context
      await observability?.captureException(error, {
        tags: {
          page: 'sentry-example',
          environment: 'development',
          app: 'backstage',
        },
        extra: {
          timestamp: new Date().toISOString(),
          userAction: 'test-error-button-click',
        },
        userId: 'test-admin-user',
      });

      notifications.show({
        title: 'Error sent to Sentry',
        message: 'Check your Sentry dashboard to see the error',
        color: 'green',
      });
    } catch (error: any) {
      notifications.show({
        title: 'Failed to send error',
        message: 'Make sure Sentry is configured correctly',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleThrowError = () => {
    throw new Error('Uncaught error from Backstage admin panel');
  };

  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Title order={1}>Sentry Error Testing</Title>

        <Paper shadow="sm" p="md" withBorder={true}>
          <Stack gap="md">
            <div>
              <Title order={3}>Test Error Capture</Title>
              <Text c="dimmed" size="md">
                Sends a test error to Sentry with context information
              </Text>
            </div>
            <Button onClick={handleTestError} loading={isLoading} variant="light" c="red">
              Send Test Error to Sentry
            </Button>
          </Stack>
        </Paper>

        <Paper shadow="sm" p="md" withBorder={true}>
          <Stack gap="md">
            <div>
              <Title order={3}>Test Uncaught Error</Title>
              <Text c="dimmed" size="md">
                Throws an uncaught error to test the global error handler
              </Text>
            </div>
            <Button onClick={handleThrowError} variant="light" c="red">
              Throw Uncaught Error
            </Button>
          </Stack>
        </Paper>

        <Paper shadow="sm" p="md" withBorder={true}>
          <Stack gap="sm">
            <Title order={3}>Configuration Status</Title>
            <Text size="md">
              <strong>Observability:</strong> {observability ? 'Connected' : 'Not connected'}
            </Text>
            <Text size="md" c="dimmed">
              Make sure NEXT_PUBLIC_SENTRY_DSN is set in your environment variables
            </Text>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
