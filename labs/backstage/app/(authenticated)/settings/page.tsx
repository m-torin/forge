'use client';

import { Button, Card, Container, Stack, Text, Title } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';

export default function SettingsPage() {
  console.log('Page Tracking: backstage-settings');

  return (
    <Container py="xl" size="md">
      <Button
        href="/"
        component={Link}
        leftSection={<IconArrowLeft size={16} />}
        mb="xl"
        variant="subtle"
      >
        Back to Dashboard
      </Button>

      <Stack gap="xl">
        {/* UserProfile removed due to auth dependencies */}
        <Card withBorder p="lg">
          <Title order={3} mb="md">
            User Settings
          </Title>
          <Text c="dimmed">User profile functionality has been disabled.</Text>
        </Card>

        <Button
          fullWidth
          href="/settings/security"
          component={Link as any}
          size="lg"
          variant="light"
        >
          Security Settings
        </Button>
      </Stack>
    </Container>
  );
}
