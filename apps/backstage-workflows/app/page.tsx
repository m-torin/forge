'use client';

import { Container, Title, Text, Stack } from '@mantine/core';

export default function WorkflowsPage() {
  return (
    <Container size="md">
      <Stack gap="md">
        <Title order={2}>Workflow Management</Title>
        <Text>Welcome to the Backstage Workflows application.</Text>
        <Text c="dimmed">Running on port 3303</Text>
      </Stack>
    </Container>
  );
}