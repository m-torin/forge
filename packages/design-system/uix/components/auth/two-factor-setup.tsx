'use client';

import {
  Alert,
  Badge,
  Button,
  Card,
  Code,
  CopyButton,
  Group,
  Image,
  List,
  Modal,
  Stack,
  Stepper,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { IconCheck, IconCopy, IconShield, IconShieldCheck } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { analytics } from '@repo/analytics-legacy';
import {
  disableTwoFactor,
  enableTwoFactor,
  getTwoFactorBackupCodes,
  getTwoFactorQRCode,
  getTwoFactorStatus,
  regenerateTwoFactorBackupCodes,
  verifyTwoFactor,
} from '@repo/auth/client';

interface TwoFactorSetupProps {
  onCancel?: () => void;
  onComplete?: () => void;
}

export function TwoFactorSetup({ onCancel, onComplete }: TwoFactorSetupProps) {
  const [active, setActive] = useState(0);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    validate: {
      code: (value) =>
        value.length !== 6 || !/^\d+$/.test(value) ? 'Code must be 6 digits' : null,
    },
    initialValues: {
      code: '',
    },
  });

  useEffect(() => {
    setupTwoFactor();
  }, []);

  const setupTwoFactor = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Enable 2FA to get QR code and secret
      const enableResult = await enableTwoFactor?.();

      if (enableResult?.qrCode && enableResult?.secret) {
        setQrCode(enableResult.qrCode);
        setSecret(enableResult.secret);
      } else {
        // Fallback to separate QR code call
        const qrData = await getTwoFactorQRCode?.();
        if (qrData?.qrCode && qrData?.secret) {
          setQrCode(qrData.qrCode);
          setSecret(qrData.secret);
        }
      }

      analytics.capture('two_factor_setup_started', {
        source: 'two_factor_setup_component',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to setup 2FA';
      setError(errorMessage);
      analytics.capture('two_factor_setup_failed', {
        error: errorMessage,
        step: 'initialization',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (values: typeof form.values) => {
    setIsLoading(true);
    setError(null);
    try {
      // Verify the code
      await verifyTwoFactor?.({ code: values.code });

      // Get backup codes
      const codes = await getTwoFactorBackupCodes?.();
      if (codes?.backupCodes) {
        setBackupCodes(codes.backupCodes);
      }

      analytics.capture('two_factor_enabled', {
        source: 'two_factor_setup_component',
      });

      // Move to backup codes step
      setActive(2);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid code';
      setError(errorMessage);
      analytics.capture('two_factor_verification_failed', {
        error: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    analytics.capture('two_factor_setup_completed', {
      source: 'two_factor_setup_component',
    });
    onComplete?.();
  };

  return (
    <Stack>
      <Stepper onStepClick={setActive} active={active}>
        <Stepper.Step
          allowStepSelect={false}
          description="Set up authenticator app"
          label="Scan QR Code"
        >
          <Stack>
            <Alert color="blue" icon={<IconShield size={16} />}>
              Use an authenticator app like Google Authenticator, Authy, or 1Password to scan the QR
              code below.
            </Alert>

            {qrCode ? (
              <Card withBorder style={{ alignSelf: 'center' }} p="lg">
                <Image
                  width={200}
                  style={{ imageRendering: 'pixelated' }}
                  alt="2FA QR Code"
                  height={200}
                  src={qrCode}
                />
              </Card>
            ) : (
              <Card withBorder style={{ alignSelf: 'center' }} p="xl">
                <Text c="dimmed">Loading QR code...</Text>
              </Card>
            )}

            <Text c="dimmed" size="sm" ta="center">
              Can't scan? Enter this code manually:
            </Text>

            <Group justify="center">
              <Code style={{ fontSize: '14px' }}>{secret || 'Loading...'}</Code>
              <CopyButton value={secret}>
                {({ copied, copy }) => (
                  <Button
                    leftSection={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                    onClick={copy}
                    size="xs"
                    variant="subtle"
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                )}
              </CopyButton>
            </Group>

            <Button loading={isLoading} onClick={() => setActive(1)} disabled={!qrCode}>
              Continue
            </Button>
          </Stack>
        </Stepper.Step>

        <Stepper.Step allowStepSelect={false} description="Enter 6-digit code" label="Verify Code">
          <form onSubmit={form.onSubmit(handleVerify)}>
            <Stack>
              <Alert color="blue" icon={<IconShieldCheck size={16} />}>
                Enter the 6-digit code from your authenticator app to verify setup.
              </Alert>

              <TextInput
                placeholder="000000"
                style={{ fontSize: '20px', letterSpacing: '0.1em' }}
                label="Verification Code"
                maxLength={6}
                {...form.getInputProps('code')}
              />

              {error && (
                <Alert color="red" variant="light">
                  {error}
                </Alert>
              )}

              <Group>
                <Button onClick={() => setActive(0)} variant="subtle">
                  Back
                </Button>
                <Button loading={isLoading} type="submit">
                  Verify & Enable
                </Button>
              </Group>
            </Stack>
          </form>
        </Stepper.Step>

        <Stepper.Step
          allowStepSelect={false}
          description="Save recovery codes"
          label="Backup Codes"
        >
          <Stack>
            <Alert color="orange" icon={<IconShield size={16} />}>
              Save these backup codes in a secure location. You can use them to access your account
              if you lose your authenticator device.
            </Alert>

            <Card withBorder p="md">
              <Stack gap="xs">
                <Group justify="space-between" mb="sm">
                  <Text fw={500}>Backup Codes</Text>
                  <CopyButton value={backupCodes.join('\n')}>
                    {({ copied, copy }) => (
                      <Button
                        leftSection={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                        onClick={copy}
                        size="xs"
                        variant="subtle"
                      >
                        {copied ? 'Copied' : 'Copy All'}
                      </Button>
                    )}
                  </CopyButton>
                </Group>
                <List size="sm" spacing="xs">
                  {backupCodes.map((code, index) => (
                    <List.Item key={index}>
                      <Code>{code}</Code>
                    </List.Item>
                  ))}
                </List>
              </Stack>
            </Card>

            <Text c="dimmed" size="sm">
              Each code can only be used once. We'll generate new codes when you run low.
            </Text>

            <Button onClick={handleComplete}>I've Saved My Codes</Button>
          </Stack>
        </Stepper.Step>
      </Stepper>
    </Stack>
  );
}

interface TwoFactorManageProps {
  onDisabled?: () => void;
}

export function TwoFactorManage({ onDisabled }: TwoFactorManageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [confirmDisableOpened, { close: closeConfirmDisable, open: openConfirmDisable }] =
    useDisclosure(false);

  const form = useForm({
    initialValues: {
      password: '',
    },
  });

  const handleShowBackupCodes = async () => {
    setIsLoading(true);
    try {
      const codes = await getTwoFactorBackupCodes?.();
      if (codes?.backupCodes) {
        setBackupCodes(codes.backupCodes);
        setShowBackupCodes(true);
      }
    } catch (error) {
      console.error('Failed to get backup codes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    setIsLoading(true);
    try {
      const codes = await regenerateTwoFactorBackupCodes?.();
      if (codes?.backupCodes) {
        setBackupCodes(codes.backupCodes);
        analytics.capture('two_factor_backup_codes_regenerated', {
          source: 'two_factor_manage_component',
        });
      }
    } catch (error) {
      console.error('Failed to regenerate backup codes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    setIsLoading(true);
    try {
      await disableTwoFactor?.();
      analytics.capture('two_factor_disabled', {
        source: 'two_factor_manage_component',
      });
      closeConfirmDisable();
      onDisabled?.();
    } catch (error) {
      console.error('Failed to disable 2FA:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack>
      <Alert color="green" icon={<IconShieldCheck size={16} />}>
        Two-factor authentication is enabled for your account
      </Alert>

      <Group>
        <Button loading={isLoading} onClick={handleShowBackupCodes} variant="light">
          View Backup Codes
        </Button>
        <Button color="red" onClick={openConfirmDisable} variant="light">
          Disable 2FA
        </Button>
      </Group>

      <Modal
        onClose={() => setShowBackupCodes(false)}
        opened={showBackupCodes}
        title="Backup Codes"
      >
        <Stack>
          <Text c="dimmed" size="sm">
            Use these codes to access your account if you lose your authenticator device. Each code
            can only be used once.
          </Text>

          <Card withBorder p="md">
            <Stack gap="xs">
              <Group justify="space-between" mb="sm">
                <Text fw={500}>Current Codes</Text>
                <CopyButton value={backupCodes.join('\n')}>
                  {({ copied, copy }) => (
                    <Button
                      leftSection={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                      onClick={copy}
                      size="xs"
                      variant="subtle"
                    >
                      {copied ? 'Copied' : 'Copy All'}
                    </Button>
                  )}
                </CopyButton>
              </Group>
              <List size="sm" spacing="xs">
                {backupCodes.map((code, index) => (
                  <List.Item key={index}>
                    <Code>{code}</Code>
                  </List.Item>
                ))}
              </List>
            </Stack>
          </Card>

          <Button loading={isLoading} onClick={handleRegenerateBackupCodes} variant="light">
            Generate New Codes
          </Button>
        </Stack>
      </Modal>

      <Modal
        onClose={closeConfirmDisable}
        opened={confirmDisableOpened}
        title="Disable Two-Factor Authentication"
      >
        <form onSubmit={form.onSubmit(handleDisable)}>
          <Stack>
            <Alert color="red" variant="light">
              Disabling 2FA will make your account less secure. You'll need to set it up again if
              you want to re-enable it.
            </Alert>

            <TextInput
              placeholder="Enter your password"
              label="Confirm your password"
              required
              type="password"
              {...form.getInputProps('password')}
            />

            <Group justify="flex-end">
              <Button onClick={closeConfirmDisable} variant="subtle">
                Cancel
              </Button>
              <Button color="red" loading={isLoading} type="submit">
                Disable 2FA
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}

interface TwoFactorStatusProps {
  onManageClick?: () => void;
  onSetupClick?: () => void;
}

export function TwoFactorStatus({ onManageClick, onSetupClick }: TwoFactorStatusProps) {
  const [status, setStatus] = useState<{ enabled: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const twoFactorStatus = await getTwoFactorStatus?.();
      setStatus(twoFactorStatus || { enabled: false });
    } catch (error) {
      console.error('Failed to check 2FA status:', error);
      setStatus({ enabled: false });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Text c="dimmed">Checking 2FA status...</Text>;
  }

  if (status?.enabled) {
    return (
      <Group>
        <Badge color="green" variant="light">
          2FA Enabled
        </Badge>
        {onManageClick && (
          <Button onClick={onManageClick} size="xs" variant="subtle">
            Manage
          </Button>
        )}
      </Group>
    );
  }

  return (
    <Group>
      <Badge color="gray" variant="light">
        2FA Disabled
      </Badge>
      {onSetupClick && (
        <Button onClick={onSetupClick} size="xs" variant="light">
          Enable
        </Button>
      )}
    </Group>
  );
}
