'use client';

import { Button, Center, Container, MantineProvider, Stack, Text, Title } from '@mantine/core';
import { useObservability } from '@repo/observability/client/next';
import React, { useEffect } from 'react';

import type NextError from 'next/error';

interface GlobalErrorProperties {
  readonly error: NextError & { digest?: string };
  readonly reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProperties): React.ReactElement {
  const observability = useObservability();

  useEffect(() => {
    console.error('Global error:', error);

    // Send error to Sentry
    observability?.captureException(error as any as Error, {
      tags: {
        type: 'global_error',
        digest: error.digest || 'unknown',
      },
      level: 'fatal',
    });
  }, [error, observability]);

  return (
    <html lang="en">
      <body>
        <MantineProvider>
          <Center style={{ minHeight: '100vh' }}>
            <Container size="sm">
              <Stack align="center" gap="lg">
                <Title order={1}>Oops, something went wrong</Title>
                <Text c="dimmed">An unexpected error occurred</Text>
                <Button onClick={() => reset()}>Try again</Button>
              </Stack>
            </Container>
          </Center>
        </MantineProvider>
      </body>
    </html>
  );
}
