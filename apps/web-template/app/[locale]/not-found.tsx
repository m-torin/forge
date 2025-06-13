import { Button, Container, Group, Stack, Text, Title } from '@mantine/core';
import { IconHome } from '@tabler/icons-react';
import Link from 'next/link';

import { GoBackButton } from '@/components/GoBackButton';
import { getDictionary } from '@/i18n';

export default async function LocaleNotFound({ params }: { params?: Promise<{ locale: string }> }) {
  // Handle case where params might be undefined in not-found context
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || 'en';
  const dict = await getDictionary(locale);

  return (
    <Container
      size="md"
      style={{
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <Stack ta="center" gap="xl">
        <div style={{ textAlign: 'center' }}>
          <Title
            c="dimmed"
            order={1}
            size="6rem"
            style={{
              fontWeight: 900,
              lineHeight: 1,
              marginBottom: '1rem',
            }}
          >
            404
          </Title>

          <Title mb="md" order={2} size="2rem">
            {dict.errors?.notFound?.title || 'Page Not Found'}
          </Title>

          <Text c="dimmed" maw={400} size="lg" ta="center">
            {dict.errors?.notFound?.description ||
              'The requested taxonomy type or page was not found. Please check the URL or browse our available categories.'}
          </Text>
        </div>

        <Group gap="md">
          <Button
            component={Link}
            href={`/${locale}`}
            leftSection={<IconHome size={16} />}
            size="lg"
            variant="light"
          >
            {dict.navigation?.home || 'Go Home'}
          </Button>

          <GoBackButton>{dict.errors?.notFound?.goBack || 'Go Back'}</GoBackButton>
        </Group>

        <Stack ta="center" gap="xs">
          <Text c="dimmed" fw={500} size="md">
            {dict.errors?.notFound?.browseCatalog || 'Browse our catalog:'}
          </Text>
          <Group gap="xs">
            <Button component={Link} href={`/${locale}/brands`} size="md" variant="subtle">
              {dict.taxonomy?.brands?.title || 'Brands'}
            </Button>
            <Button component={Link} href={`/${locale}/categories`} size="md" variant="subtle">
              {dict.taxonomy?.categories?.title || 'Categories'}
            </Button>
            <Button component={Link} href={`/${locale}/collections`} size="md" variant="subtle">
              {dict.taxonomy?.collections?.title || 'Collections'}
            </Button>
            <Button component={Link} href={`/${locale}/tags`} size="md" variant="subtle">
              {dict.taxonomy?.tags?.title || 'Tags'}
            </Button>
          </Group>
        </Stack>
      </Stack>
    </Container>
  );
}
