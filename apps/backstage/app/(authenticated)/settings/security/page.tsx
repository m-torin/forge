'use client';

import { Button, Card, Container, Stack, Text, Title } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function SecuritySettingsPage() {
  console.log('Page Tracking: backstage-security-settings');
  const [_isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkTwoFactorStatus();
  }, []);

  const checkTwoFactorStatus = async () => {
    try {
      // Mock loading for demo
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Failed to check 2FA status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container py="xl" size="md">
      <Button
        href="/settings"
        component={Link}
        leftSection={<IconArrowLeft size={16} />}
        mb="xl"
        variant="subtle"
      >
        Back to Settings
      </Button>

      <Title order={1} mb="xl">
        Security Settings
      </Title>

      <Stack gap="xl">
        {/* Two-Factor Authentication */}
        <Card withBorder>
          <Stack>
            <div>
              <Title order={3}>Two-Factor Authentication</Title>
              <Text c="dimmed" mt="xs" size="sm">
                Add an extra layer of security to your admin account with 2FA
              </Text>
            </div>

            <Text c="orange">
              Security features are disabled in demo mode. Authentication has been removed from this
              backstage instance.
            </Text>
          </Stack>
        </Card>

        {/* Passkeys */}
        <Card withBorder>
          <Stack>
            <div>
              <Title order={3}>Passkeys</Title>
              <Text c="dimmed" mt="xs" size="sm">
                Passkey management is disabled in demo mode
              </Text>
            </div>
            <Text c="orange">Passkey features require authentication to be enabled.</Text>
          </Stack>
        </Card>

        {/* Active Sessions */}
        <Card withBorder>
          <Stack>
            <div>
              <Title order={3}>Active Sessions</Title>
              <Text c="dimmed" mt="xs" size="sm">
                Session management is disabled in demo mode
              </Text>
            </div>
            <Text c="orange">Session management requires authentication to be enabled.</Text>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
