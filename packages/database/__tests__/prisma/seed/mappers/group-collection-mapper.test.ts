import { ContentStatus } from '#/prisma-generated/client';
import {
  createGroupCollectionHierarchy,
  extractGroupCollectionCounts,
  mapWebappGroupCollectionToPrisma,
} from '#/prisma/src/seed/mappers/group-collection-mapper';
import { describe, expect, it } from 'vitest';

describe('group-collection-mapper', () => {
  const mockWebappGroupCollection = {
    id: '1',
    title: 'Women',
    handle: 'women',
    description: "Women's fashion and accessories",
    iconSvg: '<svg>...</svg>',
    collections: [
      {
        id: 'gid://1',
        title: 'Jackets',
        handle: 'jackets',
        description: 'Test jackets',
        sortDescription: 'Newest arrivals',
        color: 'bg-indigo-50',
        count: 77,
        image: {
          src: '/images/jackets.png',
          width: 400,
          height: 400,
          alt: 'Jackets Collection',
        },
      },
    ],
  };

  describe('mapWebappGroupCollectionToPrisma', () => {
    it('maps webapp group collection to Prisma format correctly', () => {
      const result = mapWebappGroupCollectionToPrisma(mockWebappGroupCollection);

      expect(result.name).toBe('Women');
      expect(result.slug).toBe('women');
      expect(result.status).toBe(ContentStatus.PUBLISHED);
      expect((result.copy as any)?.description).toBe("Women's fashion and accessories");
      expect((result.copy as any)?.iconSvg).toBe('<svg>...</svg>');
      expect((result.copy as any)?.groupType).toBe('category');
      expect((result.copy as any)?.childCount).toBe(1);
    });

    // Enhanced test coverage
    it('handles empty description', () => {
      const groupWithEmptyDesc = { ...mockWebappGroupCollection, description: '' };
      const result = mapWebappGroupCollectionToPrisma(groupWithEmptyDesc);
      expect((result.copy as any)?.description).toBe('');
    });

    it('handles null description', () => {
      const groupWithNullDesc = { ...mockWebappGroupCollection, description: null as any };
      const result = mapWebappGroupCollectionToPrisma(groupWithNullDesc);
      expect((result.copy as any)?.description).toBeNull();
    });

    it('handles very long description', () => {
      const longDescription = 'A'.repeat(1000);
      const groupWithLongDesc = { ...mockWebappGroupCollection, description: longDescription };
      const result = mapWebappGroupCollectionToPrisma(groupWithLongDesc);
      expect((result.copy as any)?.description).toBe(longDescription);
    });

    it('handles special characters in description', () => {
      const specialDesc =
        'Description with special chars: &, @, #, $, %, ^, *, (, ), [, ], {, }, |, \\, /, :, ;, ", \', <, >, ?, !, ~, `';
      const groupWithSpecialDesc = { ...mockWebappGroupCollection, description: specialDesc };
      const result = mapWebappGroupCollectionToPrisma(groupWithSpecialDesc);
      expect((result.copy as any)?.description).toBe(specialDesc);
    });

    it('handles empty iconSvg', () => {
      const groupWithEmptyIcon = { ...mockWebappGroupCollection, iconSvg: '' };
      const result = mapWebappGroupCollectionToPrisma(groupWithEmptyIcon);
      expect((result.copy as any)?.iconSvg).toBe('');
    });

    it('handles null iconSvg', () => {
      const groupWithNullIcon = { ...mockWebappGroupCollection, iconSvg: null as any };
      const result = mapWebappGroupCollectionToPrisma(groupWithNullIcon);
      expect((result.copy as any)?.iconSvg).toBeNull();
    });

    it('handles very long iconSvg', () => {
      const longIconSvg = '<svg>' + 'A'.repeat(5000) + '</svg>';
      const groupWithLongIcon = { ...mockWebappGroupCollection, iconSvg: longIconSvg };
      const result = mapWebappGroupCollectionToPrisma(groupWithLongIcon);
      expect((result.copy as any)?.iconSvg).toBe(longIconSvg);
    });

    it('handles special characters in iconSvg', () => {
      const specialIconSvg =
        '<svg><path d="M10 10" fill="red" stroke="blue" stroke-width="2"/></svg>';
      const groupWithSpecialIcon = { ...mockWebappGroupCollection, iconSvg: specialIconSvg };
      const result = mapWebappGroupCollectionToPrisma(groupWithSpecialIcon);
      expect((result.copy as any)?.iconSvg).toBe(specialIconSvg);
    });

    it('handles different collection counts', () => {
      const countVariations = [0, 1, 5, 10, 100];

      countVariations.forEach(count => {
        const groupWithCount = {
          ...mockWebappGroupCollection,
          collections: Array.from({ length: count }, (_, i) => ({
            id: `gid://${i}`,
            title: `Collection ${i}`,
            handle: `collection-${i}`,
            description: `Description ${i}`,
            sortDescription: `Sort ${i}`,
            color: 'bg-indigo-50',
            count: 10,
            image: {
              src: `/images/collection-${i}.png`,
              width: 400,
              height: 400,
              alt: `Collection ${i}`,
            },
          })),
        };
        const result = mapWebappGroupCollectionToPrisma(groupWithCount);
        expect((result.copy as any)?.childCount).toBe(count);
      });
    });

    it('handles very long title', () => {
      const longTitle = 'A'.repeat(500);
      const groupWithLongTitle = { ...mockWebappGroupCollection, title: longTitle };
      const result = mapWebappGroupCollectionToPrisma(groupWithLongTitle);
      expect(result.name).toBe(longTitle);
    });

    it('handles empty title', () => {
      const groupWithEmptyTitle = { ...mockWebappGroupCollection, title: '' };
      const result = mapWebappGroupCollectionToPrisma(groupWithEmptyTitle);
      expect(result.name).toBe('');
    });

    it('handles very long handle', () => {
      const longHandle = 'a'.repeat(200);
      const groupWithLongHandle = { ...mockWebappGroupCollection, handle: longHandle };
      const result = mapWebappGroupCollectionToPrisma(groupWithLongHandle);
      expect(result.slug).toBe(longHandle);
    });

    it('handles empty handle', () => {
      const groupWithEmptyHandle = { ...mockWebappGroupCollection, handle: '' };
      const result = mapWebappGroupCollectionToPrisma(groupWithEmptyHandle);
      expect(result.slug).toBe('');
    });

    it('handles special characters in title', () => {
      const specialTitle = 'Group Collection & Co. (Special) - Test Group!';
      const groupWithSpecialTitle = { ...mockWebappGroupCollection, title: specialTitle };
      const result = mapWebappGroupCollectionToPrisma(groupWithSpecialTitle);
      expect(result.name).toBe(specialTitle);
    });

    it('generates consistent results for same input', () => {
      const result1 = mapWebappGroupCollectionToPrisma(mockWebappGroupCollection);
      const result2 = mapWebappGroupCollectionToPrisma(mockWebappGroupCollection);

      expect(result1.name).toBe(result2.name);
      expect(result1.slug).toBe(result2.slug);
      expect(result1.status).toBe(result2.status);
      expect((result1.copy as any)?.description).toBe((result2.copy as any)?.description);
      expect((result1.copy as any)?.iconSvg).toBe((result2.copy as any)?.iconSvg);
      expect((result1.copy as any)?.childCount).toBe((result2.copy as any)?.childCount);
    });

    it('includes all required fields', () => {
      const result = mapWebappGroupCollectionToPrisma(mockWebappGroupCollection);

      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('slug');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('copy');
      expect(result.copy as any).toHaveProperty('description');
      expect(result.copy as any).toHaveProperty('iconSvg');
      expect(result.copy as any).toHaveProperty('groupType');
      expect(result.copy as any).toHaveProperty('childCount');
    });

    it('sets correct default status', () => {
      const result = mapWebappGroupCollectionToPrisma(mockWebappGroupCollection);
      expect(result.status).toBe(ContentStatus.PUBLISHED);
    });

    it('sets correct group type', () => {
      const result = mapWebappGroupCollectionToPrisma(mockWebappGroupCollection);
      expect((result.copy as any)?.groupType).toBe('category');
    });

    it('handles different group types', () => {
      const groupTypes = ['category', 'brand', 'season', 'style', 'occasion'];

      groupTypes.forEach(groupType => {
        const groupWithType = { ...mockWebappGroupCollection, title: `Test ${groupType}` };
        const result = mapWebappGroupCollectionToPrisma(groupWithType);
        expect((result.copy as any)?.groupType).toBe('category'); // Always returns 'category'
      });
    });
  });

  describe('createGroupCollectionHierarchy', () => {
    it('creates hierarchy relationships correctly', () => {
      const groupCollectionId = 'group-123';
      const existingCollections = [
        { id: 'collection-1', slug: 'jackets' } as any,
        { id: 'collection-2', slug: 'dresses' } as any,
      ];

      const result = createGroupCollectionHierarchy(
        mockWebappGroupCollection,
        groupCollectionId,
        existingCollections,
      );

      expect(result).toHaveLength(1);
      expect(result[0].collectionId).toBe('collection-1');
      expect(result[0].parentCollectionId).toBe('group-123');
    });

    it('handles collections not found in existing collections', () => {
      const groupCollectionId = 'group-123';
      const existingCollections = [
        { id: 'collection-1', slug: 'dresses' } as any, // Different slug
      ];

      const result = createGroupCollectionHierarchy(
        mockWebappGroupCollection,
        groupCollectionId,
        existingCollections,
      );

      expect(result).toHaveLength(0);
    });

    // Enhanced test coverage
    it('handles multiple matching collections', () => {
      const groupCollectionId = 'group-123';
      const existingCollections = [
        { id: 'collection-1', slug: 'jackets' } as any,
        { id: 'collection-2', slug: 'dresses' } as any,
        { id: 'collection-3', slug: 'shoes' } as any,
      ];

      const multiCollectionGroup = {
        ...mockWebappGroupCollection,
        collections: [
          mockWebappGroupCollection.collections[0], // jackets
          {
            id: 'gid://2',
            title: 'Dresses',
            handle: 'dresses',
            description: 'Test dresses',
            sortDescription: 'Newest arrivals',
            color: 'bg-pink-50',
            count: 50,
            image: {
              src: '/images/dresses.png',
              width: 400,
              height: 400,
              alt: 'Dresses Collection',
            },
          },
        ],
      };

      const result = createGroupCollectionHierarchy(
        multiCollectionGroup,
        groupCollectionId,
        existingCollections,
      );

      expect(result).toHaveLength(2);
      expect(result[0].collectionId).toBe('collection-1');
      expect(result[0].parentCollectionId).toBe('group-123');
      expect(result[1].collectionId).toBe('collection-2');
      expect(result[1].parentCollectionId).toBe('group-123');
    });

    it('handles empty existing collections', () => {
      const groupCollectionId = 'group-123';
      const existingCollections = [] as any;

      const result = createGroupCollectionHierarchy(
        mockWebappGroupCollection,
        groupCollectionId,
        existingCollections,
      );

      expect(result).toHaveLength(0);
    });

    it('handles empty group collections', () => {
      const groupCollectionId = 'group-123';
      const existingCollections = [{ id: 'collection-1', slug: 'jackets' } as any];

      const emptyGroupCollection = {
        ...mockWebappGroupCollection,
        collections: [],
      };

      const result = createGroupCollectionHierarchy(
        emptyGroupCollection,
        groupCollectionId,
        existingCollections,
      );

      expect(result).toHaveLength(0);
    });

    it('handles case insensitive matching', () => {
      const groupCollectionId = 'group-123';
      const existingCollections = [
        { id: 'collection-1', slug: 'JACKETS' } as any, // Uppercase
      ];

      const result = createGroupCollectionHierarchy(
        mockWebappGroupCollection,
        groupCollectionId,
        existingCollections,
      );

      expect(result).toHaveLength(0); // Should not match due to case sensitivity
    });

    it('handles special characters in handles', () => {
      const groupCollectionId = 'group-123';
      const existingCollections = [{ id: 'collection-1', slug: 'jackets-special' } as any];

      const groupWithSpecialHandle = {
        ...mockWebappGroupCollection,
        collections: [
          {
            ...mockWebappGroupCollection.collections[0],
            handle: 'jackets-special',
          },
        ],
      };

      const result = createGroupCollectionHierarchy(
        groupWithSpecialHandle,
        groupCollectionId,
        existingCollections,
      );

      expect(result).toHaveLength(1);
      expect(result[0].collectionId).toBe('collection-1');
    });

    it('handles very long handles', () => {
      const longHandle = 'a'.repeat(100);
      const groupCollectionId = 'group-123';
      const existingCollections = [{ id: 'collection-1', slug: longHandle } as any];

      const groupWithLongHandle = {
        ...mockWebappGroupCollection,
        collections: [
          {
            ...mockWebappGroupCollection.collections[0],
            handle: longHandle,
          },
        ],
      };

      const result = createGroupCollectionHierarchy(
        groupWithLongHandle,
        groupCollectionId,
        existingCollections,
      );

      expect(result).toHaveLength(1);
      expect(result[0].collectionId).toBe('collection-1');
    });

    it('generates consistent results for same input', () => {
      const groupCollectionId = 'group-123';
      const existingCollections = [{ id: 'collection-1', slug: 'jackets' } as any];

      const result1 = createGroupCollectionHierarchy(
        mockWebappGroupCollection,
        groupCollectionId,
        existingCollections,
      );
      const result2 = createGroupCollectionHierarchy(
        mockWebappGroupCollection,
        groupCollectionId,
        existingCollections,
      );

      expect(result1.length).toBe(result2.length);
      expect(result1[0].collectionId).toBe(result2[0].collectionId);
      expect(result1[0].parentCollectionId).toBe(result2[0].parentCollectionId);
    });

    it('handles duplicate collection handles', () => {
      const groupCollectionId = 'group-123';
      const existingCollections = [
        { id: 'collection-1', slug: 'jackets' } as any,
        { id: 'collection-2', slug: 'jackets' } as any, // Duplicate slug
      ];

      const result = createGroupCollectionHierarchy(
        mockWebappGroupCollection,
        groupCollectionId,
        existingCollections,
      );

      expect(result).toHaveLength(1); // Should only match first occurrence
      expect(result[0].collectionId).toBe('collection-1');
    });
  });

  describe('extractGroupCollectionCounts', () => {
    it('extracts counts correctly', () => {
      const result = extractGroupCollectionCounts(mockWebappGroupCollection);

      expect(result).toStrictEqual({ jackets: 77 });
    });

    // Enhanced test coverage
    it('handles multiple collections', () => {
      const multiCollectionGroup = {
        ...mockWebappGroupCollection,
        collections: [
          mockWebappGroupCollection.collections[0], // jackets: 77
          {
            id: 'gid://2',
            title: 'Dresses',
            handle: 'dresses',
            description: 'Test dresses',
            sortDescription: 'Newest arrivals',
            color: 'bg-pink-50',
            count: 50,
            image: {
              src: '/images/dresses.png',
              width: 400,
              height: 400,
              alt: 'Dresses Collection',
            },
          },
          {
            id: 'gid://3',
            title: 'Shoes',
            handle: 'shoes',
            description: 'Test shoes',
            sortDescription: 'Newest arrivals',
            color: 'bg-green-50',
            count: 25,
            image: {
              src: '/images/shoes.png',
              width: 400,
              height: 400,
              alt: 'Shoes Collection',
            },
          },
        ],
      };

      const result = extractGroupCollectionCounts(multiCollectionGroup);

      expect(result).toStrictEqual({
        jackets: 77,
        dresses: 50,
        shoes: 25,
      });
    });

    it('handles empty collections', () => {
      const emptyGroupCollection = {
        ...mockWebappGroupCollection,
        collections: [],
      };

      const result = extractGroupCollectionCounts(emptyGroupCollection);

      expect(result).toStrictEqual({});
    });

    it('handles zero counts', () => {
      const groupWithZeroCount = {
        ...mockWebappGroupCollection,
        collections: [
          {
            ...mockWebappGroupCollection.collections[0],
            count: 0,
          },
        ],
      };

      const result = extractGroupCollectionCounts(groupWithZeroCount);

      expect(result).toStrictEqual({ jackets: 0 });
    });

    it('handles negative counts', () => {
      const groupWithNegativeCount = {
        ...mockWebappGroupCollection,
        collections: [
          {
            ...mockWebappGroupCollection.collections[0],
            count: -1,
          },
        ],
      };

      const result = extractGroupCollectionCounts(groupWithNegativeCount);

      expect(result).toStrictEqual({ jackets: -1 });
    });

    it('handles very large counts', () => {
      const groupWithLargeCount = {
        ...mockWebappGroupCollection,
        collections: [
          {
            ...mockWebappGroupCollection.collections[0],
            count: 1000000,
          },
        ],
      };

      const result = extractGroupCollectionCounts(groupWithLargeCount);

      expect(result).toStrictEqual({ jackets: 1000000 });
    });

    it('handles special characters in handles', () => {
      const groupWithSpecialHandle = {
        ...mockWebappGroupCollection,
        collections: [
          {
            ...mockWebappGroupCollection.collections[0],
            handle: 'jackets-special',
          },
        ],
      };

      const result = extractGroupCollectionCounts(groupWithSpecialHandle);

      expect(result).toStrictEqual({ 'jackets-special': 77 });
    });

    it('handles very long handles', () => {
      const longHandle = 'a'.repeat(100);
      const groupWithLongHandle = {
        ...mockWebappGroupCollection,
        collections: [
          {
            ...mockWebappGroupCollection.collections[0],
            handle: longHandle,
          },
        ],
      };

      const result = extractGroupCollectionCounts(groupWithLongHandle);

      expect(result).toStrictEqual({ [longHandle]: 77 });
    });

    it('handles duplicate handles', () => {
      const groupWithDuplicateHandles = {
        ...mockWebappGroupCollection,
        collections: [
          mockWebappGroupCollection.collections[0], // jackets: 77
          {
            ...mockWebappGroupCollection.collections[0],
            id: 'gid://2',
            count: 50, // Different count
          },
        ],
      };

      const result = extractGroupCollectionCounts(groupWithDuplicateHandles);

      expect(result).toStrictEqual({ jackets: 50 }); // Last one wins
    });

    it('generates consistent results for same input', () => {
      const result1 = extractGroupCollectionCounts(mockWebappGroupCollection);
      const result2 = extractGroupCollectionCounts(mockWebappGroupCollection);

      expect(result1).toStrictEqual(result2);
    });

    it('handles collections with missing count', () => {
      const groupWithMissingCount = {
        ...mockWebappGroupCollection,
        collections: [
          {
            ...mockWebappGroupCollection.collections[0],
            count: undefined as any,
          },
        ],
      };

      const result = extractGroupCollectionCounts(groupWithMissingCount);

      expect(result).toStrictEqual({ jackets: undefined });
    });

    it('handles collections with null count', () => {
      const groupWithNullCount = {
        ...mockWebappGroupCollection,
        collections: [
          {
            ...mockWebappGroupCollection.collections[0],
            count: null as any,
          },
        ],
      };

      const result = extractGroupCollectionCounts(groupWithNullCount);

      expect(result).toStrictEqual({ jackets: null });
    });
  });
});
