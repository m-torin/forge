'use client';

import { Button, Container, Stack } from '@mantine/core';
import Link from 'next/link';

import { BackButton, usePageTracking, UserProfile } from '@repo/design-system/uix';

export default function SettingsPage() {
  usePageTracking('backstage-settings');

  return (
    <Container py="xl" size="md">
      <BackButton href="/">Back to Dashboard</BackButton>

      <Stack gap="xl">
        <UserProfile showSocialAccounts={false} />

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
