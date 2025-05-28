import { env } from '@/env';
import { Anchor, Box, Container, Divider, Grid, Group, Stack, Text, Title } from '@mantine/core';
import Link from 'next/link';

import { Status } from '@repo/observability/status';

import type { Route } from 'next';

export const Footer = () => {
  const navigationItems = [
    {
      description: '',
      href: '/',
      title: 'Home',
    },
    {
      description: 'Managing a small business today is already tough.',
      items: [
        {
          href: '/blog',
          title: 'Blog',
        },
      ],
      title: 'Pages',
    },
    {
      description: 'We stay on top of the latest legal requirements.',
      items: [
        {
          href: '/legal/privacy',
          title: 'Privacy Policy',
        },
        {
          href: '/legal/terms',
          title: 'Terms of Service',
        },
      ],
      title: 'Legal',
    },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <Box w="100%">
      <Container size="lg">
        <Grid style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }} gutter="xl" py="xl">
          {navigationItems.map((item) => (
            <Grid.Col key={item.title} span={{ base: 12, lg: 3, sm: 6 }}>
              <Stack align="flex-start" gap="xs">
                <Text fw={500} size="sm">
                  {item.title}
                </Text>
                <Text c="dimmed" size="sm">
                  {item.description}
                </Text>
                {item.items && (
                  <Stack align="flex-start" gap={4}>
                    {item.items.map((subItem) => (
                      <Anchor
                        key={subItem.title}
                        href={subItem.href as Route}
                        component={Link}
                        style={{
                          '&:hover': { textDecoration: 'underline' },
                        }}
                        c="dimmed"
                        size="sm"
                        td="none"
                      >
                        {subItem.title}
                      </Anchor>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Grid.Col>
          ))}
          <Grid.Col span={{ base: 12, lg: 3, sm: 6 }}>
            <Stack align="flex-start" gap="xs">
              <Text fw={500} size="sm">
                Subscribe
              </Text>
              <Text c="dimmed" size="sm">
                Subscribe to our newsletter to hear about new features as soon as they are released.
              </Text>
            </Stack>
          </Grid.Col>
        </Grid>

        <Divider
          styles={{
            root: {
              borderImage:
                'linear-gradient(to right, transparent, var(--mantine-color-gray-3), transparent) 1',
            },
          }}
          my="xl"
        />

        <Group align="center" justify="space-between" mb="xl" wrap="wrap">
          <Title order={3} style={{ letterSpacing: '-0.05em' }} fw={400}>
            Forge
            <Text c="blue" inherit span>
              ahead
            </Text>
            <Text c="dimmed" inherit span>
              .run
            </Text>
          </Title>

          <Group align="center" gap="md">
            <Anchor
              href={env.BETTERSTACK_URL || '#'}
              style={{ alignItems: 'center', display: 'flex', gap: '4px' }}
              c="dimmed"
              size="xs"
            >
              <Status /> Status
            </Anchor>
            <Text c="dimmed" size="xs">
              &copy; {currentYear} Forgeahead. All rights reserved.
            </Text>
          </Group>
        </Group>
      </Container>
    </Box>
  );
};
