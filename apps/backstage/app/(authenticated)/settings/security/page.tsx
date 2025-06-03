'use client';

import { Button, Card, Container, Stack, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconShield } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { analytics } from '@repo/analytics';
import { getTwoFactorStatus } from '@repo/auth/client';
import {
  BackButton,
  PasskeyManager,
  SessionManagement,
  TwoFactorManage,
  TwoFactorSetup,
  usePageTracking,
} from '@repo/design-system/uix';

export default function SecuritySettingsPage() {
  usePageTracking('backstage-security-settings');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [setupOpened, { close: closeSetup, open: openSetup }] = useDisclosure(false);

  useEffect(() => {
    checkTwoFactorStatus();
  }, []);

  const checkTwoFactorStatus = async () => {
    try {
      const status = await getTwoFactorStatus?.();
      setTwoFactorEnabled(status?.enabled || false);
    } catch (error) {
      console.error('Failed to check 2FA status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorComplete = () => {
    setTwoFactorEnabled(true);
    closeSetup();
    analytics.capture('two_factor_enabled', {
      source: 'backstage_security_settings',
    });
  };

  const handleTwoFactorDisabled = () => {
    setTwoFactorEnabled(false);
    analytics.capture('two_factor_disabled', {
      source: 'backstage_security_settings',
    });
  };

  return (
    <Container py="xl" size="md">
      <BackButton href="/settings">Back to Settings</BackButton>

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

            {isLoading ? (
              <Text c="dimmed">Checking 2FA status...</Text>
            ) : twoFactorEnabled ? (
              <TwoFactorManage onDisabled={handleTwoFactorDisabled} />
            ) : (
              <>
                <Text>
                  Two-factor authentication is not enabled for your account. We strongly recommend
                  enabling it for enhanced security.
                </Text>
                <Button
                  leftSection={<IconShield size={16} />}
                  onClick={openSetup}
                  style={{ alignSelf: 'flex-start' }}
                >
                  Enable Two-Factor Authentication
                </Button>
              </>
            )}
          </Stack>
        </Card>

        {/* Passkeys */}
        <Card withBorder>
          <PasskeyManager />
        </Card>

        {/* Active Sessions */}
        <Card withBorder>
          <SessionManagement />
        </Card>
      </Stack>

      {/* 2FA Setup Modal */}
      {setupOpened && (
        <Card
          shadow="lg"
          withBorder
          style={{
            maxWidth: 600,
            width: '90%',
            left: '50%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'fixed',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
          }}
        >
          <Stack>
            <Title order={2}>Set Up Two-Factor Authentication</Title>
            <TwoFactorSetup onCancel={closeSetup} onComplete={handleTwoFactorComplete} />
          </Stack>
        </Card>
      )}

      {/* Backdrop */}
      {setupOpened && (
        <div
          role="button"
          tabIndex={0}
          onClick={closeSetup}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              closeSetup();
            }
          }}
          aria-label="Close two-factor authentication setup"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            bottom: 0,
            left: 0,
            position: 'fixed',
            right: 0,
            top: 0,
            zIndex: 999,
            cursor: 'pointer',
          }}
        />
      )}
    </Container>
  );
}
