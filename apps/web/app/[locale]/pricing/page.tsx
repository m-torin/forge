import { env } from '@/env';
import {
  Anchor,
  Box,
  Button,
  Center,
  Container,
  Grid,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconArrowRight, IconCheck, IconMinus, IconPhone } from '@tabler/icons-react';
import Link from 'next/link';

import type { Route } from 'next';

const Pricing = () => (
  <Box py={{ base: 80, lg: 160 }}>
    <Container size="xl">
      <Stack align="center" gap="lg">
        <Stack align="center" gap="sm" maw={600}>
          <Title order={2} fw={400} size="h1" ta="center">
            Prices that make sense!
          </Title>
          <Text c="dimmed" size="lg" ta="center">
            Managing a small business today is already tough.
          </Text>
        </Stack>

        <Grid
          style={{
            borderLeft: '1px solid var(--mantine-color-gray-3)',
            borderTop: '1px solid var(--mantine-color-gray-3)',
          }}
          gutter={0}
          mt={80}
        >
          <Grid.Col
            style={{
              borderBottom: '1px solid var(--mantine-color-gray-3)',
              borderRight: '1px solid var(--mantine-color-gray-3)',
            }}
            span={{ base: 12, lg: 3 }}
          />

          {/* Startup Plan */}
          <Grid.Col
            style={{
              borderBottom: '1px solid var(--mantine-color-gray-3)',
              borderRight: '1px solid var(--mantine-color-gray-3)',
            }}
            p={{ base: 12, md: 24 }}
            span={{ base: 4, lg: 3 }}
          >
            <Stack gap="sm">
              <Text fw={500} size="xl">
                Startup
              </Text>
              <Text c="dimmed" size="sm">
                Our goal is to streamline SMB trade, making it easier and faster than ever for
                everyone and everywhere.
              </Text>
              <Group align="baseline" gap="xs" mt={32}>
                <Text fw={500} size="36px">
                  $40
                </Text>
                <Text c="dimmed" size="sm">
                  /month
                </Text>
              </Group>
              <Anchor href={env.NEXT_PUBLIC_APP_URL as Route} component={Link} underline="never">
                <Button
                  fullWidth
                  rightSection={<IconArrowRight size={16} />}
                  mt={32}
                  variant="outline"
                >
                  Try it
                </Button>
              </Anchor>
            </Stack>
          </Grid.Col>

          {/* Growth Plan */}
          <Grid.Col
            style={{
              borderBottom: '1px solid var(--mantine-color-gray-3)',
              borderRight: '1px solid var(--mantine-color-gray-3)',
            }}
            p={{ base: 12, md: 24 }}
            span={{ base: 4, lg: 3 }}
          >
            <Stack gap="sm">
              <Text fw={500} size="xl">
                Growth
              </Text>
              <Text c="dimmed" size="sm">
                Our goal is to streamline SMB trade, making it easier and faster than ever for
                everyone and everywhere.
              </Text>
              <Group align="baseline" gap="xs" mt={32}>
                <Text fw={500} size="36px">
                  $40
                </Text>
                <Text c="dimmed" size="sm">
                  /month
                </Text>
              </Group>
              <Anchor href={env.NEXT_PUBLIC_APP_URL as Route} component={Link} underline="never">
                <Button fullWidth rightSection={<IconArrowRight size={16} />} mt={32}>
                  Try it
                </Button>
              </Anchor>
            </Stack>
          </Grid.Col>

          {/* Enterprise Plan */}
          <Grid.Col
            style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}
            p={{ base: 12, md: 24 }}
            span={{ base: 4, lg: 3 }}
          >
            <Stack gap="sm">
              <Text fw={500} size="xl">
                Enterprise
              </Text>
              <Text c="dimmed" size="sm">
                Our goal is to streamline SMB trade, making it easier and faster than ever for
                everyone and everywhere.
              </Text>
              <Group align="baseline" gap="xs" mt={32}>
                <Text fw={500} size="36px">
                  $40
                </Text>
                <Text c="dimmed" size="sm">
                  /month
                </Text>
              </Group>
              <Anchor href={'/contact' as Route} component={Link} underline="never">
                <Button fullWidth rightSection={<IconPhone size={16} />} mt={32} variant="outline">
                  Contact us
                </Button>
              </Anchor>
            </Stack>
          </Grid.Col>

          {/* Features Header */}
          <Grid.Col
            style={{
              borderBottom: '1px solid var(--mantine-color-gray-3)',
              borderRight: '1px solid var(--mantine-color-gray-3)',
            }}
            p={{ base: 12, md: 24 }}
            span={{ base: 12, lg: 3 }}
          >
            <Text fw={700}>Features</Text>
          </Grid.Col>
          <Grid.Col
            style={{
              borderBottom: '1px solid var(--mantine-color-gray-3)',
              borderRight: '1px solid var(--mantine-color-gray-3)',
            }}
            span={{ base: 4, lg: 3 }}
          />
          <Grid.Col
            style={{
              borderBottom: '1px solid var(--mantine-color-gray-3)',
              borderRight: '1px solid var(--mantine-color-gray-3)',
            }}
            span={{ base: 4, lg: 3 }}
          />
          <Grid.Col
            style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}
            span={{ base: 4, lg: 3 }}
          />

          {/* SSO */}
          <Grid.Col
            style={{
              borderBottom: '1px solid var(--mantine-color-gray-3)',
              borderRight: '1px solid var(--mantine-color-gray-3)',
            }}
            p={{ base: 12, md: 24 }}
            span={{ base: 12, lg: 3 }}
          >
            SSO
          </Grid.Col>
          <Grid.Col
            style={{
              borderBottom: '1px solid var(--mantine-color-gray-3)',
              borderRight: '1px solid var(--mantine-color-gray-3)',
            }}
            p={{ base: 4, md: 16 }}
            span={{ base: 4, lg: 3 }}
          >
            <Center>
              <IconCheck color="var(--mantine-color-blue-6)" size={16} />
            </Center>
          </Grid.Col>
          <Grid.Col
            style={{
              borderBottom: '1px solid var(--mantine-color-gray-3)',
              borderRight: '1px solid var(--mantine-color-gray-3)',
            }}
            p={{ base: 4, md: 16 }}
            span={{ base: 4, lg: 3 }}
          >
            <Center>
              <IconCheck color="var(--mantine-color-blue-6)" size={16} />
            </Center>
          </Grid.Col>
          <Grid.Col
            style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}
            p={{ base: 4, md: 16 }}
            span={{ base: 4, lg: 3 }}
          >
            <Center>
              <IconCheck color="var(--mantine-color-blue-6)" size={16} />
            </Center>
          </Grid.Col>

          {/* AI Assistant */}
          <Grid.Col
            style={{
              borderBottom: '1px solid var(--mantine-color-gray-3)',
              borderRight: '1px solid var(--mantine-color-gray-3)',
            }}
            p={{ base: 12, md: 24 }}
            span={{ base: 12, lg: 3 }}
          >
            AI Assistant
          </Grid.Col>
          <Grid.Col
            style={{
              borderBottom: '1px solid var(--mantine-color-gray-3)',
              borderRight: '1px solid var(--mantine-color-gray-3)',
            }}
            p={{ base: 4, md: 16 }}
            span={{ base: 4, lg: 3 }}
          >
            <Center>
              <IconMinus color="var(--mantine-color-gray-5)" size={16} />
            </Center>
          </Grid.Col>
          <Grid.Col
            style={{
              borderBottom: '1px solid var(--mantine-color-gray-3)',
              borderRight: '1px solid var(--mantine-color-gray-3)',
            }}
            p={{ base: 4, md: 16 }}
            span={{ base: 4, lg: 3 }}
          >
            <Center>
              <IconCheck color="var(--mantine-color-blue-6)" size={16} />
            </Center>
          </Grid.Col>
          <Grid.Col
            style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}
            p={{ base: 4, md: 16 }}
            span={{ base: 4, lg: 3 }}
          >
            <Center>
              <IconCheck color="var(--mantine-color-blue-6)" size={16} />
            </Center>
          </Grid.Col>

          {/* Version Control */}
          <Grid.Col
            style={{
              borderBottom: '1px solid var(--mantine-color-gray-3)',
              borderRight: '1px solid var(--mantine-color-gray-3)',
            }}
            p={{ base: 12, md: 24 }}
            span={{ base: 12, lg: 3 }}
          >
            Version Control
          </Grid.Col>
          <Grid.Col
            style={{
              borderBottom: '1px solid var(--mantine-color-gray-3)',
              borderRight: '1px solid var(--mantine-color-gray-3)',
            }}
            p={{ base: 4, md: 16 }}
            span={{ base: 4, lg: 3 }}
          >
            <Center>
              <IconMinus color="var(--mantine-color-gray-5)" size={16} />
            </Center>
          </Grid.Col>
          <Grid.Col
            style={{
              borderBottom: '1px solid var(--mantine-color-gray-3)',
              borderRight: '1px solid var(--mantine-color-gray-3)',
            }}
            p={{ base: 4, md: 16 }}
            span={{ base: 4, lg: 3 }}
          >
            <Center>
              <IconCheck color="var(--mantine-color-blue-6)" size={16} />
            </Center>
          </Grid.Col>
          <Grid.Col
            style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}
            p={{ base: 4, md: 16 }}
            span={{ base: 4, lg: 3 }}
          >
            <Center>
              <IconCheck color="var(--mantine-color-blue-6)" size={16} />
            </Center>
          </Grid.Col>

          {/* Members */}
          <Grid.Col
            style={{
              borderBottom: '1px solid var(--mantine-color-gray-3)',
              borderRight: '1px solid var(--mantine-color-gray-3)',
            }}
            p={{ base: 12, md: 24 }}
            span={{ base: 12, lg: 3 }}
          >
            Members
          </Grid.Col>
          <Grid.Col
            style={{
              borderBottom: '1px solid var(--mantine-color-gray-3)',
              borderRight: '1px solid var(--mantine-color-gray-3)',
            }}
            p={{ base: 4, md: 16 }}
            span={{ base: 4, lg: 3 }}
          >
            <Center>
              <Text c="dimmed" size="sm">
                5 members
              </Text>
            </Center>
          </Grid.Col>
          <Grid.Col
            style={{
              borderBottom: '1px solid var(--mantine-color-gray-3)',
              borderRight: '1px solid var(--mantine-color-gray-3)',
            }}
            p={{ base: 4, md: 16 }}
            span={{ base: 4, lg: 3 }}
          >
            <Center>
              <Text c="dimmed" size="sm">
                25 members
              </Text>
            </Center>
          </Grid.Col>
          <Grid.Col
            style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}
            p={{ base: 4, md: 16 }}
            span={{ base: 4, lg: 3 }}
          >
            <Center>
              <Text c="dimmed" size="sm">
                100+ members
              </Text>
            </Center>
          </Grid.Col>

          {/* Multiplayer Mode */}
          <Grid.Col
            style={{
              borderBottom: '1px solid var(--mantine-color-gray-3)',
              borderRight: '1px solid var(--mantine-color-gray-3)',
            }}
            p={{ base: 12, md: 24 }}
            span={{ base: 12, lg: 3 }}
          >
            Multiplayer Mode
          </Grid.Col>
          <Grid.Col
            style={{
              borderBottom: '1px solid var(--mantine-color-gray-3)',
              borderRight: '1px solid var(--mantine-color-gray-3)',
            }}
            p={{ base: 4, md: 16 }}
            span={{ base: 4, lg: 3 }}
          >
            <Center>
              <IconMinus color="var(--mantine-color-gray-5)" size={16} />
            </Center>
          </Grid.Col>
          <Grid.Col
            style={{
              borderBottom: '1px solid var(--mantine-color-gray-3)',
              borderRight: '1px solid var(--mantine-color-gray-3)',
            }}
            p={{ base: 4, md: 16 }}
            span={{ base: 4, lg: 3 }}
          >
            <Center>
              <IconCheck color="var(--mantine-color-blue-6)" size={16} />
            </Center>
          </Grid.Col>
          <Grid.Col
            style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}
            p={{ base: 4, md: 16 }}
            span={{ base: 4, lg: 3 }}
          >
            <Center>
              <IconCheck color="var(--mantine-color-blue-6)" size={16} />
            </Center>
          </Grid.Col>

          {/* Orchestration */}
          <Grid.Col
            style={{ borderRight: '1px solid var(--mantine-color-gray-3)' }}
            p={{ base: 12, md: 24 }}
            span={{ base: 12, lg: 3 }}
          >
            Orchestration
          </Grid.Col>
          <Grid.Col
            style={{ borderRight: '1px solid var(--mantine-color-gray-3)' }}
            p={{ base: 4, md: 16 }}
            span={{ base: 4, lg: 3 }}
          >
            <Center>
              <IconMinus color="var(--mantine-color-gray-5)" size={16} />
            </Center>
          </Grid.Col>
          <Grid.Col
            style={{ borderRight: '1px solid var(--mantine-color-gray-3)' }}
            p={{ base: 4, md: 16 }}
            span={{ base: 4, lg: 3 }}
          >
            <Center>
              <IconCheck color="var(--mantine-color-blue-6)" size={16} />
            </Center>
          </Grid.Col>
          <Grid.Col p={{ base: 4, md: 16 }} span={{ base: 4, lg: 3 }}>
            <Center>
              <IconCheck color="var(--mantine-color-blue-6)" size={16} />
            </Center>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  </Box>
);

export default Pricing;
