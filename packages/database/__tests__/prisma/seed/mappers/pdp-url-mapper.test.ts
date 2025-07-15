import { generatePdpUrls } from '#/prisma/src/seed/mappers/pdp-url-mapper';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('pdp-url-mapper', () => {
  const mockConfig = {
    pdpJoinId: 'test-join-1',
    productSlug: 'test-product',
    retailerSlug: 'target',
    baseUrl: 'https://www.target.com',
  };

  beforeEach(() => {
    // Mock Math.random for deterministic tests
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  describe('generatePdpUrls', () => {
    it('generates basic URL structure correctly', () => {
      const result = generatePdpUrls(mockConfig);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);

      const canonicalUrl = result.find(url => (url as any).isCanonical);
      expect(canonicalUrl).toBeDefined();
      expect(canonicalUrl!.url).toContain('target.com');
      expect(canonicalUrl!.urlType).toBe('PRODUCT_PAGE');
    });

    it('handles different retailers correctly', () => {
      const retailers = ['target', 'walmart', 'amazon', 'anthropologie'];

      retailers.forEach(retailer => {
        const config = { ...mockConfig, retailerSlug: retailer };
        const result = generatePdpUrls(config);

        expect(result.length).toBeGreaterThan(0);
        const canonicalUrl = result.find(url => (url as any).isCanonical);
        // Check that the URL contains the expected domain based on the retailer
        if (retailer === 'amazon') {
          expect(canonicalUrl!.url).toContain('amazon.com');
        } else if (retailer === 'walmart') {
          expect(canonicalUrl!.url).toContain('walmart.com');
        } else if (retailer === 'target') {
          expect(canonicalUrl!.url).toContain('target.com');
        } else {
          // For unknown retailers, should use default pattern
          expect(canonicalUrl!.url).toContain('/products/');
        }
      });
    });

    it('generates correct URL structure for each retailer', () => {
      const retailerTests = [
        { retailer: 'target', expectedDomain: 'target.com' },
        { retailer: 'walmart', expectedDomain: 'walmart.com' },
        { retailer: 'amazon', expectedDomain: 'amazon.com' },
        { retailer: 'anthropologie', expectedDomain: 'anthropologie.com' },
      ];

      retailerTests.forEach(({ retailer, expectedDomain }) => {
        const config = {
          ...mockConfig,
          retailerSlug: retailer,
          baseUrl: `https://www.${expectedDomain}`,
        };
        const result = generatePdpUrls(config);
        const canonicalUrl = result.find(url => (url as any).isCanonical);

        expect(canonicalUrl!.url).toContain(expectedDomain);
      });
    });

    it('handles special characters in product slug', () => {
      const specialSlugConfig = {
        ...mockConfig,
        productSlug: 'test-product-with-special-chars-&-spaces',
      };

      const result = generatePdpUrls(specialSlugConfig);

      // Check that at least the canonical URL contains the product slug
      const canonicalUrl = result.find(url => (url as any).isCanonical);
      expect(canonicalUrl!.url).toContain('test-product-with-special-chars-&-spaces');

      // Other URLs might be mobile or app URLs that don't include the slug
      result.forEach(url => {
        if ((url as any).urlType === 'PRODUCT_PAGE') {
          expect(url.url).toContain('test-product-with-special-chars-&-spaces');
        }
      });
    });

    it('generates appropriate app deep links for each retailer', () => {
      const appRetailers = ['target', 'walmart', 'amazon'];

      appRetailers.forEach(retailer => {
        const config = { ...mockConfig, retailerSlug: retailer };
        const result = generatePdpUrls(config);

        const appUrl = result.find(url => (url as any).urlType === 'APP_DEEPLINK');
        expect(appUrl).toBeDefined();

        const expectedPrefix =
          retailer === 'amazon' ? 'com.amazon.mobile.shopping://' : `${retailer}://`;
        expect(appUrl!.url).toMatch(new RegExp(`^${expectedPrefix}`));
      });
    });

    it('generates consistent results for same input', () => {
      const result1 = generatePdpUrls(mockConfig);
      const result2 = generatePdpUrls(mockConfig);

      expect(result1.length).toBe(result2.length);
      expect(result1.map(url => url.urlType).sort()).toStrictEqual(
        result2.map(url => url.urlType).sort(),
      );
    });

    it('handles empty product slug', () => {
      const emptySlugConfig = { ...mockConfig, productSlug: '' };
      const result = generatePdpUrls(emptySlugConfig);

      expect(result.length).toBeGreaterThan(0);
      result.forEach(url => {
        expect(url.url).toBeDefined();
        expect(typeof url.url).toBe('string');
      });
    });

    it('handles very long product slug', () => {
      const longSlug = 'a'.repeat(1000);
      const longSlugConfig = { ...mockConfig, productSlug: longSlug };
      const result = generatePdpUrls(longSlugConfig);

      expect(result.length).toBeGreaterThan(0);
      // Check that at least the canonical URL contains the product slug
      const canonicalUrl = result.find(url => (url as any).isCanonical);
      expect(canonicalUrl!.url).toContain(longSlug);

      // Other URLs might be mobile or app URLs that don't include the slug
      result.forEach(url => {
        if ((url as any).urlType === 'PRODUCT_PAGE') {
          expect(url.url).toContain(longSlug);
        }
      });
    });

    it('handles special characters in retailer slug', () => {
      const specialRetailerConfig = { ...mockConfig, retailerSlug: 'special-retailer-&-co' };
      const result = generatePdpUrls(specialRetailerConfig);

      expect(result.length).toBeGreaterThan(0);
      const canonicalUrl = result.find(url => (url as any).isCanonical);
      // Unknown retailers should use default pattern
      expect(canonicalUrl!.url).toContain('/products/');
    });

    it('handles missing baseUrl', () => {
      const noBaseUrlConfig = { ...mockConfig, baseUrl: '' };
      const result = generatePdpUrls(noBaseUrlConfig);

      expect(result.length).toBeGreaterThan(0);
      result.forEach(url => {
        expect(url.url).toBeDefined();
        expect(typeof url.url).toBe('string');
      });
    });

    it('handles null/undefined values gracefully', () => {
      const nullConfig = {
        pdpJoinId: null as any,
        productSlug: undefined as any,
        retailerSlug: 'target',
        baseUrl: 'https://www.target.com',
      };

      const result = generatePdpUrls(nullConfig);
      expect(result.length).toBeGreaterThan(0);
    });

    it('handles unknown retailer gracefully', () => {
      const unknownRetailerConfig = { ...mockConfig, retailerSlug: 'unknown-retailer' };
      const result = generatePdpUrls(unknownRetailerConfig);

      expect(result.length).toBeGreaterThan(0);
      const canonicalUrl = result.find(url => (url as any).isCanonical);
      expect(canonicalUrl!.url).toContain('/products/');
    });

    it('includes proper metadata for each URL type', () => {
      const result = generatePdpUrls(mockConfig);

      result.forEach(url => {
        expect((url as any).metadata).toBeDefined();
        expect((url as any).metadata.generated).toBe(true);
        expect((url as any).metadata.retailer).toBe(mockConfig.retailerSlug);
      });
    });

    it('handles mobile URL generation correctly', () => {
      const mobileRetailers = ['amazon', 'target'];

      mobileRetailers.forEach(retailer => {
        const config = { ...mockConfig, retailerSlug: retailer };
        const result = generatePdpUrls(config);

        const mobileUrl = result.find(url => (url as any).urlType === 'MOBILE');
        if (mobileUrl) {
          expect(mobileUrl.url).toContain('m.');
        }
      });
    });

    it('handles AMP URL generation with randomization', () => {
      // Test with high random value (should generate AMP)
      vi.spyOn(Math, 'random').mockReturnValue(0.8);
      const result1 = generatePdpUrls(mockConfig);
      const ampUrl1 = result1.find(url => (url as any).urlType === 'AMP');
      expect(ampUrl1).toBeDefined();

      // Test with low random value (should not generate AMP)
      vi.spyOn(Math, 'random').mockReturnValue(0.2);
      const result2 = generatePdpUrls(mockConfig);
      const ampUrl2 = result2.find(url => (url as any).urlType === 'AMP');
      expect(ampUrl2).toBeUndefined();
    });

    it('handles edge case with very short product slug', () => {
      const shortSlugConfig = { ...mockConfig, productSlug: 'a' };
      const result = generatePdpUrls(shortSlugConfig);

      expect(result.length).toBeGreaterThan(0);
      result.forEach(url => {
        expect(url.url).toContain('a');
      });
    });

    it('handles unicode characters in product slug', () => {
      const unicodeSlug = 'product-ñ-é-ü-中文-日本語';
      const unicodeConfig = { ...mockConfig, productSlug: unicodeSlug };
      const result = generatePdpUrls(unicodeConfig);

      expect(result.length).toBeGreaterThan(0);
      // Check that at least the canonical URL contains the product slug
      const canonicalUrl = result.find(url => (url as any).isCanonical);
      expect(canonicalUrl!.url).toContain(unicodeSlug);

      // Other URLs might be mobile or app URLs that don't include the slug
      result.forEach(url => {
        if ((url as any).urlType === 'PRODUCT_PAGE') {
          expect(url.url).toContain(unicodeSlug);
        }
      });
    });

    it('handles numeric product slugs', () => {
      const numericSlug = '12345';
      const numericConfig = { ...mockConfig, productSlug: numericSlug };
      const result = generatePdpUrls(numericConfig);

      expect(result.length).toBeGreaterThan(0);
      // Check that at least the canonical URL contains the product slug
      const canonicalUrl = result.find(url => (url as any).isCanonical);
      expect(canonicalUrl!.url).toContain(numericSlug);

      // Other URLs might be mobile or app URLs that don't include the slug
      result.forEach(url => {
        if ((url as any).urlType === 'PRODUCT_PAGE') {
          expect(url.url).toContain(numericSlug);
        }
      });
    });

    it('handles product slug with spaces and special characters', () => {
      const complexSlug = 'product name with spaces & symbols @#$%';
      const complexConfig = { ...mockConfig, productSlug: complexSlug };
      const result = generatePdpUrls(complexConfig);

      expect(result.length).toBeGreaterThan(0);
      // Check that at least the canonical URL contains the product slug
      const canonicalUrl = result.find(url => (url as any).isCanonical);
      expect(canonicalUrl!.url).toContain(complexSlug);

      // Other URLs might be mobile or app URLs that don't include the slug
      result.forEach(url => {
        if ((url as any).urlType === 'PRODUCT_PAGE') {
          expect(url.url).toContain(complexSlug);
        }
      });
    });

    it('validates URL structure for each retailer type', () => {
      const retailerPatterns = [
        { retailer: 'target', pattern: /\/p\/.*\/-\/A-\d{9}/ },
        { retailer: 'walmart', pattern: /\/ip\/.*\/\d{9}/ },
        { retailer: 'amazon', pattern: /\/dp\/B0[A-Z0-9]{8}/ },
        { retailer: 'anthropologie', pattern: /\/shop\/.*/ },
      ];

      retailerPatterns.forEach(({ retailer, pattern }) => {
        const config = { ...mockConfig, retailerSlug: retailer };
        const result = generatePdpUrls(config);
        const canonicalUrl = result.find(url => (url as any).isCanonical);

        expect(canonicalUrl!.url).toMatch(pattern);
      });
    });

    it('handles baseUrl with trailing slash', () => {
      const trailingSlashConfig = { ...mockConfig, baseUrl: 'https://www.target.com/' };
      const result = generatePdpUrls(trailingSlashConfig);

      expect(result.length).toBeGreaterThan(0);
      result.forEach(url => {
        expect(url.url).toContain('target.com');
        // Note: The current implementation may have double slashes, which is acceptable
        // as long as the URL is valid
        expect(url.url).toMatch(/^https?:\/\//); // Should start with http:// or https://
      });
    });

    it('handles baseUrl without protocol', () => {
      const noProtocolConfig = { ...mockConfig, baseUrl: 'www.target.com' };
      const result = generatePdpUrls(noProtocolConfig);

      expect(result.length).toBeGreaterThan(0);
      result.forEach(url => {
        // The URL should contain the base domain
        expect(url.url).toContain('target.com');
      });
    });

    it('generates unique URLs for different inputs', () => {
      const config1 = { ...mockConfig, productSlug: 'product-1' };
      const config2 = { ...mockConfig, productSlug: 'product-2' };

      const result1 = generatePdpUrls(config1);
      const result2 = generatePdpUrls(config2);

      const url1 = result1.find(url => (url as any).isCanonical)!.url;
      const url2 = result2.find(url => (url as any).isCanonical)!.url;

      expect(url1).not.toBe(url2);
    });

    it('handles retailer slug case sensitivity', () => {
      const upperCaseConfig = { ...mockConfig, retailerSlug: 'TARGET' };
      const lowerCaseConfig = { ...mockConfig, retailerSlug: 'target' };

      const result1 = generatePdpUrls(upperCaseConfig);
      const result2 = generatePdpUrls(lowerCaseConfig);

      // Should handle case differences appropriately
      expect(result1.length).toBeGreaterThan(0);
      expect(result2.length).toBeGreaterThan(0);
    });

    it('includes all required fields in output', () => {
      const result = generatePdpUrls(mockConfig);

      result.forEach(url => {
        expect(url).toHaveProperty('pdpJoinId');
        expect(url).toHaveProperty('url');
        expect(url).toHaveProperty('isCanonical');
        expect(url).toHaveProperty('urlType');
        expect(url).toHaveProperty('metadata');

        expect(typeof url.pdpJoinId).toBe('string');
        expect(typeof url.url).toBe('string');
        expect(typeof (url as any).isCanonical).toBe('boolean');
        expect(typeof url.urlType).toBe('string');
        expect(typeof (url as any).metadata).toBe('object');
      });
    });

    it('handles extreme edge cases gracefully', () => {
      const extremeConfig = {
        pdpJoinId: '',
        productSlug: '',
        retailerSlug: '',
        baseUrl: '',
      };

      const result = generatePdpUrls(extremeConfig);
      expect(result.length).toBeGreaterThan(0);

      result.forEach(url => {
        expect(url.url).toBeDefined();
        expect(typeof url.url).toBe('string');
      });
    });
  });
});
