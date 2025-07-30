import { CollectionType, ContentStatus } from '#/prisma-generated/client';
import {
  extractCollectionMedia,
  mapWebappCollectionToPrisma,
} from '#/prisma/src/seed/mappers/collection-mapper';
import { describe, expect, it } from 'vitest';

describe('collection-mapper', () => {
  const mockWebappCollection = {
    id: 'gid://1',
    title: 'Test Collection',
    handle: 'test-collection',
    description: 'A test collection',
    sortDescription: 'Newest arrivals',
    color: 'bg-indigo-50',
    count: 77,
    image: {
      src: '/images/collection.jpg',
      alt: 'Test Collection',
    },
  };

  describe('mapWebappCollectionToPrisma', () => {
    it('maps webapp collection to Prisma format correctly', () => {
      const result = mapWebappCollectionToPrisma(mockWebappCollection);

      expect(result.name).toBe('Test Collection');
      expect(result.slug).toBe('test-collection');
      expect(result.type).toBe(CollectionType.PRODUCT_LINE);
      expect(result.status).toBe(ContentStatus.PUBLISHED);
      expect((result.copy as any)?.description).toBe('A test collection');
      expect((result.copy as any)?.sortDescription).toBe('Newest arrivals');
      expect((result.copy as any)?.displayColor).toBe('bg-indigo-50');
      expect((result.copy as any)?.productCount).toBe(77);
    });

    it('identifies sale collections correctly', () => {
      const saleCollection = { ...mockWebappCollection, handle: 'sale-collection' };
      const result = mapWebappCollectionToPrisma(saleCollection);
      expect(result.type).toBe(CollectionType.CLEARANCE);
    });

    it('identifies new arrivals collections correctly', () => {
      const newArrivalsCollection = { ...mockWebappCollection, handle: 'new-arrivals' };
      const result = mapWebappCollectionToPrisma(newArrivalsCollection);
      expect(result.type).toBe(CollectionType.NEW_ARRIVALS);
    });

    // Enhanced test coverage
    it('handles different sale collection variations', () => {
      const saleVariations = [
        'sale',
        'clearance',
        'discount',
        'sale-items',
        'clearance-sale',
        'end-of-season-sale',
        'summer-sale',
        'winter-sale',
        'holiday-sale',
        'black-friday-sale',
        'cyber-monday-sale',
      ];

      saleVariations.forEach(handle => {
        const saleCollection = { ...mockWebappCollection, handle };
        const result = mapWebappCollectionToPrisma(saleCollection);
        expect(result.type).toBe(CollectionType.CLEARANCE);
      });
    });

    it('handles different new arrivals variations', () => {
      const newArrivalsVariations = [
        'new-arrivals',
        'new-in',
        'new-items',
        'latest-arrivals',
        'just-in',
        'new-collection',
        'new-season',
        'spring-new-arrivals',
        'fall-new-arrivals',
      ];

      newArrivalsVariations.forEach(handle => {
        const newArrivalsCollection = { ...mockWebappCollection, handle };
        const result = mapWebappCollectionToPrisma(newArrivalsCollection);
        expect(result.type).toBe(CollectionType.NEW_ARRIVALS);
      });
    });

    it('handles case insensitive collection type detection', () => {
      const saleCollection = { ...mockWebappCollection, handle: 'SALE-COLLECTION' };
      const result = mapWebappCollectionToPrisma(saleCollection);
      expect(result.type).toBe(CollectionType.CLEARANCE);
    });

    it('handles collections with special characters in handle', () => {
      const specialHandleCollection = { ...mockWebappCollection, handle: 'sale-collection-&-more' };
      const result = mapWebappCollectionToPrisma(specialHandleCollection);
      expect(result.type).toBe(CollectionType.CLEARANCE);
    });

    it('handles empty description', () => {
      const collectionWithEmptyDesc = { ...mockWebappCollection, description: '' };
      const result = mapWebappCollectionToPrisma(collectionWithEmptyDesc);
      expect((result.copy as any)?.description).toBe('');
    });

    it('handles null description', () => {
      const collectionWithNullDesc = { ...mockWebappCollection, description: null as any };
      const result = mapWebappCollectionToPrisma(collectionWithNullDesc);
      expect((result.copy as any)?.description).toBeNull();
    });

    it('handles very long descriptions', () => {
      const longDescription = 'A'.repeat(1000);
      const collectionWithLongDesc = { ...mockWebappCollection, description: longDescription };
      const result = mapWebappCollectionToPrisma(collectionWithLongDesc);
      expect((result.copy as any)?.description).toBe(longDescription);
    });

    it('handles special characters in description', () => {
      const specialDesc =
        'Description with special chars: &, @, #, $, %, ^, *, (, ), [, ], {, }, |, \\, /, :, ;, ", \', <, >, ?, !, ~, `';
      const collectionWithSpecialDesc = { ...mockWebappCollection, description: specialDesc };
      const result = mapWebappCollectionToPrisma(collectionWithSpecialDesc);
      expect((result.copy as any)?.description).toBe(specialDesc);
    });

    it('handles missing sortDescription', () => {
      const collectionWithoutSortDesc = { ...mockWebappCollection, sortDescription: undefined };
      const result = mapWebappCollectionToPrisma(collectionWithoutSortDesc);
      expect((result.copy as any)?.sortDescription).toBeUndefined();
    });

    it('handles empty sortDescription', () => {
      const collectionWithEmptySortDesc = { ...mockWebappCollection, sortDescription: '' };
      const result = mapWebappCollectionToPrisma(collectionWithEmptySortDesc);
      expect((result.copy as any)?.sortDescription).toBe('');
    });

    it('handles missing color', () => {
      const collectionWithoutColor = { ...mockWebappCollection, color: undefined };
      const result = mapWebappCollectionToPrisma(collectionWithoutColor);
      expect((result.copy as any)?.displayColor).toBeUndefined();
    });

    it('handles empty color', () => {
      const collectionWithEmptyColor = { ...mockWebappCollection, color: '' };
      const result = mapWebappCollectionToPrisma(collectionWithEmptyColor);
      expect((result.copy as any)?.displayColor).toBe('');
    });

    it('handles different count values', () => {
      const countVariations = [0, 1, 10, 100, 1000, 10000];

      countVariations.forEach(count => {
        const collectionWithCount = { ...mockWebappCollection, count };
        const result = mapWebappCollectionToPrisma(collectionWithCount);
        expect((result.copy as any)?.productCount).toBe(count);
      });
    });

    it('handles negative count', () => {
      const collectionWithNegativeCount = { ...mockWebappCollection, count: -1 };
      const result = mapWebappCollectionToPrisma(collectionWithNegativeCount);
      expect((result.copy as any)?.productCount).toBe(-1);
    });

    it('handles very long titles', () => {
      const longTitle = 'A'.repeat(500);
      const collectionWithLongTitle = { ...mockWebappCollection, title: longTitle };
      const result = mapWebappCollectionToPrisma(collectionWithLongTitle);
      expect(result.name).toBe(longTitle);
    });

    it('handles empty title', () => {
      const collectionWithEmptyTitle = { ...mockWebappCollection, title: '' };
      const result = mapWebappCollectionToPrisma(collectionWithEmptyTitle);
      expect(result.name).toBe('');
    });

    it('handles very long handles', () => {
      const longHandle = 'a'.repeat(200);
      const collectionWithLongHandle = { ...mockWebappCollection, handle: longHandle };
      const result = mapWebappCollectionToPrisma(collectionWithLongHandle);
      expect(result.slug).toBe(longHandle);
    });

    it('handles empty handle', () => {
      const collectionWithEmptyHandle = { ...mockWebappCollection, handle: '' };
      const result = mapWebappCollectionToPrisma(collectionWithEmptyHandle);
      expect(result.slug).toBe('');
    });

    it('handles special characters in title', () => {
      const specialTitle = 'Collection & Co. (Special) - Test Collection!';
      const collectionWithSpecialTitle = { ...mockWebappCollection, title: specialTitle };
      const result = mapWebappCollectionToPrisma(collectionWithSpecialTitle);
      expect(result.name).toBe(specialTitle);
    });

    it('generates consistent results for same input', () => {
      const result1 = mapWebappCollectionToPrisma(mockWebappCollection);
      const result2 = mapWebappCollectionToPrisma(mockWebappCollection);

      expect(result1.name).toBe(result2.name);
      expect(result1.slug).toBe(result2.slug);
      expect(result1.type).toBe(result2.type);
      expect(result1.status).toBe(result2.status);
      expect((result1.copy as any)?.description).toBe((result2.copy as any)?.description);
    });

    it('includes all required fields', () => {
      const result = mapWebappCollectionToPrisma(mockWebappCollection);

      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('slug');
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('copy');
      expect(result.copy).toHaveProperty('description');
      expect(result.copy).toHaveProperty('sortDescription');
      expect(result.copy).toHaveProperty('displayColor');
      expect(result.copy).toHaveProperty('productCount');
    });

    it('sets correct default status', () => {
      const result = mapWebappCollectionToPrisma(mockWebappCollection);
      expect(result.status).toBe(ContentStatus.PUBLISHED);
    });

    it('handles collections with mixed case in title and handle', () => {
      const mixedCaseCollection = {
        ...mockWebappCollection,
        title: 'Test Collection & Co.',
        handle: 'test-collection-co',
      };
      const result = mapWebappCollectionToPrisma(mixedCaseCollection);
      expect(result.name).toBe('Test Collection & Co.');
      expect(result.slug).toBe('test-collection-co');
    });
  });

  describe('extractCollectionMedia', () => {
    it('creates media for collection with image', () => {
      const collectionId = 'collection-123';
      const result = extractCollectionMedia(mockWebappCollection, collectionId);

      expect(result).not.toBeNull();
      expect(result!.url).toBe('/images/collection.jpg');
      expect(result!.altText).toBe('Test Collection');
      expect(result!.type).toBe('IMAGE');
      expect(result!.collection).toStrictEqual({ connect: { id: collectionId } });
    });

    it('returns null for collection without image', () => {
      const collectionWithoutImage = { ...mockWebappCollection, image: undefined };
      const collectionId = 'collection-123';
      const result = extractCollectionMedia(collectionWithoutImage, collectionId);

      expect(result).toBeNull();
    });

    // Enhanced test coverage
    it('handles collection with empty alt text', () => {
      const collectionWithEmptyAlt = {
        ...mockWebappCollection,
        image: { ...mockWebappCollection.image, alt: '' },
      };
      const collectionId = 'collection-123';
      const result = extractCollectionMedia(collectionWithEmptyAlt, collectionId);

      expect(result!.altText).toBe('Test Collection'); // Falls back to title
    });

    it('handles collection with null alt text', () => {
      const collectionWithNullAlt = {
        ...mockWebappCollection,
        image: { ...mockWebappCollection.image, alt: null as any },
      };
      const collectionId = 'collection-123';
      const result = extractCollectionMedia(collectionWithNullAlt, collectionId);

      expect(result!.altText).toBe('Test Collection'); // Falls back to title
    });

    it('handles collection with very long alt text', () => {
      const longAlt = 'A'.repeat(500);
      const collectionWithLongAlt = {
        ...mockWebappCollection,
        image: { ...mockWebappCollection.image, alt: longAlt },
      };
      const collectionId = 'collection-123';
      const result = extractCollectionMedia(collectionWithLongAlt, collectionId);

      expect(result!.altText).toBe(longAlt);
    });

    it('handles collection with special characters in alt text', () => {
      const specialAlt =
        'Alt text with special chars: &, @, #, $, %, ^, *, (, ), [, ], {, }, |, \\, /, :, ;, ", \', <, >, ?, !, ~, `';
      const collectionWithSpecialAlt = {
        ...mockWebappCollection,
        image: { ...mockWebappCollection.image, alt: specialAlt },
      };
      const collectionId = 'collection-123';
      const result = extractCollectionMedia(collectionWithSpecialAlt, collectionId);

      expect(result!.altText).toBe(specialAlt);
    });

    it('handles different image URLs', () => {
      const urlVariations = [
        '/images/collection.jpg',
        'https://example.com/images/collection.jpg',
        'https://cdn.example.com/images/collection.png',
        'https://images.example.com/collection.webp',
        'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
        'https://example.com/images/collection.jpg?width=800&height=600',
        'https://example.com/images/collection.jpg#fragment',
      ];

      urlVariations.forEach(url => {
        const collectionWithUrl = {
          ...mockWebappCollection,
          image: { ...mockWebappCollection.image, src: url },
        };
        const collectionId = 'collection-123';
        const result = extractCollectionMedia(collectionWithUrl, collectionId);

        expect(result!.url).toBe(url);
      });
    });

    it('handles very long image URLs', () => {
      const longUrl = 'https://example.com/images/' + 'a'.repeat(1000) + '.jpg';
      const collectionWithLongUrl = {
        ...mockWebappCollection,
        image: { ...mockWebappCollection.image, src: longUrl },
      };
      const collectionId = 'collection-123';
      const result = extractCollectionMedia(collectionWithLongUrl, collectionId);

      expect(result!.url).toBe(longUrl);
    });

    it('handles empty image URL', () => {
      const collectionWithEmptyUrl = {
        ...mockWebappCollection,
        image: { ...mockWebappCollection.image, src: '' },
      };
      const collectionId = 'collection-123';
      const result = extractCollectionMedia(collectionWithEmptyUrl, collectionId);

      expect(result!.url).toBe('');
    });

    it('sets correct media properties', () => {
      const collectionId = 'collection-123';
      const result = extractCollectionMedia(mockWebappCollection, collectionId);

      expect(result!.type).toBe('IMAGE');
      expect(result!.width).toBe(1920);
      expect(result!.height).toBe(600);
      expect(result!.size).toBeGreaterThan(0);
      expect(result!.mimeType).toBe('image/png');
      expect(result!.sortOrder).toBe(0);
      expect(result!.copy).toStrictEqual({});
    });

    it('estimates file size correctly', () => {
      const collectionId = 'collection-123';
      const result = extractCollectionMedia(mockWebappCollection, collectionId);

      // Estimated size should be reasonable for a 1920x600 PNG
      const expectedSize = Math.floor((1920 * 600 * 0.25) / 1024) * 1024;
      expect(result!.size).toBe(expectedSize);
    });

    it('generates consistent results for same input', () => {
      const collectionId = 'collection-123';
      const result1 = extractCollectionMedia(mockWebappCollection, collectionId);
      const result2 = extractCollectionMedia(mockWebappCollection, collectionId);

      expect(result1!.url).toBe(result2!.url);
      expect(result1!.altText).toBe(result2!.altText);
      expect(result1!.type).toBe(result2!.type);
      expect(result1!.width).toBe(result2!.width);
      expect(result1!.height).toBe(result2!.height);
      expect(result1!.size).toBe(result2!.size);
    });

    it('includes all required media fields', () => {
      const collectionId = 'collection-123';
      const result = extractCollectionMedia(mockWebappCollection, collectionId);

      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('altText');
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('width');
      expect(result).toHaveProperty('height');
      expect(result).toHaveProperty('size');
      expect(result).toHaveProperty('mimeType');
      expect(result).toHaveProperty('sortOrder');
      expect(result).toHaveProperty('collection');
      expect(result).toHaveProperty('copy');
    });

    it('handles collection with very long title for alt text fallback', () => {
      const longTitle = 'A'.repeat(1000);
      const collectionWithLongTitle = {
        ...mockWebappCollection,
        title: longTitle,
        image: { ...mockWebappCollection.image, alt: '' },
      };
      const collectionId = 'collection-123';
      const result = extractCollectionMedia(collectionWithLongTitle, collectionId);

      expect(result!.altText).toBe(longTitle);
    });

    it('handles collection with empty title for alt text fallback', () => {
      const collectionWithEmptyTitle = {
        ...mockWebappCollection,
        title: '',
        image: { ...mockWebappCollection.image, alt: '' },
      };
      const collectionId = 'collection-123';
      const result = extractCollectionMedia(collectionWithEmptyTitle, collectionId);

      expect(result!.altText).toBe('');
    });
  });
});
