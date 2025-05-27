'use client';

import { Button, Paper, PasswordInput, Stack, TextInput } from '@mantine/core';
import { useState } from 'react';

import { signIn } from '@repo/auth/client';

export const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn.email({
        email,
        password,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper withBorder p="xl" radius="md">
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            onChange={(e) => setEmail(e.currentTarget.value)}
            placeholder="your@email.com"
            label="Email"
            required
            type="email"
            value={email}
          />
          <PasswordInput
            onChange={(e) => setPassword(e.currentTarget.value)}
            placeholder="Your password"
            label="Password"
            required
            value={password}
          />
          <Button fullWidth loading={isLoading} type="submit">
            Sign in
          </Button>
        </Stack>
      </form>
    </Paper>
  );
};
