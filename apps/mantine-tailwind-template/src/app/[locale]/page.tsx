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
import { ColorSchemesSwitcher } from '../../components/color-schemes-switcher';
import { LanguageSwitcher } from '../../components/language-switcher';
import { getDictionary, type Locale } from '../../lib/i18n';

export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <AppShell header={{ height: 70 }} padding="md">
      <AppShellHeader>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <IconBrandNextjs size={32} />
            <Text fw={700} size="lg">
              {dict.header.title}
            </Text>
          </Group>
          <Group gap="sm">
            <LanguageSwitcher currentLocale={locale} />
            <ColorSchemesSwitcher />
          </Group>
        </Group>
      </AppShellHeader>

      <AppShellMain>
        <Container size="md" py="xl">
          <Stack align="center" gap="xl">
            <Title order={1} ta="center" size="3rem">
              {dict.home.welcome}{' '}
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
              {dict.home.description}
            </Text>

            <Group gap="lg" mt="xl">
              <Card withBorder p="md" radius="md" className="flex items-center gap-3">
                <IconBrandNextjs size={24} />
                <div>
                  <Text fw={600}>{dict.home.features.nextjs.title}</Text>
                  <Text size="sm" c="dimmed">
                    {dict.home.features.nextjs.description}
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
                  <Text fw={600}>{dict.home.features.mantine.title}</Text>
                  <Text size="sm" c="dimmed">
                    {dict.home.features.mantine.description}
                  </Text>
                </div>
              </Card>

              <Card withBorder p="md" radius="md" className="flex items-center gap-3">
                <IconBrandTailwind size={24} className="text-cyan-500" />
                <div>
                  <Text fw={600}>{dict.home.features.tailwind.title}</Text>
                  <Text size="sm" c="dimmed">
                    {dict.home.features.tailwind.description}
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