import { env } from '@/env';
import { Box, Button, Container, Group, Stack, Text, Title } from '@mantine/core';
import { IconArrowRight, IconPhone } from '@tabler/icons-react';
import Link from 'next/link';

import type { Dictionary } from '@repo/internationalization';
import type { Route } from 'next';

interface HeroProps {
  dictionary: Dictionary;
}

export const Hero = async ({ dictionary }: HeroProps) => (
  <Box w="100%">
    <Container size="xl">
      <Stack align="center" gap="xl" justify="center" py={{ base: 40, lg: 80 }}>
        <Box>
          <Button
            href={'/blog/hello-world' as Route}
            component={Link}
            rightSection={<IconArrowRight size={16} />}
            size="sm"
            variant="light"
          >
            {dictionary.web.home.hero.announcement}
          </Button>
        </Box>
        <Stack align="center" gap="md">
          <Title
            order={1}
            style={{ letterSpacing: '-0.05em' }}
            fw={400}
            maw={800}
            size="4rem"
            ta="center"
          >
            {dictionary.web.home.meta.title}
          </Title>
          <Text c="dimmed" maw={800} size="xl" ta="center">
            {dictionary.web.home.meta.description}
          </Text>
        </Stack>
        <Group gap="sm">
          <Button leftSection={<IconPhone size={16} />} size="lg" variant="default">
            {dictionary.web.global.primaryCta}
          </Button>
          <Button
            href={`mailto:hello@${env.VERCEL_PROJECT_PRODUCTION_URL}`}
            component={Link}
            rightSection={<IconArrowRight size={16} />}
            size="lg"
          >
            {dictionary.web.global.secondaryCta}
          </Button>
        </Group>
      </Stack>
    </Container>
  </Box>
);
