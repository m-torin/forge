'use client';

import { Button, Center, Container, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { IconShieldX } from '@tabler/icons-react';
import React from 'react';

export default function UnauthorizedPage() {
  return (
    <Center style={{ minHeight: '100vh' }}>
      <Container size="sm">
        <Paper shadow="md" withBorder p="xl" radius="md">
          <Stack align="center" gap="lg">
            <IconShieldX color="var(--mantine-color-red-6)" size={48} />

            <Stack align="center" gap="xs">
              <Title order={2}>Unauthorized Access</Title>
              <Text c="dimmed">You don't have permission to access this area</Text>
            </Stack>

            <Text c="dimmed" size="sm" ta="center">
              This area is restricted to administrators only. If you believe you should have access,
              please contact your system administrator.
            </Text>

            <Group gap="sm">
              <Button onClick={() => window.history.back()}>Go Back</Button>
              <Button onClick={() => (window.location.href = '/')} variant="outline">
                Home
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Container>
    </Center>
  );
}
