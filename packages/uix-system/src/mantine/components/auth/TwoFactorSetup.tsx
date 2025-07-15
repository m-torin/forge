'use client';

import {
  ActionIcon,
  Alert,
  Button,
  Code,
  Group,
  Paper,
  PinInput,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconCheck,
  IconCopy,
  IconKey,
  IconQrcode,
  IconShieldCheck,
} from '@tabler/icons-react';
import { useState } from 'react';

export type TwoFactorStep = 'qr' | 'verify' | 'backup';

export interface TwoFactorSetupProps {
  currentStep: TwoFactorStep;
  onStepChange: (step: TwoFactorStep) => void;

  // QR Code step
  qrCode?: string | null;
  secret?: string | null;
  onLoadQRCode?: () => Promise<void>;
  onEnable?: () => Promise<void>;

  // Verify step
  verificationCode: string;
  onVerificationCodeChange: (code: string) => void;
  onVerify?: () => Promise<void>;

  // Backup codes step
  backupCodes?: string[];
  onComplete?: () => void;

  // Common
  loading?: boolean;
  error?: string | null;
  onErrorDismiss?: () => void;
  onCancel?: () => void;

  // Customization
  title?: {
    qr?: string;
    verify?: string;
    backup?: string;
  };
  subtitle?: {
    qr?: string;
    verify?: string;
    backup?: string;
  };
  qrSize?: number;
  pinLength?: number;
}

export function TwoFactorSetup({
  currentStep,
  onStepChange: _onStepChange,
  qrCode,
  secret,
  onLoadQRCode: _onLoadQRCode,
  onEnable,
  verificationCode,
  onVerificationCodeChange,
  onVerify,
  backupCodes = [],
  onComplete,
  loading = false,
  error = null,
  onErrorDismiss,
  onCancel,
  title = {
    qr: 'Set up two-factor authentication',
    verify: 'Verify your authenticator',
    backup: 'Save your backup codes',
  },
  subtitle = {
    qr: 'Scan this QR code with your authenticator app (like Google Authenticator or Authy)',
    verify: 'Enter the 6-digit code from your authenticator app',
    backup:
      'Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.',
  },
  qrSize = 200,
  pinLength = 6,
}: TwoFactorSetupProps) {
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedItems(prev => new Set(prev).add(value));
    setTimeout(() => {
      setCopiedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(value);
        return newSet;
      });
    }, 2000);
  };

  if (currentStep === 'qr') {
    return (
      <Paper withBorder shadow="md" p={30} radius="md">
        <Stack align="center" gap="md">
          <IconShieldCheck size={50} color="var(--mantine-color-blue-6)" />

          <Title order={2} ta="center">
            {title.qr}
          </Title>

          <Text c="dimmed" size="sm" ta="center" maw={400}>
            {subtitle.qr}
          </Text>

          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
              w="100%"
              withCloseButton={!!onErrorDismiss}
              onClose={onErrorDismiss}
            >
              {error}
            </Alert>
          )}

          {qrCode ? (
            <Paper p="md" withBorder>
              <img src={qrCode} alt="Two-factor QR code" width={qrSize} height={qrSize} />
            </Paper>
          ) : (
            <Paper p={60} withBorder>
              <IconQrcode size={80} color="var(--mantine-color-gray-4)" />
            </Paper>
          )}

          {secret && (
            <Stack gap="xs" w="100%">
              <Text size="sm" c="dimmed" ta="center">
                Can't scan? Enter this code manually:
              </Text>
              <Group justify="center">
                <Code>{secret}</Code>
                <Tooltip label={copiedItems.has(secret) ? 'Copied' : 'Copy'}>
                  <ActionIcon
                    color={copiedItems.has(secret) ? 'teal' : 'gray'}
                    onClick={() => handleCopy(secret)}
                    variant="subtle"
                  >
                    {copiedItems.has(secret) ? <IconCheck size={16} /> : <IconCopy size={16} />}
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Stack>
          )}

          <Group mt="lg">
            {onCancel && (
              <Button variant="subtle" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button
              onClick={onEnable}
              loading={loading}
              disabled={!qrCode}
              data-testid="enable-2fa"
            >
              Continue
            </Button>
          </Group>
        </Stack>
      </Paper>
    );
  }

  if (currentStep === 'verify') {
    return (
      <Paper withBorder shadow="md" p={30} radius="md">
        <Stack align="center" gap="md">
          <IconKey size={50} color="var(--mantine-color-blue-6)" />

          <Title order={2} ta="center">
            {title.verify}
          </Title>

          <Text c="dimmed" size="sm" ta="center" maw={400}>
            {subtitle.verify}
          </Text>

          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
              w="100%"
              withCloseButton={!!onErrorDismiss}
              onClose={onErrorDismiss}
            >
              {error}
            </Alert>
          )}

          <PinInput
            length={pinLength}
            type="number"
            value={verificationCode}
            onChange={onVerificationCodeChange}
            size="lg"
            data-testid="2fa-code"
          />

          <Group mt="lg">
            {onCancel && (
              <Button variant="subtle" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button
              onClick={onVerify}
              loading={loading}
              disabled={verificationCode.length !== pinLength}
              data-testid="verify-2fa"
            >
              Verify
            </Button>
          </Group>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper withBorder shadow="md" p={30} radius="md">
      <Stack align="center" gap="md">
        <IconCheck size={50} color="var(--mantine-color-green-6)" />

        <Title order={2} ta="center">
          {title.backup}
        </Title>

        <Text c="dimmed" size="sm" ta="center" maw={400}>
          {subtitle.backup}
        </Text>

        <Paper p="md" withBorder w="100%">
          <Stack gap="xs">
            {backupCodes.map(code => (
              <Group key={code} justify="space-between">
                <Code>{code}</Code>
                <Tooltip label={copiedItems.has(code) ? 'Copied' : 'Copy'}>
                  <ActionIcon
                    color={copiedItems.has(code) ? 'teal' : 'gray'}
                    onClick={() => handleCopy(code)}
                    variant="subtle"
                    size="sm"
                  >
                    {copiedItems.has(code) ? <IconCheck size={14} /> : <IconCopy size={14} />}
                  </ActionIcon>
                </Tooltip>
              </Group>
            ))}
          </Stack>
        </Paper>

        <Alert icon={<IconAlertCircle size={16} />} variant="light" w="100%">
          Each backup code can only be used once. Store them securely!
        </Alert>

        <Button fullWidth onClick={onComplete} data-testid="complete-2fa-setup">
          I've saved my codes
        </Button>
      </Stack>
    </Paper>
  );
}
