'use client';

import { Card, Container, Grid, Stack, Text, Title } from '@mantine/core';
import Link from 'next/link';

export default function HomePage() {
  return (
    <Container py="xl" size="lg">
      <Stack align="center" gap="xl">
        <Title order={1}>Admin Dashboard</Title>

        <Grid style={{ width: '100%' }} gutter="lg">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card
              href="/guests"
              component={Link}
              shadow="sm"
              withBorder
              style={{ cursor: 'pointer', textDecoration: 'none' }}
              padding="lg"
              radius="md"
            >
              <Title order={3} mb="xs">
                User Management
              </Title>
              <Text c="dimmed">Manage user accounts, roles, and permissions</Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card
              href="/guests/organizations"
              component={Link}
              shadow="sm"
              withBorder
              style={{ cursor: 'pointer', textDecoration: 'none' }}
              padding="lg"
              radius="md"
            >
              <Title order={3} mb="xs">
                Organizations
              </Title>
              <Text c="dimmed">Manage organizations and their settings</Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card
              href="/guests/api-keys"
              component={Link}
              shadow="sm"
              withBorder
              style={{ cursor: 'pointer', textDecoration: 'none' }}
              padding="lg"
              radius="md"
            >
              <Title order={3} mb="xs">
                API Keys
              </Title>
              <Text c="dimmed">Manage API keys for integrations</Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card
              href="/guests/sessions"
              component={Link}
              shadow="sm"
              withBorder
              style={{ cursor: 'pointer', textDecoration: 'none' }}
              padding="lg"
              radius="md"
            >
              <Title order={3} mb="xs">
                Sessions
              </Title>
              <Text c="dimmed">View and manage active user sessions</Text>
            </Card>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
