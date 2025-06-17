import { NextJSProductSearch } from '@/components/search';

interface ProductSearchPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ProductSearchPage({ params }: ProductSearchPageProps) {
  const { locale } = await params;

  return <NextJSProductSearch locale={locale} />;
}

export async function generateMetadata({ params }: ProductSearchPageProps) {
  const { locale } = await params;

  return {
    title: 'Product Search - Algolia InstantSearch',
    description: 'Search through our collection of fashion products using Algolia InstantSearch',
  };
}
