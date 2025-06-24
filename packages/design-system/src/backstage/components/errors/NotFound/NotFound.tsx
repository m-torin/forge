'use client';

import { Container, Title, Text, Button, Group, Paper, Center } from '@mantine/core';
import { IconError404 } from '@tabler/icons-react';

export interface NotFoundProps {
  homeUrl?: string;
  homeLabel?: string;
}

export function NotFound({ homeUrl = '/', homeLabel = 'Back to Dashboard' }: NotFoundProps = {}) {
  return (
    <Container size="sm" py="xl">
      <Center>
        <Paper shadow="md" p="xl" radius="md" style={{ maxWidth: 500, width: '100%' }}>
          <Center mb="lg">
            <IconError404 size={120} color="gray" />
          </Center>

          <Title order={1} ta="center" mb="md">
            404 - Page Not Found
          </Title>

          <Text ta="center" c="dimmed" mb="xl">
            The page you're looking for doesn't exist or has been moved.
          </Text>

          <Group justify="center">
            <Button component="a" href={homeUrl} variant="filled">
              {homeLabel}
            </Button>
          </Group>
        </Paper>
      </Center>
    </Container>
  );
}
