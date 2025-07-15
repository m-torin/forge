import { MediaType, ProductStatus, ProductType } from '#/prisma-generated/client';
import {
  extractProductMedia,
  extractProductVariants,
  mapWebappProductToPrisma,
} from '#/prisma/src/seed/mappers/product-mapper';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('product-mapper', () => {
  const mockWebappProduct = {
    id: 'gid://1001',
    title: 'Test Product',
    handle: 'test-product',
    vendor: 'TestBrand',
    price: 100,
    description: 'Test description',
    features: ['Feature 1', 'Feature 2'],
    careInstruction: 'Test care',
    shippingAndReturn: 'Test shipping',
    reviewNumber: 10,
    rating: 4.5,
    status: 'New in',
    options: [
      {
        name: 'Color',
        optionValues: [
          { name: 'Red', swatch: { color: '#FF0000' } },
          { name: 'Blue', swatch: { color: '#0000FF' } },
        ],
      },
      {
        name: 'Size',
        optionValues: [{ name: 'S' }, { name: 'M' }],
      },
    ],
    images: [
      { src: '/images/test1.jpg', alt: 'Test 1' },
      { src: '/images/test2.jpg', alt: 'Test 2' },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('mapWebappProductToPrisma', () => {
    it('maps webapp product to Prisma format correctly', () => {
      const result = mapWebappProductToPrisma(mockWebappProduct);

      expect(result.name).toBe('Test Product');
      expect(result.slug).toBe('test-product');
      expect(result.brand).toBe('TestBrand');
      expect(result.price).toBe(100);
      expect(result.status).toBe(ProductStatus.ACTIVE);
      expect(result.type).toBe(ProductType.PHYSICAL);
      expect(result.currency).toBe('USD');
      expect((result.copy as any)?.description).toBe('Test description');
      expect((result.copy as any)?.features).toStrictEqual(['Feature 1', 'Feature 2']);
      expect((result.attributes as any)?.reviewCount).toBe(10);
      expect((result.attributes as any)?.rating).toBe(4.5);
    });

    it('handles different status mappings', () => {
      const productWithBestSeller = { ...mockWebappProduct, status: 'Best Seller' };
      const result = mapWebappProductToPrisma(productWithBestSeller);
      expect(result.status).toBe(ProductStatus.ACTIVE);
    });

    it('generates compare at price', () => {
      const result = mapWebappProductToPrisma(mockWebappProduct);
      expect(result.compareAtPrice).toBeGreaterThan(100);
    });

    // Enhanced comprehensive test coverage
    it('handles null and undefined values gracefully', () => {
      const productWithNulls = {
        ...mockWebappProduct,
        description: null as any,
        features: null as any,
        careInstruction: null as any,
        shippingAndReturn: null as any,
        reviewNumber: null as any,
        rating: null as any,
        status: null as any,
        options: null as any,
        images: null as any,
      };

      const result = mapWebappProductToPrisma(productWithNulls);

      expect((result.copy as any)?.description).toBe('');
      expect((result.copy as any)?.features).toStrictEqual([]);
      expect((result.copy as any)?.careInstruction).toBe('');
      expect((result.copy as any)?.shippingAndReturn).toBe('');
      expect((result.attributes as any)?.reviewCount).toBe(0);
      expect((result.attributes as any)?.rating).toBe(0);
      expect(result.status).toBe(ProductStatus.ACTIVE);
      expect((result as any).images).toBeUndefined();
    });

    it('handles undefined values gracefully', () => {
      const productWithUndefined = {
        ...mockWebappProduct,
        description: undefined as any,
        features: undefined as any,
        careInstruction: undefined as any,
        shippingAndReturn: undefined as any,
        reviewNumber: undefined as any,
        rating: undefined as any,
        status: undefined as any,
        options: undefined as any,
        images: undefined as any,
      };

      const result = mapWebappProductToPrisma(productWithUndefined);

      expect((result.copy as any)?.description).toBe('');
      expect((result.copy as any)?.features).toStrictEqual([]);
      expect((result.copy as any)?.careInstruction).toBe('');
      expect((result.copy as any)?.shippingAndReturn).toBe('');
      expect((result.attributes as any)?.reviewCount).toBe(0);
      expect((result.attributes as any)?.rating).toBe(0);
      expect(result.status).toBe(ProductStatus.ACTIVE);
      expect((result as any).images).toBeUndefined();
    });

    it('handles empty strings and arrays', () => {
      const productWithEmpty = {
        ...mockWebappProduct,
        description: '',
        features: [],
        careInstruction: '',
        shippingAndReturn: '',
        reviewNumber: 0,
        rating: 0,
        status: '',
        options: [],
        images: [],
      };

      const result = mapWebappProductToPrisma(productWithEmpty);

      expect((result.copy as any)?.description).toBe('');
      expect((result.copy as any)?.features).toStrictEqual([]);
      expect((result.copy as any)?.careInstruction).toBe('');
      expect((result.copy as any)?.shippingAndReturn).toBe('');
      expect((result.attributes as any)?.reviewCount).toBe(0);
      expect((result.attributes as any)?.rating).toBe(0);
      expect(result.status).toBe(ProductStatus.ACTIVE);
      expect((result as any).images).toBeUndefined();
    });

    it('handles very long strings', () => {
      const longString = 'A'.repeat(5000);
      const productWithLongStrings = {
        ...mockWebappProduct,
        title: longString,
        description: longString,
        careInstruction: longString,
        shippingAndReturn: longString,
      };

      const result = mapWebappProductToPrisma(productWithLongStrings);

      expect(result.name).toBe(longString);
      expect((result.copy as any)?.description).toBe(longString);
      expect((result.copy as any)?.careInstruction).toBe(longString);
      expect((result.copy as any)?.shippingAndReturn).toBe(longString);
    });

    it('handles special characters in all text fields', () => {
      const specialChars =
        'Special chars: ñ, é, ü, &, @, #, $, %, *, (), [], {}, |, \\, /, <, >, ", \'';
      const productWithSpecialChars = {
        ...mockWebappProduct,
        title: specialChars,
        description: specialChars,
        vendor: specialChars,
        careInstruction: specialChars,
        shippingAndReturn: specialChars,
        features: [specialChars, 'Normal feature'],
      };

      const result = mapWebappProductToPrisma(productWithSpecialChars);

      expect(result.name).toBe(specialChars);
      expect((result.copy as any)?.description).toBe(specialChars);
      expect(result.brand).toBe(specialChars);
      expect((result.copy as any)?.careInstruction).toBe(specialChars);
      expect((result.copy as any)?.shippingAndReturn).toBe(specialChars);
      expect((result.copy as any)?.features).toStrictEqual([specialChars, 'Normal feature']);
    });

    it('handles unicode characters', () => {
      const unicodeText = 'Unicode: 北京 (Beijing), 東京 (Tokyo), パリ (Paris), ロンドン (London)';
      const productWithUnicode = {
        ...mockWebappProduct,
        title: unicodeText,
        description: unicodeText,
        vendor: unicodeText,
      };

      const result = mapWebappProductToPrisma(productWithUnicode);

      expect(result.name).toBe(unicodeText);
      expect((result.copy as any)?.description).toBe(unicodeText);
      expect(result.brand).toBe(unicodeText);
    });

    it('handles numeric edge cases', () => {
      const productWithNumericEdges = {
        ...mockWebappProduct,
        price: 0,
        reviewNumber: -1,
        rating: 6.0, // Above max
      };

      const result = mapWebappProductToPrisma(productWithNumericEdges);

      expect(result.price).toBe(0);
      expect((result.attributes as any)?.reviewCount).toBe(-1);
      expect((result.attributes as any)?.rating).toBe(6.0);
    });

    it('handles all status values', () => {
      const statuses = [
        'New in',
        'Best Seller',
        'Sale',
        'Limited Edition',
        'Out of Stock',
        'Discontinued',
        'Unknown Status',
        '',
        null,
        undefined,
      ];

      statuses.forEach(status => {
        const productWithStatus = { ...mockWebappProduct, status: status as any };
        const result = mapWebappProductToPrisma(productWithStatus);

        // All should map to ACTIVE as fallback
        expect(result.status).toBe(ProductStatus.ACTIVE);
      });
    });

    it('handles missing required fields gracefully', () => {
      const minimalProduct = {
        id: 'gid://1002',
        title: 'Minimal Product',
        handle: 'minimal-product',
        vendor: 'Brand',
        price: 1,
      } as any;

      const result = mapWebappProductToPrisma(minimalProduct);

      expect(result.name).toBe('Minimal Product');
      expect(result.slug).toBe('minimal-product');
      expect(result.brand).toBe('Brand');
      expect(result.price).toBe(1);
      expect((result.copy as any)?.description).toBe('');
      expect((result.copy as any)?.features).toStrictEqual([]);
      expect((result.attributes as any)?.reviewCount).toBe(0);
      expect((result.attributes as any)?.rating).toBe(0);
    });

    it('handles extra fields in input gracefully', () => {
      const productWithExtraFields = {
        ...mockWebappProduct,
        extraField1: 'extra value',
        extraField2: 123,
        extraField3: { nested: 'value' },
        extraField4: [1, 2, 3],
      };

      const result = mapWebappProductToPrisma(productWithExtraFields);

      // Should not break and should not include extra fields
      expect(result.name).toBe('Test Product');
      expect(result).not.toHaveProperty('extraField1');
      expect(result).not.toHaveProperty('extraField2');
    });

    it('handles type mismatches gracefully', () => {
      const productWithTypeMismatches = {
        ...mockWebappProduct,
        title: 123 as any,
        price: 'not a number' as any,
        reviewNumber: 'not a number' as any,
        rating: 'not a number' as any,
        features: 'not an array' as any,
        options: 'not an array' as any,
        images: 'not an array' as any,
      };

      const result = mapWebappProductToPrisma(productWithTypeMismatches);

      expect(result.name).toBe(123);
      expect(result.price).toBe('not a number');
      expect((result.attributes as any)?.reviewCount).toBe('not a number');
      expect((result.attributes as any)?.rating).toBe('not a number');
      expect((result.copy as any)?.features).toBe('not an array');
      expect((result as any).images).toBe('not an array');
    });

    it('generates consistent physical properties', () => {
      const result1 = mapWebappProductToPrisma(mockWebappProduct);
      const result2 = mapWebappProductToPrisma(mockWebappProduct);

      // Physical properties should be consistent for same input
      expect((result1.physicalProperties as any)?.weight).toBe(
        (result2.physicalProperties as any)?.weight,
      );
      expect((result1.physicalProperties as any)?.dimensions).toStrictEqual(
        (result2.physicalProperties as any)?.dimensions,
      );
    });

    it('handles zero and negative prices', () => {
      const zeroPriceProduct = { ...mockWebappProduct, price: 0 };
      const negativePriceProduct = { ...mockWebappProduct, price: -10 };

      const zeroResult = mapWebappProductToPrisma(zeroPriceProduct);
      const negativeResult = mapWebappProductToPrisma(negativePriceProduct);

      expect(zeroResult.price).toBe(0);
      expect(negativeResult.price).toBe(-10);
    });

    it('handles very large numbers', () => {
      const largeNumberProduct = {
        ...mockWebappProduct,
        price: Number.MAX_SAFE_INTEGER,
        reviewNumber: Number.MAX_SAFE_INTEGER,
        rating: Number.MAX_SAFE_INTEGER,
      };

      const result = mapWebappProductToPrisma(largeNumberProduct);

      expect(result.price).toBe(Number.MAX_SAFE_INTEGER);
      expect((result.attributes as any)?.reviewCount).toBe(Number.MAX_SAFE_INTEGER);
      expect((result.attributes as any)?.rating).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('handles NaN and Infinity values', () => {
      const nanProduct = {
        ...mockWebappProduct,
        price: NaN,
        reviewNumber: NaN,
        rating: NaN,
      };

      const infinityProduct = {
        ...mockWebappProduct,
        price: Infinity,
        reviewNumber: Infinity,
        rating: Infinity,
      };

      const nanResult = mapWebappProductToPrisma(nanProduct);
      const infinityResult = mapWebappProductToPrisma(infinityProduct);

      expect(nanResult.price).toBeNaN();
      expect((nanResult.attributes as any)?.reviewCount).toBeNaN();
      expect((nanResult.attributes as any)?.rating).toBeNaN();

      expect(infinityResult.price).toBe(Infinity);
      expect((infinityResult.attributes as any)?.reviewCount).toBe(Infinity);
      expect((infinityResult.attributes as any)?.rating).toBe(Infinity);
    });

    it('preserves all required output fields', () => {
      const result = mapWebappProductToPrisma(mockWebappProduct);

      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('slug');
      expect(result).toHaveProperty('brand');
      expect(result).toHaveProperty('price');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('currency');
      expect(result).toHaveProperty('copy');
      expect(result).toHaveProperty('attributes');
      expect(result).toHaveProperty('physicalProperties');
      expect(result.copy).toHaveProperty('description');
      expect(result.copy).toHaveProperty('features');
      expect(result.attributes).toHaveProperty('reviewCount');
      expect(result.attributes).toHaveProperty('rating');
    });
  });

  describe('mapWebappProductToPrisma edge cases', () => {
    it('handles unknown status gracefully', () => {
      const productWithUnknownStatus = { ...mockWebappProduct, status: 'Unknown Status' };
      const result = mapWebappProductToPrisma(productWithUnknownStatus);
      expect(result.status).toBe(ProductStatus.ACTIVE); // fallback
    });

    it('handles missing optional fields', () => {
      const minimalProduct = {
        id: 'gid://1002',
        title: 'Minimal',
        handle: 'minimal',
        vendor: 'Brand',
        price: 1,
        description: '',
        features: [],
        careInstruction: '',
        shippingAndReturn: '',
        reviewNumber: 0,
        rating: 0,
        status: '',
        options: [],
        images: [],
      };
      const result = mapWebappProductToPrisma(minimalProduct);
      expect(result.name).toBe('Minimal');
      expect((result.copy as any)?.features).toStrictEqual([]);
      expect((result as any).images).toBeUndefined();
    });

    it('generates physicalProperties within expected bounds', () => {
      const result = mapWebappProductToPrisma(mockWebappProduct);
      expect((result.physicalProperties as any)?.weight).toBeGreaterThanOrEqual(200);
      expect((result.physicalProperties as any)?.weight).toBeLessThanOrEqual(2200);
      expect((result.physicalProperties as any)?.dimensions.length).toBeGreaterThanOrEqual(20);
      expect((result.physicalProperties as any)?.dimensions.length).toBeLessThanOrEqual(60);
      expect((result.physicalProperties as any)?.dimensions.width).toBeGreaterThanOrEqual(15);
      expect((result.physicalProperties as any)?.dimensions.width).toBeLessThanOrEqual(45);
      expect((result.physicalProperties as any)?.dimensions.height).toBeGreaterThanOrEqual(2);
      expect((result.physicalProperties as any)?.dimensions.height).toBeLessThanOrEqual(12);
    });
  });

  describe('extractProductVariants', () => {
    it('creates variants for each color/size combination', () => {
      const parentId = 'parent-123';
      const variants = extractProductVariants(mockWebappProduct, parentId);

      expect(variants).toHaveLength(4); // 2 colors × 2 sizes
      expect(variants[0].type).toBe(ProductType.VARIANT);
      expect(variants[0].parent).toStrictEqual({ connect: { id: parentId } });
      expect((variants[0].attributes as any)?.color).toBe('Red');
      expect((variants[0].attributes as any)?.size).toBe('S');
    });

    it('sets first variant as default', () => {
      const parentId = 'parent-123';
      const variants = extractProductVariants(mockWebappProduct, parentId);

      expect(variants[0].isDefault).toBe(true);
      expect(variants[1].isDefault).toBe(false);
    });

    it('generates correct SKUs', () => {
      const parentId = 'parent-123';
      const variants = extractProductVariants(mockWebappProduct, parentId);

      expect((variants[0].attributes as any)?.sku).toBe('TEST-PRODUCT-RED-S');
      expect((variants[1].attributes as any)?.sku).toBe('TEST-PRODUCT-RED-M');
    });

    // Enhanced comprehensive test coverage
    it('handles null and undefined options', () => {
      const productWithNullOptions = { ...mockWebappProduct, options: null as any };
      const productWithUndefinedOptions = { ...mockWebappProduct, options: undefined as any };

      const nullVariants = extractProductVariants(productWithNullOptions, 'parent-1');
      const undefinedVariants = extractProductVariants(productWithUndefinedOptions, 'parent-2');

      expect(nullVariants).toHaveLength(0);
      expect(undefinedVariants).toHaveLength(0);
    });

    it('handles empty options array', () => {
      const productNoOptions = { ...mockWebappProduct, options: [] };
      const variants = extractProductVariants(productNoOptions, 'parent-1');
      expect(variants).toHaveLength(0);
    });

    it('handles options with null/undefined values', () => {
      const productWithNullOptionValues = {
        ...mockWebappProduct,
        options: [
          { name: 'Color', optionValues: null as any },
          { name: 'Size', optionValues: undefined as any },
        ],
      };

      const variants = extractProductVariants(productWithNullOptionValues, 'parent-1');
      expect(variants).toHaveLength(0);
    });

    it('handles options with empty optionValues arrays', () => {
      const productWithEmptyOptionValues = {
        ...mockWebappProduct,
        options: [
          { name: 'Color', optionValues: [] },
          { name: 'Size', optionValues: [] },
        ],
      };

      const variants = extractProductVariants(productWithEmptyOptionValues, 'parent-1');
      expect(variants).toHaveLength(0);
    });

    it('handles options with missing name property', () => {
      const productWithMissingNames = {
        ...mockWebappProduct,
        options: [
          { optionValues: [{ name: 'Red' }] } as any,
          { optionValues: [{ name: 'S' }] } as any,
        ],
      };

      const variants = extractProductVariants(productWithMissingNames, 'parent-1');
      expect(variants).toHaveLength(1); // Should still create variants
    });

    it('handles optionValues with missing name property', () => {
      const productWithMissingOptionNames = {
        ...mockWebappProduct,
        options: [
          { name: 'Color', optionValues: [{ swatch: { color: '#FF0000' } }] as any },
          { name: 'Size', optionValues: [{}] as any },
        ],
      };

      const variants = extractProductVariants(productWithMissingOptionNames, 'parent-1');
      expect(variants).toHaveLength(1);
      expect((variants[0].attributes as any)?.color).toBeUndefined();
      expect((variants[0].attributes as any)?.size).toBeUndefined();
    });

    it('handles special characters in option names', () => {
      const productWithSpecialChars = {
        ...mockWebappProduct,
        options: [
          { name: 'Color & Style', optionValues: [{ name: 'Red & Blue' }] },
          { name: 'Size (EU)', optionValues: [{ name: 'S (Small)' }] },
        ],
      };

      const variants = extractProductVariants(productWithSpecialChars, 'parent-1');
      expect(variants).toHaveLength(1);
      expect((variants[0].attributes as any)?.color).toBe('Red & Blue');
      expect((variants[0].attributes as any)?.size).toBe('S (Small)');
    });

    it('handles very long option names', () => {
      const longName = 'A'.repeat(200);
      const productWithLongNames = {
        ...mockWebappProduct,
        options: [
          { name: 'Color', optionValues: [{ name: longName }] },
          { name: 'Size', optionValues: [{ name: longName }] },
        ],
      };

      const variants = extractProductVariants(productWithLongNames, 'parent-1');
      expect(variants).toHaveLength(1);
      expect((variants[0].attributes as any)?.color).toBe(longName);
      expect((variants[0].attributes as any)?.size).toBe(longName);
    });

    it('handles unicode characters in option names', () => {
      const unicodeName = 'サイズ (Size)';
      const productWithUnicode = {
        ...mockWebappProduct,
        options: [
          { name: 'Color', optionValues: [{ name: unicodeName }] },
          { name: 'Size', optionValues: [{ name: unicodeName }] },
        ],
      };

      const variants = extractProductVariants(productWithUnicode, 'parent-1');
      expect(variants).toHaveLength(1);
      expect((variants[0].attributes as any)?.color).toBe(unicodeName);
      expect((variants[0].attributes as any)?.size).toBe(unicodeName);
    });

    it('handles missing swatch gracefully', () => {
      const productNoSwatch = {
        ...mockWebappProduct,
        options: [
          { name: 'Color', optionValues: [{ name: 'Green' }] },
          { name: 'Size', optionValues: [{ name: 'L' }] },
        ],
      };
      const variants = extractProductVariants(productNoSwatch, 'parent-2');
      expect((variants[0].attributes as any)?.colorSwatch).toBeUndefined();
    });

    it('handles swatch with missing color property', () => {
      const productWithIncompleteSwatch = {
        ...mockWebappProduct,
        options: [
          { name: 'Color', optionValues: [{ name: 'Green', swatch: {} }] } as any,
          { name: 'Size', optionValues: [{ name: 'L' }] },
        ],
      };

      const variants = extractProductVariants(productWithIncompleteSwatch, 'parent-1');
      expect((variants[0].attributes as any)?.colorSwatch).toBeUndefined();
    });

    it('handles swatch with null/undefined color', () => {
      const productWithNullSwatchColor = {
        ...mockWebappProduct,
        options: [
          { name: 'Color', optionValues: [{ name: 'Green', swatch: { color: null } }] } as any,
          { name: 'Size', optionValues: [{ name: 'L' }] },
        ],
      };

      const variants = extractProductVariants(productWithNullSwatchColor, 'parent-1');
      expect((variants[0].attributes as any)?.colorSwatch).toBeNull();
    });

    it('generates unique SKUs for different combinations', () => {
      const productWithMultipleOptions = {
        ...mockWebappProduct,
        options: [
          { name: 'Color', optionValues: [{ name: 'Red' }, { name: 'Blue' }] },
          { name: 'Size', optionValues: [{ name: 'S' }, { name: 'M' }, { name: 'L' }] },
        ],
      };

      const variants = extractProductVariants(productWithMultipleOptions, 'parent-1');
      const skus = variants.map(v => (v.attributes as any)?.sku);
      const uniqueSkus = new Set(skus);

      expect(uniqueSkus.size).toBe(skus.length);
      expect(skus).toContain('TEST-PRODUCT-RED-S');
      expect(skus).toContain('TEST-PRODUCT-RED-M');
      expect(skus).toContain('TEST-PRODUCT-RED-L');
      expect(skus).toContain('TEST-PRODUCT-BLUE-S');
      expect(skus).toContain('TEST-PRODUCT-BLUE-M');
      expect(skus).toContain('TEST-PRODUCT-BLUE-L');
    });

    it('handles single option type', () => {
      const productWithSingleOption = {
        ...mockWebappProduct,
        options: [{ name: 'Color', optionValues: [{ name: 'Red' }, { name: 'Blue' }] }],
      };

      const variants = extractProductVariants(productWithSingleOption, 'parent-1');
      expect(variants).toHaveLength(2);
      expect((variants[0].attributes as any)?.color).toBe('Red');
      expect((variants[0].attributes as any)?.size).toBeUndefined();
      expect((variants[1].attributes as any)?.color).toBe('Blue');
      expect((variants[1].attributes as any)?.size).toBeUndefined();
    });

    it('handles more than two option types', () => {
      const productWithThreeOptions = {
        ...mockWebappProduct,
        options: [
          { name: 'Color', optionValues: [{ name: 'Red' }] },
          { name: 'Size', optionValues: [{ name: 'S' }] },
          { name: 'Material', optionValues: [{ name: 'Cotton' }] },
        ],
      };

      const variants = extractProductVariants(productWithThreeOptions, 'parent-1');
      expect(variants).toHaveLength(1);
      expect((variants[0].attributes as any)?.color).toBe('Red');
      expect((variants[0].attributes as any)?.size).toBe('S');
      expect((variants[0].attributes as any)?.material).toBe('Cotton');
    });

    it('preserves all required variant fields', () => {
      const variants = extractProductVariants(mockWebappProduct, 'parent-1');

      variants.forEach(variant => {
        expect(variant).toHaveProperty('type');
        expect(variant).toHaveProperty('parent');
        expect(variant).toHaveProperty('isDefault');
        expect(variant).toHaveProperty('attributes');
        expect(variant.attributes as any).toHaveProperty('sku');
        expect(variant.attributes as any).toHaveProperty('color');
        expect(variant.attributes as any).toHaveProperty('size');
      });
    });
  });

  describe('extractProductMedia', () => {
    it('creates media items for each image', () => {
      const productId = 'product-123';
      const mediaItems = extractProductMedia(mockWebappProduct, productId);

      expect(mediaItems).toHaveLength(2);
      expect(mediaItems[0].url).toBe('/images/test1.jpg');
      expect(mediaItems[0].altText).toBe('Test 1');
      expect(mediaItems[0].type).toBe(MediaType.IMAGE);
      expect(mediaItems[0].productId).toBe(productId);
    });

    it('sets correct sort order', () => {
      const productId = 'product-123';
      const mediaItems = extractProductMedia(mockWebappProduct, productId);

      expect(mediaItems[0].sortOrder).toBe(0);
      expect(mediaItems[1].sortOrder).toBe(1);
    });

    it('estimates dimensions and file sizes', () => {
      const productId = 'product-123';
      const mediaItems = extractProductMedia(mockWebappProduct, productId);

      expect(mediaItems[0].width).toBeDefined();
      expect(mediaItems[0].height).toBeDefined();
      expect(mediaItems[0].size).toBeDefined();
      expect(mediaItems[0].mimeType).toBe('image/jpeg');
    });

    // Enhanced comprehensive test coverage
    it('handles null and undefined images', () => {
      const productWithNullImages = { ...mockWebappProduct, images: null as any };
      const productWithUndefinedImages = { ...mockWebappProduct, images: undefined as any };

      const nullMedia = extractProductMedia(productWithNullImages, 'product-1');
      const undefinedMedia = extractProductMedia(productWithUndefinedImages, 'product-2');

      expect(nullMedia).toHaveLength(0);
      expect(undefinedMedia).toHaveLength(0);
    });

    it('returns empty array if no images', () => {
      const productNoImages = { ...mockWebappProduct, images: [] };
      const mediaItems = extractProductMedia(productNoImages, 'product-1');
      expect(mediaItems).toHaveLength(0);
    });

    it('handles images with missing properties', () => {
      const productWithIncompleteImages = {
        ...mockWebappProduct,
        images: [
          { src: '/img1.jpg' } as any, // missing alt
          { alt: 'Image 2' } as any, // missing src
          {} as any, // missing both
        ],
      };

      const mediaItems = extractProductMedia(productWithIncompleteImages, 'product-1');
      expect(mediaItems).toHaveLength(3);
      expect(mediaItems[0].altText).toBe('Test Product'); // fallback to title
      expect(mediaItems[1].url).toBeUndefined();
      expect(mediaItems[2].url).toBeUndefined();
      expect(mediaItems[2].altText).toBe('Test Product'); // fallback to title
    });

    it('handles images with null/undefined properties', () => {
      const productWithNullImageProps = {
        ...mockWebappProduct,
        images: [{ src: null, alt: null } as any, { src: undefined, alt: undefined } as any],
      };

      const mediaItems = extractProductMedia(productWithNullImageProps, 'product-1');
      expect(mediaItems).toHaveLength(2);
      expect(mediaItems[0].url).toBeNull();
      expect(mediaItems[0].altText).toBe('Test Product'); // fallback
      expect(mediaItems[1].url).toBeUndefined();
      expect(mediaItems[1].altText).toBe('Test Product'); // fallback
    });

    it('uses product title as altText fallback', () => {
      const productNoAlt = {
        ...mockWebappProduct,
        images: [{ src: '/img.jpg', alt: '' }], // Provide alt as empty string
      };
      const mediaItems = extractProductMedia(productNoAlt, 'product-2');
      expect(mediaItems[0].altText).toBe(productNoAlt.title);
    });

    it('handles very long URLs and alt text', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(1000) + '.jpg';
      const longAlt = 'A'.repeat(1000);

      const productWithLongStrings = {
        ...mockWebappProduct,
        images: [{ src: longUrl, alt: longAlt }],
      };

      const mediaItems = extractProductMedia(productWithLongStrings, 'product-1');
      expect(mediaItems[0].url).toBe(longUrl);
      expect(mediaItems[0].altText).toBe(longAlt);
    });

    it('handles special characters in URLs and alt text', () => {
      const specialUrl = 'https://example.com/image with spaces & special chars.jpg';
      const specialAlt = 'Image with special chars: ñ, é, ü, &, @, #, $, %, *, ()';

      const productWithSpecialChars = {
        ...mockWebappProduct,
        images: [{ src: specialUrl, alt: specialAlt }],
      };

      const mediaItems = extractProductMedia(productWithSpecialChars, 'product-1');
      expect(mediaItems[0].url).toBe(specialUrl);
      expect(mediaItems[0].altText).toBe(specialAlt);
    });

    it('handles unicode characters in alt text', () => {
      const unicodeAlt = '画像 (Image) with 漢字 (Chinese characters) and ひらがな (Hiragana)';

      const productWithUnicode = {
        ...mockWebappProduct,
        images: [{ src: '/img.jpg', alt: unicodeAlt }],
      };

      const mediaItems = extractProductMedia(productWithUnicode, 'product-1');
      expect(mediaItems[0].altText).toBe(unicodeAlt);
    });

    it('handles different image file extensions', () => {
      const productWithDifferentExtensions = {
        ...mockWebappProduct,
        images: [
          { src: '/img1.jpg', alt: 'JPEG' },
          { src: '/img2.png', alt: 'PNG' },
          { src: '/img3.gif', alt: 'GIF' },
          { src: '/img4.webp', alt: 'WebP' },
          { src: '/img5.svg', alt: 'SVG' },
        ],
      };

      const mediaItems = extractProductMedia(productWithDifferentExtensions, 'product-1');
      expect(mediaItems).toHaveLength(5);
      expect(mediaItems[0].mimeType).toBe('image/jpeg');
      expect(mediaItems[1].mimeType).toBe('image/png');
      expect(mediaItems[2].mimeType).toBe('image/gif');
      expect(mediaItems[3].mimeType).toBe('image/webp');
      expect(mediaItems[4].mimeType).toBe('image/svg+xml');
    });

    it('handles unknown file extensions', () => {
      const productWithUnknownExtension = {
        ...mockWebappProduct,
        images: [
          { src: '/img.unknown', alt: 'Unknown' },
          { src: '/img', alt: 'No extension' },
        ],
      };

      const mediaItems = extractProductMedia(productWithUnknownExtension, 'product-1');
      expect(mediaItems).toHaveLength(2);
      expect(mediaItems[0].mimeType).toBe('image/jpeg'); // default fallback
      expect(mediaItems[1].mimeType).toBe('image/jpeg'); // default fallback
    });

    it('generates consistent dimensions and sizes', () => {
      const mediaItems1 = extractProductMedia(mockWebappProduct, 'product-1');
      const mediaItems2 = extractProductMedia(mockWebappProduct, 'product-1');

      expect(mediaItems1[0].width).toBe(mediaItems2[0].width);
      expect(mediaItems1[0].height).toBe(mediaItems2[0].height);
      expect(mediaItems1[0].size).toBe(mediaItems2[0].size);
    });

    it('handles very large number of images', () => {
      const manyImages = Array.from({ length: 100 }, (_, i) => ({
        src: `/img${i}.jpg`,
        alt: `Image ${i}`,
      }));

      const productWithManyImages = {
        ...mockWebappProduct,
        images: manyImages,
      };

      const mediaItems = extractProductMedia(productWithManyImages, 'product-1');
      expect(mediaItems).toHaveLength(100);
      expect(mediaItems[99].sortOrder).toBe(99);
      expect(mediaItems[99].url).toBe('/img99.jpg');
    });

    it('preserves all required media fields', () => {
      const mediaItems = extractProductMedia(mockWebappProduct, 'product-1');

      mediaItems.forEach(item => {
        expect(item).toHaveProperty('url');
        expect(item).toHaveProperty('altText');
        expect(item).toHaveProperty('type');
        expect(item).toHaveProperty('productId');
        expect(item).toHaveProperty('sortOrder');
        expect(item).toHaveProperty('width');
        expect(item).toHaveProperty('height');
        expect(item).toHaveProperty('size');
        expect(item).toHaveProperty('mimeType');
      });
    });

    it('handles product with missing title for fallback', () => {
      const productWithoutTitle = {
        ...mockWebappProduct,
        title: '',
        images: [{ src: '/img.jpg', alt: '' }],
      };

      const mediaItems = extractProductMedia(productWithoutTitle, 'product-1');
      expect(mediaItems[0].altText).toBe(''); // fallback to empty string
    });
  });
});
