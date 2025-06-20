'use client';

import { Card, Title, Text, Button, TextInput, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconMail, IconCheck } from '@tabler/icons-react';
import { authClient } from '@repo/auth/client/next';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { logger } from '@/lib/logger';

export function MagicLinkSection() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const form = useForm({
    initialValues: {
      email: '',
    },
    validate: {
      email: (value) => {
        if (!value) return 'Email is required';
        if (!/^\S+@\S+$/.test(value)) return 'Invalid email';
        return null;
      },
    },
  });

  const handleSendMagicLink = async (values: { email: string }) => {
    try {
      setSending(true);

      await authClient.signIn.magicLink({
        email: values.email,
        callbackURL: window.location.origin,
      });

      setSent(true);
      notifications.show({
        title: 'Magic link sent!',
        message: 'Check your email for the login link.',
        color: 'green',
        icon: <IconCheck size={16} />,
      });

      // Reset after 60 seconds
      setTimeout(() => {
        setSent(false);
        form.reset();
      }, 60000);
    } catch (_error) {
      logger.error('Failed to send magic link', _error);
      notifications.show({
        title: 'Error',
        message: 'Failed to send magic link. Please try again.',
        color: 'red',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card shadow="sm" radius="md" withBorder>
      <Title order={3} mb="md">
        Magic Link Login
      </Title>
      <Text size="sm" color="dimmed" mb="lg">
        Get a secure login link sent to your email - no password needed
      </Text>

      {!sent ? (
        <form onSubmit={form.onSubmit(handleSendMagicLink)}>
          <Stack gap="md">
            <TextInput
              label="Email address"
              placeholder="your@email.com"
              leftSection={<IconMail size={16} />}
              {...form.getInputProps('email')}
              disabled={sending}
            />

            <Button type="submit" loading={sending} leftSection={<IconMail size={16} />}>
              Send magic link
            </Button>
          </Stack>
        </form>
      ) : (
        <Card bg="green.1" p="md">
          <Stack gap="sm" align="center">
            <IconCheck size={48} className="text-green-600" />
            <Text fw={500}>Check your email!</Text>
            <Text size="sm" color="dimmed" ta="center">
              We've sent a magic link to your email address. Click the link to log in securely.
            </Text>
            <Text size="xs" color="dimmed">
              Link expires in 15 minutes
            </Text>
          </Stack>
        </Card>
      )}
    </Card>
  );
}
