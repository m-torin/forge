'use client';

import Link from 'next/link';
import { Container, Title, Text, Button, Group, Stack, Card } from '@mantine/core';
import Header from '../components/Header';

export default function Home() {
  return (
    <Container size="md">
      <Header />
      <Stack gap="lg" mt="xl">
        <Title order={2}>Admin Dashboard</Title>
        <Text>Welcome to the backstage admin dashboard. This is the main hub for all administrative functions.</Text>
        
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={3} mb="md">Available Modules</Title>
          <Group>
            <Button component="a" href="/cms" variant="light">
              Content Management
            </Button>
            <Button component="a" href="/authmgmt" variant="light">
              Auth Management
            </Button>
            <Button component="a" href="/workflows" variant="light">
              Workflows
            </Button>
            <Button component={Link} href="/about" variant="light">
              About
            </Button>
          </Group>
        </Card>
      </Stack>
    </Container>
  );
}