'use client';

import { Button, Paper, PasswordInput, Stack, TextInput } from '@mantine/core';
import { useState } from 'react';

import { signUp } from '@repo/auth/client';

export const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signUp.email({
        name,
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
            onChange={(e) => setName(e.currentTarget.value)}
            placeholder="Your name"
            label="Name"
            required
            value={name}
          />
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
            placeholder="Create a password"
            label="Password"
            required
            value={password}
          />
          <Button fullWidth loading={isLoading} type="submit">
            Sign up
          </Button>
        </Stack>
      </form>
    </Paper>
  );
};
