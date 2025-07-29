import { CollectionType, ContentStatus, type Prisma } from '../../../../../prisma-generated/client';

interface WebappCollection {
  id: string;
  title: string;
  handle: string;
  description: string;
  sortDescription?: string;
  color?: string;
  count: number;
  image?: {
    src: string;
    alt: string;
  };
}

export function mapWebappCollectionToPrisma(
  collection: WebappCollection,
): Prisma.CollectionCreateInput {
  // Determine collection type based on handle or title
  let collectionType: CollectionType = CollectionType.PRODUCT_LINE;

  if (collection.handle.includes('sale') || collection.title.toLowerCase().includes('sale')) {
    collectionType = CollectionType.CLEARANCE;
  } else if (
    collection.handle.includes('new-arrivals') ||
    collection.title.toLowerCase().includes('new')
  ) {
    collectionType = CollectionType.NEW_ARRIVALS;
  }

  return {
    name: collection.title,
    slug: collection.handle,
    type: collectionType,
    status: ContentStatus.PUBLISHED,
    copy: {
      description: collection.description,
      sortDescription: collection.sortDescription,
      displayColor: collection.color,
      productCount: collection.count,
    },
  };
}

export function extractCollectionMedia(
  collection: WebappCollection,
  collectionId: string,
): Prisma.MediaCreateInput | null {
  if (!collection.image) return null;

  // Collection images are typically banners/hero images
  const width = 1920;
  const height = 600;
  const estimatedSize = Math.floor((width * height * 0.25) / 1024) * 1024; // Convert to bytes

  return {
    url: collection.image.src,
    altText: collection.image.alt || collection.title,
    type: 'IMAGE',
    width,
    height,
    size: estimatedSize,
    mimeType: 'image/png', // Collections often use PNG for better quality
    sortOrder: 0,
    collection: {
      connect: { id: collectionId },
    },
    copy: {},
  };
}
