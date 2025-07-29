'use client';

import { Button, Container, Text, Title } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html>
      <body>
        <Container size="sm" py="xl">
          <div style={{ textAlign: 'center' }}>
            <IconAlertTriangle
              size={80}
              color="red"
              style={{ margin: '0 auto', display: 'block' }}
            />
            <Title order={1} mt="md" c="bright">
              Application Error
            </Title>
            <Text c="dimmed" size="lg" mt="md">
              A critical error occurred. Please try refreshing the page.
            </Text>
            {error.digest && (
              <Text c="dimmed" size="sm" mt="xs">
                Error ID: {error.digest}
              </Text>
            )}
            <Button onClick={reset} mt="xl" size="lg">
              Refresh Page
            </Button>
          </div>
        </Container>
      </body>
    </html>
  );
}
