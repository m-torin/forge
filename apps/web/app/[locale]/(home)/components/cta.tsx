import { env } from '@/env';
import { Box, Button, Container, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { IconArrowRight, IconPhone } from '@tabler/icons-react';
import Link from 'next/link';

import type { Dictionary } from '@repo/internationalization';
import type { Route } from 'next';

interface CTAProps {
  dictionary: Dictionary;
}

export const CTA = ({ dictionary }: CTAProps) => (
  <Box py={{ base: 40, lg: 80 }} w="100%">
    <Container size="xl">
      <Paper bg="gray.0" p={{ base: 'md', lg: 56 }} radius="md">
        <Stack align="center" gap="xl" ta="center">
          <Stack gap="xs">
            <Title order={3} style={{ letterSpacing: '-0.05em' }} fw={400} maw={600} size="h1">
              {dictionary.web.home.cta.title}
            </Title>
            <Text style={{ lineHeight: 1.6 }} c="dimmed" maw={600} size="lg">
              {dictionary.web.home.cta.description}
            </Text>
          </Stack>
          <Group gap="sm">
            <Button
              href="/contact"
              component={Link}
              leftSection={<IconPhone size={16} />}
              variant="default"
            >
              {dictionary.web.global.primaryCta}
            </Button>
            <Button
              href={env.NEXT_PUBLIC_APP_URL as Route}
              component={Link}
              rightSection={<IconArrowRight size={16} />}
            >
              {dictionary.web.global.secondaryCta}
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Container>
  </Box>
);
