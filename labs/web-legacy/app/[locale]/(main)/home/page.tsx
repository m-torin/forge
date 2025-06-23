import { getDictionary } from '@/i18n';
import { HomePage } from '@/components/HomePage';
import { type Metadata } from 'next';
import { createMetadata } from '@repo/seo/server/next';
import { getProducts } from '@/actions/products';
import { getFeaturedCollections } from '@/actions/collections';
import { getArticles } from '@/actions/articles';
import {
  transformDatabaseProductToTProductItem,
  transformDatabaseCollectionToTCollection,
  transformDatabaseArticleToTBlogPost,
} from '@/types/database';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';
  const homeUrl = `${baseUrl}/${locale}/home`;

  return createMetadata({
    title: dict.home?.title || 'Home',
    description: dict.home?.description || 'Discover amazing products, collections, and stories.',
    alternates: {
      canonical: homeUrl,
      languages: {
        en: `${baseUrl}/en/home`,
        es: `${baseUrl}/es/home`,
        fr: `${baseUrl}/fr/home`,
        de: `${baseUrl}/de/home`,
        pt: `${baseUrl}/pt/home`,
      },
    },
  });
}

export default async function HomePageRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  // Fetch all data in parallel for better performance
  const [
    featuredProductsResult,
    allProductsResult,
    featuredCollectionsResult,
    featuredArticlesResult,
  ] = await Promise.all([
    getProducts({ page: 1, sort: 'newest', limit: 8 }).catch(() => ({
      data: [],
      pagination: null,
    })),
    getProducts({ page: 1, sort: 'newest', limit: 12 }).catch(() => ({
      data: [],
      pagination: null,
    })),
    getFeaturedCollections(6).catch(() => []),
    getArticles({ page: 1, limit: 4, status: 'PUBLISHED' }).catch(() => ({
      data: [],
      pagination: null,
    })),
  ]);

  // Transform database data to UI types
  const featuredProducts = (featuredProductsResult.data || []).map(
    transformDatabaseProductToTProductItem,
  );
  const recentProducts = (allProductsResult.data || []).map(transformDatabaseProductToTProductItem);
  const featuredCollections = (
    (featuredCollectionsResult as any)?.data ||
    featuredCollectionsResult ||
    []
  ).map(transformDatabaseCollectionToTCollection);
  const featuredArticles = (featuredArticlesResult.data || []).map(
    transformDatabaseArticleToTBlogPost,
  );

  return (
    <HomePage
      dict={dict}
      locale={locale}
      featuredProducts={featuredProducts}
      recentProducts={recentProducts}
      featuredCollections={featuredCollections}
      featuredArticles={featuredArticles}
    />
  );
}
