import { Box, Container, Grid, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { IconArrowDownLeft, IconArrowUpRight } from '@tabler/icons-react';

import type { Dictionary } from '@repo/internationalization';

interface StatsProps {
  dictionary: Dictionary;
}

export const Stats = ({ dictionary }: StatsProps) => (
  <Box py={{ base: 40, lg: 80 }} w="100%">
    <Container size="xl">
      <Grid gutter={{ base: 40, lg: 60 }}>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <Stack gap="md">
            <Title order={2} fw={400} maw={{ lg: 600 }} size="h1">
              {dictionary.web.home.stats.title}
            </Title>
            <Text c="dimmed" maw={{ lg: 400 }} size="lg">
              {dictionary.web.home.stats.description}
            </Text>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <Grid gutter="sm">
            {dictionary.web.home.stats.items.map((item, index) => (
              <Grid.Col key={index} span={{ base: 12, sm: 6 }}>
                <Paper withBorder h="100%" p="xl" radius="md">
                  <Stack h="100%" justify="space-between">
                    <Box>
                      {Number.parseFloat(item.delta) > 0 ? (
                        <IconArrowUpRight
                          style={{ color: 'var(--mantine-color-blue-6)' }}
                          size={16}
                        />
                      ) : (
                        <IconArrowDownLeft
                          style={{ color: 'var(--mantine-color-red-6)' }}
                          size={16}
                        />
                      )}
                    </Box>
                    <Box>
                      <Group align="flex-end" gap="xs" mb="xs">
                        <Title order={2} fw={400} size="h1">
                          {item.type === 'currency' && '$'}
                          {new Intl.NumberFormat().format(Number.parseFloat(item.metric))}
                        </Title>
                        <Text c="dimmed" size="sm">
                          {Number.parseFloat(item.delta) > 0 ? '+' : ''}
                          {item.delta}%
                        </Text>
                      </Group>
                      <Text c="dimmed">{item.title}</Text>
                    </Box>
                  </Stack>
                </Paper>
              </Grid.Col>
            ))}
          </Grid>
        </Grid.Col>
      </Grid>
    </Container>
  </Box>
);
