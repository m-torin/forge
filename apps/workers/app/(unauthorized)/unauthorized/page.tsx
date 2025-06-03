'use client';

import { Button, Container, Stack, Text, Title } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { analytics } from '@repo/analytics';

export default function UnauthorizedPage() {
  const router = useRouter();

  useEffect(() => {
    // Track page view
    analytics.capture('page_viewed', {
      app: 'workers',
      page: 'workers-unauthorized',
      title: 'Workers Unauthorized',
    });
  }, []);

  return (
    <Container py={100} size="sm">
      <Stack align="center" gap="xl">
        <Stack align="center" gap="md">
          <Title order={1}>Access Denied</Title>
          <Text c="dimmed" size="lg" ta="center">
            You don't have permission to access this page.
          </Text>
        </Stack>
        <Button onClick={() => router.push('/sign-in' as any)} size="md">
          Sign In
        </Button>
      </Stack>
    </Container>
  );
}
