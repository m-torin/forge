import { Box, Container, Grid, Paper, Stack, Text, Title } from '@mantine/core';
import { IconUser } from '@tabler/icons-react';

import type { Dictionary } from '@repo/internationalization';

interface FeaturesProps {
  dictionary: Dictionary;
}

export const Features = ({ dictionary }: FeaturesProps) => (
  <Box py={{ base: 40, lg: 80 }} w="100%">
    <Container size="xl">
      <Stack gap="xl">
        <Stack align="flex-start" gap="sm">
          <Stack gap="xs">
            <Title order={2} style={{ letterSpacing: '-0.05em' }} fw={400} maw={600} size="h1">
              {dictionary.web.home.features.title}
            </Title>
            <Text style={{ lineHeight: 1.6 }} c="dimmed" maw={{ base: 600, lg: 400 }} size="lg">
              {dictionary.web.home.features.description}
            </Text>
          </Stack>
        </Stack>
        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, lg: 8, sm: 12 }}>
            <Paper style={{ aspectRatio: 'auto' }} bg="gray.0" h="100%" p="xl" radius="md">
              <Stack h="100%" justify="space-between">
                <IconUser stroke={1} size={32} />
                <Stack gap="xs">
                  <Title order={3} style={{ letterSpacing: '-0.025em' }} fw={400} size="h4">
                    {dictionary.web.home.features.items[0].title}
                  </Title>
                  <Text c="dimmed" maw={300}>
                    {dictionary.web.home.features.items[0].description}
                  </Text>
                </Stack>
              </Stack>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 4, sm: 6 }}>
            <Paper style={{ aspectRatio: '1' }} bg="gray.0" h="100%" p="xl" radius="md">
              <Stack h="100%" justify="space-between">
                <IconUser stroke={1} size={32} />
                <Stack gap="xs">
                  <Title order={3} style={{ letterSpacing: '-0.025em' }} fw={400} size="h4">
                    {dictionary.web.home.features.items[1].title}
                  </Title>
                  <Text c="dimmed" maw={300}>
                    {dictionary.web.home.features.items[1].description}
                  </Text>
                </Stack>
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 4, sm: 6 }}>
            <Paper style={{ aspectRatio: '1' }} bg="gray.0" h="100%" p="xl" radius="md">
              <Stack h="100%" justify="space-between">
                <IconUser stroke={1} size={32} />
                <Stack gap="xs">
                  <Title order={3} style={{ letterSpacing: '-0.025em' }} fw={400} size="h4">
                    {dictionary.web.home.features.items[2].title}
                  </Title>
                  <Text c="dimmed" maw={300}>
                    {dictionary.web.home.features.items[2].description}
                  </Text>
                </Stack>
              </Stack>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 8, sm: 12 }}>
            <Paper style={{ aspectRatio: 'auto' }} bg="gray.0" h="100%" p="xl" radius="md">
              <Stack h="100%" justify="space-between">
                <IconUser stroke={1} size={32} />
                <Stack gap="xs">
                  <Title order={3} style={{ letterSpacing: '-0.025em' }} fw={400} size="h4">
                    {dictionary.web.home.features.items[3].title}
                  </Title>
                  <Text c="dimmed" maw={300}>
                    {dictionary.web.home.features.items[3].description}
                  </Text>
                </Stack>
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  </Box>
);
