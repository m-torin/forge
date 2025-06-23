'use client';

import { logger } from '@/lib/logger';
import { Alert, Button, Container, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';
import { useEffect } from 'react';

export default function CollectionsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Collections page error', error);
  }, [error]);

  return (
    <Container size="md" py="xl">
      <Stack align="center" gap="lg">
        <Alert
          icon={<IconAlertTriangle size={20} />}
          title="Unable to load collections"
          color="red"
          variant="light"
          style={{ width: '100%' }}
        >
          <Stack gap="sm">
            <Text size="sm">
              We encountered an error while loading the collections page. This might be temporary.
            </Text>

            {process.env.NODE_ENV === 'development' && (
              <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                {error.message}
              </Text>
            )}

            <Button
              leftSection={<IconRefresh size={16} />}
              onClick={reset}
              variant="light"
              size="sm"
            >
              Try Again
            </Button>
          </Stack>
        </Alert>
      </Stack>
    </Container>
  );
}
