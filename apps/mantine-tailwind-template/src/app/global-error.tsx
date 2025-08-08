'use client';

import { Button, Container, Group, Text, Title } from '@mantine/core';
import { logError } from '@repo/observability';
import { IconRefresh } from '@tabler/icons-react';
import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the error for monitoring
    logError('Global error boundary triggered', {
      error: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <html>
      <body>
        <Container size="md" style={{ textAlign: 'center', paddingTop: '10rem' }}>
          <Title size="h1" mb="md" c="red">
            Something went wrong!
          </Title>
          <Text mb="xl" c="dimmed">
            An unexpected error occurred. Please try refreshing the page.
          </Text>
          <Group justify="center">
            <Button onClick={reset} leftSection={<IconRefresh size={16} />} variant="filled">
              Try Again
            </Button>
          </Group>
        </Container>
      </body>
    </html>
  );
}
