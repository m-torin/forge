'use client';

import { Container, Title, Text, Stack } from '@mantine/core';

export default function CMSPage() {
  return (
    <Container size="md">
      <Stack gap="md">
        <Title order={2}>Content Management System</Title>
        <Text>Welcome to the Backstage CMS application.</Text>
        <Text c="dimmed">Running on port 3301</Text>
      </Stack>
    </Container>
  );
}
