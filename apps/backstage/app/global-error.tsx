'use client';

import { Button, Center, Container, MantineProvider, Stack, Text, Title } from '@mantine/core';
import React, { useEffect } from 'react';

import type NextError from 'next/error';

interface GlobalErrorProperties {
  readonly error: NextError & { digest?: string };
  readonly reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProperties): React.ReactElement {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

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
