import React from 'react';
import { Container, Title, Text, Stack, Breadcrumbs, Anchor, Group } from '@mantine/core';
import { IconHome } from '@tabler/icons-react';
import { InstantSearchClientWrapper } from './instant-search-client';

interface InstantSearchPageProps {
  params: {
    locale: string;
  };
  searchParams?: {
    q?: string;
    category?: string;
  };
}

/**
 * Server component for InstantSearch page
 * This component handles SEO, initial data, and renders the client wrapper
 */
export default async function InstantSearchPage({ params, searchParams }: InstantSearchPageProps) {
  const { locale } = params;
  const initialQuery = searchParams?.q || '';
  const initialCategory = searchParams?.category || '';

  // Fetch any initial server-side data here if needed
  const initialData = {
    query: initialQuery,
    category: initialCategory,
    // Add any other server-fetched initial data
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Breadcrumbs - Server rendered for SEO */}
        <Breadcrumbs>
          <Anchor href={`/${locale}`} c="dimmed" size="md">
            <Group gap="xs">
              <IconHome size={14} />
              Home
            </Group>
          </Anchor>
          <Anchor href={`/${locale}/search`} c="dimmed" size="md">
            Search
          </Anchor>
          <Text c="dimmed" size="md">
            Instant Search
          </Text>
        </Breadcrumbs>

        {/* Header - Server rendered for SEO */}
        <div>
          <Title order={1} mb="md">
            Product Search
          </Title>
          <Text c="dimmed" size="lg">
            Find products with our advanced search functionality
          </Text>
        </div>

        {/* Client-side search functionality */}
        <InstantSearchClientWrapper locale={locale} initialData={initialData} />
      </Stack>
    </Container>
  );
}
