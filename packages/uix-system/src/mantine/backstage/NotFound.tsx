import { Button, Container, Text, Title } from '@mantine/core';
import { IconError404 } from '@tabler/icons-react';
import Link from 'next/link';

interface NotFoundProps {
  title?: string;
  message?: string;
  homeUrl?: string;
  homeLabel?: string;
}

export function NotFound({
  title = 'Page not found',
  message = 'The page you are looking for does not exist',
  homeUrl = '/',
  homeLabel = 'Back to Home',
}: NotFoundProps) {
  return (
    <Container size="sm" py="xl">
      <div style={{ textAlign: 'center' }}>
        <IconError404
          size={120}
          color="var(--mantine-color-dimmed)"
          style={{ margin: '0 auto', display: 'block' }}
        />
        <Title order={1} mt="xl" c="bright">
          {title}
        </Title>
        <Text c="dimmed" size="lg" mt="md">
          {message}
        </Text>
        <Button component={Link} href={homeUrl as any} size="lg" mt="xl">
          {homeLabel}
        </Button>
      </div>
    </Container>
  );
}
