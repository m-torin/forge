'use client';

import { useEffect } from 'react';
import { Container, Title, Text, Button, Group, Paper } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import * as Sentry from '@sentry/nextjs';

export interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
  homeUrl?: string;
  homeLabel?: string;
}

export function ErrorBoundary({
  error,
  reset,
  homeUrl = '/',
  homeLabel = 'Go to Dashboard',
}: ErrorBoundaryProps) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <Container size="sm" py="xl">
      <Paper shadow="md" p="xl" radius="md">
        <Group mb="md">
          <IconAlertCircle size={48} color="red" />
          <div>
            <Title order={2}>Something went wrong!</Title>
            <Text c="dimmed" size="sm">
              Error ID: {error.digest}
            </Text>
          </div>
        </Group>

        <Text mb="lg">
          We're sorry, but something went wrong. The error has been logged and we'll look into it.
        </Text>

        {process.env.NODE_ENV === 'development' && (
          <Paper bg="gray.1" p="md" radius="sm" mb="lg">
            <Text size="sm" c="red" style={{ fontFamily: 'monospace' }}>
              {error.message}
            </Text>
          </Paper>
        )}

        <Group>
          <Button onClick={reset} variant="filled">
            Try again
          </Button>
          <Button component="a" href={homeUrl} variant="light">
            {homeLabel}
          </Button>
        </Group>
      </Paper>
    </Container>
  );
}
