import {
  createPdpJoin,
  generateProductRetailerDistribution,
  shouldIncludeBrandDirectSale,
} from '#/prisma/src/seed/mappers/pdp-join-mapper';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('pdp-join-mapper', () => {
  const mockConfig = {
    productId: 'product-1',
    brandId: 'brand-1',
    productSlug: 'test-product',
    retailerSlug: 'target',
    baseUrl: 'https://www.target.com',
  };

  beforeEach(() => {
    // Mock Math.random for deterministic tests
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  describe('createPdpJoin', () => {
    it('creates pdp join with correct structure', () => {
      const result = createPdpJoin(mockConfig);

      expect(result.product).toStrictEqual({ connect: { id: 'product-1' } });
      expect(result.brand).toStrictEqual({ connect: { id: 'brand-1' } });
      expect(result.canonicalUrl).toContain('target.com');
      expect(result.copy).toHaveProperty('retailerSpecificInfo');
      expect(result.copy).toHaveProperty('lastUpdated');
    });

    it('handles different retailers correctly', () => {
      const retailers = ['target', 'walmart', 'amazon'];

      retailers.forEach(retailer => {
        const config = { ...mockConfig, retailerSlug: retailer };
        const result = createPdpJoin(config);

        // Check that the URL contains the retailer-specific pattern
        if (retailer === 'target') {
          expect(result.canonicalUrl).toContain('/p/');
        } else if (retailer === 'walmart') {
          expect(result.canonicalUrl).toContain('/ip/');
        } else if (retailer === 'amazon') {
          expect(result.canonicalUrl).toContain('/dp/');
        }
        expect((result.copy as any)?.retailerSpecificInfo).toContain(retailer);
      });
    });

    it('handles special characters in product slug', () => {
      const specialSlugConfig = {
        ...mockConfig,
        productSlug: 'test-product-with-special-chars-&-spaces',
      };

      const result = createPdpJoin(specialSlugConfig);
      expect(result.canonicalUrl).toContain('test-product-with-special-chars-&-spaces');
    });

    it('handles very long product slug', () => {
      const longSlug = 'a'.repeat(1000);
      const longSlugConfig = { ...mockConfig, productSlug: longSlug };
      const result = createPdpJoin(longSlugConfig);

      expect(result.canonicalUrl).toContain(longSlug);
    });

    it('handles empty product slug', () => {
      const emptySlugConfig = { ...mockConfig, productSlug: '' };
      const result = createPdpJoin(emptySlugConfig);

      expect(result.canonicalUrl).toContain('target.com');
      expect(result.canonicalUrl).toContain('/p/');
    });

    it('handles unicode characters in product slug', () => {
      const unicodeSlug = 'product-ñ-é-ü-中文-日本語';
      const unicodeConfig = { ...mockConfig, productSlug: unicodeSlug };
      const result = createPdpJoin(unicodeConfig);

      expect(result.canonicalUrl).toContain(unicodeSlug);
    });

    it('handles numeric product slugs', () => {
      const numericSlug = '12345';
      const numericConfig = { ...mockConfig, productSlug: numericSlug };
      const result = createPdpJoin(numericConfig);

      expect(result.canonicalUrl).toContain(numericSlug);
    });

    it('handles product slug with spaces and special characters', () => {
      const complexSlug = 'product name with spaces & symbols @#$%';
      const complexConfig = { ...mockConfig, productSlug: complexSlug };
      const result = createPdpJoin(complexConfig);

      expect(result.canonicalUrl).toContain(complexSlug);
    });

    it('handles baseUrl with trailing slash', () => {
      const trailingSlashConfig = { ...mockConfig, baseUrl: 'https://www.target.com/' };
      const result = createPdpJoin(trailingSlashConfig);

      expect(result.canonicalUrl).toContain('target.com');
    });

    it('handles baseUrl without protocol', () => {
      const noProtocolConfig = { ...mockConfig, baseUrl: 'www.target.com' };
      const result = createPdpJoin(noProtocolConfig);

      expect(result.canonicalUrl).toContain('target.com');
    });

    it('handles very long baseUrl', () => {
      const longBaseUrl = 'https://' + 'a'.repeat(1000) + '.com';
      const longBaseUrlConfig = { ...mockConfig, baseUrl: longBaseUrl };
      const result = createPdpJoin(longBaseUrlConfig);

      expect(result.canonicalUrl).toContain('a'.repeat(1000));
    });

    it('handles empty baseUrl', () => {
      const emptyBaseUrlConfig = { ...mockConfig, baseUrl: '' };
      const result = createPdpJoin(emptyBaseUrlConfig);

      expect(result.canonicalUrl).toMatch(/^\/p\//);
    });

    it('handles unknown retailer slug', () => {
      const unknownRetailerConfig = { ...mockConfig, retailerSlug: 'unknown-retailer' };
      const result = createPdpJoin(unknownRetailerConfig);

      expect(result.canonicalUrl).toContain('/products/');
      expect((result.copy as any)?.retailerSpecificInfo).toContain('unknown-retailer');
    });

    it('handles special characters in retailer slug', () => {
      const specialRetailerConfig = { ...mockConfig, retailerSlug: 'special-retailer-&-co' };
      const result = createPdpJoin(specialRetailerConfig);

      expect(result.canonicalUrl).toContain('/products/');
      expect((result.copy as any)?.retailerSpecificInfo).toContain('special-retailer-&-co');
    });

    it('generates consistent results for same input', () => {
      const result1 = createPdpJoin(mockConfig);
      const result2 = createPdpJoin(mockConfig);

      expect(result1.canonicalUrl).toBe(result2.canonicalUrl);
      expect((result1.copy as any)?.retailerSpecificInfo).toBe(
        (result2.copy as any)?.retailerSpecificInfo,
      );
    });

    it('includes retailer-specific information', () => {
      const retailers = ['target', 'walmart', 'amazon', 'anthropologie'];

      retailers.forEach(retailer => {
        const config = { ...mockConfig, retailerSlug: retailer };
        const result = createPdpJoin(config);

        expect((result.copy as any)?.retailerSpecificInfo).toContain(retailer);
        expect((result.copy as any)?.retailerSpecificInfo).toContain('available at');
      });
    });

    it('includes timestamp in lastUpdated', () => {
      const result = createPdpJoin(mockConfig);

      expect((result.copy as any)?.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('handles null/undefined values gracefully', () => {
      // Test with null product slug
      const nullSlugConfig = { ...mockConfig, productSlug: null as any };
      const nullResult = createPdpJoin(nullSlugConfig);
      expect(nullResult.canonicalUrl).toContain('null');

      // Test with undefined retailer slug
      const undefinedRetailerConfig = { ...mockConfig, retailerSlug: undefined as any };
      const undefinedResult = createPdpJoin(undefinedRetailerConfig);
      expect(undefinedResult.canonicalUrl).toContain('/products/');
      expect((undefinedResult.copy as any)?.retailerSpecificInfo).toContain('undefined');
    });

    it('handles very long retailer slug', () => {
      const longRetailer = 'a'.repeat(1000);
      const longRetailerConfig = { ...mockConfig, retailerSlug: longRetailer };
      const result = createPdpJoin(longRetailerConfig);

      expect((result.copy as any)?.retailerSpecificInfo).toContain(longRetailer);
    });

    it('handles retailer slug with special characters', () => {
      const specialRetailer = 'retailer-&-co-@#$%';
      const specialRetailerConfig = { ...mockConfig, retailerSlug: specialRetailer };
      const result = createPdpJoin(specialRetailerConfig);

      expect((result.copy as any)?.retailerSpecificInfo).toContain(specialRetailer);
    });

    it('handles empty retailer slug', () => {
      const emptyRetailerConfig = { ...mockConfig, retailerSlug: '' };
      const result = createPdpJoin(emptyRetailerConfig);

      expect(result.canonicalUrl).toContain('/products/');
      expect((result.copy as any)?.retailerSpecificInfo).toContain('');
    });
  });

  describe('generateProductRetailerDistribution', () => {
    it('generates distribution for multiple products', () => {
      const productSlugs = ['product-1', 'product-2', 'product-3'];
      const result = generateProductRetailerDistribution(productSlugs);

      expect(result).toHaveLength(3);
      result.forEach(distribution => {
        expect(distribution).toHaveProperty('productSlug');
        expect(distribution).toHaveProperty('retailers');
        expect(Array.isArray(distribution.retailers)).toBe(true);
        expect(distribution.retailers.length).toBeGreaterThan(0);
      });
    });

    it('handles empty product slugs array', () => {
      const result = generateProductRetailerDistribution([]);
      expect(result).toHaveLength(0);
    });

    it('handles single product slug', () => {
      const result = generateProductRetailerDistribution(['single-product']);
      expect(result).toHaveLength(1);
      expect(result[0].productSlug).toBe('single-product');
      expect(Array.isArray(result[0].retailers)).toBe(true);
    });

    it('handles very long product slugs', () => {
      const longSlug = 'a'.repeat(1000);
      const result = generateProductRetailerDistribution([longSlug]);

      expect(result[0].productSlug).toBe(longSlug);
      expect(result[0].retailers.length).toBeGreaterThan(0);
    });

    it('handles special characters in product slugs', () => {
      const specialSlug = 'product-ñ-é-ü-中文-日本語';
      const result = generateProductRetailerDistribution([specialSlug]);

      expect(result[0].productSlug).toBe(specialSlug);
      expect(result[0].retailers.length).toBeGreaterThan(0);
    });

    it('generates consistent distribution for same input', () => {
      const productSlugs = ['product-1', 'product-2'];
      const result1 = generateProductRetailerDistribution(productSlugs);
      const result2 = generateProductRetailerDistribution(productSlugs);

      expect(result1).toStrictEqual(result2);
    });

    it('includes all expected retailers', () => {
      const productSlugs = ['product-1', 'product-2', 'product-3', 'product-4', 'product-5'];
      const result = generateProductRetailerDistribution(productSlugs);

      const allRetailers = result.flatMap(d => d.retailers);
      expect(allRetailers).toContain('target');
      expect(allRetailers).toContain('walmart');
      expect(allRetailers).toContain('amazon');
    });

    it('handles large number of products', () => {
      const manyProducts = Array.from({ length: 100 }, (_, i) => `product-${i}`);
      const result = generateProductRetailerDistribution(manyProducts);

      expect(result).toHaveLength(100);
      result.forEach(distribution => {
        expect(distribution.retailers.length).toBeGreaterThan(0);
        expect(distribution.retailers.length).toBeLessThanOrEqual(3);
      });
    });
  });

  describe('shouldIncludeBrandDirectSale', () => {
    it('returns true for direct sale brands', () => {
      expect(shouldIncludeBrandDirectSale('luxcouture')).toBe(true);
      expect(shouldIncludeBrandDirectSale('chicelegance')).toBe(true);
      expect(shouldIncludeBrandDirectSale('tailoredfit')).toBe(true);
    });

    it('returns false for non-direct sale brands', () => {
      expect(shouldIncludeBrandDirectSale('target')).toBe(false);
      expect(shouldIncludeBrandDirectSale('walmart')).toBe(false);
      expect(shouldIncludeBrandDirectSale('amazon')).toBe(false);
      expect(shouldIncludeBrandDirectSale('unknown-brand')).toBe(false);
    });

    it('handles case sensitivity correctly', () => {
      expect(shouldIncludeBrandDirectSale('LUXCOUTURE')).toBe(false);
      expect(shouldIncludeBrandDirectSale('LuxCouture')).toBe(false);
      expect(shouldIncludeBrandDirectSale('luxcouture')).toBe(true);
    });

    it('handles empty string', () => {
      expect(shouldIncludeBrandDirectSale('')).toBe(false);
    });

    it('handles very long brand slug', () => {
      const longBrand = 'a'.repeat(1000);
      expect(shouldIncludeBrandDirectSale(longBrand)).toBe(false);
    });

    it('handles special characters in brand slug', () => {
      expect(shouldIncludeBrandDirectSale('lux-couture')).toBe(false);
      expect(shouldIncludeBrandDirectSale('lux_couture')).toBe(false);
      expect(shouldIncludeBrandDirectSale('lux&couture')).toBe(false);
    });

    it('handles null/undefined values', () => {
      expect(shouldIncludeBrandDirectSale(null as any)).toBe(false);
      expect(shouldIncludeBrandDirectSale(undefined as any)).toBe(false);
    });

    it('handles whitespace in brand slug', () => {
      expect(shouldIncludeBrandDirectSale(' luxcouture ')).toBe(false);
      expect(shouldIncludeBrandDirectSale('luxcouture ')).toBe(false);
      expect(shouldIncludeBrandDirectSale(' luxcouture')).toBe(false);
    });
  });
});
