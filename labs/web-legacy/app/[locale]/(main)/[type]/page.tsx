import { notFound } from 'next/navigation';

import { getDictionary } from '@/i18n';
import { logger } from '@/lib/logger';
import { type TaxonomyItem, TaxonomyType } from '@/types';

import { TaxonomyPageUI } from './TaxonomyPageUI';

import { Metadata } from 'next';

interface TaxonomyPageProps {
  params: Promise<{
    locale: string;
    type: string;
  }>;
}

// Dynamic metadata generation with error handling
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; type: string }>;
}): Promise<Metadata> {
  try {
    const { locale, type } = await params;

    // Validate taxonomy type
    if (!Object.values(TaxonomyType).includes(type as TaxonomyType)) {
      return {
        description: 'The requested taxonomy type was not found.',
        title: 'Not Found',
      };
    }

    const dict = await getDictionary(locale);
    const taxonomyType = type as TaxonomyType;

    return {
      description: dict.taxonomy?.[taxonomyType]?.description || `Browse ${type} in our catalog`,
      openGraph: {
        description: dict.taxonomy?.[taxonomyType]?.description || `Browse ${type} in our catalog`,
        title: dict.taxonomy?.[taxonomyType]?.title || type,
        type: 'website',
      },
      title: `${dict.taxonomy?.[taxonomyType]?.title || type} | ${dict.app?.brand || 'Web Template'}`,
    };
  } catch (_error: any) {
    // Handle metadata generation errors gracefully
    logger.error('Error generating taxonomy metadata', _error);
    return {
      description: 'Browse our catalog',
      title: 'Catalog | Web Template',
    };
  }
}

// Static generation for SEO optimization
export async function generateStaticParams() {
  return Object.values(TaxonomyType).map((type) => ({
    type,
  }));
}

// Pure server component - handles data fetching only
export default async function TaxonomyPage({ params }: TaxonomyPageProps) {
  let resolvedParams;

  try {
    resolvedParams = await params;
  } catch (_error: any) {
    logger.error('Error resolving taxonomy page params', _error);
    notFound();
  }

  const { locale, type } = resolvedParams;

  // Validate taxonomy type
  if (!Object.values(TaxonomyType).includes(type as TaxonomyType)) {
    notFound();
  }

  const taxonomyType = type as TaxonomyType;

  try {
    // Parallel data fetching for better performance
    const [dict, taxonomyItems] = await Promise.all([
      getDictionary(locale),
      getTaxonomyItems(taxonomyType),
    ]);

    // Pass data to client component for rendering
    return (
      <TaxonomyPageUI
        dict={dict}
        locale={locale}
        taxonomyItems={taxonomyItems}
        taxonomyType={taxonomyType}
        type={type}
      />
    );
  } catch (_error: any) {
    // Handle data fetching errors gracefully
    logger.error('Error fetching taxonomy data', _error);

    // Try to get basic dictionary for error display
    try {
      const dict = await getDictionary(locale);
      return (
        <TaxonomyPageUI
          dict={dict}
          locale={locale}
          taxonomyItems={[]}
          taxonomyType={taxonomyType}
          type={type}
        />
      );
    } catch (_error: any) {
      logger.error('Error fetching dictionary', _error);
      notFound();
    }
  }
}

// Mock data function - in a real app, this would fetch from your API/database
async function getTaxonomyItems(type: TaxonomyType): Promise<TaxonomyItem[]> {
  const mockData: Record<TaxonomyType, TaxonomyItem[]> = {
    [TaxonomyType.ATTRIBUTES]: [
      {
        count: 78,
        description: 'Products available in blue',
        id: '1',
        name: 'Color: Blue',
        slug: 'color-blue',
        type: TaxonomyType.ATTRIBUTES,
      },
      {
        count: 52,
        description: 'Large-sized products',
        id: '2',
        name: 'Size: Large',
        slug: 'size-large',
        type: TaxonomyType.ATTRIBUTES,
      },
    ],
    [TaxonomyType.BRANDS]: [
      {
        count: 42,
        description: 'High-quality products from our premium brand',
        id: '1',
        name: 'Premium Brand',
        slug: 'premium-brand',
        type: TaxonomyType.BRANDS,
      },
      {
        count: 28,
        description: 'Sustainable and environmentally conscious products',
        id: '2',
        name: 'Eco Friendly',
        slug: 'eco-friendly',
        type: TaxonomyType.BRANDS,
      },
    ],
    [TaxonomyType.CATEGORIES]: [
      {
        count: 156,
        description: 'Latest technology and gadgets',
        id: '1',
        name: 'Electronics',
        slug: 'electronics',
        type: TaxonomyType.CATEGORIES,
      },
      {
        count: 89,
        description: 'Fashion and apparel for all occasions',
        id: '2',
        name: 'Clothing',
        slug: 'clothing',
        type: TaxonomyType.CATEGORIES,
      },
    ],
    [TaxonomyType.COLLECTIONS]: [
      {
        count: 34,
        description: 'Fresh styles for the summer season',
        id: '1',
        name: 'Summer Collection',
        slug: 'summer-collection',
        type: TaxonomyType.COLLECTIONS,
      },
      {
        count: 67,
        description: 'Our most popular products',
        id: '2',
        name: 'Best Sellers',
        slug: 'best-sellers',
        type: TaxonomyType.COLLECTIONS,
      },
    ],
    [TaxonomyType.TAGS]: [
      {
        count: 23,
        description: 'Recently added products',
        id: '1',
        name: 'New Arrival',
        slug: 'new-arrival',
        type: TaxonomyType.TAGS,
      },
      {
        count: 45,
        description: 'Discounted products',
        id: '2',
        name: 'On Sale',
        slug: 'on-sale',
        type: TaxonomyType.TAGS,
      },
    ],
  };

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // For testing zero state - uncomment next line to test empty state
  // return [];

  return mockData[type] || [];
}
