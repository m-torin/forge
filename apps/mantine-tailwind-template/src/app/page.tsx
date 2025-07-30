import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  Card,
  Container,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconBrandNextjs, IconBrandTailwind } from '@tabler/icons-react';
import { ColorSchemesSwitcher } from '../components/color-schemes-switcher';

export default function Home() {
  return (
    <AppShell header={{ height: 70 }} padding="md">
      <AppShellHeader>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <IconBrandNextjs size={32} />
            <Text fw={700} size="lg">
              Mantine + Tailwind
            </Text>
          </Group>
          <ColorSchemesSwitcher />
        </Group>
      </AppShellHeader>

      <AppShellMain>
        <Container size="md" py="xl">
          <Stack align="center" gap="xl">
            <Title order={1} ta="center" size="3rem">
              Welcome to{' '}
              <Text
                inherit
                variant="gradient"
                component="span"
                gradient={{ from: 'pink', to: 'yellow' }}
              >
                Mantine
              </Text>{' '}
              +{' '}
              <Text
                inherit
                variant="gradient"
                component="span"
                gradient={{ from: 'blue', to: 'cyan' }}
              >
                Tailwind
              </Text>
            </Title>

            <Text ta="center" size="lg" maw={600} c="dimmed">
              A modern Next.js template combining the power of Mantine UI components with Tailwind
              CSS utilities. Get started by editing this page.
            </Text>

            <Group gap="lg" mt="xl">
              <Card withBorder p="md" radius="md" className="flex items-center gap-3">
                <IconBrandNextjs size={24} />
                <div>
                  <Text fw={600}>Next.js 15</Text>
                  <Text size="sm" c="dimmed">
                    React framework
                  </Text>
                </div>
              </Card>

              <Card withBorder p="md" radius="md" className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-500">
                  <Text c="white" size="xs" fw={700}>
                    M
                  </Text>
                </div>
                <div>
                  <Text fw={600}>Mantine v8</Text>
                  <Text size="sm" c="dimmed">
                    React components
                  </Text>
                </div>
              </Card>

              <Card withBorder p="md" radius="md" className="flex items-center gap-3">
                <IconBrandTailwind size={24} className="text-cyan-500" />
                <div>
                  <Text fw={600}>Tailwind CSS</Text>
                  <Text size="sm" c="dimmed">
                    Utility classes
                  </Text>
                </div>
              </Card>
            </Group>
          </Stack>
        </Container>
      </AppShellMain>
    </AppShell>
  );
}
