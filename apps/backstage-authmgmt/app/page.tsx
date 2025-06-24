'use client';

import { Container, Title, Text, Stack } from '@mantine/core';

export default function AuthMgmtPage() {
  return (
    <Container size="md">
      <Stack gap="md">
        <Title order={2}>Authentication Management</Title>
        <Text>Welcome to the Backstage Auth Management application.</Text>
        <Text c="dimmed">Running on port 3302</Text>
      </Stack>
    </Container>
  );
}