'use client';

import React, { useState } from 'react';
import {
  Button,
  Card,
  Container,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconLock, IconMail } from '@tabler/icons-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .refine((email) => {
      // Allow localhost emails for development
      if (email.includes('@localhost')) {
        return /^[^\s@]+@localhost$/.test(email);
      }
      // Use standard email validation for others
      return z.string().email().safeParse(email).success;
    }, 'Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const redirectTo = searchParams.get('from') || '/';

  const form = useForm<LoginForm>({
    validate: zodResolver(loginSchema),
    initialValues: {
      email: '',
      password: '',
    },
  });

  const handleLogin = async (values: LoginForm) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/sign-in/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: 'Logged in successfully!',
          color: 'green',
        });

        // Redirect to the intended page or dashboard
        router.push(redirectTo as any);
      } else {
        notifications.show({
          title: 'Login Failed',
          message: result.error || 'Invalid email or password',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      notifications.show({
        title: 'Error',
        message: 'An error occurred during login',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="xs" py="xl">
      <Stack gap="xl" align="center">
        <Stack gap="xs" align="center">
          <Title order={1}>Backstage Admin</Title>
          <Text c="dimmed" ta="center">
            Sign in to access the administration panel
          </Text>
        </Stack>

        <Paper w="100%" p="xl" shadow="md" radius="md">
          <form onSubmit={form.onSubmit(handleLogin)}>
            <Stack gap="md">
              <TextInput
                label="Email"
                placeholder="admin@example.com"
                leftSection={<IconMail size={16} />}
                required
                {...form.getInputProps('email')}
              />

              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                leftSection={<IconLock size={16} />}
                required
                {...form.getInputProps('password')}
              />

              <Button type="submit" fullWidth loading={loading} size="md">
                Sign In
              </Button>
            </Stack>
          </form>
        </Paper>

        <Card w="100%" p="md" bg="blue.0" radius="md">
          <Group gap="xs">
            <IconAlertCircle size={16} color="var(--mantine-color-blue-7)" />
            <Text size="sm" c="blue.7" fw={500}>
              Development Credentials
            </Text>
          </Group>
          <Text size="sm" c="dimmed" mt="xs">
            Email: <strong>admin@example.com</strong>
            <br />
            Password: <strong>admin123</strong>
          </Text>
        </Card>
      </Stack>
    </Container>
  );
}
