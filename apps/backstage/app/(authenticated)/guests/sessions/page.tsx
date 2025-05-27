'use client';

import { Alert, Card, Grid, Stack, Text, Title } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import React from 'react';

export default function SessionsPage() {
  return (
    <Stack gap="lg">
      <div>
        <Title order={1}>Session Management</Title>
        <Text c="dimmed">View and manage active user sessions</Text>
      </div>

      <Alert icon={<IconInfoCircle size={16} />} variant="light">
        Session management is handled on a per-user basis. Select a user from the Users page to view
        and manage their sessions.
      </Alert>

      <Card shadow="sm" withBorder radius="md">
        <Card.Section withBorder inheritPadding py="xs">
          <Title order={3}>Session Overview</Title>
          <Text c="dimmed" size="sm">
            Quick stats about active sessions
          </Text>
        </Card.Section>

        <Card.Section inheritPadding py="md">
          <Grid>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Stack gap="xs">
                <Text c="dimmed" fw={500} size="sm">
                  Total Active Sessions
                </Text>
                <Text fw="bold" size="xl">
                  -
                </Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Stack gap="xs">
                <Text c="dimmed" fw={500} size="sm">
                  Unique Users
                </Text>
                <Text fw="bold" size="xl">
                  -
                </Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Stack gap="xs">
                <Text c="dimmed" fw={500} size="sm">
                  Impersonated Sessions
                </Text>
                <Text fw="bold" size="xl">
                  -
                </Text>
              </Stack>
            </Grid.Col>
          </Grid>
        </Card.Section>
      </Card>
    </Stack>
  );
}
