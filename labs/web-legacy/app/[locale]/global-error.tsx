'use client';

import { Alert, Button, Container, Stack, Text, Title } from '@mantine/core';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function LocaleGlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  // Extract locale from pathname
  const locale = pathname.split('/')[1] || 'en';

  useEffect(() => {
    // Log the error to an error reporting service
    // eslint-disable-next-line no-console
    console.error('Global error: ', error);
  }, [error]);

  // Fallback text - in a real app, you'd want to fetch dictionary here
  // For simplicity, using English fallbacks since this is an error state
  return (
    <Container
      size="md"
      style={{
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <Stack ta="center" gap="lg">
        <Alert
          c="red"
          icon={<IconAlertCircle size={24} />}
          style={{ width: '100%' }}
          title="Something went wrong!"
          variant="light"
        >
          <Text c="dimmed" size="md">
            An unexpected error occurred. Our team has been notified and is working to fix this
            issue.
          </Text>
          {process.env.NODE_ENV === 'development' && (
            <Text c="red" mt="sm" size="xs" style={{ fontFamily: 'monospace' }}>
              {(error as Error)?.message || 'Unknown error'}
            </Text>
          )}
        </Alert>

        <Title c="dimmed" order={2} ta="center">
          Oops! Something went wrong
        </Title>

        <Text c="dimmed" size="lg" ta="center">
          We apologize for the inconvenience. Please try refreshing the page or contact support if
          the problem persists.
        </Text>

        <Button
          leftSection={<IconRefresh size={16} />}
          size="lg"
          variant="light"
          onClick={() => reset()}
        >
          Try again
        </Button>

        <Button component="a" href={`/${locale}`} size="md" variant="light">
          Go to homepage
        </Button>
      </Stack>
    </Container>
  );
}
