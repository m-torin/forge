import { Suspense } from 'react';
import { headers } from 'next/headers';
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import {
  Container,
  Stack,
  Skeleton,
  Title,
  Text,
  Breadcrumbs,
  Anchor,
  Group,
  Alert,
} from '@mantine/core';
import { IconHome, IconAlertTriangle } from '@tabler/icons-react';
import { env } from '@/env';
import { createMetadata, structuredData } from '@repo/seo/server/next';
import { OptimizedJsonLd } from '@repo/seo/client/next';

// Next.js 15 optimized search components
// Import server components directly to avoid index.ts conflicts
import { SearchResultsServer } from './SearchResultsServer';
import { SearchFiltersServer } from './SearchFiltersServer';
import { SearchStatsServer } from './SearchStatsServer';
import { SearchBoxClient } from './SearchBoxClient';
import { NextJSSearchWrapper } from './NextJSSearchWrapper';

// Enhanced search client with Next.js optimizations for products only
const searchClient = algoliasearch(
  env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY,
);

// Use products index for InstantSearch examples
const indexName = 'autocomplete_demo_products';

// Error component for search failures
function SearchError({ error, testId }: { error: string; testId?: string }) {
  return (
    <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light" data-testid={testId}>
      <Text size="sm">Search failed to load: {error}</Text>
    </Alert>
  );
}

interface SearchPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}

// Server-side search data fetching
async function getInitialSearchData(query?: string) {
  if (!query) return null;

  try {
    // Pre-fetch initial search results server-side
    const response = await searchClient.search([
      {
        indexName,
        params: {
          query,
          hitsPerPage: 24,
          attributesToRetrieve: [
            'objectID',
            'name',
            'title',
            'image',
            'image_url',
            'price',
            'price_range',
            'currency',
            'brand',
            'rating',
            'reviews',
            'categories',
          ],
          attributesToHighlight: ['name', 'title'],
          facets: ['categories', 'brand', 'rating'],
        },
      },
    ]);

    return response.results[0];
  } catch (_error) {
    console.warn('Server-side search failed:', _error);
    return null;
  }
}

// Loading skeletons for streaming
function SearchPageSkeleton() {
  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Skeleton height={60} radius="sm" />
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="w-full md:w-1/4">
            <Stack gap="lg">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} height={200} radius="sm" />
              ))}
            </Stack>
          </div>
          <div className="w-full md:w-3/4">
            <Stack gap="lg">
              <Skeleton height={40} radius="sm" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} height={300} radius="sm" />
                ))}
              </div>
            </Stack>
          </div>
        </div>
      </Stack>
    </Container>
  );
}

// Main optimized search page component
export default async function NextJSOptimizedSearchPage({ params, searchParams }: SearchPageProps) {
  try {
    const { locale } = await params;
    const { q: query, category, page } = await searchParams;

    // Get headers for URL routing (Next.js 15 feature)
    const headersList = await headers();
    const serverUrl = headersList.get('x-url') || '';

    // Pre-fetch initial search data server-side
    const initialData = await getInitialSearchData(query);

    // Create WebSite search action structured data
    const baseUrl = env.NEXT_PUBLIC_APP_URL || 'https://example.com';
    const websiteData = structuredData.website({
      name: 'Web Template',
      url: baseUrl,
      potentialAction: {
        target: `${baseUrl}/${locale}/nextjs-search?q={search_term_string}`,
        queryInput: 'search_term_string',
      },
    });

    // Create breadcrumb structured data
    const breadcrumbData = structuredData.breadcrumbs([
      {
        name: 'Home',
        url: `${baseUrl}/${locale}`,
      },
      {
        name: 'Search',
        url: `${baseUrl}/${locale}/search`,
      },
      ...(query
        ? [
            {
              name: `Results for "${query}"`,
              url: `${baseUrl}/${locale}/nextjs-search?q=${encodeURIComponent(query)}`,
            },
          ]
        : []),
    ]);

    return (
      <Container size="xl" py="xl" data-testid="nextjs-optimized-search">
        <OptimizedJsonLd data={websiteData} id="website-search" strategy="afterInteractive" />
        <OptimizedJsonLd data={breadcrumbData} id="breadcrumb" strategy="afterInteractive" />
        <NextJSSearchWrapper>
          <Stack gap="xl">
            {/* Breadcrumbs - Static (no suspense needed) */}
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
            </Breadcrumbs>

            {/* Page header - Static */}
            <div>
              <Title order={1} mb="md">
                Next.js 15 Optimized Search
              </Title>
              <Text c="dimmed" size="lg">
                Server-side rendered search with streaming and React Server Components
              </Text>
            </div>

            {/* Search box - Client component for interactivity */}
            <SearchBoxClient locale={locale} />

            {/* Search stats - Stream from server */}
            <Suspense fallback={<Skeleton height={80} radius="sm" />}>
              <SearchStatsServer initialData={initialData} />
            </Suspense>

            {/* Main content grid */}
            <Group align="flex-start" gap="xl" wrap="nowrap">
              {/* Sidebar filters - Stream from server */}
              <div style={{ minWidth: '250px', maxWidth: '300px' }}>
                <Suspense fallback={<Skeleton height={600} radius="sm" />}>
                  <SearchFiltersServer />
                </Suspense>
              </div>

              {/* Search results - Stream from server */}
              <div style={{ flex: 1 }}>
                <Suspense fallback={<SearchResultsSkeleton />}>
                  <SearchResultsServer initialData={initialData} locale={locale} />
                </Suspense>
              </div>
            </Group>
          </Stack>
        </NextJSSearchWrapper>
      </Container>
    );
  } catch (_error) {
    console.error('NextJSOptimizedSearchPage error:', _error);
    return (
      <SearchError
        error={_error instanceof Error ? (_error as Error).message : 'Failed to load search page'}
        testId="nextjs-optimized-search-error"
      />
    );
  }
}

// Specific skeleton for search results
function SearchResultsSkeleton() {
  return (
    <Stack gap="lg">
      <Skeleton height={40} radius="sm" />
      <Group gap="md" wrap="wrap">
        {[...Array(6)].map((_, i) => (
          <Skeleton
            key={i}
            height={300}
            radius="sm"
            style={{ flex: '1 1 300px', minWidth: '250px' }}
          />
        ))}
      </Group>
    </Stack>
  );
}

// Enable Partial Pre-rendering for Next.js 15
export const experimental_ppr = true;

// Metadata for SEO
export async function generateMetadata({ params, searchParams }: SearchPageProps) {
  const { locale } = await params;
  const { q: query } = await searchParams;
  const baseUrl = env.NEXT_PUBLIC_APP_URL || 'https://example.com';
  const searchUrl = `${baseUrl}/${locale}/nextjs-search${query ? `?q=${encodeURIComponent(query)}` : ''}`;

  return createMetadata({
    title: query ? `Search results for "${query}"` : 'Search Products',
    description: query
      ? `Find the best products matching "${query}" with our AI-powered search`
      : 'Discover products with our advanced search functionality',
    alternates: {
      canonical: searchUrl,
      languages: {
        en: `${baseUrl}/en/nextjs-search${query ? `?q=${encodeURIComponent(query)}` : ''}`,
        es: `${baseUrl}/es/nextjs-search${query ? `?q=${encodeURIComponent(query)}` : ''}`,
        fr: `${baseUrl}/fr/nextjs-search${query ? `?q=${encodeURIComponent(query)}` : ''}`,
        de: `${baseUrl}/de/nextjs-search${query ? `?q=${encodeURIComponent(query)}` : ''}`,
        pt: `${baseUrl}/pt/nextjs-search${query ? `?q=${encodeURIComponent(query)}` : ''}`,
      },
    },
    openGraph: {
      title: query ? `Search: ${query}` : 'Product Search',
      description: 'Advanced product search with filters and instant results',
      type: 'website',
    },
  });
}
