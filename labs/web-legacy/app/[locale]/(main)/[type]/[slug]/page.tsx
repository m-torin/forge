import { notFound } from 'next/navigation';

import { getDictionary } from '@/i18n';
import { logger } from '@/lib/logger';
import { type TaxonomyItem, TaxonomyType } from '@/types';

import { TaxonomyTermPageUI } from './TaxonomyTermPageUI';

import { Metadata } from 'next';

interface TaxonomyItemPageProps {
  params: Promise<{
    locale: string;
    slug: string;
    type: string;
  }>;
}

// Dynamic metadata generation
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string; type: string }>;
}): Promise<Metadata> {
  const { locale, slug, type } = await params;

  // Validate taxonomy type
  if (!Object.values(TaxonomyType).includes(type as TaxonomyType)) {
    return {
      description: 'The requested taxonomy item was not found.',
      title: 'Not Found',
    };
  }

  const taxonomyType = type as TaxonomyType;
  const [dict, taxonomyItem] = await Promise.all([
    getDictionary(locale),
    getTaxonomyItem(taxonomyType, slug),
  ]);

  if (!taxonomyItem) {
    return {
      description: 'The requested taxonomy item was not found.',
      title: 'Not Found',
    };
  }

  return {
    description: taxonomyItem.description || `Explore ${taxonomyItem.name} in our ${type} catalog`,
    openGraph: {
      description:
        taxonomyItem.description || `Explore ${taxonomyItem.name} in our ${type} catalog`,
      title: taxonomyItem.name,
      type: 'website',
    },
    title: `${taxonomyItem.name} | ${dict.app?.brand || 'Web Template'}`,
  };
}

// Generate static params for all taxonomy items
export async function generateStaticParams({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;

  if (!Object.values(TaxonomyType).includes(type as TaxonomyType)) {
    return [];
  }

  const taxonomyType = type as TaxonomyType;

  // Mock data for static generation - in a real app, fetch all slugs from your API
  const mockSlugs: Record<TaxonomyType, string[]> = {
    [TaxonomyType.ATTRIBUTES]: ['color-blue', 'size-large'],
    [TaxonomyType.BRANDS]: ['premium-brand', 'eco-friendly'],
    [TaxonomyType.CATEGORIES]: ['electronics', 'clothing'],
    [TaxonomyType.COLLECTIONS]: ['summer-collection', 'best-sellers'],
    [TaxonomyType.TAGS]: ['new-arrival', 'on-sale'],
  };

  return mockSlugs[taxonomyType].map((slug) => ({
    slug,
  }));
}

// Pure server component - handles data fetching only
export default async function TaxonomyItemPage({ params }: TaxonomyItemPageProps) {
  let resolvedParams;

  try {
    resolvedParams = await params;
  } catch (_error: any) {
    logger.error('Error resolving taxonomy term page params', _error);
    notFound();
  }

  const { locale, slug, type } = resolvedParams;

  // Validate taxonomy type
  if (!Object.values(TaxonomyType).includes(type as TaxonomyType)) {
    notFound();
  }

  const taxonomyType = type as TaxonomyType;

  try {
    // Parallel data fetching for better performance
    const [dict, taxonomyItem] = await Promise.all([
      getDictionary(locale),
      getTaxonomyItem(taxonomyType, slug),
    ]);

    if (!taxonomyItem) {
      notFound();
    }

    // Pass data to client component for rendering
    return (
      <TaxonomyTermPageUI
        dict={dict}
        locale={locale}
        taxonomyItem={taxonomyItem}
        taxonomyType={taxonomyType}
        type={type}
        slug={slug}
      />
    );
  } catch (_error: any) {
    // Handle data fetching errors gracefully
    logger.error('Error fetching taxonomy term data', _error);
    notFound();
  }
}

// Mock data function - in a real app, this would fetch from your API/database
async function getTaxonomyItem(type: TaxonomyType, slug: string): Promise<null | TaxonomyItem> {
  const mockData: Record<TaxonomyType, TaxonomyItem[]> = {
    [TaxonomyType.ATTRIBUTES]: [
      {
        count: 78,
        description:
          'Products available in various shades of blue. From navy to sky blue, find the perfect blue tone for your needs.',
        id: '1',
        name: 'Color: Blue',
        slug: 'color-blue',
        type: TaxonomyType.ATTRIBUTES,
      },
      {
        count: 52,
        description:
          'Large-sized products for optimal comfort and fit. Perfect for those who prefer more spacious and comfortable items.',
        id: '2',
        name: 'Size: Large',
        slug: 'size-large',
        type: TaxonomyType.ATTRIBUTES,
      },
    ],
    [TaxonomyType.BRANDS]: [
      {
        count: 42,
        description:
          'High-quality products from our premium brand. We focus on delivering exceptional craftsmanship and sustainable practices in every product we create.',
        id: '1',
        name: 'Premium Brand',
        slug: 'premium-brand',
        type: TaxonomyType.BRANDS,
      },
      {
        count: 28,
        description:
          'Sustainable and environmentally conscious products. Our commitment to the planet drives everything we do, from sourcing materials to packaging.',
        id: '2',
        name: 'Eco Friendly',
        slug: 'eco-friendly',
        type: TaxonomyType.BRANDS,
      },
    ],
    [TaxonomyType.CATEGORIES]: [
      {
        count: 156,
        description:
          'Latest technology and gadgets for the modern lifestyle. Discover cutting-edge devices that enhance your daily productivity and entertainment.',
        id: '1',
        name: 'Electronics',
        slug: 'electronics',
        type: TaxonomyType.CATEGORIES,
      },
      {
        count: 89,
        description:
          'Fashion and apparel for all occasions. From casual everyday wear to formal attire, find the perfect outfit for any moment.',
        id: '2',
        name: 'Clothing',
        slug: 'clothing',
        type: TaxonomyType.CATEGORIES,
      },
    ],
    [TaxonomyType.COLLECTIONS]: [
      {
        count: 34,
        description:
          'Fresh styles for the summer season. Light fabrics, vibrant colors, and comfortable designs perfect for warm weather activities.',
        id: '1',
        name: 'Summer Collection',
        slug: 'summer-collection',
        type: TaxonomyType.COLLECTIONS,
      },
      {
        count: 67,
        description:
          'Our most popular products chosen by customers worldwide. These items have consistently received excellent reviews and high ratings.',
        id: '2',
        name: 'Best Sellers',
        slug: 'best-sellers',
        type: TaxonomyType.COLLECTIONS,
      },
    ],
    [TaxonomyType.TAGS]: [
      {
        count: 23,
        description:
          "Recently added products featuring the latest trends and innovations. Be the first to discover what's new in our catalog.",
        id: '1',
        name: 'New Arrival',
        slug: 'new-arrival',
        type: TaxonomyType.TAGS,
      },
      {
        count: 45,
        description:
          'Discounted products offering exceptional value. Limited time offers on selected items with significant savings.',
        id: '2',
        name: 'On Sale',
        slug: 'on-sale',
        type: TaxonomyType.TAGS,
      },
    ],
  };

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  const items = mockData[type] || [];
  return items.find((item: any) => item.slug === slug) || null;
}
