'use client';

import Link from 'next/link';
import { Container, Title, Text, Button, Stack } from '@mantine/core';

export default function About() {
  return (
    <Container size="md">
      <Stack gap="md">
        <Title order={2}>About</Title>
        <Text>This is the about page for the backstage admin system.</Text>
        <Button component={Link} href="/" variant="light">
          Go Back
        </Button>
      </Stack>
    </Container>
  );
}
