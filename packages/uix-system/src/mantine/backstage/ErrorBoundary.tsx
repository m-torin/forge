'use client';

import { Button, Container, Group, Text, Title } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
  homeUrl?: string;
  homeLabel?: string;
}

export function ErrorBoundary({
  error,
  reset,
  homeUrl = '/',
  homeLabel = 'Go to Home',
}: ErrorBoundaryProps) {
  return (
    <Container size="sm" py="xl">
      <div style={{ textAlign: 'center' }}>
        <IconAlertCircle size={64} color="red" style={{ margin: '0 auto', display: 'block' }} />
        <Title order={1} mt="md" c="bright">
          Something went wrong!
        </Title>
        <Text c="dimmed" size="lg" mt="md">
          {error.message || 'An unexpected error occurred'}
        </Text>
        {error.digest && (
          <Text c="dimmed" size="sm" mt="xs">
            Error ID: {error.digest}
          </Text>
        )}
        <Group justify="center" mt="xl" gap="sm">
          <Button onClick={reset}>Try again</Button>
          <Button variant="light" component="a" href={homeUrl}>
            {homeLabel}
          </Button>
        </Group>
      </div>
    </Container>
  );
}
