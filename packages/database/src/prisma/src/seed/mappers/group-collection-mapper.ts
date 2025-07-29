import {
  type Collection,
  type Prisma,
  ContentStatus,
} from '../../../../../prisma-generated/client';

export interface WebappGroupCollection {
  id: string;
  title: string;
  handle: string;
  description: string;
  iconSvg: string;
  collections: Array<{
    id: string;
    title: string;
    handle: string;
    description: string;
    sortDescription: string;
    color: string;
    count: number;
    image: {
      src: string;
      width: number;
      height: number;
      alt: string;
    };
  }>;
}

export function mapWebappGroupCollectionToPrisma(
  groupCollection: WebappGroupCollection,
): Prisma.CollectionCreateInput {
  return {
    name: groupCollection.title,
    slug: groupCollection.handle,
    status: ContentStatus.PUBLISHED,
    copy: {
      description: groupCollection.description,
      iconSvg: groupCollection.iconSvg,
      groupType: 'category', // Women, Man, Accessories, etc.
      childCount: groupCollection.collections.length,
    },
  };
}

export function createGroupCollectionHierarchy(
  groupCollection: WebappGroupCollection,
  groupCollectionId: string,
  existingCollections: Collection[],
): Array<{ collectionId: string; parentCollectionId: string }> {
  const relationships: Array<{ collectionId: string; parentCollectionId: string }> = [];

  // Find existing collections that match the child collections in this group
  for (const childCollection of groupCollection.collections) {
    const existingCollection = existingCollections.find(c => c.slug === childCollection.handle);

    if (existingCollection) {
      relationships.push({
        collectionId: existingCollection.id,
        parentCollectionId: groupCollectionId,
      });
    }
  }

  return relationships;
}

export function extractGroupCollectionCounts(
  groupCollection: WebappGroupCollection,
): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const collection of groupCollection.collections) {
    counts[collection.handle] = collection.count;
  }

  return counts;
}

// Helper function to generate collection icon for media
export function createGroupCollectionIcon(
  groupCollection: WebappGroupCollection,
  collectionId: string,
): Prisma.MediaCreateInput {
  return {
    url: '/icons/collection-group.svg', // Placeholder icon URL
    altText: `${groupCollection.title} category icon`,
    type: 'IMAGE',
    sortOrder: 0,
    copy: {
      iconSvg: groupCollection.iconSvg,
      iconType: 'category',
    },
    collection: {
      connect: { id: collectionId },
    },
  };
}
